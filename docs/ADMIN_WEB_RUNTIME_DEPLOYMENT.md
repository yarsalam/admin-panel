# Admin Web — runtime-only image deployment

## یادآوری وضعیت کل پروژه — دو مسئلهٔ اصلی باز

این بخش را در شروع چت بعدی بخوان:

1. **ورود پنل مدیریت کار نمی‌کند:** علت کدی `CustomButton` با پیش‌فرض `type="button"` بود. اصلاح فرم‌ها در PR #30 مخزن admin-panel ادغام شده است (commit `734ef06b72bdd37899570defe339b4406efc40dc`). بااین‌حال این تغییر هنوز روی VPS Deploy نشده؛ پس مشکل Production تا تعویض Image سرویس `admin-web` و تست ورود واقعی باز است. PR #31 همین Image standalone/runtime-only را فراهم می‌کند. CI run #4 با ID `41120657283` Build، اجرای کانتینر و پاسخ HTTP 200 از `/login` را تأیید کرده، اما Image Push/Deploy نشده است.
- توجه: پس از run #4، commit `31989503311b4fab6867464d6ab432da76d87039` فقط directive مربوط به Client Component را برای `RiskPanel` صریح کرد؛ CI باید روی آخرین head دوباره تأیید شود.
2. **`ai_assistant` در Matching:** Image قبلی به‌دلیل نبود `pandas` crash می‌کرد. PR #4 مخزن ai-packs اصلاح `pandas==2.2.3` را اعمال کرده و CI run #83 موفق شده است؛ اما Image هنوز در GHCR منتشر و روی VPS جایگزین نشده است. اقدام بعدی فقط انتشار و تعویض Image همین سرویس است؛ نه SEO، نه Safety، نه Revenue و نه چهار سرویس سالم Matching را دوباره Build یا تعویض نکن.

## سه تصمیم قطعی معماری

1. سورس، تست‌ها، مستندات و فایل‌های توسعه فقط در GitHub نگهداری می‌شوند.
2. VPS فقط Imageهای Runtime نهایی، فایل‌های ضروری اجرای Production مثل Compose و تنظیمات، Secrets خصوصی و داده‌های پایدار/volumeهای لازم را نگه می‌دارد.
3. هیچ Build سورسی روی VPS انجام نمی‌شود؛ Build خارج از VPS (GitHub Actions یا محیط Build مستقل) انجام می‌شود و فقط Image نهایی منتقل یا از Registry دریافت می‌شود.

این سه تصمیم ثابت‌اند و هر دستور یا پیشنهاد خلاف آن‌ها نباید اجرا شود.

## Artifact design

- Source, tests, documentation, Dockerfiles and Git metadata stay in GitHub.
- GitHub Actions builds the Next.js app using the supported Webpack build option and Next.js standalone output.
- The final image contains the standalone server, its traced production dependencies and static runtime assets only.
- The VPS pulls and runs the GHCR image; it does not receive a repository checkout, build context, pnpm workspace, tests, docs or build toolchain.
- The runtime Compose file defines only `admin-web`; it has no `build:`, source bind mount, dependency rebuild or database service.

## Build and verification

The PR workflow builds the runtime image without publishing. It starts the image and checks that `GET /login` returns HTTP 200. It also checks that repository metadata and docs are absent from the final image.

The manual publisher workflow requires the exact production `NEXT_PUBLIC_API_URL`, builds the image, smoke-tests `/login`, then publishes an immutable tag:

`ghcr.io/yarsalam/admin-panel-web:sha-<commit>`

Use the exact image tag printed by GitHub Actions. There is no `latest` production tag.

## VPS runtime configuration

The only Compose file needed for the web container is `docker-compose.runtime.yml`, alongside the already-required private `.env`. The latter must include:
- `ADMIN_WEB_IMAGE_TAG=sha-<commit>`
- `NEXT_PUBLIC_API_URL=<the same HTTPS URL used at build time>`

Do not store `.env` in Git or inside the image.

