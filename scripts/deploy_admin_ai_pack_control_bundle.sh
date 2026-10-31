#!/usr/bin/env bash
set -Eeuo pipefail

# Run as deploy after both PRs are merged and both immutable Admin images are published.
# This performs the AI Pack progressive live/RAM tests and then deploys only Admin backend/web.
# No source build, project-wide down, orphan removal, pruning, or volume deletion is used.

ADMIN_RUNTIME_REF="${ADMIN_RUNTIME_REF:?Set exact merged Admin commit SHA}"
AI_PACKS_RUNTIME_REF="${AI_PACKS_RUNTIME_REF:?Set exact merged ai-packs commit SHA}"
ADMIN_RUNTIME_IMAGE_TAG="${ADMIN_RUNTIME_IMAGE_TAG:?Set ADMIN_RUNTIME_IMAGE_TAG=sha-<Admin commit SHA>}"

[[ "$(id -un)" == "deploy" ]] || { echo "Run as deploy user." >&2; exit 1; }
[[ "$ADMIN_RUNTIME_REF" =~ ^[0-9a-f]{40}$ ]] || { echo "ADMIN_RUNTIME_REF must be a full SHA." >&2; exit 1; }
[[ "$AI_PACKS_RUNTIME_REF" =~ ^[0-9a-f]{40}$ ]] || { echo "AI_PACKS_RUNTIME_REF must be a full SHA." >&2; exit 1; }
[[ "$ADMIN_RUNTIME_IMAGE_TAG" == "sha-$ADMIN_RUNTIME_REF" ]] || { echo "Admin image tag must exactly match ADMIN_RUNTIME_REF." >&2; exit 1; }

for command in docker curl python3 sudo; do
  command -v "$command" >/dev/null 2>&1 || { echo "Missing required command: $command" >&2; exit 1; }
done
docker info >/dev/null 2>&1 || { echo "deploy user cannot access Docker." >&2; exit 1; }

HOME_DIR="/home/deploy"
ADMIN_ROOT="$HOME_DIR/yarsalam-admin-prod-20261026"
ENV_FILE="$ADMIN_ROOT/.env"
PROJECT="yarsalam-admin-prod-20261026"
AI_ROOT="$HOME_DIR/ai-packs-control-20261030"
AI_ENV_DIR="$HOME_DIR/.config/yarsalam/ai-packs"
BACKEND_REPO="ghcr.io/yarsalam/admin-panel-backend"
WEB_REPO="ghcr.io/yarsalam/admin-panel-web"
BACKEND_COMPOSE="$ADMIN_ROOT/docker-compose.backend.runtime.yml"
WEB_COMPOSE="$ADMIN_ROOT/docker-compose.runtime.yml"
ADMIN_RAW="https://raw.githubusercontent.com/yarsalam/admin-panel/$ADMIN_RUNTIME_REF"
AI_RAW="https://raw.githubusercontent.com/yarsalam/ai-packs/$AI_PACKS_RUNTIME_REF"

[[ -f "$ENV_FILE" ]] || { echo "Private Admin .env not found." >&2; exit 1; }
[[ -d "$AI_ROOT/deploy/compose" && -d "$AI_ENV_DIR" ]] || { echo "AI Pack Compose/env directories missing." >&2; exit 1; }
docker network inspect yarsalam_network >/dev/null 2>&1 || { echo "Shared yarsalam_network missing." >&2; exit 1; }
[[ -f "$WEB_COMPOSE" ]] || { echo "Persisted Admin web runtime Compose missing." >&2; exit 1; }

TMP="$(mktemp -d)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ROLLBACK_TAG="rollback-$STAMP"
ENV_BACKUP="$ADMIN_ROOT/.env.$STAMP.pre-ai-pack-control.bak"
BACKEND_COMPOSE_BACKUP="$ADMIN_ROOT/docker-compose.backend.runtime.yml.$STAMP.bak"
WEB_COMPOSE_BACKUP="$ADMIN_ROOT/docker-compose.runtime.yml.$STAMP.bak"
ENV_UPDATED=0
DEPLOY_STARTED=0
SUCCESS=0
OLD_BACKEND_ID=""
OLD_WEB_ID=""

log() { printf '%s\n' "$*"; }
cleanup() { rm -rf "$TMP"; }

get_env_value() {
  python3 - "$ENV_FILE" "$1" <<'PY'
import sys
from pathlib import Path
for line in Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace").splitlines():
    if line.startswith(sys.argv[2] + "="):
        print(line.split("=", 1)[1].strip().strip('"').strip("'"))
        break
PY
}

