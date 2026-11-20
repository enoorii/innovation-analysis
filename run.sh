#!/usr/bin/env bash
# ============================================================================
# Innovation Atlas — one-command setup & run
# Works on: Linux, macOS, WSL, Windows (Git Bash)
#
#   ./run.sh              install everything (if needed) and start the app
#   ./run.sh --ingest     also rebuild the AI knowledge index (needs API key)
#   ./run.sh --no-open    don't open a browser
#   ./run.sh --clean      wipe .tools/, .venv, node_modules and reinstall
#   ./run.sh --yes        non-interactive (never prompt for the API key)
#
# Everything is installed into ./.tools — nothing is written to your system.
# ============================================================================
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TOOLS="$ROOT/.tools"
LOGS="$ROOT/logs"

NODE_VERSION="v22.14.0"
PNPM_SPEC="pnpm@10"
BACKEND_PORT=9123
FRONTEND_PORT=5173

CLEAN=0
INGEST=0
NO_OPEN=0
ASSUME_YES=0
BACK_PID=""
FRONT_PID=""

# ---------------------------------------------------------------- output ---
if [ -t 1 ]; then
  B=$'\033[1m'; DIM=$'\033[2m'; R=$'\033[0m'
  BLUE=$'\033[34m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'
else
  B=""; DIM=""; R=""; BLUE=""; GREEN=""; YELLOW=""; RED=""
fi
say()  { printf '%s\n' "${BLUE}==>${R} ${B}$*${R}"; }
ok()   { printf '%s\n' "${GREEN}  ok${R} $*"; }
warn() { printf '%s\n' "${YELLOW}  !!${R} $*" >&2; }
die()  { printf '%s\n' "${RED}error:${R} $*" >&2; exit 1; }

usage() {
  sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 0
}

while [ $# -gt 0 ]; do
  case "$1" in
    --clean)   CLEAN=1 ;;
    --ingest)  INGEST=1 ;;
    --no-open) NO_OPEN=1 ;;
    --yes|-y)  ASSUME_YES=1 ;;
    --help|-h) usage ;;
    *) die "unknown option: $1 (try --help)" ;;
  esac
  shift
done

# ------------------------------------------------------------------- os ----
UNAME="$(uname -s)"
case "$UNAME" in
  Linux*)             OS="linux" ;;
  Darwin*)            OS="mac" ;;
  MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
  *) die "unsupported operating system: $UNAME" ;;
esac
case "$(uname -m)" in
  x86_64|amd64)  ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) die "unsupported CPU architecture: $(uname -m)" ;;
esac
IS_WSL=0
if [ "$OS" = "linux" ] && grep -qi microsoft /proc/version 2>/dev/null; then IS_WSL=1; fi

[ -d "$ROOT/backend" ]  || die "backend/ not found — put run.sh at the repository root."
[ -d "$ROOT/dashboard" ] || die "dashboard/ not found — put run.sh at the repository root."

mkdir -p "$TOOLS" "$TOOLS/bin" "$LOGS"
export PATH="$TOOLS/bin:$PATH"
export UV_PYTHON_DOWNLOADS=automatic
if [ "$OS" = "windows" ] || [ "$IS_WSL" = "1" ]; then export UV_LINK_MODE=copy; fi
set -m   # each background job gets its own process group (clean shutdown)

# -------------------------------------------------------------- helpers ----
fetch() { # url dest
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL --retry 3 -o "$2" "$1"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$2" "$1"
  elif [ "$OS" = "windows" ]; then
    powershell -NoProfile -Command "Invoke-WebRequest -Uri '$1' -OutFile '$(cygpath -w "$2")'"
  else
    die "need curl or wget to download files"
  fi
}

extract() { # archive dest
  case "$1" in
    *.zip)
      if [ "$OS" = "windows" ]; then
        powershell -NoProfile -Command \
          "Expand-Archive -LiteralPath '$(cygpath -w "$1")' -DestinationPath '$(cygpath -w "$2")' -Force"
      else
        command -v unzip >/dev/null 2>&1 || die "need unzip to extract $1"
        unzip -q "$1" -d "$2"
      fi ;;
    *.tar.gz|*.tgz) tar -xzf "$1" -C "$2" ;;
    *) die "unknown archive type: $1" ;;
  esac
}

http_ok() { curl -fsS -m 2 "$1" >/dev/null 2>&1; }

wait_for_http() { # url seconds
  local i=0
  while [ "$i" -lt "$2" ]; do
    http_ok "$1" && return 0
    i=$((i + 1)); sleep 1
  done
  return 1
}

