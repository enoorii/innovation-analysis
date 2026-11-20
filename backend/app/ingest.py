"""
Markdown → chunks → embeddings → ChromaDB — incremental + recursive splitting.

Chunking strategy (v2):
1. Split document into sections by markdown headings — but ONLY for metadata
   ("which heading does this chunk belong to?"). Section boundaries do NOT
   determine chunk boundaries.
2. Within each section, recursively split:
      paragraphs (\n\\s*\n)  →  sentences ([.!?])  →  characters (tiktoken)
   until every atom is ≤ CHUNK_SIZE tokens.
3. Greedily merge atoms into chunks ≤ CHUNK_SIZE tokens.
4. Apply `overlap` tokens from the tail of chunk[i-1] to chunk[i].

Result: works on any markdown file, headers or not; header becomes a metadata
field for citation, not a chunking constraint.

Manifest (`CHROMA_DIR/manifest.json`) stores per-file:
    {sha256, embedding_model, chunker_version, chunk_ids, chunk_count, ingested_at}

Skip decision requires ALL of: hash unchanged, embedding_model unchanged,
chunker_version unchanged.
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from collections import Counter
from collections.abc import Iterable
from pathlib import Path

import chromadb
import tiktoken
from openai import OpenAI

from .config import settings

_enc = tiktoken.get_encoding("cl100k_base")
MANIFEST_VERSION = 1
CHUNKER_VERSION = 2  # BUMP when splitter logic changes → forces re-ingest


# ===================================================================
# token + recursive-split helpers
# ===================================================================


def _count_tokens(text: str) -> int:
    return len(_enc.encode(text))


def _char_split(text: str, CHUNK_SIZE: int) -> list[str]:
    """Last-resort split by raw token count (no separators)."""
    tokens = _enc.encode(text)
    return [
        _enc.decode(tokens[i : i + CHUNK_SIZE])
        for i in range(0, len(tokens), CHUNK_SIZE)
    ]


def _split_oversized(text: str, CHUNK_SIZE: int) -> list[str]:
    """Split an oversized paragraph by sentences, then characters if needed."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    buf = ""
    for s in sentences:
        cand = (buf + " " + s).strip() if buf else s
        if _count_tokens(cand) <= CHUNK_SIZE:
            buf = cand
        else:
            if buf:
                chunks.append(buf)
            buf = s
    if buf:
        chunks.append(buf)

    final: list[str] = []
    for ch in chunks:
        if _count_tokens(ch) <= CHUNK_SIZE:
            final.append(ch)
        else:
            final.extend(_char_split(ch, CHUNK_SIZE))
    return final


def _make_atoms(text: str, CHUNK_SIZE: int) -> list[str]:
    """Paragraph-level atoms, each ≤ CHUNK_SIZE tokens."""
    atoms: list[str] = []
    for para in re.split(r"\n\s*\n", text):
        para = para.strip()
        if not para:
            continue
        if _count_tokens(para) <= CHUNK_SIZE:
            atoms.append(para)
        else:
            atoms.extend(_split_oversized(para, CHUNK_SIZE))
    return atoms


def _merge_atoms(atoms: list[str], CHUNK_SIZE: int) -> list[str]:
    chunks: list[str] = []
    buf = ""
    for atom in atoms:
        cand = (buf + "\n\n" + atom) if buf else atom
        if _count_tokens(cand) <= CHUNK_SIZE:
            buf = cand
        else:
            if buf:
                chunks.append(buf)
            buf = atom
    if buf:
        chunks.append(buf)
    return chunks


def _apply_overlap(chunks: list[str], overlap: int) -> list[str]:
    if overlap <= 0 or len(chunks) <= 1:
        return chunks
    out = [chunks[0]]
    for i in range(1, len(chunks)):
        prev_tokens = _enc.encode(chunks[i - 1])
        if len(prev_tokens) >= overlap:
            tail = _enc.decode(prev_tokens[-overlap:])
            out.append((tail.rstrip() + " " + chunks[i]).strip())
        else:
            out.append((chunks[i - 1] + " " + chunks[i]).strip())
    return out


def _split_recursive(text: str, CHUNK_SIZE: int, overlap: int) -> list[str]:
    """The public recursive splitter. Two-pass + overlap."""
    atoms = _make_atoms(text, CHUNK_SIZE)
    chunks = _merge_atoms(atoms, CHUNK_SIZE)
    return _apply_overlap(chunks, overlap)


# ===================================================================
# section splitting (for metadata ONLY — no impact on chunk size)
# ===================================================================


def _split_by_sections(text: str, fallback: str) -> Iterable[tuple[str, str]]:
    """Yield (header, body) pairs by splitting on markdown headings."""
    parts = re.split(r"(?m)^(#{1,6}\s+.+)$", text)
    if len(parts) == 1:
        yield (fallback, text)
        return

    preamble = parts[0].strip()
    if preamble:
        yield (fallback, preamble)

    for i in range(1, len(parts), 2):
        header = parts[i].lstrip("#").strip()
        body = parts[i + 1] if i + 1 < len(parts) else ""
        if body.strip():
            yield (header, body)


