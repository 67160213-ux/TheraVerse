import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

interface Props {
  active: boolean
  onResolved: () => void
}

/**
 * [AC-03] Fires when HR or glucose stays in the red zone for 10+ consecutive
 * seconds. Locks the screen, plays an alert, and surfaces an 80x80+ emergency
 * call button that opens the phone dialer directly — no navigation required.
 */
export default function SafetyBreakOverlay({ active, onResolved }: Props) {
  const { zone, patient } = useApp()
  const [secondsInRed, setSecondsInRed] = useState(0)
  const [triggered, setTriggered] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!active) {
      setSecondsInRed(0)
      setTriggered(false)
      return
    }
    if (zone !== 'red') {
      setSecondsInRed(0)
      return
    }
    const id = setInterval(() => setSecondsInRed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [active, zone])

  useEffect(() => {
    if (secondsInRed >= 10 && !triggered) {
      setTriggered(true)
      playAlertTone()
    }
  }, [secondsInRed, triggered])

  function playAlertTone() {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext()
      audioCtxRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      osc.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch {
      // Audio unsupported/blocked — visual alert below still stands.
    }
  }

  if (!active || !triggered) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-vital-danger flex flex-col items-center justify-center px-6 text-white"
      role="alertdialog"
      aria-live="assertive"
    >
      <p className="font-display text-3xl font-bold text-center mb-2">กรุณานั่งพักทันที</p>
      <p className="text-center mb-8 text-white/90">
        ระบบตรวจพบว่าชีพจรหรือระดับน้ำตาลของคุณอยู่ในโซนอันตราย
      </p>
      <a
        href={patient?.emergencyPhone ?? 'tel:1669'}
        className="min-h-[80px] min-w-[80px] w-full max-w-xs bg-white text-vital-danger rounded-2xl font-display font-bold text-xl flex items-center justify-center shadow-card mb-4"
      >
        📞 กดเพื่อโทรหา{patient?.nurseName ?? 'พยาบาลเจ้าของไข้'}
      </a>
      <button
        onClick={() => {
          setTriggered(false)
          setSecondsInRed(0)
          onResolved()
        }}
        className="text-white/80 underline text-sm"
      >
        ฉันพักและอาการดีขึ้นแล้ว
      </button>
    </div>
  )
}
