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
