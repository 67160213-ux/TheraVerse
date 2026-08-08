# Gamified Diabetes Therapeutics — REST API

Backend for the "วินัยนักสู้" walking-therapy SaMD prototype. Node.js + TypeScript +
Express + Prisma + PostgreSQL, containerized with **Docker & Docker Compose**.

Pairs with the frontend built earlier (`gamified-diabetes-therapeutics.zip`) — every
stubbed `fetch()` comment in that project maps to an endpoint here.

## Stack
- **Express + TypeScript** — REST API, `zod` for request validation
- **Prisma + PostgreSQL** — patients, devices, vitals, sessions, battles, clinical reports, rewards
- **Docker Compose** — `api` (Node) + `db` (Postgres 16) + optional `adminer` DB browser
- **Swagger UI** at `/api/docs` for interactive exploration

## Quick start (Docker)

```bash
cp .env.docker.example .env       # edit POSTGRES_PASSWORD before any real deployment
docker compose up --build
```

- API: http://localhost:4000/api/health
- Docs: http://localhost:4000/api/docs
- DB browser (optional): `docker compose --profile tools up adminer` → http://localhost:8080

The `api` container runs `prisma migrate deploy` automatically on startup
(`docker-entrypoint.sh`) before the server starts — no manual migration step needed.

To seed the demo patient (ลุงสมศักดิ์, HN `6501234`):
```bash
docker compose exec api npx tsx prisma/seed.ts
```

## Quick start (local, no Docker)

```bash
cp .env.example .env
# start a local Postgres however you like, matching DATABASE_URL in .env
npm install
npx prisma migrate deploy
npm run dev          # http://localhost:4000
```

## Data model

| Table | Purpose |
|---|---|
| `Patient` | HN, clinical targets, PDPA consent (AC-01) |
| `DeviceLink` | Garmin watch / CGM pairing state (AC-02) |
| `VitalReading` | Every HR + glucose tick, tagged with computed zone |
| `WalkSession` | One walking-therapy session: distance, GPS-loss count, safety-break count |
| `BattleResult` | Boss battle outcome per session |
| `ClinicalReport` | Encrypted-at-rest vitals profile submitted to the hospital backend |
| `RewardToken` | "Token of Discipline" — issued on clinical goal met, regardless of battle outcome |
| `Voucher` | 15% pharmacy discount code, redeemed from a token |

## Endpoint walkthrough (mirrors the 12-step user journey)

```bash
# 1. Landing — look up / register by HN, then give PDPA consent
curl -X POST localhost:4000/api/patients -d '{"hn":"6501234","name":"ลุงสมศักดิ์","age":62}' -H 'Content-Type: application/json'
curl -X PATCH localhost:4000/api/patients/6501234/consent -d '{"agreed":true}' -H 'Content-Type: application/json'

# 2-3. Device Setup + Web Bluetooth pairing
curl -X POST localhost:4000/api/patients/6501234/devices/pair -d '{"deviceType":"WATCH"}' -H 'Content-Type: application/json'
curl -X POST localhost:4000/api/patients/6501234/devices/pair -d '{"deviceType":"CGM"}' -H 'Content-Type: application/json'

# 4-5. Start the walk session, then stream vitals ticks
curl -X POST localhost:4000/api/patients/6501234/sessions
curl -X POST localhost:4000/api/sessions/<sessionId>/progress \
  -d '{"heartRateBpm":110,"glucoseMgDl":115,"deltaDistanceM":16}' -H 'Content-Type: application/json'

# 8-10. Battle outcome — issues a reward token if the clinical goal was met
curl -X POST localhost:4000/api/sessions/<sessionId>/battle -d '{"outcome":"DEFEAT","comboMax":12}' -H 'Content-Type: application/json'

# 11. Submit the clinical report
curl -X POST localhost:4000/api/sessions/<sessionId>/clinical-report

# 12. Rewards — check balance, redeem for a QR/promo voucher
curl localhost:4000/api/patients/6501234/rewards
curl -X POST localhost:4000/api/patients/6501234/rewards/redeem
```

Full route list with descriptions: `GET /api/docs`.

## Design notes
- **PDPA gate**: device pairing, session start, and vitals ingestion all check
  `patient.consentGiven` server-side (`getConsentedPatientOrThrow`), not just in the UI —
  AC-01 is enforced at the API, not trusted from the client.
- **Zone computed server-side** (`src/utils/zone.ts`) from the patient's own HR targets, so
  distance only accrues and gacha/battle credit only counts while genuinely in the green zone —
  a client can't just report `zone: "green"` directly.
- **Clinical-goal-first reward logic** (AC-04): `POST /sessions/:id/battle` checks
  `session.distanceM >= patient.dailyDistanceGoalM` independently of the battle outcome before
  issuing a token — losing the boss fight never blocks a clinically-earned reward.
- **No secrets in the image**: `.env` is excluded via `.dockerignore`; Postgres credentials are
  injected at `docker compose up` time from your `.env`, never baked into the Dockerfile.

## Project layout

```
src/
  app.ts               Express app assembly, middleware, route mounting
  index.ts             Entrypoint, graceful shutdown
  lib/prisma.ts         Prisma client singleton
  middleware/errorHandler.ts
  utils/                asyncHandler, zone computation, consent guard
  routes/
    patients.ts          HN lookup/register, PDPA consent
    devices.ts            Web Bluetooth pairing state
    sessions.ts            Session create + progress/complete/detail
    battles.ts              Boss battle outcome + reward token issuance
    clinicalReports.ts       Report submission + listing
    rewards.ts                Token balance + voucher redemption
prisma/
  schema.prisma          Data model
  migrations/              Hand-reviewed initial migration
  seed.ts                    Demo patient seed
Dockerfile              Multi-stage build (deps → build → prod-deps → runner)
docker-compose.yml     api + db (+ optional adminer) services
docker-entrypoint.sh  Runs `prisma migrate deploy` before starting the server
```

## Note on this scaffold

`prisma generate` needs to reach `binaries.prisma.sh` to download the query engine — this was
not reachable from the sandbox this API was built in, so the Prisma client types couldn't be
regenerated and verified end-to-end here. The schema, hand-written initial migration, and
application code were all reviewed manually for consistency, and `tsc` was run to confirm the
only outstanding errors were the expected "implicit any" ones from the *un-generated* Prisma
client (which resolve once `prisma generate` runs, as it does automatically during
`docker compose build`). Run `docker compose up --build` and check `/api/health` as your first
verification step.
