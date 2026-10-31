# Admin AI Pack Control Center

## Purpose

The system-health page now has a Pack-level control surface for controlled offline functional checks and memory measurement. It is intended for the current no-active-users validation phase and must not be treated as a product monitoring/autoscaling control plane.

## Pack states and actions

- Four fixed cards: SEO, Revenue, Matching, Safety.
- Each card exposes Start, Test, Stop. These are Pack operations, not independent dependency toggles; Compose handles each Pack's service dependencies.
- Progressive Test walks Matching → SEO → Revenue → Safety. Not-installed Packs (currently Safety on the inspected VPS) are shown as NOT_INSTALLED and skipped.
- Stop All requires browser confirmation and stops only the four hard-coded AI Pack Compose projects.
- UI shows host MemAvailable, per-container Docker memory, gateway status, progress, functional smoke test checks, minimum available RAM during the operation, SEO external URL egress result, and Revenue model readiness fields.
- Only superadmin role can call the mutating/status endpoints. The controller is also behind the existing JWT guard.

## Host controller security boundary

The Admin web/backend containers do not receive Docker socket access. A minimal host process, installed as a deploy-owned systemd service, executes only a fixed operation allowlist against fixed Compose project names, Compose file paths, and private env files.

- Bind address must exactly equal the gateway IP of existing Docker network yarsalam_network; the service is not bound to 0.0.0.0 or a public interface.
- HTTP requests require a 48+ character bearer token, compared in constant time.
- The API does not accept arbitrary commands, paths, service names, Compose arguments, Docker arguments or image names.
- Operations are serialized and the actor is recorded in the operation report.
- The agent writes JSON reports in `/home/deploy/ai-pack-deploy-logs/control`.
- The Admin backend is the only container that receives AI_PACK_CONTROL_URL and AI_PACK_CONTROL_TOKEN. These are not exposed to Admin web/browser JavaScript.

## Runtime and memory policy

- Fixed project mapping and gateway ports: Matching 9003, SEO 9000, Revenue 9002, Safety 9001.
- Start preflight requires an existing local immutable GHCR SHA image for every Pack image and a valid private Pack admin token. The controller never builds or pulls images.
- Start uses `docker compose up -d --no-recreate --pull never --wait`. Already-running healthy services are not recreated.
- Stop uses `docker compose stop` only. No `down`, `--remove-orphans`, volume commands or prune operations are used.
- Baseline guardrails: 2500 MiB MemAvailable before start, 1536 MiB minimum reserve after a Pack start/test, 1024 MiB emergency floor sampled during Compose startup. These are initial operating thresholds, not a claim that the VPS is OOMing.
- If a newly-started Pack fails Compose health or breaches the reserve/emergency guard, only that newly-started Pack may be stopped. A Pack already running before the test is preserved.
- Successful packs remain running in the progressive test so cumulative memory can be observed. The sequence stops before starting another Pack if the reserve has been crossed.
- Host MemAvailable is sampled every second during Compose startup and while functional tests run; Docker stats per container are also returned.

## Functional checks

The controller reuses `scripts/smoke_test_packs.py`, which creates a short-lived test licence and revokes it in a finally block.

- SEO: gateway/dependency health, public URL technical HTML audit against `https://example.com/`, and topical backlink similarity. The report separates external URL egress from app health. An egress failure can be caused by VPN routing, firewall, DNS or other outbound policy; it does not prove that VPN is the only cause. Since SEO previously required VPN in this environment, the VPS's intended VPN/egress route must be active before this test.
- Revenue: promotion scoring endpoint with synthetic candidates. The report separately includes `model_trained`, `cv_score`, model phase and sample count. A successful API response is not evidence of a trained or calibrated commercial model.
- Matching: multilingual embedding and Persian sentiment inference. Existing running Matching containers are tested in place and are not recreated.
- Safety: Persian moderation tests only when the Pack is installed and preflight passes. Current VPS inspection showed no Safety project, so it must remain NOT_INSTALLED until explicitly deployed.