tail_log() { printf '%s\n' "${DIM}--- last 25 lines of $1 ---${R}"; tail -n 25 "$1" 2>/dev/null || true; }

open_url() {
  [ "$NO_OPEN" = "1" ] && return 0
  case "$OS" in
    mac)     open "$1" >/dev/null 2>&1 || true ;;
    windows) powershell -NoProfile -Command "Start-Process '$1'" >/dev/null 2>&1 || true ;;
    linux)
      if [ "$IS_WSL" = "1" ]; then
        if command -v wslview >/dev/null 2>&1; then wslview "$1" >/dev/null 2>&1 || true
        elif command -v powershell.exe >/dev/null 2>&1; then
          powershell.exe -NoProfile -Command "Start-Process '$1'" >/dev/null 2>&1 || true
        fi
      else
        xdg-open "$1" >/dev/null 2>&1 || true
      fi ;;
  esac
}

cleanup() {
  trap - EXIT
  [ -n "$BACK_PID$FRONT_PID" ] || return 0
  printf '\n'
  say "Shutting down…"
  local pid winpid
  for pid in "$FRONT_PID" "$BACK_PID"; do
    [ -n "$pid" ] || continue
    if [ "$OS" = "windows" ]; then
      winpid="$(ps -W 2>/dev/null | awk -v p="$pid" '$1==p {print $4}' | head -n1)"
      if [ -n "$winpid" ]; then
        taskkill //PID "$winpid" //T //F >/dev/null 2>&1 || kill "$pid" >/dev/null 2>&1 || true
      else
        kill "$pid" >/dev/null 2>&1 || true
      fi
    else
      kill -TERM "-$pid" >/dev/null 2>&1 || kill -TERM "$pid" >/dev/null 2>&1 || true
    fi
  done
  wait >/dev/null 2>&1 || true
  ok "Stopped. Logs kept in logs/"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# ------------------------------------------------------------- node/pnpm ---
node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  local v maj min
  v="$(node -v 2>/dev/null)" || return 1
  v="${v#v}"; maj="${v%%.*}"; min="${v#*.}"; min="${min%%.*}"
  case "$maj" in ''|*[!0-9]*) return 1 ;; esac
  case "$min" in ''|*[!0-9]*) min=0 ;; esac
  [ "$maj" -gt 22 ] && return 0
  [ "$maj" -eq 22 ] && [ "$min" -ge 12 ] && return 0
  [ "$maj" -eq 20 ] && [ "$min" -ge 19 ] && return 0
  return 1
}

install_node() {
  say "Installing Node.js $NODE_VERSION into .tools/ (no admin required)…"
  local plat ext name
  case "$OS" in linux) plat="linux" ;; mac) plat="darwin" ;; windows) plat="win" ;; esac
  if [ "$OS" = "windows" ]; then ext="zip"; else ext="tar.gz"; fi
  name="node-$NODE_VERSION-$plat-$ARCH"
  if [ ! -x "$TOOLS/$name/node" ] && [ ! -f "$TOOLS/$name/node.exe" ]; then
    fetch "https://nodejs.org/dist/$NODE_VERSION/$name.$ext" "$TOOLS/$name.$ext"
    extract "$TOOLS/$name.$ext" "$TOOLS"
    rm -f "$TOOLS/$name.$ext"
  fi
  export PATH="$TOOLS/$name:$PATH"
  node_ok || die "Node.js installation failed — see $TOOLS/$name"
}

ensure_node() {
  if node_ok; then ok "Node.js $(node -v)"; else install_node; ok "Node.js $(node -v) (local)"; fi
}

ensure_pnpm() {
  export PATH="$TOOLS/npm-global:$TOOLS/npm-global/bin:$PATH"
  if command -v pnpm >/dev/null 2>&1; then ok "pnpm $(pnpm -v)"; return 0; fi
  say "Installing pnpm into .tools/…"
  npm install -g --prefix "$TOOLS/npm-global" "$PNPM_SPEC" >/dev/null 2>&1 \
    || npm install -g --prefix "$TOOLS/npm-global" "$PNPM_SPEC"
  command -v pnpm >/dev/null 2>&1 || die "pnpm installation failed"
  ok "pnpm $(pnpm -v) (local)"
}