# ===================================================================
# file → chunks
# ===================================================================


def _chunk_file(path: Path) -> Iterable[dict]:
    text = path.read_text(encoding="utf-8")

    chunk_index = 0

    for header, body in _split_by_sections(text, path.stem):
        for piece in _split_recursive(
            body, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP
        ):
            piece = piece.strip()

            if not piece:
                continue

            chunk_id = hashlib.sha256(
                f"{path.name}::{chunk_index}::{header}::{piece}".encode()
            ).hexdigest()

            yield {
                "source": path.name,
                "header": header,
                "text": piece,
                "chunk_id": chunk_id,
            }

            chunk_index += 1


# ===================================================================
# manifest
# ===================================================================


def _manifest_path() -> Path:
    return settings.CHROMA_DIR / "manifest.json"


def _load_manifest() -> dict:
    p = _manifest_path()
    if not p.exists():
        return {"version": MANIFEST_VERSION, "files": {}}
    data = json.loads(p.read_text(encoding="utf-8"))
    if data.get("version") != MANIFEST_VERSION:
        return {"version": MANIFEST_VERSION, "files": {}}
    return data


def _save_manifest(manifest: dict) -> None:
    _manifest_path().write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def _file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ===================================================================
# embeddings
# ===================================================================


def _embed_batch(oai: OpenAI, texts: list[str], model: str) -> list[list[float]]:
    embs: list[list[float]] = []
    BATCH = 64
    for i in range(0, len(texts), BATCH):
        resp = oai.embeddings.create(model=model, input=texts[i : i + BATCH])
        embs.extend([d.embedding for d in resp.data])
    return embs


# ===================================================================
# main entry
# ===================================================================


def run_ingest(rebuild: bool = False) -> dict:
    settings.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(settings.CHROMA_DIR))

    if rebuild:
        try:
            client.delete_collection("knowledge")
        except Exception:
            pass
        _save_manifest({"version": MANIFEST_VERSION, "files": {}})

    collection = client.get_or_create_collection(
        name="knowledge",
        metadata={"hnsw:space": "cosine"},
    )

    manifest = _load_manifest()
    files_on_disk = {p.name: p for p in sorted(settings.KNOWLEDGE_DIR.glob("*.md"))}

    # ---- delete orphaned files ----
    chunks_deleted = 0
    for fname in list(manifest["files"].keys()):
        if fname not in files_on_disk:
            collection.delete(where={"source": fname})
            chunks_deleted += manifest["files"][fname].get("chunk_count", 0)
            del manifest["files"][fname]

    oai = OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
    files_processed = files_skipped = chunks_created = 0

    for fname, path in files_on_disk.items():
        h = _file_sha256(path)
        prev = manifest["files"].get(fname)
        is_fresh = (
            prev is not None
            and prev.get("sha256") == h
            and prev.get("embedding_model") == settings.OPENAI_EMBED_MODEL
            and prev.get("chunker_version") == CHUNKER_VERSION
        )
        if is_fresh:
            files_skipped += 1
            continue

        # ---- ALWAYS delete existing chunks for this source before adding ----
        # Defensive: manifest may be stale, missing, or from an older code
        # version. Trusting it alone causes "duplicate IDs" when the collection
        # has chunks the manifest doesn't know about.
        existing = collection.get(where={"source": fname})
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
            chunks_deleted += len(existing["ids"])
        # drop stale manifest entry (will be re-written below)
        manifest["files"].pop(fname, None)

        chunks = list(_chunk_file(path))
        if not chunks:
            files_skipped += 1
            continue

        texts = [c["text"] for c in chunks]
        embs = _embed_batch(oai, texts, settings.OPENAI_EMBED_MODEL)

        ids = [c["chunk_id"] for c in chunks]

        duplicates = {
            chunk_id: count for chunk_id, count in Counter(ids).items() if count > 1
        }

        if duplicates:
            raise ValueError(f"Duplicate chunk IDs generated: {duplicates}")

        collection.add(
            ids=[c["chunk_id"] for c in chunks],
            documents=texts,
            embeddings=embs,
            metadatas=[{"source": c["source"], "header": c["header"]} for c in chunks],
        )

        manifest["files"][fname] = {
            "sha256": h,
            "embedding_model": settings.OPENAI_EMBED_MODEL,
            "chunker_version": CHUNKER_VERSION,
            "chunk_ids": [c["chunk_id"] for c in chunks],
            "chunk_count": len(chunks),
            "ingested_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        files_processed += 1
        chunks_created += len(chunks)

    _save_manifest(manifest)

    return {
        "files_processed": files_processed,
        "files_skipped": files_skipped,
        "chunks_created": chunks_created,
        "chunks_deleted": chunks_deleted,
        "collection_name": "knowledge",
    }
