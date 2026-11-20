"""
In-memory chat session store with TTL and per-session asyncio locks.

Design rationale:
- Frontend remains the primary source of truth (AI SDK useChat pattern).
- Backend ALSO stores per-session message history so that:
  * a page refresh can rehydrate the conversation via GET /chat/{id}
  * the streaming endpoint can append user + assistant turns atomically
- Reset is explicit: DELETE /chat/{id} clears both stores (frontend
  clears its local state after receiving 204).
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field


@dataclass
class Session:
    messages: list[dict] = field(default_factory=list)
    created_at: float = field(default_factory=time.monotonic)
    updated_at: float = field(default_factory=time.monotonic)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    def is_expired(self, ttl: int) -> bool:
        return (time.monotonic() - self.updated_at) > ttl


class SessionStore:
    def __init__(self, ttl_seconds: int):
        self._ttl = ttl_seconds
        self._sessions: dict[str, Session] = {}
        self._gc_lock = asyncio.Lock()

    def _prune(self) -> None:
        """Drop expired sessions; safe to call from any coroutine."""
        now = time.monotonic()
        expired = [
            sid for sid, s in self._sessions.items() if (now - s.updated_at) > self._ttl
        ]
        for sid in expired:
            self._sessions.pop(sid, None)

    def get_or_create(self, session_id: str) -> Session:
        self._prune()
        s = self._sessions.get(session_id)
        if s is None:
            s = Session()
            self._sessions[session_id] = s
        return s

    def get(self, session_id: str) -> Session | None:
        self._prune()
        return self._sessions.get(session_id)

    def append(self, session_id: str, message: dict) -> None:
        s = self.get_or_create(session_id)
        s.messages.append(message)
        s.updated_at = time.monotonic()

    def clear(self, session_id: str) -> bool:
        return self._sessions.pop(session_id, None) is not None

    def count(self) -> int:
        return len(self._sessions)
