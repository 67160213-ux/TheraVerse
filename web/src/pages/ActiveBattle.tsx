import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useVitalsSimulator } from '../hooks/useVitalsSimulator'
import { playComboSound, speakNarrator } from '../lib/audio'
import VitalsBadge from '../components/VitalsBadge'

const BATTLE_SECONDS = 20

export default function ActiveBattle() {
  const navigate = useNavigate()
  const { zone, vitals, setGame } = useApp()
  const [secondsLeft, setSecondsLeft] = useState(BATTLE_SECONDS)
  const [bossHp, setBossHp] = useState(100)
  const [combo, setCombo] = useState(0)
  const lastHr = useRef(vitals.heartRateBpm)
  const hasFinished = useRef(false)

  useVitalsSimulator(secondsLeft > 0)

  // Emergency exit check
  useEffect(() => {
    if (zone === 'red' && Math.abs(vitals.heartRateBpm - lastHr.current) > 25) {
      setGame((g) => ({ ...g, lastBossResult: 'defeat' }))
      speakNarrator('ฉุกเฉิน! ชีพจรผันผวนรุนแรง ออกจากการต่อสู้อัตโนมัติ')
      navigate('/run?criticalExit=1')
    }
    lastHr.current = vitals.heartRateBpm
  }, [zone, vitals.heartRateBpm, navigate, setGame])

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  // Combo & Damage dealing logic
  useEffect(() => {
    if (secondsLeft <= 0) return
    const stable = zone === 'green'
    if (stable) {
      setCombo((c) => {
        const nextC = c + 1
        if (nextC % 4 === 0) {
          playComboSound()
          speakNarrator(`คอมโบคูณ ${nextC}! โจมตีสำเร็จ`)
        }
        return nextC
      })
      setBossHp((h) => Math.max(0, h - 4))
    } else {
      setCombo(0)
    }
  }, [secondsLeft, zone])

  // End of Battle transition logic
  useEffect(() => {
    if (secondsLeft === 0 && !hasFinished.current) {
      hasFinished.current = true
      const result = bossHp <= 40 ? 'victory' : 'defeat'
      setGame((g) => ({ ...g, lastBossResult: result }))
      if (result === 'victory') {
        speakNarrator('ชัยชนะ! คุณสามารถเอาชนะบอสเบาหวานได้สำเร็จ')
      } else {
        speakNarrator('ศึกท้าดวลบอสสิ้นสุดลง การเดินวันนี้ผ่านเกณฑ์ทางการแพทย์ครบถ้วน ได้รับเหรียญตราแห่งวินัยครับ')
      }
      setTimeout(() => {
        navigate('/battle/result')
      }, 500)
    }
  }, [secondsLeft, bossHp, navigate, setGame])

  function handleSimulateDefeat() {
    setBossHp(80)
    setSecondsLeft(0)
  }

  function handleSimulateVictory() {
    setBossHp(10)
    setSecondsLeft(0)
  }

  function handleSimulateCriticalExit() {
    setGame((g) => ({ ...g, lastBossResult: 'defeat' }))
    speakNarrator('ฉุกเฉิน! ชีพจรผันผวนรุนแรง ออกจากการต่อสู้อัตโนมัติ')
    navigate('/run?criticalExit=1')
  }

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

      {/* Test Simulation Controls */}
      <div className="bg-navy-950/80 rounded-2xl p-4 border border-cyan-400/20 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🛠️ เครื่องมือจำลองการต่อสู้ (Dev Simulation):</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleSimulateVictory}
            className="py-2.5 px-3 rounded-xl bg-action-lime/10 hover:bg-action-lime/20 border border-action-lime/30 text-action-lime font-bold text-xs transition"
          >
            🏆 จำลองชนะบอส
          </button>
          <button
            onClick={handleSimulateDefeat}
            className="py-2.5 px-3 rounded-xl bg-action-orange/10 hover:bg-action-orange/20 border border-action-orange/30 text-action-orange font-bold text-xs transition"
          >
            🛡️ จำลองแพ้บอส (HP &gt; 40%)
          </button>
          <button
            onClick={handleSimulateCriticalExit}
            className="py-2.5 px-3 rounded-xl bg-magenta-500/10 hover:bg-magenta-500/20 border border-magenta-500/30 text-magenta-400 font-bold text-xs transition"
          >
            🚨 จำลองชีพจรผันผวนวิกฤต
          </button>
        </div>
      </div>
    </div>
  )
}
