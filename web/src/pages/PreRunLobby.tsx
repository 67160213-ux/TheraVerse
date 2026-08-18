import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import BigButton from '../components/BigButton'

export default function PreRunLobby() {
  const navigate = useNavigate()
  const { patient, game, setSessionId } = useApp()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    if (!patient?.hn) return
    setStarting(true)
    setError(null)
    try {
      const session = await api.startSession(patient.hn)
      setSessionId(session.id)
      navigate('/run')
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'เริ่มเซสชันไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gold-600 font-semibold text-sm">ก่อนเริ่มเดิน</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">จัดทีมของคุณ</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gold-200 flex items-center justify-center text-4xl">🛡️</div>
        <div>
          <p className="font-display font-bold text-lg">{game.activeCharacter}</p>
          <p className="text-ink/60 text-sm">ตัวละครประจำทีมของ{patient?.name}</p>
        </div>
      </div>

      <div className="bg-pine-700 text-white rounded-2xl p-5">
        <p className="font-display font-semibold mb-3">เป้าหมายวันนี้ที่หมอกำหนด</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-pine-100/70 text-xs">Target Heart Zone</p>
            <p className="font-display text-2xl font-bold">
              {patient?.targetHrLow}–{patient?.targetHrHigh} <span className="text-sm font-normal">bpm</span>
            </p>
          </div>
          <div>
            <p className="text-pine-100/70 text-xs">ระยะทางเป้าหมาย</p>
            <p className="font-display text-2xl font-bold">
              {((patient?.dailyDistanceGoalM ?? 2000) / 1000).toFixed(1)} <span className="text-sm font-normal">กม.</span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-ink/60 text-sm">
        ระบบจะคำนวณโบนัสจากความสม่ำเสมอของชีพจรระหว่างที่คุณเดินในโซนปลอดภัย
      </p>

      {error && <p className="text-vital-danger text-sm text-center">{error}</p>}

      <BigButton variant="gold" onClick={handleStart} disabled={starting}>
        {starting ? 'กำลังเริ่ม...' : 'เริ่มสตาร์ท (Start)'}
      </BigButton>
    </div>
  )
}
