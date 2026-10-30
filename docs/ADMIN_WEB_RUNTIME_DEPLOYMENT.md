# Admin Web — runtime-only image deployment

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

The only Compose file needed for the web container is `docker-compose.runtime.yml`, alongside the already-required private `.env.production`. The latter must include:
- `ADMIN_WEB_IMAGE_TAG=sha-<commit>`
- `NEXT_PUBLIC_API_URL=<the same HTTPS URL used at build time>`

Do not store `.env.production` in Git or inside the image.

The Compose project name is fixed as `yarsalam-admin-prod-20261026` to match the existing production container's project label. The host binding remains `127.0.0.1:3000:3000` for the host reverse proxy. The file defines no database/backend services and has no Build Context.

After the image has been published, the limited cutover pattern (run only from the existing admin production directory) is:

```bash
docker compose --env-file .env.production -f docker-compose.runtime.yml pull admin-web

docker compose --env-file .env.production -f docker-compose.runtime.yml \
  up -d --no-deps --force-recreate admin-web
```

Do not add `--remove-orphans`, do not use `down`, and do not change the backend, database, Redis, proxy or TLS containers during this web-only replacement. Before deployment, record the currently running container image ID and keep a rollback image tag. Deployment is separate from CI and requires explicit operator approval.

## Known context

- Auth form fix PR #30 is merged at `734ef06b72bdd37899570defe339b4406efc40dc` on `feat/production-deployment-memory`.
- The production container was observed under Compose project `yarsalam-admin-prod-20261026`; this runtime Compose file retains that project identity.
- A previous TypeScript/lint/build run used PR #29's branch and must not be treated as the validation result for the merged production branch.
- The previous Turbopack favicon decode failure is avoided by calling the documented `next build --webpack` command; the icon itself is not modified.