set_env_values() {
  python3 - "$ENV_FILE" "$@" <<'PY'
import os, sys, tempfile
from pathlib import Path
path = Path(sys.argv[1])
pairs = sys.argv[2:]
values = dict(pair.split("=", 1) for pair in pairs)
old = path.read_text(encoding="utf-8", errors="replace").splitlines()
pending = dict(values)
out = []
for line in old:
    key = line.split("=", 1)[0].strip() if "=" in line and not line.lstrip().startswith("#") else None
    if key in pending:
        out.append(key + "=" + pending.pop(key))
    else:
        out.append(line)
out.extend(key + "=" + value for key, value in pending.items())
fd, tmp = tempfile.mkstemp(prefix=path.name + ".", dir=str(path.parent))
try:
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write("\n".join(out).rstrip() + "\n")
        f.flush()
        os.fsync(f.fileno())
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)
finally:
    try: os.unlink(tmp)
    except FileNotFoundError: pass
os.chmod(path, 0o600)
PY
}

compose_backend() {
  docker compose --project-name "$PROJECT" --env-file "$ENV_FILE" -f "$BACKEND_COMPOSE" "$@"
}
compose_web() {
  docker compose --project-name "$PROJECT" --env-file "$ENV_FILE" -f "$WEB_COMPOSE" "$@"
}
find_container() {
  local service="$1"
  docker ps -aq \
    --filter "label=com.docker.compose.project=$PROJECT" \
    --filter "label=com.docker.compose.service=$service" | head -n1
}
wait_health() {
  local service="$1" cid state attempt
  for attempt in $(seq 1 60); do
    cid="$(find_container "$service")"
    [[ -n "$cid" ]] || { sleep 2; continue; }
    state="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || true)"
    if [[ "$state" == "healthy" ]]; then
      printf '%s' "$cid"
      return 0
    fi
    if [[ "$state" == "unhealthy" || "$state" == "exited" || "$state" == "dead" ]]; then
      docker logs --tail=80 "$cid" 2>&1 | tail -80
      return 1
    fi
    sleep 2
  done
  cid="$(find_container "$service")"
  [[ -z "$cid" ]] || docker logs --tail=80 "$cid" 2>&1 | tail -80
  return 1
}
rollback() {
  local rc=$?
  trap - EXIT
  if [[ "$rc" -ne 0 ]]; then
    log "OPERATION_FAILED=1"
    if [[ "$ENV_UPDATED" == "1" ]]; then
      log "Restoring previous Admin containers from local rollback image aliases..."
      set_env_values "$ENV_FILE" \
        "ADMIN_BACKEND_IMAGE_TAG=$ROLLBACK_TAG" \
        "ADMIN_WEB_IMAGE_TAG=$ROLLBACK_TAG" || true
    fi
    if [[ "$DEPLOY_STARTED" == "1" ]]; then
      compose_backend up -d --no-deps --force-recreate --pull never admin-backend || true
      compose_web up -d --no-deps --force-recreate --pull never admin-web || true
      wait_health admin-backend >/dev/null || log "BACKEND_ROLLBACK_HEALTH=FAILED"
      wait_health admin-web >/dev/null || log "WEB_ROLLBACK_HEALTH=FAILED"
    fi
    log "Rollback aliases are preserved locally: $BACKEND_REPO:$ROLLBACK_TAG and $WEB_REPO:$ROLLBACK_TAG"
    log "Admin private env backup: $ENV_BACKUP"
  fi
  cleanup
  exit "$rc"
}
trap rollback EXIT

log "===== 1. VERIFY EXISTING ADMIN CONTAINERS AND CAPTURE ROLLBACK IMAGES ====="
OLD_BACKEND_CONTAINER="$(find_container admin-backend)"
OLD_WEB_CONTAINER="$(find_container admin-web)"
[[ -n "$OLD_BACKEND_CONTAINER" && -n "$OLD_WEB_CONTAINER" ]] || {
  echo "Both existing Admin containers must be present; refusing blind replacement." >&2
  exit 1
}
OLD_BACKEND_ID="$(docker inspect -f '{{.Image}}' "$OLD_BACKEND_CONTAINER")"
OLD_WEB_ID="$(docker inspect -f '{{.Image}}' "$OLD_WEB_CONTAINER")"
docker image tag "$OLD_BACKEND_ID" "$BACKEND_REPO:$ROLLBACK_TAG"
docker image tag "$OLD_WEB_ID" "$WEB_REPO:$ROLLBACK_TAG"

