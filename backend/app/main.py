import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .config import settings
from .ingest import run_ingest
from .rag import answer, retrieve, stream_answer
from .schemas import (
    ChatRequest,
    ChatResponse,
    ChatStreamRequest,
    IngestResponse,
    SessionHistory,
)
from .session import SessionStore

app = FastAPI(title="Innovation Dashboard API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.DASHBOARD_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_store = SessionStore(ttl_seconds=settings.SESSION_TTL_SECONDS)


# ---------------- health ----------------


@app.get("/health")
def health():
    return {"status": "ok", "active_sessions": _store.count()}


# ---------------- ingest ----------------


@app.post("/ingest", response_model=IngestResponse)
def ingest(rebuild: bool = False):
    try:
        return IngestResponse(**run_ingest(rebuild=rebuild))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- session history / reset ----------------


@app.get("/chat/{session_id}", response_model=SessionHistory)
def get_history(session_id: str):
    session = _store.get(session_id)
    if session is None:
        return SessionHistory(session_id=session_id, messages=[])
    return SessionHistory(session_id=session_id, messages=session.messages)


@app.delete("/chat/{session_id}", status_code=204)
def reset_session(session_id: str):
    _store.clear(session_id)


# ---------------- non-streaming chat ----------------


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        last_user = next(
            (m.content for m in reversed(req.messages) if m.role == "user"), ""
        )
        retrieved = retrieve(
            last_user, country=req.country_filter, analysis=req.analysis_filter
        )

        history = [
            m.model_dump() for m in req.messages if m.role in ("user", "assistant")
        ][:-1]
        text = answer(history, last_user, retrieved)

        if req.session_id:
            _store.append(req.session_id, {"role": "user", "content": last_user})
            _store.append(req.session_id, {"role": "assistant", "content": text})

        return ChatResponse(answer=text, retrieved=retrieved, session_id=req.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- streaming chat (AI SDK Data Stream v1) ----------------


def _fmt_text(t: str) -> str:
    return f"0:{json.dumps(t)}\n"


def _fmt_data(payload) -> str:
    return f"2:{json.dumps(payload)}\n"


def _fmt_error(msg: str) -> str:
    return f"3:{json.dumps(msg)}\n"


def _fmt_finish() -> str:
    return 'd:{"finishReason":"stop"}\n'


@app.post("/chat/stream")
async def chat_stream(req: ChatStreamRequest):
    session = _store.get_or_create(req.session_id)

    # Retrieve once (blocking, cheap). Then stream the answer.
    retrieved = retrieve(
        req.message, country=req.country_filter, analysis=req.analysis_filter
    )

    # Append user message to session BEFORE streaming starts
    _store.append(req.session_id, {"role": "user", "content": req.message})
    history = list(session.messages[:-1])  # exclude the just-appended user msg

    async def event_stream():
        assistant_buf: list[str] = []
        try:
            # emit retrieved chunks as data payload up-front so UI can render sources
            yield _fmt_data(
                {
                    "retrieved": [
                        {"source": c.source, "score": c.score} for c in retrieved
                    ]
                }
            )

            async for delta in stream_answer(history, req.message, retrieved):
                assistant_buf.append(delta)
                yield _fmt_text(delta)

            _store.append(
                req.session_id, {"role": "assistant", "content": "".join(assistant_buf)}
            )
            yield _fmt_finish()
        except Exception as e:
            yield _fmt_error(str(e))
            yield _fmt_finish()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Vercel-AI-Data-Stream": "v1",
        },
    )
