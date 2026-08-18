import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import BigButton from '../components/BigButton'

const DEVICES = [
  { id: 'garmin', label: 'นาฬิกา Garmin', desc: 'วัดชีพจรระหว่างเดินอย่างแม่นยำ' },
  { id: 'cgm', label: 'เครื่องวัดน้ำตาล Continuous Glucose Monitor (CGM)', desc: 'ติดที่ต้นแขน วัดระดับน้ำตาลต่อเนื่องตลอดเวลา' },
]

export default function DeviceSetup() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>(['garmin', 'cgm'])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-action-orange font-display font-semibold text-xs uppercase tracking-wider bg-action-orange/10 px-2.5 py-1 rounded-full">
          ขั้นตอนที่ 2 จาก 4
        </span>
        <h1 className="font-display text-2xl font-extrabold text-medical-900 mt-2">อุปกรณ์ของคุณ</h1>
        <p className="text-slate-600 text-sm mt-1">เลือกอุปกรณ์ที่จะใช้ติดตามสัญญาณชีพขณะทำกิจกรรม</p>
      </div>

      <div className="space-y-3">
        {DEVICES.map((d) => {
          const isSel = selected.includes(d.id)
          return (
            <label
              key={d.id}
              className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card cursor-pointer border-2 transition ${
                isSel ? 'border-medical-500 bg-medical-50/30' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => toggle(d.id)}
                className="w-6 h-6 accent-medical-700 rounded"
              />
              <div>
                <p className="font-display font-bold text-lg text-medical-900">{d.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{d.desc}</p>
              </div>
            </label>
          )
        })}
      </div>

      <div className="bg-medical-50 border border-medical-200/60 rounded-2xl p-4 text-xs text-medical-900 leading-relaxed flex items-center gap-3">
        <span className="text-2xl">📡</span>
        <div>
          <p className="font-bold text-medical-900">เตรียมความพร้อมสำหรับ Web Bluetooth</p>
          <p className="text-slate-600">เปิดบลูทูธบนอุปกรณ์ทั้งสองชิ้น นำไปวางใกล้โทรศัพท์ แล้วกดปุ่มเชื่อมต่อในขั้นตอนถัดไป</p>
        </div>
      </div>

      <BigButton variant="action" onClick={() => navigate('/connect')} disabled={selected.length === 0}>
        ถัดไป: เชื่อมต่ออุปกรณ์ (Connect Bluetooth)
      </BigButton>
    </div>
  )
}
