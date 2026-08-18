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
        <span className="text-action-orange font-display font-semibold text-xs uppercase tracking-wider bg-action-orange/10 px-2.5 py-1 rounded-full">
          ขั้นตอนที่ 3 จาก 4
        </span>
        <h1 className="font-display text-2xl font-extrabold text-medical-900 mt-2">เชื่อมต่ออุปกรณ์ Bluetooth</h1>
        <p className="text-slate-600 text-sm mt-1">กดปุ่มเพื่อค้นหาและจับคู่อุปกรณ์ผ่าน Web Bluetooth API</p>
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
        <div className="bg-magenta-500/10 border border-magenta-500/30 text-magenta-600 rounded-2xl p-4 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {bothConnected && (
        <div className="animate-popIn space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">สัญญาณชีพเรียลไทม์จากอุปกรณ์:</p>
          <VitalsBadge />
        </div>
      )}

      <BigButton variant="action" onClick={() => navigate('/pre-run')} disabled={!bothConnected}>
        ถัดไป: จัดทีมก่อนวิ่ง (Pre-Run Lobby)
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
    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-card border border-medical-100">
      <div>
        <p className="font-display font-bold text-lg text-medical-900">{label}</p>
        <p className={`text-xs font-semibold mt-0.5 ${connected ? 'text-medical-500' : 'text-slate-400'}`}>
          {connected ? '● เชื่อมต่อแล้ว (Connected)' : '○ ยังไม่ได้เชื่อมต่อ'}
        </p>
      </div>
      {!connected && (
        <button
          onClick={onConnect}
          disabled={busy}
          className="min-h-[48px] px-5 rounded-xl bg-medical-700 hover:bg-medical-500 text-white font-display font-semibold text-sm transition disabled:opacity-50 shadow-sm"
        >
          {busy ? 'กำลังค้นหา...' : 'เชื่อมต่อ'}
        </button>
      )}
    </div>
  )
}
