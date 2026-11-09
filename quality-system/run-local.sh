#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
PYTHON="${PYTHON:-python3}"
DB="${YQH_DB:-data/yqh.sqlite3}"
mkdir -p "$(dirname -- "$DB")"

echo "== YQH: initialize acceptance register =="
"$PYTHON" yqh.py init --db "$DB" --expectations config/expectations.json

echo "== YQE: read-only scan of configured local repositories =="
"$PYTHON" yqe.py scan --config config/repos.json --output data/yqe/inventory.json

echo "== YQH: import extracted source inventory =="
"$PYTHON" yqh.py import-inventory --db "$DB" --inventory data/yqe/inventory.json

echo "== YQTE: connect code and configured GitHub work items =="
"$PYTHON" yqte.py link --db "$DB" --repos config/repos.json --links config/links.json

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "== YQTE: read-only GitHub Issue/PR synchronization =="
  "$PYTHON" yqte.py sync-github --db "$DB" --repos config/repos.json --links config/links.json
else
  echo "GitHub sync skipped: install/authenticate gh to include remote Issues and PRs."
fi

echo "== YQH: current evidence-based progress report =="
"$PYTHON" yqh.py report --db "$DB"
