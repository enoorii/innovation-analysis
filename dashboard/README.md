# Innovation Atlas — dashboard

React 19 + Vite + Tailwind 4 + shadcn (Base UI) + **Recharts** (shadcn's chart
theming target). All chart data is bundled from `data/processed/*.json` as
typed modules in `src/data/`, so every page renders even with the backend off.
Only the AI chat needs FastAPI.

## Run

To run this app open two terminals (at /backend and /dashboard)

```bash
# First terminal, backend (repo root /backend) — serves on 127.0.0.1:9123
uv sync
uv run poe dev

# Second terminal, dashboard
pnpm install
pnpm dev            # http://localhost:5173
```
