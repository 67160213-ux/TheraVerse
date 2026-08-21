import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import { speakNarrator } from '../lib/audio'
import BigButton from '../components/BigButton'

const AVATARS = [
  { id: 'ขุนศึกเบาหวาน', icon: '🛡️', title: 'ขุนศึกเบาหวาน', bonus: '🛡️ +15% ความทนทานต่อชีพจรผันผวน' },
  { id: 'อัศวินอินซูลิน', icon: '⚡', title: 'อัศวินอินซูลิน', bonus: '⚡ +20% พลังโจมตีคอมโบเมื่อชีพจรนิ่ง' },
  { id: 'นักรบคาดิโอ', icon: '🏃‍♂️', title: 'นักรบคาดิโอ', bonus: '🎁 +10% โอกาสสุ่มกล่อง Gacha เกรดสูง' },
]

export default function PreRunLobby() {
  const navigate = useNavigate()
  const { patient, game, setGame, setSessionId } = useApp()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function selectAvatar(avatar: typeof AVATARS[0]) {
    setGame((g) => ({ ...g, activeCharacter: avatar.title }))
    speakNarrator(`เลือกฮีโร่ ${avatar.title} พร้อมโบนัสพิเศษ`)
  }

  async function handleStart() {
    if (!patient?.hn) return
    setStarting(true)
    setError(null)
    try {
      const session = await api.startSession(patient.hn)
      setSessionId(session.id)
      speakNarrator('เริ่มสตาร์ทภารกิจเดินบำบัด ออกวิ่งได้เลยครับ!')
      navigate('/run')
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'เริ่มเซสชันไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setStarting(false)
    }
  }

  async function handleWarpToBoss() {
    setStarting(true)
    setError(null)
    const hn = patient?.hn || '6501234'
    try {
      const session = await api.startSession(hn)
      setSessionId(session.id)
    } catch (e) {
      console.warn('Warp session warning:', e)
    } finally {
      setGame((g) => ({ ...g, distanceM: 2000 }))
      speakNarrator('จำลองเดินครบ 2.0 กม.! พร้อมเข้าท้าดวลบอสเบาหวาน')
      setStarting(false)
      navigate('/battle')
    }
  }

  const currentAvatar = AVATARS.find((a) => a.title === game.activeCharacter) || AVATARS[0]

  return (
    <div className="gamified-container space-y-6">
      <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
        <div>
          <span className="text-cyan-400 font-display font-semibold text-xs tracking-wider uppercase bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/30">
            ⚡ TOUCHPOINT 2: SMART PRESCRIPTION LOBBY
          </span>
          <h1 className="font-display text-2xl font-extrabold text-white mt-2">เลือกฮีโร่และรับภารกิจแพทย์</h1>
        </div>
        <div className="text-3xl animate-bounce">{currentAvatar.icon}</div>
      </div>

      {/* Avatar Selector */}
      <div className="space-y-3">
        <p className="font-display font-bold text-sm text-slate-300">เลือก Avatar ประจำตัวของคุณ:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AVATARS.map((a) => {
            const selected = game.activeCharacter === a.title
            return (
              <button
                key={a.id}
                onClick={() => selectAvatar(a)}
                className={`p-3 rounded-2xl text-left border-2 transition-all ${
                  selected
                    ? 'bg-navy-800 border-cyan-400 shadow-neon-cyan scale-[1.02]'
                    : 'bg-navy-950/60 border-slate-700/60 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-3xl mb-1">{a.icon}</div>
                <p className="font-display font-bold text-sm text-white">{a.title}</p>
                <p className="text-[11px] text-cyan-400 font-medium mt-1">{a.bonus}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctor's Smart Prescription Card */}
      <div className="bg-navy-950/90 rounded-2xl p-5 border border-magenta-500/30 shadow-neon-pink space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <p className="font-display font-bold text-sm text-magenta-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-magenta-500 animate-ping"></span>
            ใบสั่งยาของแพทย์ (Smart Prescription)
          </p>
          <span className="text-xs font-mono text-slate-400">{patient?.nurseName || 'ทีมพยาบาล'}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-navy-900/90 p-3.5 rounded-xl border border-cyan-400/20">
            <p className="text-slate-400 text-xs font-semibold">Target HR Zone</p>
            <p className="font-display text-2xl font-extrabold text-cyan-400 mt-1">
              {patient?.targetHrLow}–{patient?.targetHrHigh} <span className="text-xs font-normal text-slate-300">bpm</span>
            </p>
          </div>
          <div className="bg-navy-900/90 p-3.5 rounded-xl border border-action-orange/20">
            <p className="text-slate-400 text-xs font-semibold">ระยะทางเป้าหมาย</p>
            <p className="font-display text-2xl font-extrabold text-action-orange mt-1">
              {((patient?.dailyDistanceGoalM ?? 2000) / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-300">กม.</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          * ระบบจะแปลงจังหวะการเดินให้อยู่ในโซนปลอดภัยเป็นพลังต่อสู้กับบอสเบาหวาน
        </p>
      </div>

      {error && <p className="text-magenta-500 font-semibold text-sm text-center bg-magenta-500/10 p-3 rounded-xl border border-magenta-500/30">{error}</p>}

      <div className="space-y-2.5">
        <BigButton variant="lime" onClick={handleStart} disabled={starting}>
          {starting ? 'กำลังเริ่ม...' : '🚀 รับภารกิจแพทย์และออกวิ่ง (START)'}
        </BigButton>
        <button
          onClick={handleWarpToBoss}
          disabled={starting}
          className="w-full min-h-[44px] rounded-xl bg-magenta-500/20 hover:bg-magenta-500/30 border border-magenta-500/40 text-magenta-400 font-display font-bold text-xs transition shadow-neon-pink"
        >
          ⚡ จำลองเดินครบเป้าหมาย (วาร์ปไปตีบอสทันที)
        </button>
      </div>
    </div>
  )
}
