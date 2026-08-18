import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'
import BigButton from '../components/BigButton'

export default function BattleResult() {
  const navigate = useNavigate()
  const { game, patient, setGame, sessionId } = useApp()
  const won = game.lastBossResult === 'victory'
  const [submitting, setSubmitting] = useState(true)
  const [clinicalGoalMet, setClinicalGoalMet] = useState(game.distanceM >= (patient?.dailyDistanceGoalM ?? 2000))
  const [tokenIssued, setTokenIssued] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function submit() {
      if (!sessionId) {
        setSubmitting(false)
        return
      }
      try {
        const result = await api.submitBattleResult(sessionId, { outcome: won ? 'VICTORY' : 'DEFEAT' })
        if (!cancelled) {
          setClinicalGoalMet(result.clinicalGoalMet)
          setTokenIssued(!!result.token)
        }
      } catch {
      } finally {
        if (!cancelled) setSubmitting(false)
      }
    }
    submit()
    return () => {
      cancelled = true
    }
  }, [sessionId, won])

  function claimToken() {
    if (tokenIssued) {
      setGame((g) => ({ ...g, inventory: [...g.inventory, 'เหรียญตราแห่งวินัย'] }))
    }
    navigate('/dashboard')
  }

  return (
    <div className="gamified-container space-y-6 text-center">
      <p className="text-7xl animate-bounce">{won ? '🏆' : '🛡️'}</p>
      <div>
        <span className={`font-display font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border ${
          won ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30 shadow-neon-cyan' : 'bg-action-orange/10 text-action-orange border-action-orange/30'
        }`}>
          {won ? 'VICTORY ACHIEVED' : 'BATTLE FINISHED'}
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white mt-2">
          {won ? 'ชนะบอสเบาหวานสำเร็จ!' : 'จบศึกท้าดวลบอส'}
        </h1>
      </div>

      {!won && clinicalGoalMet && (
        <p className="text-slate-300 text-xs leading-relaxed max-w-sm mx-auto">
          แม้บอสในเกมจะไม่พ่ายแพ้ แต่การเดินของคุณผ่านเกณฑ์ทางการแพทย์ที่หมอกำหนดครบถ้วน จึงถือว่าสำเร็จเป้าหมายประจำวัน!
        </p>
      )}

      {clinicalGoalMet ? (
        <div className="bg-navy-950/90 rounded-3xl p-6 border-2 border-action-lime/50 shadow-neon-cyan space-y-2">
          <p className="text-5xl">🎖️</p>
          <p className="font-display font-extrabold text-xl text-action-lime">เหรียญตราแห่งวินัย</p>
          <p className="text-slate-400 text-xs font-mono">Token of Discipline Received</p>
        </div>
      ) : (
        <div className="gamified-card rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-300 text-sm">การเดินยังไม่ครบเป้าหมาย 2.0 กม. ในวันนี้ สู้ต่อพรุ่งนี้นะครับ!</p>
        </div>
      )}

      <BigButton variant="lime" onClick={claimToken} disabled={submitting}>
        {submitting ? 'กำลังบันทึกผล...' : 'ถัดไป: สรุปรายงานส่งแพทย์ (Clinical Dashboard)'}
      </BigButton>
    </div>
  )
}

