"""
Retrieval + chat with streaming.

Design:
- `retrieve()` – Chroma query with optional source/topic filter.
- `stream_answer()` – async generator yielding plain text deltas.
- `build_messages()` – assembles system prompt + context + history.
- Session handling lives in main.py; this module is stateless.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import cast

import chromadb
from openai import AsyncOpenAI, OpenAI
from openai.types.chat import ChatCompletionMessageParam

from .config import settings
from .schemas import RetrievedChunk

_sync_oai: OpenAI | None = None
_async_oai: AsyncOpenAI | None = None
_chroma_col = None


def _sync_client() -> OpenAI:
    global _sync_oai
    if _sync_oai is None:
        _sync_oai = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,  # None → default openai URL
        )
    return _sync_oai


def _async_client() -> AsyncOpenAI:
    global _async_oai
    if _async_oai is None:
        _async_oai = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
        )
    return _async_oai


def _collection():
    global _chroma_col
    if _chroma_col is None:
        client = chromadb.PersistentClient(path=str(settings.CHROMA_DIR))
        _chroma_col = client.get_or_create_collection(
            name="knowledge",
            metadata={"hnsw:space": "cosine"},
        )
    return _chroma_col


# ---------------- retrieval ----------------

_SOURCE_FOR_ANALYSIS = {
    "vif": ["01_vif_regression_analysis.md"],
    "dlm": ["02_distributed_lag_model.md"],
    "gii": ["03_gii_analysis.md"],
    "data": ["00_data_preparation.md", "03_feature_engineering.md"],
}


def retrieve(
    query: str,
    country: str | None = None,
    analysis: str | None = None,
    top_k: int | None = None,
) -> list[RetrievedChunk]:
    top_k = top_k or settings.TOP_K

    emb = (
        _sync_client()
        .embeddings.create(model=settings.OPENAI_EMBED_MODEL, input=[query])
        .data[0]
        .embedding
    )

    where = None
    if analysis and analysis != "all":
        sources = _SOURCE_FOR_ANALYSIS.get(analysis, [])
        if sources:
            where = {"source": {"$in": sources}}

    res = _collection().query(
        query_embeddings=[emb],
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    out: list[RetrievedChunk] = []
    if res["documents"] and res["documents"][0]:
        for doc, meta, dist in zip(
            res["documents"][0], res["metadatas"][0], res["distances"][0]
        ):
            out.append(
                RetrievedChunk(
                    text=doc,
                    source=f"{meta.get('source', '?')} › {meta.get('header', '?')}",
                    score=float(1.0 - dist),
                )
            )

    if country:
        filtered = [c for c in out if country.lower() in c.text.lower()]
        out = filtered or out

    return out


# ---------------- prompt ----------------

SYSTEM_PROMPT = """\
You are an analyst assistant for a dashboard comparing innovation indicators \
for ITALY and FINLAND (2004–2025). Your knowledge base contains \
markdown files with methodology, results and caveats.

Rules:
1. Answer ONLY from the retrieved context below. If the context does not \
   contain enough to answer, say so explicitly — do not guess.
2. Always distinguish Italy vs Finland when the question is comparative.
3. Preserve the statistical caveats in the source: N=13–22, I(1) series, \
   levels regressions are descriptive not causal, HC3 is authoritative.
4. If the user asks about causality, state clearly that the analyses are \
   descriptive/associative.
5. Cite the source header in parentheses: (source: 01_vif_regression_analysis.md › Results — Italy).
6. Never fabricate numbers. If a number is not in the retrieved context, say so.
"""


def build_messages(
    history: list[dict],
    user_message: str,
    retrieved: list[RetrievedChunk],
) -> list[ChatCompletionMessageParam]:
    context_block = (
        "\n\n---\n\n".join(f"[{c.source}]\n{c.text}" for c in retrieved)
        or "(no retrieved context)"
    )

    raw: list[dict] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"Retrieved context:\n\n{context_block}"},
        *[
            {"role": m.get("role", "user"), "content": m.get("content", "")}
            for m in history[-20:]
        ],
        {"role": "user", "content": user_message},
    ]

    # openai SDK types messages as a TypedDict union; cast at the single
    # boundary where raw dicts become typed messages.
    return cast(list[ChatCompletionMessageParam], raw)


# ---------------- streaming ----------------


async def stream_answer(
    history: list[dict],
    user_message: str,
    retrieved: list[RetrievedChunk],
) -> AsyncIterator[str]:
    oai = _async_client()
    messages = build_messages(history, user_message, retrieved)

    stream = await oai.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=messages,
        temperature=0.2,
        stream=True,
    )

    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


# ---------------- non-streaming ----------------


def answer(
    history: list[dict],
    user_message: str,
    retrieved: list[RetrievedChunk],
) -> str:
    oai = _sync_client()
    resp = oai.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=build_messages(history, user_message, retrieved),
        temperature=0.2,
    )
    return resp.choices[0].message.content