The Compose project name is fixed as `yarsalam-admin-prod-20261026` to match the existing production container's project label. The host binding remains `127.0.0.1:3000:3000` for the host reverse proxy. The file defines no database/backend services and has no Build Context.

After the image has been published, the limited cutover pattern (run only from the existing admin production directory) is:

```bash
docker compose --env-file .env -f docker-compose.runtime.yml pull admin-web

docker compose --env-file .env -f docker-compose.runtime.yml \
  up -d --no-deps --force-recreate admin-web
```

Do not add `--remove-orphans`, do not use `down`, and do not change the backend, database, Redis, proxy or TLS containers during this web-only replacement. Before deployment, record the currently running container image ID and keep a rollback image tag. Deployment is separate from CI and requires explicit operator approval.

## Known context

- Auth form fix PR #30 is merged at `734ef06b72bdd37899570defe339b4406efc40dc` on `feat/production-deployment-memory`.
- The production container was observed under Compose project `yarsalam-admin-prod-20261026`; this runtime Compose file retains that project identity.
- A previous TypeScript/lint/build run used PR #29's branch and must not be treated as the validation result for the merged production branch.
- The previous Turbopack favicon decode failure is avoided by calling the documented `next build --webpack` command; the icon itself is not modified.


## Production discovery update — 2026-10-31

A read-only VPS check confirmed:

- Compose project: `yarsalam-admin-prod-20261026`.
- Existing admin runtime directory: `/home/deploy/yarsalam-admin-prod-20261026`.
- Existing Compose files: `docker-compose.yml` and `docker-compose.production.yml`.
- Existing frontend container responds to `GET /login` with HTTP 200. This proves route availability only, not successful authentication.
- Current configured public API URL is `http://novertex.ir/api`. A read-only curl followed the HTTP redirect to `https://novertex.ir/api/`; TLS verification succeeded (`ssl_verify_result=0`). The root `/api/` returned 404, which alone does not show the API is unavailable because it may not expose a handler at its root.
- The frontend login mutation calls `POST /admin/auth/login` relative to `NEXT_PUBLIC_API_URL`. Before building the new frontend image, verify that the corresponding HTTPS route is reachable without redirect and returns the expected validation response to an empty JSON body (for example HTTP 400/422), not 404.
- The current Matching `ai_assistant` image already contains `pandas==2.2.3`; its app imports pass and its health endpoint returns HTTP 200. Do not rebuild or replace it as part of this admin-only release.

### Important runtime environment isolation

The private admin `.env` contains backend/database credentials. It must be passed to Docker Compose only for variable interpolation (for example `docker compose --env-file .env ...`), **not** injected into the `admin-web` container through `env_file: .env`. The standalone web container receives only the explicit non-secret runtime variables declared under `environment`. The runtime Compose validation workflow enforces this rule.

For the next admin image build, use `https://novertex.ir/api` only after the auth-route probe above confirms the HTTPS route. Update `NEXT_PUBLIC_API_URL` in the private VPS `.env` as part of the backed-up, single-service deployment operation, so the built client configuration and runtime Compose configuration agree exactly.


## Production follow-up — 2026-10-31 (verified after PR #33)

- PR #33 is **merged** into `feat/production-deployment-memory`: `86245fa7a1a5e0cc2519da1e066499e5f977cafc`.
- Its CI run `41182064502` succeeded, including the runtime Compose guard, standalone Image build/smoke test, and runtime-image content checks.
- PR #31 is merged at `c3b8ce3ad8e96bd755223f6911f2b5526d62b548`; PR #30 login submit fix remains part of the same production branch.
- The current branch has the real manual publisher at `.github/workflows/publish-admin-web.yml`. The default-branch copy is only a registration stub. Dispatch against `feat/production-deployment-memory`, not `main`.
- The API route probe was run against `https://novertex.ir/api/admin/auth/login`: HTTP 401, zero redirects, TLS verification result 0. This is the expected response for the reserved fake `.invalid` identity and confirms that the auth route reached the backend.
- A fresh read-only probe of the live Matching `ai_assistant` container confirms `pandas==2.2.3`, application imports, and its health endpoint (HTTP 200). Its current image is `ghcr.io/yarsalam/ai-packs/matching-pack-ai-assistant:sha-b76cca762cb850ed8d75303e2613dce8e311dd7e`. Do not republish or replace Matching as part of this admin release.
- The new runtime Compose definition intentionally omits `env_file: .env`; use `.env` only as Compose interpolation input. This prevents database/backend secrets from being injected into the web container.

