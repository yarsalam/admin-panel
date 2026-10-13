# Production deployment (admin panel)

The default docker-compose.yml remains the development setup. It bind-mounts source code and starts Next.js/NestJS in watch/dev mode. For production, apply the override below; it uses separate production Dockerfiles, removes the source bind mounts, builds Next.js once, and starts NestJS from compiled JavaScript.

## Before deploying

1. Back up the admin database and verify that its data volume is known and restorable.
2. Keep the existing .env private. Never commit production credentials.
3. Set NODE_ENV=production, strong unique ADMIN_DB_ROOT_PASSWORD, ADMIN_DB_PASSWORD, and JWT_SECRET.
4. Set ADMIN_WEB_ORIGINS to the exact public HTTPS origin of the admin web app (no trailing slash).
5. Set NEXT_PUBLIC_API_URL to the public URL that a user's browser can reach for the admin API. This value is compiled into the Next.js client bundle at image-build time. Do not use a Docker-only hostname here.
6. Set USER_API_BASE_URL to the user backend address reachable from the shared yarsalam_network, and make USER_API_KEY match the backend's INTERNAL_API_KEY.
7. Ensure TLS is terminated by a trusted reverse proxy. Do not expose database/Redis ports publicly at the firewall.

## Deploy

Requires Docker Compose v2.24.4 or newer because the override uses the !reset tag to remove development bind mounts.

    docker compose version
    docker compose -f docker-compose.yml -f docker-compose.production.yml config
    docker compose -f docker-compose.yml -f docker-compose.production.yml build admin-web admin-backend
    docker compose -f docker-compose.yml -f docker-compose.production.yml up -d admin-redis admin-mysql admin-backend admin-web
    docker compose -f docker-compose.yml -f docker-compose.production.yml ps
    docker compose -f docker-compose.yml -f docker-compose.production.yml logs --tail=100 admin-backend admin-web
    docker stats --no-stream

Review the rendered config output locally before sharing it: Compose may display resolved environment values. Do not paste it into public tickets or commit it.

## Safety notes

- The override does not run database migrations and explicitly sets DB_SYNC=false. Production schema changes should use reviewed migrations.
- It intentionally keeps the base Compose project's MySQL and Redis services and network, rather than introducing a second database stack. Back up data before any container recreation and verify the actual volume mapping first.
- Container memory limits are initial guardrails, not performance guarantees: 768 MiB each for the web and API, with Node's old-space cap at 640 MiB. Observe OOM/restarts and adjust from real measurements.
- The existing base Compose file publishes ports 3000 and 4000. Restrict these with the host firewall or put a reverse proxy in front; only expose HTTPS publicly.
- The production Dockerfiles currently retain installed workspace dependencies to keep monorepo resolution predictable. They avoid dev/watch processes and source bind mounts, but a later optimization can use a pruned/standalone runtime image after validating workspace packaging.
- Do not remove old containers, prune Docker volumes, or run docker compose down -v as part of deployment.