Smoke tests prove endpoint functionality for representative test input only. They do not prove model accuracy, calibration, false-positive/false-negative rates, security certification, legal clearance, billing readiness or public-sale readiness.

## One-shot VPS rollout

After the host-controller PR and Admin-panel PR are reviewed/merged and the two immutable Admin runtime images are published from the same merged Admin commit, run the single deployment bundle script as deploy. Supply:

- `AI_PACKS_RUNTIME_REF`: exact merged commit SHA from `yarsalam/ai-packs`.
- `ADMIN_RUNTIME_REF`: exact merged commit SHA from `yarsalam/admin-panel` used to build the images.
- `ADMIN_RUNTIME_IMAGE_TAG=sha-<ADMIN_RUNTIME_REF>`.

The script:

1. Installs the host agent from the exact ai-packs ref and runs the progressive functional/RAM assessment.
2. Downloads only the two essential Admin runtime Compose files from the exact Admin ref.
3. Backs up the Admin private `.env` and Compose files; updates only the two Admin image tags.
4. Validates that backend Compose contains only `admin-backend`, web Compose contains only `admin-web`, both use the external `yarsalam_network`, both are image-only and neither receives a private `env_file` or source volume.
5. Pulls only the Admin backend and Admin web immutable images.
6. Recreates only `admin-backend` and `admin-web`, one at a time, with health and API-agent connectivity probes.
7. On failure, resets the two image tags to local rollback aliases created from the exact previous running image IDs and recreates only the same two Admin services.

Before running it, enable the intended outbound VPN/egress route on the VPS if the SEO public URL audit requires it. A VPN on the developer's laptop does not change VPS outbound routing.

## Files

- `scripts/deploy_admin_ai_pack_control_bundle.sh` — the single VPS installer/test/deploy operation.
- `docker-compose.backend.runtime.yml` — only the Admin backend runtime service.
- Existing `docker-compose.runtime.yml` — only the Admin web runtime service.
- `.github/workflows/ai-pack-control-validation.yml` — backend/web/Compose/script validation.
- `.github/workflows/publish-admin-ai-pack-control-runtime.yml` — one manual workflow that tests and publishes both Admin images under the same immutable SHA tag.

## Deployment status

Code and CI validation are on `feat/admin-ai-pack-control-center`. No changes have yet been deployed to the VPS by this feature branch. The currently-running Admin and AI Pack containers remain on their previous versions until the reviewed PR is merged, the publisher workflow succeeds, and the one-shot rollout script is explicitly run.

## Operational prohibitions

Never mount `/var/run/docker.sock` into Admin web/backend. Never run `docker compose down`, `down -v`, `--remove-orphans`, any prune, or project-wide `up` as part of this feature. Do not automatically stop a pre-existing Pack to satisfy the memory guard. Do not change mobApp, MySQL, Redis, Qdrant, Nginx, or Admin DB services.


## Merge status update — 2026-10-31

- PR #35 `Add Admin AI Pack Control Center and progressive RAM testing` is merged into `feat/production-deployment-memory` at `fe119522ff36f1de2741fcc6a454253184020efe`.
- Final pre-merge AI Pack Control Center CI run `41206176182`: SUCCESS. It validates NestJS build, six control-service tests, source-free backend runtime image, Next.js Webpack build, runtime Compose guard and deploy-script syntax.
- Production Docker validation after merge: run `41230216455` SUCCESS (admin web/backend image builds and production Compose validation). It builds only in GitHub Actions and does not publish/push to GHCR.
- AI pack host-controller installer/test script exact merged ref: `cd7c2bda98d8ed5101832ce7d166f76863601334`.
- No Admin runtime images have been published for this feature and no container on VPS has been changed. The next controlled action is to manually dispatch `publish-admin-ai-pack-control-runtime.yml` with `https://novertex.ir/api`, then run `scripts/deploy_admin_ai_pack_control_bundle.sh` on the VPS with the exact merged refs.
- Exact merged Admin ref and required image tag: `fe119522ff36f1de2741fcc6a454253184020efe` / `sha-fe119522ff36f1de2741fcc6a454253184020efe`.