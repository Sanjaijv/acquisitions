# Docker + Neon Local/Neon Cloud

This repository is dockerized to support:

- Development: local Neon Local proxy + app with automatic ephemeral branches
- Production: app only, connecting to Neon Cloud via DATABASE_URL

## Prerequisites

- Docker and Docker Compose
- A Neon account and project
- Your Neon credentials:
  - NEON_API_KEY
  - NEON_PROJECT_ID
  - PARENT_BRANCH_ID (the branch to fork for ephemeral branches; e.g. your main branch ID)

## Environment setup

Copy and fill the appropriate env files:

- Development: `.env.development`
  - Set `NEON_API_KEY`, `NEON_PROJECT_ID`, and `PARENT_BRANCH_ID`
  - The `DATABASE_URL` for the app is injected by compose to `postgres://dev:dev@neon-local:5432/devdb`
- Production: `.env.production`
  - Set `DATABASE_URL` to your Neon Cloud URL (e.g., `postgres://…neon.tech…?sslmode=require`)
  - Set `JWT_SECRET` and any other secrets

Note: `.env` contains only placeholders. Do not put real secrets there.

## Run in development (Neon Local)

This spins up Neon Local and the app. Neon Local will create an ephemeral branch on start and delete it on stop.

```bash
# Build and start
docker compose -f docker-compose.dev.yml --env-file .env.development up --build

# Stop and remove containers
docker compose -f docker-compose.dev.yml down
```

- App: http://localhost:3000
- Health: http://localhost:3000/health

If you need to use the neon-http driver locally instead (not typical with Neon Local), set `USE_NEON_HTTP=true` and provide a Neon Cloud `DATABASE_URL` in `.env.development`.

## Run in production (Neon Cloud)

This runs the app only, connecting to your external Neon database.

```bash
# Build and start
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

## How DATABASE_URL switches

- Development: `docker-compose.dev.yml` injects `DATABASE_URL=postgres://dev:dev@neon-local:5432/devdb`, and `PGSSLMODE=disable`. The app uses node-postgres (wire protocol) to talk to Neon Local.
- Production: `.env.production` provides the Neon Cloud URL and `PGSSLMODE=require`. The app autodetects `neon.tech` and uses the Neon HTTP driver.

## Implementation details

- `src/config/database.js` selects the driver automatically:
  - If `DATABASE_URL` matches `neon.tech` or `USE_NEON_HTTP=true`, it uses `@neondatabase/serverless` + `drizzle-orm/neon-http` (HTTP driver)
  - Otherwise it uses `pg` + `drizzle-orm/node-postgres` (wire protocol)
- Dockerfile:
  - `dev` stage runs `npm run dev` (Node watch mode)
  - `prod` stage installs production deps and runs `node src/index.js`
- Compose:
  - `docker-compose.dev.yml` includes `neon-local` service with `neondatabase/neon_local:latest`
  - `docker-compose.prod.yml` runs only the app; Neon Cloud is external

## Notes

- Ensure your Neon role/database exist in the parent branch if your app expects specific schemas. Neon Local creates ephemeral branches, not migrations. Run your migrations against the ephemeral branch as part of your dev flow.
- Lint/format:
  - `npm run lint` / `npm run lint:fix`
  - `npm run format` / `npm run format:check`
