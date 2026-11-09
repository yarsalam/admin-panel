# Yarsalam Quality Engineering System (YQES)

Laptop-first, read-only-by-default tooling for the three Yarsalam repositories.

- **YQE — Yarsalam Quality Extractor:** inventories source files, Python symbols, conservative JavaScript/TypeScript declarations, Nest-style HTTP routes and Git commit/dirty-worktree state.
- **YQH — Yarsalam Quality Hub:** local SQLite register for expectations, acceptance criteria, evidence, extracted code entities, GitHub work items and traceability links.
- **YQTE — Yarsalam Quality Traceability Engine:** connects code and GitHub Issues/PRs to expectations, synchronizes PR/Issue metadata through the authenticated `gh` CLI, and associates changed PR paths with extracted source entities.

Python standard library only; no Docker or paid service is needed. Only `yqte sync-github` requires GitHub connectivity and `gh auth login`.

## First run

From this directory, using Python 3.10+:

```bash
python3 yqh.py init --db data/yqh.sqlite3 --expectations config/expectations.json
python3 yqe.py scan --config config/repos.json --output data/yqe/inventory.json
python3 yqh.py import-inventory --db data/yqh.sqlite3 --inventory data/yqe/inventory.json
python3 yqte.py link --db data/yqh.sqlite3 --repos config/repos.json --links config/links.json
python3 yqte.py sync-github --db data/yqh.sqlite3 --repos config/repos.json --links config/links.json
python3 yqh.py report --db data/yqh.sqlite3
```

Or run the combined link and GitHub sync:

```bash
python3 yqte.py reconcile --db data/yqh.sqlite3 --repos config/repos.json --links config/links.json
```

## Configured local repositories

`config/repos.json` uses the workspace paths already provided:

- `~/projects/yarsalam-project/yarsalam` → `yarsalam/mobile`
- `~/projects/yarsalam-project/backend` → `yarsalam/mobApp`
- `~/projects/yarsalam-project/admin-panel` → `yarsalam/admin-panel`

Change these paths if needed. YQE reads code only: it does not run app code, install packages, checkout branches, clean working trees or write to scanned repositories. It records each repo's HEAD SHA and dirty state. Generated inventory/SQLite output stays under the ignored `data/` folder.

YQTE uses GitHub GET API calls through `gh api`; it does not create comments, labels, branches, commits, close Issues, merge PRs or push. Issue/PR bodies are inspected transiently for explicit YH identifiers but are not stored. The initial `links.json` maps known open work items as **traceability hypotheses**; the presence of a linked PR is not proof of completion.

## Evidence and status gate

All seeded expectations start `unverified`. Code presence, an open PR, or a passing isolated unit test does not count as full acceptance.

Add evidence for an exact criterion:

```bash
python3 yqh.py add-evidence --db data/yqh.sqlite3 \
  --expectation-id YH-PAY-001 \
  --criterion "Cross-account IDOR regression test fails before fix and passes after fix." \
  --type integration-test --status passed \
  --summary "A different authenticated user receives 404; payment state is unchanged." \
  --source-ref "commit:<sha>; test:<command>; run:<url>"
```

Use evidence status `failed`, `blocked` or `informational` when appropriate. YQH refuses to set an expectation to `verified` until every acceptance criterion has at least one `passed` evidence record.

## Current extraction limits

Python symbols use AST parsing. JavaScript/TypeScript extraction uses conservative regular expressions, not the TypeScript compiler; generated or complex syntax can be missed. Route extraction currently targets Nest-style decorators. YQE does not yet resolve runtime dependency injection, database joins, full mobile-to-backend call graphs, dynamic routes or semantic product capabilities. Those require framework-specific adapters and integration evidence in later iterations. A clean report is not a release approval.

## Tests

```bash
python3 -m unittest discover -s tests -v
```

Do not commit credentials, APKs, databases, customer data, environment files or local source contents.
