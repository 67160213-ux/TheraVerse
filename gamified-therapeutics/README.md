# วินัยนักสู้ — Gamified Diabetes Walking Therapeutics (Frontend)

React + TypeScript + Vite + Tailwind scaffold implementing the full 12-step
User Journey for ลุงสมศักดิ์'s walking-therapy SaMD prototype.

## Stack
- **Vite + React 18 + TypeScript** — fast dev/build, static output deployable anywhere
- **Tailwind CSS** — custom design tokens in `tailwind.config.js` (pine/gold/vital-zone palette)
- **React Router** — one route per journey step
- **React Context** (`src/context/AppContext.tsx`) — single source of truth for patient profile,
  device connection state, live vitals, game state, and reward vouchers

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

## Real hardware integration

The vitals feed is currently simulated in `src/hooks/useVitalsSimulator.ts` so the whole
journey is demoable without physical devices. To wire in real Garmin/CGM hardware, replace
the simulator's `setInterval` writes with `navigator.bluetooth` GATT notification handlers —
the commented-out real implementation is sketched inline in `useWebBluetooth.ts`.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build & deploy

```bash
npm run build      # outputs static site to dist/
npm run preview    # sanity-check the production build locally
```

`dist/` is a plain static site — deploy it to Vercel, Netlify, Cloudflare Pages, GitHub Pages,
or any static host / CDN. No server-side code is required for this frontend; it expects a
backend (hospital DB lookup, clinical report ingestion, promo-code issuance) to be wired up
behind the endpoints stubbed as comments in `ClinicalDashboard.tsx`, `Landing.tsx`, and
`Rewards.tsx`.

**Note on Web Bluetooth:** it only works over HTTPS (or localhost) and only in
Chromium-based browsers (Chrome, Edge) — Safari and Firefox do not support it. The app
detects this via `devices.bluetoothSupported` and degrades gracefully.
