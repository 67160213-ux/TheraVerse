import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { playEmergencySiren, speakNarrator } from '../lib/audio'

interface Props {
  active: boolean
  onResolved: () => void
}

/**
 * Touchpoint 5: Fail-Safe Safety Break (ฉุกเฉินและแจ้งเตือนผู้ดูแล)
 * Locks the screen on dangerous vitals, triggers emergency siren, and counts down 15 seconds.
 * If unacknowledged, automatically dispatches GPS location & SMS to emergency contacts.
 */
export default function SafetyBreakOverlay({ active, onResolved }: Props) {
  const { zone, patient } = useApp()
  const [secondsInRed, setSecondsInRed] = useState(0)
  const [triggered, setTriggered] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [dispatched, setDispatched] = useState(false)

  useEffect(() => {
    if (!active) {
      setSecondsInRed(0)
      setTriggered(false)
      playEmergencySiren(false)
      return
    }
    if (zone !== 'red') {
      setSecondsInRed(0)
      if (triggered && !dispatched) {
        playEmergencySiren(false)
      }
      return
    }
    const id = setInterval(() => setSecondsInRed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [active, zone, triggered, dispatched])

  useEffect(() => {
    if (secondsInRed >= 5 && !triggered) {
      setTriggered(true)
      setCountdown(15)
      setDispatched(false)
      playEmergencySiren(true)
      speakNarrator('เตือนภัยฉุกเฉิน! สัญญาณชีพอยู่ในโซนอันตราย กรุณานั่งพักทันที!', true)
    }
  }, [secondsInRed, triggered])

  // 15-second emergency countdown timer
  useEffect(() => {
    if (!triggered || dispatched) return
    if (countdown <= 0) {
      setDispatched(true)
      playEmergencySiren(false)
      speakNarrator('ส่งตำแหน่ง จีพีเอส และข้อความฉุกเฉิน ถึงผู้ดูแลเรียบร้อยแล้ว')
      return
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [triggered, countdown, dispatched])

  if (!active || !triggered) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-b from-magenta-600 via-magenta-500 to-navy-950 flex flex-col items-center justify-center px-6 text-white text-center"
      role="alertdialog"
      aria-live="assertive"
    >
      <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-4xl mb-4 animate-bounce">
        🚨
      </div>
      <h2 className="font-display text-3xl font-extrabold mb-2 text-white">กรุณานั่งพักทันที!</h2>
      <p className="text-sm max-w-sm mb-6 text-white/90 leading-relaxed">
        ระบบตรวจพบว่าชีพจรหรือระดับน้ำตาลของคุณอยู่ในโซนอันตรายของแพทย์
      </p>

      {!dispatched ? (
        <div className="bg-black/40 rounded-2xl p-5 border border-white/20 mb-6 w-full max-w-xs backdrop-blur-md">
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1 font-semibold">ส่งสัญญาณ SMS/GPS ผู้ดูแลอัตโนมัติใน</p>
          <p className="font-display text-5xl font-black text-action-lime animate-pulse">{countdown}s</p>
        </div>
      ) : (
        <div className="bg-action-orange/20 border-2 border-action-orange text-action-lime rounded-2xl p-4 mb-6 text-sm font-bold animate-popIn">
          📡 ส่งพิกัด GPS & ข้อความ SMS แจ้งศูนย์ฉุกเฉิน ({patient?.emergencyPhone || '1669'}) เรียบร้อยแล้ว!
        </div>
      )}

      <a
        href={patient?.emergencyPhone ?? 'tel:1669'}
        className="min-h-[64px] w-full max-w-xs bg-white text-magenta-600 rounded-2xl font-display font-extrabold text-lg flex items-center justify-center shadow-neon-pink mb-4 transition transform active:scale-95"
      >
        📞 กดเพื่อโทรด่วนหา {patient?.nurseName || 'ผู้ดูแล/1669'}
      </a>

      <button
        onClick={() => {
          setTriggered(false)
          setSecondsInRed(0)
          setDispatched(false)
          playEmergencySiren(false)
          speakNarrator('ขอบคุณที่นั่งพัก สัญญาณชีพกลับเข้าสู่ความปลอดภัยแล้ว')
          onResolved()
        }}
        className="text-white/80 hover:text-white underline text-xs font-semibold py-2"
      >
        ฉันนั่งพักและอาการกลับมาปกติแล้ว (Resume)
      </button>
    </div>
  )
}

