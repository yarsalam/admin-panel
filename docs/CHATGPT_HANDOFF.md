# ChatGPT handoff — Yarsalam admin panel deployment

Last updated: 2026-10-25

## Standing requirements

- Account for Iran filtering and possible loss of international connectivity. Do not promise that a foreign VPS will always be reachable from Iran.
- The admin panel must remain private by default; use VPN/SSH tunnel first, with allowlisting only as an explicitly reviewed alternative.
- Only runtime artifacts go to the VPS. Source, tests, Git history, pnpm workspace, and development tooling remain in GitHub/CI. Prefer CI-built immutable images.
- Never commit production secrets or include them in image layers.
- Do not run the existing development Compose file or publish the admin hostname until production manifests and access controls are reviewed.
- Give concrete commands for the next step and do not claim to have executed VPS commands.

## Confirmed deployment environment

The VPS is `185.7.172.248`, Ubuntu 24.04.5 LTS, kernel `6.8.0-147-generic`, 8 GiB RAM, 4 vCPU, approximately 133 GB disk. SSH is key-only with root/password/keyboard-interactive SSH login disabled. UFW allows TCP 22/80/443. Docker and Compose are active. The deployment directories exist at `/opt/yarsalam`, `/opt/yarsalam/secrets` (0700), and `/srv/yarsalam`. No application containers have been deployed.

## Repository-specific caution

The current admin Compose and Dockerfiles are development-only: they publish service ports, mount source, use dev servers, and contain fixed example credentials. There is no production Compose or production Dockerfile yet. Build the monorepo from its root in CI and deploy only production images by immutable digest. Do not clone the repository or run the existing Compose stack on the VPS.

## Next actions

1. Create production Dockerfiles for web and server, respecting the pnpm monorepo/lockfile.
2. Build and test images in CI, scan them, and publish immutable references.
3. Create minimal production Compose with private-only admin routing, no public DB/Redis ports, explicit resources/health checks, and schema sync disabled.
4. Review API origin, TLS, CORS, authentication, and the private access method.
5. Document backup/restore, monitoring, rollback, and connectivity-outage procedures.
6. Obtain explicit approval before first startup or DNS publication.

See [PRODUCTION_DEPLOYMENT_POLICY.md](PRODUCTION_DEPLOYMENT_POLICY.md) for release gates.
