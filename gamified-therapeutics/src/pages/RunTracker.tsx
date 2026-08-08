import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useVitalsSimulator } from '../hooks/useVitalsSimulator'
import VitalsBadge from '../components/VitalsBadge'
import SafetyBreakOverlay from '../components/SafetyBreakOverlay'
import GachaModal from '../components/GachaModal'
import BigButton from '../components/BigButton'

const GACHA_INTERVAL_M = 500

export default function RunTracker() {
  const navigate = useNavigate()
  const { patient, zone, game, setGame } = useApp()
  const [running, setRunning] = useState(true)
  const [gpsLost, setGpsLost] = useState(false)
  const [forceDanger, setForceDanger] = useState(false)
  const [gachaOpen, setGachaOpen] = useState(false)
  const lastGachaAt = useRef(0)

  useVitalsSimulator(running && !gachaOpen, forceDanger)

  // Simulate distance accrual: GPS normally, step-count fallback if signal is lost (edge case #2).
  useEffect(() => {
    if (!running || gachaOpen) return
    const id = setInterval(() => {
      setGame((g) => {
        const metersPerTick = gpsLost ? 14 /* step-count estimate */ : 16 /* GPS */
        const onlyIfSafe = zone === 'green'
        const nextDistance = g.distanceM + (onlyIfSafe ? metersPerTick : 0)
        if (Math.floor(nextDistance / GACHA_INTERVAL_M) > Math.floor(lastGachaAt.current / GACHA_INTERVAL_M)) {
          lastGachaAt.current = nextDistance
          setGachaOpen(true)
        }
        return { ...g, distanceM: nextDistance }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, gachaOpen, gpsLost, zone, setGame])

  const goalM = patient?.dailyDistanceGoalM ?? 2000
  const progressPct = Math.min(100, (game.distanceM / goalM) * 100)
  const goalReached = game.distanceM >= 2000

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gold-600 font-semibold text-sm">กำลังเดินบำบัด</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">Run Tracker</h1>
      </div>

      <VitalsBadge />

      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex justify-between items-baseline mb-2">
          <p className="font-display font-semibold">ระยะทางวันนี้</p>
          <p className="font-display text-2xl font-bold text-pine-900">
            {(game.distanceM / 1000).toFixed(2)} <span className="text-sm font-normal">/ {(goalM / 1000).toFixed(1)} กม.</span>
          </p>
        </div>
        <div className="h-3 bg-pine-50 rounded-full overflow-hidden">
          <div className="h-full bg-gold-400 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        {gpsLost && (
          <p className="text-xs text-ink/50 mt-2">
            📡 สัญญาณ GPS หลุด — กำลังใช้จำนวนก้าวจากนาฬิกาแทนชั่วคราว
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex-1 min-h-[56px] rounded-xl bg-white border-2 border-pine-300 font-semibold"
        >
          {running ? '⏸ หยุดชั่วคราว' : '▶ เดินต่อ'}
        </button>
        <button
          onClick={() => setGpsLost((v) => !v)}
          className="flex-1 min-h-[56px] rounded-xl bg-white border-2 border-pine-300 font-semibold text-sm"
        >
          {gpsLost ? 'จำลอง: สัญญาณกลับมา' : 'จำลอง: เข้าอุโมงค์ (GPS หาย)'}
        </button>
      </div>

      <button
        onClick={() => setForceDanger((v) => !v)}
        className="w-full text-xs text-ink/40 underline"
      >
        {forceDanger ? 'ยกเลิกการจำลองภาวะฉุกเฉิน' : 'จำลองภาวะฉุกเฉิน (ทดสอบ Safety Break)'}
      </button>

      <BigButton variant="gold" onClick={() => navigate('/battle')} disabled={!goalReached}>
        {goalReached ? 'ถัดไป: ท้าดวลบอสประจำวัน' : `เดินอีก ${((2000 - game.distanceM) / 1000).toFixed(2)} กม. เพื่อปลดล็อกบอส`}
      </BigButton>

      <GachaModal
        open={gachaOpen}
        onClaim={() => {
          setGame((g) => ({ ...g, discCoins: g.discCoins + 1 }))
          setGachaOpen(false)
        }}
      />
      <SafetyBreakOverlay active={running} onResolved={() => setForceDanger(false)} />
    </div>
  )
}
