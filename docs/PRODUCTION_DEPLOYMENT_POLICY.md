# Yarsalam admin panel production deployment policy

This document is a release gate, not authorization to deploy.

## Non-negotiable requirements

- Keep the admin interface private by default. A separate domain does not make it private. Prefer VPN/SSH tunnel; if a public gateway is explicitly approved, restrict it with a trusted IP allowlist and strong authentication.
- Consider Iran filtering, DNS disruption, and international-connectivity outages. Avoid runtime dependence on third-party CDNs/APIs where practical. Prebuild immutable images in CI. A foreign server cannot guarantee access from Iran during an international outage.
- Only runtime artifacts belong on the VPS. Source, tests, Git history, pnpm workspace, development tools, and build dependencies stay in GitHub/CI. Deploy approved image references/digests and minimal Compose/configuration only.
- Never put `.env`, `.env.production`, credentials, tokens, or private keys in Git or image layers.
- Do not expose admin MySQL, Redis, backend, or web ports publicly. Do not connect the admin database to the public network.
- Use production builds and start commands; never use `next dev`, `start:dev`, source bind mounts, or schema auto-sync in production.
- Define persistent storage, encrypted backups, tested restore, resource/log limits, health checks, and rollback before launch.

## Current repository cautions

- The root `docker-compose.yml` is development-only: it publishes admin database/Redis and app ports, mounts source, starts dev servers, and contains fixed example credentials.
- `apps/web/Dockerfile` and `apps/server/Dockerfile` use development start commands and are not production images.
- The monorepo must be built from its root in CI so the pnpm workspace and lockfile are available.
- No production Compose file or production Dockerfiles were present when this policy was drafted. Do not run the existing Compose file on the VPS.
- The admin panel must not be published on `novertex.ir` (or any other public hostname) until the private access design, TLS/authentication, API origin, CORS, and network policy are reviewed. DNS alone is not an access-control mechanism.

## VPS layout

- `/opt/yarsalam/`: approved runtime manifests and release metadata.
- `/opt/yarsalam/secrets/`: root-owned production secret files, mode 0700.
- `/srv/yarsalam/`: only required persistent runtime data.
- Do not clone this source repository onto the production host for routine deployments.

## Required gates

- [ ] CI builds production web/server images from the monorepo root with the lockfile and approved production commands.
- [ ] Images are scanned and pinned by digest.
- [ ] Admin web/server have private-only routing and no accidental public host ports.
- [ ] Admin API uses the intended HTTPS/backend origin, strict CORS, secure session/JWT configuration, and non-default secrets.
- [ ] Schema migrations are explicit; automatic schema sync is disabled.
- [ ] Compose output and service list are inspected before startup.
- [ ] Backups, restore test, monitoring, log rotation, and rollback are documented.
- [ ] Explicit approval is received before starting containers or publishing DNS.

## Operational rule

Do not execute `docker compose up`, publish the admin hostname, or change firewall/DNS until the exact production manifests, image digests, routing, ports, secrets, and service list have been reviewed.
