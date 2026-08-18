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
      // POST /api/sessions/:id/clinical-report — aggregates the session's
      // vitals series server-side into the report payload.
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
        <p className="text-gold-600 font-semibold text-sm">รายงานถึงโรงพยาบาล</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">สรุปผลวันนี้</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
        <Row label="ผู้ป่วย" value={`${patient?.name} (HN ${patient?.hn || '-'})`} />
        <Row label="ระยะทางที่เดิน" value={`${(game.distanceM / 1000).toFixed(2)} กม.`} />
        <Row label="ผลบอส" value={game.lastBossResult === 'victory' ? 'ชนะ' : 'แพ้แต่บรรลุเป้าหมายแพทย์'} />
        <Row label="เหรียญตราที่ได้รับวันนี้" value={`${game.inventory.filter((i) => i === 'เหรียญตราแห่งวินัย').length} เหรียญ`} />
      </div>

      <div className="bg-pine-50 rounded-xl p-4 text-sm text-pine-900/80">
        ข้อมูลชีพจรและระดับน้ำตาลตลอดการเดินจะถูกเข้ารหัสและส่งเข้าระบบหลังบ้านของแพทย์โดยตรง
      </div>

      {status === 'sent' ? (
        <div className="bg-vital-safe/10 border-2 border-vital-safe/30 rounded-2xl p-4 text-center text-vital-safe font-semibold">
          ✓ ส่งข้อมูลให้ทีมแพทย์เรียบร้อยแล้ว
        </div>
      ) : (
        <BigButton onClick={submit} disabled={status === 'sending'}>
          {status === 'sending' ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลสรุปผลให้โรงพยาบาล'}
        </BigButton>
      )}

      {error && <p className="text-vital-danger text-sm text-center">{error}</p>}

      {status === 'sent' && <BigButton variant="gold" onClick={() => navigate('/rewards')}>ไปที่คลังรางวัล</BigButton>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-pine-50 last:border-0 pb-2 last:pb-0">
      <span className="text-ink/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
