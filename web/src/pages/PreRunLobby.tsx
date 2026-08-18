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
    <div className="gamified-container space-y-6">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <div>
          <span className="text-cyan-400 font-display font-semibold text-xs tracking-wider uppercase bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/30">
            ⚡ GAMIFIED ENERGY LOBBY
          </span>
          <h1 className="font-display text-2xl font-extrabold text-white mt-2">เตรียมพร้อมออกวิ่ง</h1>
        </div>
        <div className="text-3xl animate-bounce">🏃‍♂️</div>
      </div>

      <div className="gamified-card rounded-2xl p-5 flex items-center gap-4 border border-cyan-400/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-medical-700 flex items-center justify-center text-3xl shadow-neon-cyan">
          🛡️
        </div>
        <div>
          <p className="font-display font-extrabold text-xl text-cyan-400">{game.activeCharacter}</p>
          <p className="text-slate-300 text-xs mt-0.5">ฮีโร่คู่ใจของ {patient?.name}</p>
        </div>
      </div>

      <div className="bg-navy-950/80 rounded-2xl p-5 border border-magenta-500/30 shadow-neon-pink">
        <p className="font-display font-bold text-sm text-magenta-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-magenta-500 animate-ping"></span>
          เป้าหมายทางการแพทย์ประจำวัน (Prescription)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-navy-900/90 p-3 rounded-xl border border-cyan-400/20">
            <p className="text-slate-400 text-xs font-semibold">Target HR Zone</p>
            <p className="font-display text-2xl font-extrabold text-cyan-400 mt-1">
              {patient?.targetHrLow}–{patient?.targetHrHigh} <span className="text-xs font-normal text-slate-300">bpm</span>
            </p>
          </div>
          <div className="bg-navy-900/90 p-3 rounded-xl border border-action-orange/20">
            <p className="text-slate-400 text-xs font-semibold">ระยะทางเป้าหมาย</p>
            <p className="font-display text-2xl font-extrabold text-action-orange mt-1">
              {((patient?.dailyDistanceGoalM ?? 2000) / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-300">กม.</span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-slate-300 text-xs px-2">
        ระบบจะคำนวณโบนัสและพลังโจมตีจากความสม่ำเสมอของชีพจรขณะคุณเดินอยู่ในโซนปลอดภัย
      </p>

      {error && <p className="text-magenta-500 font-semibold text-sm text-center bg-magenta-500/10 p-3 rounded-xl border border-magenta-500/30">{error}</p>}

      <BigButton variant="lime" onClick={handleStart} disabled={starting}>
        {starting ? 'กำลังเริ่ม...' : '🚀 เริ่มสตาร์ทการเดิน (START)'}
      </BigButton>
    </div>
  )
}

