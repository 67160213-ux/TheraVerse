import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'
import { speakNarrator } from '../lib/audio'
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

  useEffect(() => {
    if (!submitting) {
      if (won) {
        speakNarrator('สรุปผลการบำบัดวันนี้ หัวใจของคุณเด็กลง 5 นาที และคุมระดับน้ำตาลได้ดีเยี่ยม 95 เปอร์เซ็นต์!')
      } else {
        speakNarrator('คุณทำได้ยอดเยี่ยม การเดินวันนี้ผ่านเกณฑ์ทางการแพทย์ครบถ้วน ได้รับเหรียญตราแห่งวินัยครับ')
      }
    }
  }, [submitting, won])

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
        <span className={`font-display font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full border ${
          won ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30 shadow-neon-cyan' : 'bg-action-orange/10 text-action-orange border-action-orange/30'
        }`}>
          TOUCHPOINT 6: POSITIVE HEALTH SUMMARY
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white mt-2">
          {won ? 'ชนะบอสเบาหวานสำเร็จ!' : 'ภารกิจดวลบอสประจำวัน'}
        </h1>
      </div>

      {/* Positive Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        <div className="bg-navy-950/90 rounded-2xl p-4 border border-cyan-400/30 shadow-neon-cyan">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">❤️</span>
            <p className="font-display font-bold text-sm text-cyan-400">สรุปสุขภาพหัวใจ (Positive Metric)</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            หัวใจของคุณเด็กลง <span className="font-bold text-action-lime">5 นาที</span> จากการเดินในโซนเป้าหมายต่อเนื่อง
          </p>
        </div>
        <div className="bg-navy-950/90 rounded-2xl p-4 border border-action-lime/30 shadow-neon-cyan">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📈</span>
            <p className="font-display font-bold text-sm text-action-lime">ความเสถียรน้ำตาล (CGM)</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ควบคุมระดับน้ำตาลอยู่ในเกณฑ์นิ่งสูงถึง <span className="font-bold text-action-lime">95%</span> ตลอดการออกกำลังกาย
          </p>
        </div>
      </div>

      {clinicalGoalMet ? (
        <div className="bg-navy-950/90 rounded-3xl p-6 border-2 border-action-lime/50 shadow-neon-cyan space-y-2">
          <p className="text-5xl">🎖️</p>
          <p className="font-display font-extrabold text-xl text-action-lime">เหรียญตราแห่งวินัย (Token of Discipline)</p>
          <p className="text-slate-400 text-xs font-mono">ได้รับเหรียญสะสมสิทธิประโยชน์ รพ. เรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div className="gamified-card rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-300 text-sm">การเดินยังไม่ครบเป้าหมาย 2.0 กม. ในวันนี้ สู้ต่อพรุ่งนี้นะครับ!</p>
        </div>
      )}

      <BigButton variant="lime" onClick={claimToken} disabled={submitting}>
        {submitting ? 'กำลังบันทึกผล...' : 'ถัดไป: ส่งรายงานให้แพทย์ (Auto-Clinical Sync)'}
      </BigButton>
    </div>
  )
}