NEXT_PUBLIC_API_URL="$(get_env_value NEXT_PUBLIC_API_URL)"
[[ "$NEXT_PUBLIC_API_URL" == "https://novertex.ir/api" ]] || {
  echo "NEXT_PUBLIC_API_URL is not the verified production URL; refusing image mismatch." >&2
  exit 1
}

log "===== 2. INSTALL RESTRICTED PACK CONTROLLER AND RUN PROGRESSIVE LIVE TESTS ====="
curl -fsSL --retry 3 "$AI_RAW/scripts/install_ai_pack_control_agent.sh" -o "$TMP/install_ai_pack_control_agent.sh"
chmod 500 "$TMP/install_ai_pack_control_agent.sh"
AI_PACK_CONTROL_REF="$AI_PACKS_RUNTIME_REF" bash "$TMP/install_ai_pack_control_agent.sh"

log "===== 3. FETCH AND INSTALL THE TWO ADMIN RUNTIME COMPOSE FILES ====="
curl -fsSL --retry 3 "$ADMIN_RAW/docker-compose.backend.runtime.yml" -o "$TMP/docker-compose.backend.runtime.yml"
curl -fsSL --retry 3 "$ADMIN_RAW/docker-compose.runtime.yml" -o "$TMP/docker-compose.runtime.yml"

cp -p "$ENV_FILE" "$ENV_BACKUP"
chmod 600 "$ENV_BACKUP"
cp -p "$WEB_COMPOSE" "$WEB_COMPOSE_BACKUP"
cp -p "$BACKEND_COMPOSE" "$BACKEND_COMPOSE_BACKUP" 2>/dev/null || true

install -m 0644 "$TMP/docker-compose.backend.runtime.yml" "$BACKEND_COMPOSE"
install -m 0644 "$TMP/docker-compose.runtime.yml" "$WEB_COMPOSE"

log "===== 4. UPDATE TAGS AND VALIDATE COMPOSE ALLOWLIST ====="
set_env_values "$ENV_FILE" \
  "ADMIN_BACKEND_IMAGE_TAG=$ADMIN_RUNTIME_IMAGE_TAG" \
  "ADMIN_WEB_IMAGE_TAG=$ADMIN_RUNTIME_IMAGE_TAG"
ENV_UPDATED=1

