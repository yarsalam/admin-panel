# Agent Instructions — Yarsalam Admin Panel

Before changing code or claiming release readiness:

1. Read `QUALITY-ROADMAP.md` and follow its evidence/status rules.
2. Identify the exact repository, branch, commit SHA, affected app(s), and deployment scope.
3. Prefer the smallest targeted change. Do not perform broad dependency upgrades or rewrite lockfiles without a demonstrated need.
4. Run the relevant checks for every affected workspace: lint, type-check, unit tests, integration/API/E2E tests where available, and production build.
5. For container changes, build and test the exact production image; scan that image with a pinned, trusted scanner version and record the DB/version, image digest, command, and full report.
6. Triage scanner findings. Separate OS packages from application dependencies; verify vendor/distribution advisories and backported fixes. Do not suppress findings or claim they are false positives without evidence.
7. Never expose, print, commit, or include secrets in logs, reports, examples, or tool output.
8. Never run destructive tests, load tests against production, deploy, change DNS/firewall, expose services publicly, or modify production data without explicit authorization.
9. Do not merge or deploy on the user's behalf unless the user explicitly authorizes that exact action.
10. In every report, distinguish `PASSED`, `FAILED`, `BLOCKED`, and `NOT_STARTED`. A missing result is not a pass.
11. Update the relevant section of `QUALITY-ROADMAP.md` only when new evidence exists. Include commands, environment, commit SHA, result, and links/artifacts.
12. Finish with a concise report of changes, tests actually run, failures/risks, and the single next action.

Release readiness is a gated decision, not an inference from a green build or CI job.