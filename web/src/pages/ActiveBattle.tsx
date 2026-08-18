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

  // [Edge case 3] Critical vitals during battle: force-quit immediately,
  // regardless of score, and route to the Safety Break path.
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
  }, [secondsLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (secondsLeft === 0) {
      const result = bossHp <= 40 ? 'victory' : 'defeat'
      setGame((g) => ({ ...g, lastBossResult: result }))
      const t = setTimeout(() => navigate('/battle/result'), 600)
      return () => clearTimeout(t)
    }
  }, [secondsLeft, bossHp, navigate, setGame])

  return (
    <div className="space-y-6 text-center">
      <p className="font-display text-4xl font-bold text-pine-900">{secondsLeft}s</p>

      <div className="bg-vital-danger/10 rounded-2xl p-4">
        <p className="text-5xl mb-2">👹</p>
        <div className="h-3 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-vital-danger transition-all" style={{ width: `${bossHp}%` }} />
        </div>
      </div>

      <VitalsBadge />

      <div>
        <p className="text-ink/60 text-sm">คอมโบ</p>
        <p className="font-display text-3xl font-bold text-gold-600">×{combo}</p>
      </div>

      <p className="text-xs text-ink/40">คุมชีพจรให้อยู่ในโซนปลอดภัยเพื่อสะสมคอมโบโจมตี</p>
    </div>
  )
}
