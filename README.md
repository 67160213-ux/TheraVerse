# วินัยนักสู้ — Gamified Diabetes Walking Therapeutics

Full-stack prototype for a gamified walking-therapy SaMD app for Type 2 diabetes patients.
Single Docker Compose stack: **PostgreSQL + Node/Express API + React frontend (served via Nginx)**.

```
project/
  api/    REST API — Node.js, TypeScript, Express, Prisma, PostgreSQL
  web/    Frontend — React, TypeScript, Vite, Tailwind
  docker-compose.yml   Runs all three services together
  .env.example
```

## Run everything with one command

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---|---|
| Web app | http://localhost:8081 |
| API | http://localhost:4000/api |
| API docs (Swagger) | http://localhost:4000/api/docs |
| Health check | http://localhost:4000/api/health |
| DB browser (optional) | `docker compose --profile tools up adminer` → http://localhost:8080 |

The `api` container runs `prisma migrate deploy` automatically before starting — the database
schema is created for you on first boot, no manual migration step needed.

To seed the demo patient (ลุงสมศักดิ์, HN `6501234`):
```bash
docker compose exec api npx tsx prisma/seed.ts
```

## What's actually wired together

The frontend is no longer a standalone demo with local-only state — every screen that touches
patient data calls the real API (`web/src/lib/api.ts`):

| Screen | Calls |
|---|---|
| Landing (HN + PDPA consent) | `POST /patients`, `PATCH /patients/:hn/consent` |
| Device pairing | `POST /patients/:hn/devices/pair` |
| Pre-Run Lobby ("Start") | `POST /patients/:hn/sessions` |
| Run Tracker | `POST /sessions/:id/progress` (every second) |
| Battle Result | `POST /sessions/:id/battle` |
| Clinical Dashboard | `POST /sessions/:id/clinical-report` |
| Rewards | `GET /patients/:hn/rewards`, `POST /patients/:hn/rewards/redeem` |

The zone (green/red), distance accrual, and reward-eligibility logic are all decided
**server-side** in the API — the frontend displays what the server computed, it doesn't
recompute the authoritative state itself. Heart-rate and glucose values themselves are still
simulated client-side (`web/src/hooks/useVitalsSimulator.ts`) since there's no physical Garmin
watch or CGM in this environment — that's the one piece a real deployment would replace with
actual Web Bluetooth GATT reads.

## Run without Docker (for development)

```bash
# Terminal 1 — database + API
cd api
cp .env.example .env      # point DATABASE_URL at a local Postgres
npm install
npx prisma migrate deploy
npm run dev                # http://localhost:4000

# Terminal 2 — frontend
cd web
cp .env.example .env       # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

## Individual project docs

Deeper technical notes (data model, endpoint list, design decisions) live in each service's own
README: `api/README.md` and `web/README.md`.

## Note for grading / review

- `docker compose up --build` is the single command to run for a full working demo.
- `api/api/health` and `api/api/docs` are good first checks that the backend and its database
  connection are alive.
- The known limitation from earlier iteration — `prisma generate` needing network access to
  `binaries.prisma.sh` — only affected the sandbox this was built in; it resolves automatically
  during the normal `docker compose build` step on any machine with internet access.
