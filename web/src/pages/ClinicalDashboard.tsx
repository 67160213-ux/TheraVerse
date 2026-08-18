import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import BigButton from '../components/BigButton'

export default function ClinicalDashboard() {
  const navigate = useNavigate()
  const { game, patient, sessionId } = useApp()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!sessionId) {
      setError('ไม่พบเซสชันการเดิน กรุณาเริ่มเดินใหม่อีกครั้ง')
      setStatus('error')
      return
    }
    setStatus('sending')
    setError(null)
    try {
      await api.submitClinicalReport(sessionId)
      setStatus('sent')
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-action-orange font-display font-semibold text-xs uppercase tracking-wider bg-action-orange/10 px-2.5 py-1 rounded-full border border-action-orange/20">
          📋 CLINICAL REPORT
        </span>
        <h1 className="font-display text-2xl font-extrabold text-medical-900 mt-2">สรุปผลส่งต่อโรงพยาบาล</h1>
        <p className="text-slate-600 text-sm mt-1">ข้อมูลอัตราการเต้นของหัวใจและระดับน้ำตาลถูกส่งตรงถึงระบบของแพทย์</p>
      </div>

      <div className="bg-white rounded-3xl shadow-card p-6 border border-medical-100 space-y-4">
        <Row label="ผู้ป่วย" value={`${patient?.name} (HN ${patient?.hn || '-'})`} />
        <Row label="ระยะทางที่เดิน" value={`${(game.distanceM / 1000).toFixed(2)} กม.`} />
        <Row label="ผลท้าดวลบอส" value={game.lastBossResult === 'victory' ? '🏆 ชนะบอส' : '🛡️ แพ้บอส (บรรลุเป้าแพทย์)'} />
        <Row label="เหรียญตราสะสมวันนี้" value={`${game.inventory.filter((i) => i === 'เหรียญตราแห่งวินัย').length} เหรียญ`} />
      </div>

      <div className="bg-medical-50 border border-medical-200/60 rounded-2xl p-4 text-xs text-medical-900 leading-relaxed flex items-center gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="font-bold text-medical-900">การส่งข้อมูลตามมาตรฐาน PDPA</p>
          <p className="text-slate-600">ข้อมูลชีพจรและระดับน้ำตาลตลอดการเดินจะถูกเข้ารหัสแบบ End-to-End และส่งเข้าระบบการดูแลของแพทย์ผู้เชี่ยวชาญโดยตรง</p>
        </div>
      </div>

      {status === 'sent' ? (
        <div className="bg-medical-500/10 border-2 border-medical-500/40 rounded-2xl p-5 text-center text-medical-700 font-display font-bold shadow-sm">
          ✓ ส่งรายงานข้อมูลสุขภาพให้ทีมแพทย์เรียบร้อยแล้ว
        </div>
      ) : (
        <BigButton variant="primary" onClick={submit} disabled={status === 'sending'}>
          {status === 'sending' ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลสรุปผลให้โรงพยาบาล (Submit Report)'}
        </BigButton>
      )}

      {error && <p className="text-magenta-500 font-semibold text-sm text-center">{error}</p>}

      {status === 'sent' && (
        <BigButton variant="action" onClick={() => navigate('/rewards')}>
          🎁 ถัดไป: ไปที่คลังรางวัล (Redeem Rewards)
        </BigButton>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 last:border-0 pb-3 last:pb-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-display font-bold text-medical-900 text-base">{value}</span>
    </div>
  )
}

