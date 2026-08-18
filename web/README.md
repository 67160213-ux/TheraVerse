# วินัยนักสู้ — Gamified Diabetes Walking Therapeutics (Frontend)

React + TypeScript + Vite + Tailwind implementing the full 12-step User Journey for
ลุงสมศักดิ์'s walking-therapy SaMD prototype.

> **Running the whole system?** See the root `README.md` and root `docker-compose.yml` —
> this is one part of a combined stack (db + api + web) meant to run together with a single
> `docker compose up --build` from the project root. The instructions below are for running
> just this frontend on its own.

## Stack
- **Vite + React 18 + TypeScript** — fast dev/build, static output deployable anywhere
- **Tailwind CSS** — custom design tokens in `tailwind.config.js` (pine/gold/vital-zone palette)
- **React Router** — one route per journey step
- **React Context** (`src/context/AppContext.tsx`) — patient profile, device connection state,
  live vitals, game state, active session id
- **`src/lib/api.ts`** — typed client for every call to the backend API (base URL from
  `VITE_API_URL`)

## Journey → code map

| # | Journey step | File |
|---|---|---|
| 1 | Landing + HN login + PDPA consent (AC-01) | `src/pages/Landing.tsx` |
| 2 | Device Setup | `src/pages/DeviceSetup.tsx` |
| 3 | Web Bluetooth pairing (AC-02) | `src/pages/BluetoothConnect.tsx`, `src/hooks/useWebBluetooth.ts` |
| 4 | Pre-Run Lobby / character + HR target | `src/pages/PreRunLobby.tsx` |
| 5–7 | Run Tracker, Safety Break (AC-03), Gacha (AC-04) | `src/pages/RunTracker.tsx`, `src/components/SafetyBreakOverlay.tsx`, `src/components/GachaModal.tsx` |
| 8 | Battle Lobby | `src/pages/BattleLobby.tsx` |
| 9 | Active Battle + Force Quit on critical vitals (Edge case 3) | `src/pages/ActiveBattle.tsx` |
| 10 | Victory/Defeat + clinical-goal-first reward logic (AC-04) | `src/pages/BattleResult.tsx` |
| 11 | Clinical Dashboard report submission | `src/pages/ClinicalDashboard.tsx` |
| 12 | Rewards / Marketplace, QR voucher | `src/pages/Rewards.tsx` |

## Edge cases implemented
- **Bluetooth dropped**: `useWebBluetooth.ts` never throws into the UI; failure states are
  surfaced as plain-language banners with a manual-entry fallback path.
- **GPS lost**: `RunTracker.tsx` has a toggle simulating tunnel/tree cover — distance accrual
  switches to a step-count estimate instead of stalling.
- **Critical vitals during battle**: `ActiveBattle.tsx` watches for a red-zone HR spike and
  immediately force-navigates back to the Run Tracker's Safety Break path, ignoring score.

## What's wired to the API (no longer local-only state)

Every screen that touches patient data now calls the real API instead of just updating local
React state:

| Screen | API calls |
|---|---|
| Landing | `POST /patients`, `PATCH /patients/:hn/consent` |
| Device pairing | `POST /patients/:hn/devices/pair` |
| Pre-Run Lobby | `POST /patients/:hn/sessions` |
| Run Tracker | `POST /sessions/:id/progress` every second |
| Battle Result | `POST /sessions/:id/battle` |
| Clinical Dashboard | `POST /sessions/:id/clinical-report` |
| Rewards | `GET /patients/:hn/rewards`, `POST /patients/:hn/rewards/redeem` |

Zone (green/red) and reward eligibility are decided **server-side**; the frontend reflects what
the API returns rather than recomputing the authoritative answer itself.

## Real hardware integration

The vitals *values* themselves are still simulated in `src/hooks/useVitalsSimulator.ts` — there's
no physical Garmin watch or CGM in this environment — but every simulated reading is pushed to
the real API each second. To wire in real hardware, replace the simulator's writes with
`navigator.bluetooth` GATT notification handlers; the commented-out sketch is in
`useWebBluetooth.ts`.

## Run standalone (local, no Docker)

```bash
cp .env.example .env    # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev              # http://localhost:5173
```

## Build & deploy

```bash
npm run build      # outputs static site to dist/
npm run preview    # sanity-check the production build locally
```

`dist/` is a plain static site — deploy it to Vercel, Netlify, Cloudflare Pages, GitHub Pages,
or any static host / CDN. It calls the API at whatever `VITE_API_URL` was set to at build time,
so point that at wherever the `api` service actually runs in production.

**Note on Web Bluetooth:** it only works over HTTPS (or localhost) and only in
Chromium-based browsers (Chrome, Edge) — Safari and Firefox do not support it. The app
detects this via `devices.bluetoothSupported` and degrades gracefully.
