import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

/**
 * Simulates a live BLE feed from the Garmin watch + CGM. In production this
 * is replaced by real `navigator.bluetooth` GATT notifications (see
 * useWebBluetooth.ts for the connection handshake this stands in for).
 * `forceDanger` lets a screen deliberately trigger the AC-03 red-zone path
 * for demoing / testing the Safety Break flow without waiting on chance.
 */
export function useVitalsSimulator(running: boolean, forceDanger = false) {
  const { setVitals, patient } = useApp()
  const tick = useRef(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      tick.current += 1
      setVitals((prev) => {
        const low = patient?.targetHrLow ?? 90
        const high = patient?.targetHrHigh ?? 128
        let hr = prev.heartRateBpm
        let glucose = prev.glucoseMgDl

        if (forceDanger) {
          hr = high + 15 + Math.round(Math.random() * 10)
        } else {
          const center = (low + high) / 2
          const drift = (Math.random() - 0.5) * 6
          hr = Math.round(Math.min(high - 4, Math.max(low + 4, hr + drift - (hr - center) * 0.1)))
        }
        glucose = Math.round(Math.max(65, Math.min(180, glucose + (Math.random() - 0.5) * 4)))

        return { heartRateBpm: hr, glucoseMgDl: glucose, timestamp: Date.now() }
      })
    }, 1200)
    return () => clearInterval(id)
  }, [running, forceDanger, patient, setVitals])
}
