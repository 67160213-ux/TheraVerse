import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useVitalsSimulator } from '../hooks/useVitalsSimulator'
import VitalsBadge from '../components/VitalsBadge'

const BATTLE_SECONDS = 20

export default function ActiveBattle() {
  const navigate = useNavigate()
  const { zone, vitals, setGame } = useApp()
  const [secondsLeft, setSecondsLeft] = useState(BATTLE_SECONDS)
  const [bossHp, setBossHp] = useState(100)
  const [combo, setCombo] = useState(0)
  const lastHr = useRef(vitals.heartRateBpm)

  useVitalsSimulator(secondsLeft > 0)

  useEffect(() => {
    if (zone === 'red' && Math.abs(vitals.heartRateBpm - lastHr.current) > 25) {
      setGame((g) => ({ ...g, lastBossResult: 'defeat' }))
      navigate('/run?criticalExit=1')
    }
    lastHr.current = vitals.heartRateBpm
  }, [zone, vitals.heartRateBpm, navigate, setGame])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const stable = zone === 'green'
    if (stable) {
      setCombo((c) => c + 1)
      setBossHp((h) => Math.max(0, h - 4))
    } else {
      setCombo(0)
    }
  }, [secondsLeft])

  useEffect(() => {
    if (secondsLeft === 0) {
      const result = bossHp <= 40 ? 'victory' : 'defeat'
      setGame((g) => ({ ...g, lastBossResult: result }))
      const t = setTimeout(() => navigate('/battle/result'), 600)
      return () => clearTimeout(t)
    }
  }, [secondsLeft, bossHp, navigate, setGame])

  return (
    <div className="gamified-container space-y-6 text-center">
      <div className="inline-block bg-navy-950 px-6 py-2 rounded-2xl border border-cyan-400/40 shadow-neon-cyan">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">เวลาถอยหลัง (Time Remaining)</p>
        <p className="font-display text-4xl font-extrabold text-cyan-400 animate-pulse">{secondsLeft}s</p>
      </div>

      <div className="bg-navy-950/90 rounded-2xl p-5 border border-magenta-500/40 shadow-neon-pink">
        <div className="flex justify-between items-center mb-2">
          <span className="font-display font-bold text-sm text-magenta-400">👹 บอสเบาหวาน (Boss HP)</span>
          <span className="font-display font-bold text-sm text-magenta-400">{bossHp}%</span>
        </div>
        <div className="h-4 bg-navy-900 rounded-full overflow-hidden p-0.5 border border-magenta-500/40">
          <div className="h-full bg-gradient-to-r from-magenta-500 to-action-orange rounded-full transition-all duration-300 shadow-neon-pink" style={{ width: `${bossHp}%` }} />
        </div>
      </div>

      <VitalsBadge />

      <div className="gamified-card rounded-2xl p-4 border border-action-lime/30">
        <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">คอมโบการทรงตัวชีพจร (Pulse Combo)</p>
        <p className="font-display text-4xl font-extrabold text-action-lime shadow-neon-cyan">×{combo}</p>
      </div>

      <p className="text-xs text-slate-400">คุมชีพจรให้อยู่ในโซนปลอดภัยเพื่อสะสมคอมโบสร้างความเสียหายระดับวิกฤต!</p>
    </div>
  )
}

