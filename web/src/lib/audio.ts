/**
 * AI Audio Voice Narrator & Sound Synthesizer for DiaHero
 * Uses Web Speech Synthesis API for hands-free audio narration in Thai
 * and Web Audio API for synthesized game SFX and emergency sirens.
 */

// Web Speech Synthesis AI Voice Narrator
export function speakNarrator(text: string, force: boolean = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  try {
    if (force) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'th-TH'
    utterance.rate = 1.05
    utterance.pitch = 1.1

    // Attempt to pick a Thai voice if available
    const voices = window.speechSynthesis.getVoices()
    const thVoice = voices.find((v) => v.lang.includes('th'))
    if (thVoice) utterance.voice = thVoice

    window.speechSynthesis.speak(utterance)
  } catch {
    // Fallback gracefully if browser restricts audio autoplay
  }
}

// Web Audio API Synthesizer Helper
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return null
  return new AudioCtx()
}

export function playGachaSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 arpeggio

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + i * 0.08)

    gain.gain.setValueAtTime(0, now + i * 0.08)
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.08)
    osc.stop(now + i * 0.08 + 0.35)
  })
}

export function playComboSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.15)

  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.2)
}

let sirenInterval: any = null

export function playEmergencySiren(start: boolean) {
  if (!start) {
    if (sirenInterval) {
      clearInterval(sirenInterval)
      sirenInterval = null
    }
    return
  }

  if (sirenInterval) return

  const triggerBeep = () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.linearRampToValueAtTime(440, now + 0.4)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.45)
  }

  triggerBeep()
  sirenInterval = setInterval(triggerBeep, 600)
}
