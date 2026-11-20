"""
Manual knowledge-base ingestion CLI.

Thin wrapper around app.ingest.run_ingest — all chunking, embedding and
manifest logic lives there; this script only adds path setup, preflight
checks and a readable summary.

Usage (from backend/):
    uv run python scripts/ingest_knowledge.py            # incremental update
    uv run python scripts/ingest_knowledge.py --rebuild  # wipe + re-embed everything

Incremental mode re-embeds a file only when its sha256, the embedding model,
or the chunker version changed; unchanged files are skipped. --rebuild
ignores the manifest and reproduces the original always-rebuild behaviour.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Make `app` importable when invoked as `python scripts/ingest_knowledge.py`
# (Python puts scripts/ on sys.path, not the backend root).
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings  # noqa: E402
from app.ingest import run_ingest  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Ingest data/knowledge/*.md into the ChromaDB 'knowledge' collection.",
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="delete the collection and re-embed every file (ignore the manifest)",
    )
    args = parser.parse_args()

    # ---- preflight: fail BEFORE run_ingest can delete anything ----
    if not settings.OPENAI_API_KEY:
        print(
            "error: OPENAI_API_KEY is empty — set it in backend/.env first.",
            file=sys.stderr,
        )
        return 1

    md_files = sorted(settings.KNOWLEDGE_DIR.glob("*.md"))
    if not md_files:
        print(
            f"error: no .md files found in {settings.KNOWLEDGE_DIR}\n"
            "       (data/ is gitignored — restore data/knowledge/ before ingesting,\n"
            "        otherwise existing sources would be treated as orphaned)",
            file=sys.stderr,
        )
        return 1

    print(f"Knowledge : {settings.KNOWLEDGE_DIR} ({len(md_files)} files)")
    print(f"Chroma    : {settings.CHROMA_DIR}")
    print(f"Embeddings: {settings.OPENAI_EMBED_MODEL}")
    print(f"Mode      : {'rebuild (full)' if args.rebuild else 'incremental'}")

    try:
        result = run_ingest(rebuild=args.rebuild)
    except Exception as e:
        print(f"error: ingest failed: {e}", file=sys.stderr)
        print(
            "       check OPENAI_API_KEY / OPENAI_BASE_URL in backend/.env "
            "and network access to the provider.",
            file=sys.stderr,
        )
        return 1

    print(
        f"Done — {result['files_processed']} file(s) ingested, "
        f"{result['files_skipped']} skipped, "
        f"{result['chunks_created']} chunks created, "
        f"{result['chunks_deleted']} deleted "
        f"(collection: {result['collection_name']})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
