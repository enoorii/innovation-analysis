from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


# ---- streaming request (shadcn / AI SDK) ----
class ChatStreamRequest(BaseModel):
    """Streaming request: only the newest user message + a stable session id."""

    session_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    country_filter: Literal["Italy", "Finland"] | None = None
    analysis_filter: Literal["vif", "dlm", "gii", "data", "all"] | None = "all"


# ---- non-streaming request (kept for programmatic clients) ----
class ChatRequest(BaseModel):
    session_id: str | None = None
    messages: list[ChatMessage] = Field(..., min_length=1)
    country_filter: Literal["Italy", "Finland"] | None = None
    analysis_filter: Literal["vif", "dlm", "gii", "data", "all"] | None = "all"


class RetrievedChunk(BaseModel):
    text: str
    source: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    retrieved: list[RetrievedChunk]
    session_id: str | None = None


class SessionHistory(BaseModel):
    session_id: str
    messages: list[ChatMessage]


class IngestResponse(BaseModel):
    files_processed: int
    files_skipped: int
    chunks_created: int
    chunks_deleted: int
    collection_name: str
