# Admin Production / Staging Deployment

This stack is intended to run alongside the Yarsalam Backend stack. It does not replace the Backend database.

## Prerequisites

- Docker Engine and Docker Compose v2 on the VPS.
- The Backend stack is running and has created the external Docker network `yarsalam_network`.
- The Backend service is reachable on that network as `backend:5000`.
- Admin and Backend use the same internal API key: Admin `USER_API_KEY` must exactly match Backend `INTERNAL_API_KEY`.
- A reverse proxy with TLS terminates public HTTPS. The Admin containers bind only to loopback.

## Configure secrets

Copy `.env.production.example` to `.env.production` and replace every `CHANGE_ME` value.

Required settings:

- `ADMIN_DB_ROOT_PASSWORD`, `ADMIN_DB_USER`, `ADMIN_DB_PASSWORD`: credentials for the separate Admin MySQL database.
- `JWT_SECRET`: random secret with at least 32 characters.
- `USER_API_KEY`: exactly the same value as Backend `INTERNAL_API_KEY`.
- `ADMIN_CORS_ORIGINS`: comma-separated browser origins, for example `https://admin.example.com`.
- `NEXT_PUBLIC_API_URL`: public HTTPS URL that the browser uses for the Admin API, for example `https://admin-api.example.com`.
- `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`: one-time first-superadmin bootstrap credentials. Password must be at least 16 characters.

After the first superadmin is created, remove `INITIAL_ADMIN_PASSWORD` from the environment file and keep the account credentials in a secure password manager.

Never commit `.env.production` or print its contents in logs.

## Database schema warning

The Admin repository currently has no TypeORM migrations. The Compose file defaults `DB_SYNC=false` to avoid automatic schema mutation in a persistent environment.

For a disposable staging installation with a brand-new, empty Admin database only, `DB_SYNC=true` may be used temporarily to create the schema while validating the stack. Do not enable it against an existing database or production data. Before a persistent production rollout, create and test an initial migration and a backup/restore procedure.

## Start the stack

Start Backend first. Then run from the Admin repository root:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml config
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

The Admin services use the external `yarsalam_network`. Admin MySQL and Redis are not published to the host. Admin web and API ports are bound to `127.0.0.1:3000` and `127.0.0.1:4000`.

## Reverse proxy routing

Configure the VPS reverse proxy with TLS:

- `https://admin.example.com` → `http://127.0.0.1:3000`
- `https://admin-api.example.com` → `http://127.0.0.1:4000`

Use the same Admin web origin in `ADMIN_CORS_ORIGINS`, and the API origin in `NEXT_PUBLIC_API_URL`.

## Smoke checks

```bash
curl -fsS http://127.0.0.1:3000/login >/dev/null
curl -i -X OPTIONS http://127.0.0.1:4000/admin/auth/login \
  -H 'Origin: https://admin.example.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type'
```

Then log in through the Admin web UI. Do not expose port 3306 or 6379 publicly.
