# วินัยนักสู้ — Gamified Diabetes Walking Therapeutics (Frontend)

React + TypeScript + Vite + Tailwind implementing the full 12-step User Journey for
ลุงสมศักดิ์'s walking-therapy SaMD prototype.

> **Running the whole system?** See the root [`README.md`](file:///d:/webapp/DiaHero/README.md) and root [`docker-compose.yml`](file:///d:/webapp/DiaHero/docker-compose.yml) —
> this is one part of a combined stack (db + api + web) meant to run together with a single
> `docker compose up --build` from the project root. The instructions below are for running
> just this frontend on its own.

## Stack
- **Vite + React 18 + TypeScript** — fast dev/build, static output deployable anywhere
- **Tailwind CSS** — custom design tokens (pine/gold/vital-zone palette)
- **React Router** — one route per journey step
- **React Context** ([`src/context/AppContext.tsx`](file:///d:/webapp/DiaHero/web/src/context/AppContext.tsx)) — patient profile, device connection state, live vitals, game state, active session id
- **[`src/lib/api.ts`](file:///d:/webapp/DiaHero/web/src/lib/api.ts)** — typed client for every call to the backend API (base URL from `VITE_API_URL`)

## Journey → code map

| # | Journey step | File |
|---|---|---|
| 1 | Landing + HN login + PDPA consent (AC-01) | [`src/pages/Landing.tsx`](file:///d:/webapp/DiaHero/web/src/pages/Landing.tsx) |
| 2 | Device Setup | [`src/pages/DeviceSetup.tsx`](file:///d:/webapp/DiaHero/web/src/pages/DeviceSetup.tsx) |
| 3 | Web Bluetooth pairing & Auto-Sync (AC-02) | [`src/pages/BluetoothConnect.tsx`](file:///d:/webapp/DiaHero/web/src/pages/BluetoothConnect.tsx), [`src/hooks/useWebBluetooth.ts`](file:///d:/webapp/DiaHero/web/src/hooks/useWebBluetooth.ts) |
| 4 | Pre-Run Lobby / character selection + HR target + Dev Warp | [`src/pages/PreRunLobby.tsx`](file:///d:/webapp/DiaHero/web/src/pages/PreRunLobby.tsx) |
| 5–7 | Run Tracker, Safety Break (AC-03), Gacha (AC-04) + Dev Warp | [`src/pages/RunTracker.tsx`](file:///d:/webapp/DiaHero/web/src/pages/RunTracker.tsx), [`src/components/SafetyBreakOverlay.tsx`](file:///d:/webapp/DiaHero/web/src/components/SafetyBreakOverlay.tsx), [`src/components/GachaModal.tsx`](file:///d:/webapp/DiaHero/web/src/components/GachaModal.tsx) |
| 8 | Battle Lobby | [`src/pages/BattleLobby.tsx`](file:///d:/webapp/DiaHero/web/src/pages/BattleLobby.tsx) |
| 9 | Active Battle + Battle Simulations & Critical Force Exit | [`src/pages/ActiveBattle.tsx`](file:///d:/webapp/DiaHero/web/src/pages/ActiveBattle.tsx) |
| 10 | Victory/Defeat + clinical-goal-first reward logic (AC-04) | [`src/pages/BattleResult.tsx`](file:///d:/webapp/DiaHero/web/src/pages/BattleResult.tsx) |
| 11 | Clinical Dashboard report submission | [`src/pages/ClinicalDashboard.tsx`](file:///d:/webapp/DiaHero/web/src/pages/ClinicalDashboard.tsx) |
| 12 | Rewards / Hospital Discounts, Real Scannable QR Codes & Token Grant | [`src/pages/Rewards.tsx`](file:///d:/webapp/DiaHero/web/src/pages/Rewards.tsx) |

## Dev Tools & Simulation Shortcuts

- **⚡ Warp to Boss Battle**: Available on both [`PreRunLobby.tsx`](file:///d:/webapp/DiaHero/web/src/pages/PreRunLobby.tsx) and [`RunTracker.tsx`](file:///d:/webapp/DiaHero/web/src/pages/RunTracker.tsx) — instantly sets target distance (2.0 km) and unlocks the boss fight without manual waiting.
- **🛠️ Battle Simulation Controls**: Available on [`ActiveBattle.tsx`](file:///d:/webapp/DiaHero/web/src/pages/ActiveBattle.tsx) — allows testing:
  - 🏆 **Simulate Victory**: Sets Boss HP to 10% for a victory outcome.
  - 🛡️ **Simulate Defeat**: Sets Boss HP to 80% (>40%) to demonstrate defeat outcome while still earning tokens for clinical goal completion.
  - 🚨 **Simulate Critical HR Hazard**: Triggers an emergency heart-rate spike, forcing an immediate safety exit to the Run Tracker overlay.
- **✨ Discipline Token Grant**: Available on [`Rewards.tsx`](file:///d:/webapp/DiaHero/web/src/pages/Rewards.tsx) — grants extra discipline tokens to test redeeming hospital discount vouchers.
- **📱 Real Scannable QR Codes**: Generated dynamically for redeemed promo vouchers; includes an interactive full-screen QR inspection modal.

## Edge cases implemented
- **Bluetooth dropped**: [`useWebBluetooth.ts`](file:///d:/webapp/DiaHero/web/src/hooks/useWebBluetooth.ts) never throws into the UI; failure states are surfaced as plain-language banners with a manual-entry fallback path.
- **GPS lost**: [`RunTracker.tsx`](file:///d:/webapp/DiaHero/web/src/pages/RunTracker.tsx) has a toggle simulating tunnel/tree cover — distance accrual switches to a step-count estimate instead of stalling.
- **Critical vitals during battle**: [`ActiveBattle.tsx`](file:///d:/webapp/DiaHero/web/src/pages/ActiveBattle.tsx) watches for a red-zone HR spike and immediately force-navigates back to the Run Tracker's Safety Break path, ignoring score.

## What's wired to the API

Every screen that touches patient data calls the real API:

| Screen | API calls |
|---|---|
| Landing | `POST /patients`, `PATCH /patients/:hn/consent` |
| Device pairing | `POST /patients/:hn/devices/pair` |
| Pre-Run Lobby | `POST /patients/:hn/sessions` |
| Run Tracker | `POST /sessions/:id/progress` every second |
| Battle Result | `POST /sessions/:id/battle` |
| Clinical Dashboard | `POST /sessions/:id/clinical-report` |
| Rewards | `GET /patients/:hn/rewards`, `POST /patients/:hn/rewards/redeem`, `POST /patients/:hn/rewards/grant` |

Zone (green/red) and reward eligibility are decided **server-side**; the frontend reflects what the API returns.

## Real hardware integration

The vitals *values* themselves are simulated in [`useVitalsSimulator.ts`](file:///d:/webapp/DiaHero/web/src/hooks/useVitalsSimulator.ts), but every reading is pushed to the API each second. To wire in real hardware, replace the simulator's writes with `navigator.bluetooth` GATT notification handlers; the commented-out sketch is in [`useWebBluetooth.ts`](file:///d:/webapp/DiaHero/web/src/hooks/useWebBluetooth.ts).

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

`dist/` is a plain static site — deploy it to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host / CDN.

**Note on Web Bluetooth:** it only works over HTTPS (or localhost) and only in Chromium-based browsers (Chrome, Edge). The app detects this via `devices.bluetoothSupported` and degrades gracefully.
