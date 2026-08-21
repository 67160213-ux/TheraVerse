import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useVitalsSimulator } from '../hooks/useVitalsSimulator'
import { api } from '../lib/api'
import { speakNarrator, playGachaSound } from '../lib/audio'
import VitalsBadge from '../components/VitalsBadge'
import SafetyBreakOverlay from '../components/SafetyBreakOverlay'
import GachaModal from '../components/GachaModal'
import BigButton from '../components/BigButton'

const GACHA_INTERVAL_M = 500

export default function RunTracker() {
  const navigate = useNavigate()
  const { patient, zone, vitals, game, setGame, sessionId } = useApp()
  const [running, setRunning] = useState(true)
  const [gpsLost, setGpsLost] = useState(false)
  const [forceDanger, setForceDanger] = useState(false)
  const [gachaOpen, setGachaOpen] = useState(false)
  const lastGachaAt = useRef(0)
  const prevZone = useRef(zone)

  useVitalsSimulator(running && !gachaOpen, forceDanger)

  // Touchpoint 3: AI Voice Narrator on Zone Transitions
  useEffect(() => {
    if (!running) return
    if (prevZone.current !== zone) {
      if (zone === 'green') {
        speakNarrator('เข้าสู่โซนปลอดภัย! บอสกำลังถูกโจมตี')
      } else if (zone === 'red') {
        speakNarrator('เตือน! ชีพจรผันผวนเกินโซนปลอดภัย กรุณาชะลอความเร็ว')
      }
      prevZone.current = zone
    }
  }, [zone, running])

  // Touchpoint 4: Auto-Reward & Audio Milestones every 500m (Hands-Free)
  useEffect(() => {
    if (!running || gachaOpen) return
    const id = setInterval(() => {
      const metersPerTick = gpsLost ? 14 : 16

      if (sessionId) {
        api
          .postProgress(sessionId, {
            heartRateBpm: vitals.heartRateBpm,
            glucoseMgDl: vitals.glucoseMgDl,
            deltaDistanceM: metersPerTick,
            gpsLost,
          })
          .catch(() => {})
      }

      setGame((g) => {
        const onlyIfSafe = zone === 'green'
        const nextDistance = g.distanceM + (onlyIfSafe ? metersPerTick : 0)
        
        // Touchpoint 4: Auto-Gacha every 500m with Audio Milestone
        if (Math.floor(nextDistance / GACHA_INTERVAL_M) > Math.floor(lastGachaAt.current / GACHA_INTERVAL_M)) {
          lastGachaAt.current = nextDistance
          playGachaSound()
          speakNarrator('สะสมระยะทางครบ 500 เมตรแล้ว! ได้รับกล่อง Gacha อัตโนมัติ')
          setGachaOpen(true)
        }
        return { ...g, distanceM: nextDistance }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, gachaOpen, gpsLost, zone, setGame, sessionId, vitals])

  const goalM = patient?.dailyDistanceGoalM ?? 2000
  const progressPct = Math.min(100, (game.distanceM / goalM) * 100)
  const goalReached = game.distanceM >= 2000

  return (
    <div className="gamified-container space-y-6">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <div>
          <span className="text-action-lime font-display font-bold text-xs uppercase tracking-wider bg-action-lime/10 px-2.5 py-1 rounded-full border border-action-lime/30">
            ● TOUCHPOINT 3 & 4: RUN & AUDIO BATTLE
          </span>
          <h1 className="font-display text-2xl font-extrabold text-white mt-1">Smartwatch Run Tracker</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-navy-950 px-3 py-1 rounded-full border border-cyan-400/30">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-xs font-mono text-cyan-400 font-bold">AI VOICE ACTIVE</span>
        </div>
      </div>

      <VitalsBadge />

      <div className="gamified-card rounded-2xl p-5 border border-cyan-400/30">
        <div className="flex justify-between items-baseline mb-2">
          <p className="font-display font-bold text-slate-300 text-sm">ระยะทางสะสม (Auto-Reward ทุก 500m)</p>
          <p className="font-display text-3xl font-extrabold text-cyan-400 tracking-tight">
            {(game.distanceM / 1000).toFixed(2)} <span className="text-sm font-normal text-slate-400">/ {(goalM / 1000).toFixed(1)} กม.</span>
          </p>
        </div>
        <div className="h-4 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-cyan-400/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-action-lime to-action-orange rounded-full transition-all duration-300 shadow-neon-cyan"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {gpsLost && (
          <p className="text-xs text-action-orange font-semibold mt-3 flex items-center gap-1">
            📡 สัญญาณ GPS หลุด — สลับใช้ Step Counter จากนาฬิกาอัตโนมัติ
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="min-h-[52px] rounded-xl bg-navy-800 hover:bg-navy-700 border border-cyan-400/40 text-cyan-400 font-display font-bold text-sm transition"
        >
          {running ? '⏸ Pause (หยุดพีก)' : '▶ Resume (เดินต่อ)'}
        </button>
        <button
          onClick={() => setGpsLost((v) => !v)}
          className="min-h-[52px] rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-600 text-slate-300 font-display font-medium text-xs transition"
        >
          {gpsLost ? '📶 สัญญาณ GPS กลับมา' : '📡 จำลอง GPS หาย'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={() => setForceDanger((v) => !v)}
          className="flex-1 min-h-[44px] rounded-xl bg-magenta-500/10 hover:bg-magenta-500/20 border border-magenta-500/30 text-magenta-400 font-semibold text-xs transition"
        >
          {forceDanger ? 'ยกเลิกการจำลองฉุกเฉิน' : '🚨 จำลองภาวะฉุกเฉิน (Safety Siren)'}
        </button>
        <button
          onClick={() => {
            setGame((g) => ({ ...g, distanceM: 2000 }))
          }}
          className="flex-1 min-h-[44px] rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 font-bold text-xs transition"
        >
          ⚡ วาร์ปสะสมระยะทางครบ 2.0 กม.
        </button>
      </div>

      <BigButton variant={goalReached ? 'lime' : 'primary'} onClick={() => navigate('/battle')} disabled={!goalReached}>
        {goalReached ? '⚔️ ถัดไป: ท้าดวลบอสประจำวัน (Boss Battle)' : `เดินอีก ${((2000 - game.distanceM) / 1000).toFixed(2)} กม. เพื่อปลดล็อกบอส`}
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