ensure_uv() {
  if command -v uv >/dev/null 2>&1; then ok "uv $(uv --version 2>/dev/null | awk '{print $2}')"; return 0; fi
  say "Installing uv into .tools/bin/…"
  if [ "$OS" = "windows" ]; then
    powershell -NoProfile -ExecutionPolicy Bypass -Command \
      "\$env:UV_INSTALL_DIR='$(cygpath -w "$TOOLS/bin")'; \$env:UV_NO_MODIFY_PATH='1'; irm https://astral.sh/uv/install.ps1 | iex" \
      >/dev/null 2>&1 || die "uv installation failed (PowerShell)"
  else
    command -v curl >/dev/null 2>&1 || die "curl is required to install uv"
    curl -LsSf https://astral.sh/uv/install.sh \
      | UV_INSTALL_DIR="$TOOLS/bin" UV_NO_MODIFY_PATH=1 sh >/dev/null 2>&1 \
      || die "uv installation failed"
  fi
  export PATH="$TOOLS/bin:$PATH"
  command -v uv >/dev/null 2>&1 || die "uv installed but not found on PATH"
  ok "uv $(uv --version 2>/dev/null | awk '{print $2}') (local)"
}

# --------------------------------------------------------------- config ----
env_key() { sed -n 's/^OPENAI_API_KEY=//p' "$ROOT/backend/.env" 2>/dev/null | head -n1 | tr -d '\r"' ; }

ensure_env() {
  local envfile="$ROOT/backend/.env"
  if [ ! -f "$envfile" ]; then
    if [ -f "$ROOT/backend/.env.example" ]; then
      cp "$ROOT/backend/.env.example" "$envfile"
    else
      cat > "$envfile" <<'ENVEOF'
# Created by run.sh — add your API key to enable the AI chat.
OPENAI_API_KEY=
CHROMA_DIR=./chroma_db
KNOWLEDGE_DIR=../data/knowledge
DATA_DIR=../data/processed
DASHBOARD_ORIGIN=http://localhost:5173
ENVEOF
    fi
    ok "Created backend/.env"
  fi

  local key
  key="$(env_key)"
  case "$key" in
    ""|*your-*|*changeme*|*xxx*|*YOUR_*)
      if [ "$ASSUME_YES" = "1" ] || [ ! -t 0 ]; then
        warn "No API key set — the dashboard works, the AI chat will not answer."
        return 0
      fi
      printf '\n%s\n' "${B}AI chat needs an OpenAI-compatible API key.${R}"
      printf '%s\n' "${DIM}Charts and analyses work without it. Press Enter to skip.${R}"
      printf '%s' "API key: "
      local answer=""
      read -r answer || answer=""
      if [ -n "$answer" ]; then
        awk -v k="$answer" '
          /^OPENAI_API_KEY=/ { print "OPENAI_API_KEY=" k; done=1; next }
          { print }
          END { if (!done) print "OPENAI_API_KEY=" k }
        ' "$envfile" > "$envfile.tmp" && mv "$envfile.tmp" "$envfile"
        ok "API key saved to backend/.env (never printed, never committed)"
      else
        warn "Skipped — you can add OPENAI_API_KEY to backend/.env later."
      fi ;;
    *) ok "API key present" ;;
  esac
}

ensure_gitignore() {
  local gi="$ROOT/.gitignore"
  [ -f "$gi" ] || : > "$gi"
  if ! grep -qxF '.tools/' "$gi"; then
    printf '\n# local toolchain & logs (created by run.sh)\n.tools/\nlogs/\n' >> "$gi"
  fi
  grep -qxF 'logs/' "$gi" || printf 'logs/\n' >> "$gi"
}

# ----------------------------------------------------------------- main ----
printf '\n%s\n' "${B}Innovation Atlas — Italy x Finland${R}"
printf '%s\n\n' "${DIM}First run downloads ~1 GB (Python, Node, packages) and can take 5–10 minutes.${R}"

if [ "$CLEAN" = "1" ]; then
  say "Cleaning local installs (.tools, .venv, node_modules) — data and .env are kept…"
  rm -rf "$TOOLS" "$ROOT/backend/.venv" "$ROOT/dashboard/node_modules"
  mkdir -p "$TOOLS/bin"
fi

say "Checking toolchain…"
ensure_node
ensure_pnpm
ensure_uv
ensure_env
ensure_gitignore

say "Installing backend dependencies (uv manages Python itself)…"
( cd "$ROOT/backend" && uv sync ) || die "backend dependency install failed"
ok "Backend environment ready"

HAS_KEY=0
[ -n "$(env_key)" ] && HAS_KEY=1

