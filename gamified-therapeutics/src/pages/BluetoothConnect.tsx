import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useWebBluetooth } from '../hooks/useWebBluetooth'
import BigButton from '../components/BigButton'
import VitalsBadge from '../components/VitalsBadge'

export default function BluetoothConnect() {
  const navigate = useNavigate()
  const { devices } = useApp()
  const { pair, stage, error } = useWebBluetooth()

  const bothConnected = devices.watchConnected && devices.cgmConnected

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gold-600 font-semibold text-sm">ขั้นตอนที่ 3 จาก 4</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">เชื่อมต่ออุปกรณ์</h1>
        <p className="text-ink/70 mt-1">กดปุ่มเพื่อค้นหาและจับคู่อุปกรณ์ผ่าน Web Bluetooth</p>
      </div>

      <div className="space-y-3">
        <DeviceRow
          label="นาฬิกา Garmin"
          connected={devices.watchConnected}
          onConnect={() => pair('watch')}
          busy={stage === 'searching'}
        />
        <DeviceRow
          label="เครื่องวัดน้ำตาล CGM"
          connected={devices.cgmConnected}
          onConnect={() => pair('cgm')}
          busy={stage === 'searching'}
        />
      </div>

      {error && (
        <div className="bg-vital-danger/10 border border-vital-danger/30 text-vital-danger rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {bothConnected && (
        <div className="animate-popIn">
          <p className="text-sm text-ink/60 mb-2">ค่าล่าสุดจากอุปกรณ์ของคุณ:</p>
          <VitalsBadge />
        </div>
      )}

      <BigButton onClick={() => navigate('/pre-run')} disabled={!bothConnected}>
        ถัดไป: จัดทีมก่อนวิ่ง
      </BigButton>
    </div>
  )
}

function DeviceRow({
  label,
  connected,
  onConnect,
  busy,
}: {
  label: string
  connected: boolean
  onConnect: () => void
  busy: boolean
}) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-card">
      <div>
        <p className="font-display font-semibold text-lg">{label}</p>
        <p className={`text-sm font-medium ${connected ? 'text-vital-safe' : 'text-ink/50'}`}>
          {connected ? '● เชื่อมต่อแล้ว' : '○ ยังไม่ได้เชื่อมต่อ'}
        </p>
      </div>
      {!connected && (
        <button
          onClick={onConnect}
          disabled={busy}
          className="min-h-[52px] px-5 rounded-xl bg-pine-700 text-white font-semibold disabled:opacity-50"
        >
          {busy ? 'กำลังค้นหา...' : 'เชื่อมต่อ'}
        </button>
      )}
    </div>
  )
}
