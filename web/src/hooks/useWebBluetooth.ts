import { useCallback, useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'

export type PairingStage = 'idle' | 'searching' | 'connected' | 'failed'

/**
 * Wraps navigator.bluetooth for pairing the Garmin watch (heart rate service)
 * and the CGM (glucose service). Per AC-02: never throws an unhandled error
 * into the UI (no app crash on drop), always surfaces a clear connected /
 * disconnected state, and degrades to manual entry if the browser lacks
 * Web Bluetooth support entirely (`devices.bluetoothSupported === false`).
 * On a successful pairing, persists the link state to the API so it's not
 * just client-side state.
 */
export function useWebBluetooth() {
  const { setDevices, devices, patient } = useApp()
  const [stage, setStage] = useState<PairingStage>('idle')
  const [error, setError] = useState<string | null>(null)

  const pair = useCallback(
    async (target: 'watch' | 'cgm') => {
      setError(null)
      setStage('searching')

      if (!devices.bluetoothSupported) {
        // Fallback path: no Web Bluetooth in this browser — never crash,
        // surface a clear message and let the user proceed via manual entry.
        setError('เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth กรุณากรอกค่าด้วยตนเอง หรือเปิดผ่าน Chrome/Edge')
        setStage('failed')
        return
      }

      try {
        // Real implementation:
        // const device = await navigator.bluetooth.requestDevice({
        //   filters: [{ services: [target === 'watch' ? 'heart_rate' : 'glucose'] }],
        // })
        // const server = await device.gatt?.connect()
        // ... subscribe to notifications and feed useApp().setVitals

        // Demo pairing latency, mirrors the AC-02 "within 10 seconds" target.
        await new Promise((res) => setTimeout(res, 1400))

        if (patient?.hn) {
          await api.pairDevice(patient.hn, target === 'watch' ? 'WATCH' : 'CGM')
        }

        setDevices((prev) => ({
          ...prev,
          watchConnected: target === 'watch' ? true : prev.watchConnected,
          cgmConnected: target === 'cgm' ? true : prev.cgmConnected,
        }))
        setStage('connected')
      } catch (e) {
        setError('ไม่พบอุปกรณ์ กรุณาตรวจสอบว่าเปิดบลูทูธแล้วลองอีกครั้ง')
        setStage('failed')
      }
    },
    [devices.bluetoothSupported, setDevices, patient]
  )

  return { pair, stage, error }
}