if [ "$INGEST" = "1" ] || { [ ! -f "$ROOT/backend/chroma_db/chroma.sqlite3" ] && [ -d "$ROOT/data/knowledge" ]; }; then
  if [ "$HAS_KEY" = "1" ] && [ -d "$ROOT/data/knowledge" ]; then
    say "Building the AI knowledge index (embeddings)…"
    ( cd "$ROOT/backend" && uv run python scripts/ingest_knowledge.py ) \
      || warn "Ingest failed — chat may answer with limited context."
  else
    warn "Skipping ingest (needs OPENAI_API_KEY and data/knowledge/)."
  fi
fi

say "Installing dashboard dependencies…"
( cd "$ROOT/dashboard" && pnpm install ) || die "dashboard dependency install failed"
ok "Dashboard packages ready"

# ---- backend -------------------------------------------------------------
if http_ok "http://127.0.0.1:$BACKEND_PORT/health"; then
  ok "Backend already running on port $BACKEND_PORT — reusing it"
else
  say "Starting backend on http://127.0.0.1:$BACKEND_PORT …"
  ( cd "$ROOT/backend" && exec uv run poe dev ) >"$LOGS/backend.log" 2>&1 &
  BACK_PID=$!
  if ! wait_for_http "http://127.0.0.1:$BACKEND_PORT/health" 90; then
    tail_log "$LOGS/backend.log"
    if [ "$OS" = "windows" ]; then
      warn "granian did not start — retrying with uvicorn (Windows fallback)…"
      kill -TERM "-$BACK_PID" >/dev/null 2>&1 || kill "$BACK_PID" >/dev/null 2>&1 || true
      wait >/dev/null 2>&1 || true
      ( cd "$ROOT/backend" && exec uv run --with uvicorn uvicorn app.main:app --host 127.0.0.1 --port "$BACKEND_PORT" ) \
        >"$LOGS/backend.log" 2>&1 &
      BACK_PID=$!
      wait_for_http "http://127.0.0.1:$BACKEND_PORT/health" 90 \
        || { tail_log "$LOGS/backend.log"; die "backend failed to start"; }
    else
      die "backend failed to start (see logs/backend.log)"
    fi
  fi
  ok "Backend healthy"
fi

# ---- dashboard -----------------------------------------------------------
say "Starting dashboard…"
( cd "$ROOT/dashboard" && exec pnpm dev ) >"$LOGS/frontend.log" 2>&1 &
FRONT_PID=$!

FRONT_URL=""
i=0
while [ "$i" -lt 90 ]; do
  FRONT_URL="$(grep -Eo 'http://localhost:[0-9]+' "$LOGS/frontend.log" 2>/dev/null | head -n1 || true)"
  [ -n "$FRONT_URL" ] && break
  if ! kill -0 "$FRONT_PID" >/dev/null 2>&1; then
    tail_log "$LOGS/frontend.log"; die "dashboard failed to start"
  fi
  i=$((i + 1)); sleep 1
done
[ -n "$FRONT_URL" ] || { tail_log "$LOGS/frontend.log"; die "dashboard did not report a URL"; }
ok "Dashboard at $FRONT_URL"

open_url "$FRONT_URL"

printf '\n%s\n' "${B}──────────────────────────────────────────────────────────${R}"
printf '  %s  %s\n' "${B}Dashboard${R}" "$FRONT_URL"
printf '  %s  %s\n' "${B}API${R}"       "http://127.0.0.1:$BACKEND_PORT/health"
printf '  %s  %s\n' "${B}Logs${R}"      "logs/backend.log · logs/frontend.log"
if [ "$HAS_KEY" = "1" ]; then
  printf '  %s  %s\n' "${B}AI chat${R}" "enabled"
else
  printf '  %s  %s\n' "${B}AI chat${R}" "disabled — add OPENAI_API_KEY to backend/.env and re-run"
fi
printf '  %s\n' "${DIM}Press Ctrl+C to stop both servers.${R}"
printf '%s\n\n' "${B}──────────────────────────────────────────────────────────${R}"

while kill -0 "$BACK_PID" >/dev/null 2>&1 || [ -z "$BACK_PID" ]; do
  if ! kill -0 "$FRONT_PID" >/dev/null 2>&1; then
    tail_log "$LOGS/frontend.log"; die "dashboard exited unexpectedly"
  fi
  if [ -n "$BACK_PID" ] && ! kill -0 "$BACK_PID" >/dev/null 2>&1; then
    tail_log "$LOGS/backend.log"; die "backend exited unexpectedly"
  fi
  sleep 2
done