### Current next operation

Only the admin Image remains to publish. Run the workstation publisher script from the admin runtime package after verifying `gh auth status`:

```bash
ADMIN_AUTH_ROUTE_VERIFIED=1 ./01-publish-admin-web-only.sh
```

The script pins the workflow run to the current `feat/production-deployment-memory` head and requires interactive confirmation text `PUBLISH-ADMIN`. It publishes only `ghcr.io/yarsalam/admin-panel-web:sha-<full-commit>`; it does not alter the VPS. After a successful push, verify the output tag/digest, run the deploy script in PLAN mode, inspect its exact plan, and treat `--apply` as a separate production action requiring explicit operator approval.


## 502 recovery completed — 2026-10-31

The immediate Production recovery was successfully completed without image pull/build or container recreation:

- Existing healthy container `yarsalam-admin-prod-20261026-admin-web-1` was attached to `yarsalam_network` with network alias `admin-web`.
- Its shared-network IP is now `172.18.0.6`.
- Proxy-to-web reachability check: PASS.
- `nginx -t`: PASS.
- Graceful `nginx -s reload`: PASS.
- Public `https://novertex.ir/login`: HTTP 200.
- No application or proxy container was recreated/restarted; no Image or Volume changed.

The permanent Compose correction is in PR #34:
https://github.com/yarsalam/admin-panel/pull/34
- PR #34 merged into `feat/production-deployment-memory` at `775ac7533179bf79302db26b4c8ce8b238fa2816`.
- Head tested: `5315f5c931cc7762f39be3a7e86b7014ea34a01f`.
- CI run #8, ID `41185044552`: SUCCESS, including runtime Compose guard, standalone build/smoke, and runtime-image content checks.
- Runtime Compose attaches `admin-web` to external `yarsalam_network` using alias `admin-web` and prevents a project-local default network.
- Copy the corrected `docker-compose.runtime.yml` into the existing VPS runtime directory and validate its rendered config before any future admin-web recreation. Do not recreate the current healthy container just to apply the Compose file; its manual network attachment is already working.


## Admin AI Pack Control Center — 2026-10-31

The feature branch `feat/admin-ai-pack-control-center` adds a real Pack-level control UI to `/exec/system-health` and a superadmin-only backend API. Full design and rollout details are in `docs/AI_PACK_CONTROL_CENTER.md`.

Implementation:
- The Admin API proxies only to a restricted host-side controller. The controller is not the Docker socket and does not accept arbitrary commands or project names.
- Four fixed Pack cards expose Start/Test/Stop, Progressive Test and confirmed Stop All. Safety remains NOT_INSTALLED if absent.
- The API routes are protected by JWT + `RolesGuard` + `@Roles('superadmin')`.
- Only admin-backend receives `AI_PACK_CONTROL_URL` and `AI_PACK_CONTROL_TOKEN`; these are not present in admin-web or browser code.
- A one-shot deployment script installs the ai-packs host agent, runs the progressive smoke/RAM tests, then deploys only admin-backend and admin-web with immutable images and rollback aliases. No database, Redis, Qdrant, mobApp, Nginx or volume operation is included.

Validation:
- Latest Admin AI Pack control CI run at this update: 41205427821 — SUCCESS (NestJS build, six control-service tests, source-free backend image build/inspection, Next.js Webpack build, runtime Compose guard).
- Admin runtime publisher `.github/workflows/publish-admin-ai-pack-control-runtime.yml` is manual and publishes backend/web together using one immutable SHA tag after both images pass checks.
- The source files are on the feature branch only. The PR is not yet merged and no Admin image has been published/deployed for this feature.

Do not deploy from this branch until PR review/merge and manual image publication. The existing production admin-web and admin-backend services remain unchanged.