AI_URL="$(get_env_value AI_PACK_CONTROL_URL)"
AI_TOKEN="$(get_env_value AI_PACK_CONTROL_TOKEN)"
[[ "$AI_URL" =~ ^http://([0-9]{1,3}\.){3}[0-9]{1,3}:9115$ ]] || {
  echo "AI_PACK_CONTROL_URL is missing or not on the private bridge." >&2; exit 1;
}
[[ ${#AI_TOKEN} -ge 48 ]] || { echo "AI_PACK_CONTROL_TOKEN is missing or too short." >&2; exit 1; }

compose_backend config --format json > "$TMP/backend-config.json"
compose_web config --format json > "$TMP/web-config.json"
python3 - "$TMP/backend-config.json" "$TMP/web-config.json" <<'PY'
import json, sys
backend, web = (json.load(open(p)) for p in sys.argv[1:])
def check(doc, service_name, expected_env, expected_port):
    if set(doc.get("services", {})) != {service_name}:
        raise SystemExit("unexpected service allowlist in " + service_name + " Compose")
    service = doc["services"][service_name]
    if service.get("build") or service.get("env_file") or service.get("volumes"):
        raise SystemExit(service_name + " must be image-only without env_file or bind mounts")
    if set(service.get("environment", {})) != expected_env:
        raise SystemExit(service_name + " environment allowlist mismatch")
    if not any(p.get("host_ip") == "127.0.0.1" and p.get("target") == expected_port
               and p.get("published") == str(expected_port) for p in service.get("ports", [])):
        raise SystemExit(service_name + " host port must be loopback-only")
    networks = service.get("networks", {})
    if "shared_network" not in networks:
        raise SystemExit(service_name + " shared network missing")
    network = doc.get("networks", {}).get("shared_network", {})
    if not network.get("external") or network.get("name") != "yarsalam_network":
        raise SystemExit(service_name + " must use external yarsalam_network")
check(backend, "admin-backend", {
    "NODE_ENV", "PORT", "DB_SYNC", "ADMIN_WEB_ORIGINS", "DB_HOST", "DB_PORT",
    "DB_USER", "DB_PASS", "DB_NAME", "JWT_SECRET", "REDIS_HOST", "REDIS_PORT",
    "USER_API_BASE_URL", "USER_API_KEY", "AI_PACK_CONTROL_URL",
    "AI_PACK_CONTROL_TOKEN", "NODE_OPTIONS"
}, 4000)
check(web, "admin-web", {
    "NODE_ENV", "PORT", "HOSTNAME", "NEXT_TELEMETRY_DISABLED", "NEXT_PUBLIC_API_URL"
}, 3000)
print("ADMIN_BACKEND_COMPOSE=PASS")
print("ADMIN_WEB_COMPOSE=PASS")
print("PRIVATE_CONTROL_TOKEN_IN_WEB=NONE")
PY

log "===== 5. PULL ONLY THE TWO ADMIN IMMUTABLE IMAGES ====="
compose_backend pull admin-backend
compose_web pull admin-web

log "===== 6. DEPLOY ADMIN BACKEND ONLY ====="
DEPLOY_STARTED=1
compose_backend up -d --no-deps --force-recreate --pull never admin-backend
BACKEND_CONTAINER="$(wait_health admin-backend)" || { echo "Admin backend did not become healthy." >&2; exit 1; }

BACKEND_GUARD_HTTP="$(curl -sS --connect-timeout 3 --max-time 8 -o /dev/null -w '%{http_code}' \
  http://127.0.0.1:4000/infrastructure/ai-packs/status || true)"
[[ "$BACKEND_GUARD_HTTP" == "401" || "$BACKEND_GUARD_HTTP" == "403" ]] || {
  echo "Protected AI Pack API did not return expected HTTP 401/403 (got $BACKEND_GUARD_HTTP)." >&2; exit 1;
}

docker exec "$BACKEND_CONTAINER" node -e '
fetch(process.env.AI_PACK_CONTROL_URL+"/v1/status",{headers:{Authorization:"Bearer "+process.env.AI_PACK_CONTROL_TOKEN}})
.then(async r=>{console.log("AI_PACK_CONTROL_HTTP="+r.status);process.exit(r.status===200?0:1)})
.catch(()=>{console.error("AI_PACK_CONTROL_CONNECT=FAILED");process.exit(1)})
'

log "===== 7. DEPLOY ADMIN WEB ONLY ====="
compose_web up -d --no-deps --force-recreate --pull never admin-web
WEB_CONTAINER="$(wait_health admin-web)" || { echo "Admin web did not become healthy." >&2; exit 1; }

LOCAL_LOGIN_HTTP="$(curl -sS --connect-timeout 3 --max-time 10 -o /dev/null -w '%{http_code}' \
  http://127.0.0.1:3000/login || true)"
PUBLIC_LOGIN_HTTP="$(curl -sS --connect-timeout 5 --max-time 15 -o /dev/null -w '%{http_code}' \
  https://novertex.ir/login || true)"
[[ "$LOCAL_LOGIN_HTTP" == "200" ]] || { echo "Local Admin /login failed: HTTP=$LOCAL_LOGIN_HTTP" >&2; exit 1; }
[[ "$PUBLIC_LOGIN_HTTP" == "200" ]] || { echo "Public Admin /login failed: HTTP=$PUBLIC_LOGIN_HTTP" >&2; exit 1; }

SUCCESS=1
log "===== DEPLOYMENT RESULT ====="
log "ADMIN_BACKEND=HEALTHY"
log "ADMIN_WEB=HEALTHY"
log "PUBLIC_LOGIN_HTTP=$PUBLIC_LOGIN_HTTP"
log "AI_PACK_CONTROL_API=HEALTHY"
log "ADMIN_RUNTIME_IMAGE_TAG=$ADMIN_RUNTIME_IMAGE_TAG"
log "ROLLBACK_BACKEND_IMAGE=$BACKEND_REPO:$ROLLBACK_TAG"
log "ROLLBACK_WEB_IMAGE=$WEB_REPO:$ROLLBACK_TAG"
log "ENV_BACKUP=$ENV_BACKUP"
log "BACKEND_COMPOSE_BACKUP=$BACKEND_COMPOSE_BACKUP"
log "WEB_COMPOSE_BACKUP=$WEB_COMPOSE_BACKUP"
log "No DB, Redis, Qdrant, mobApp backend, Matching service or Nginx container was targeted."
log "SUCCESS=1"
