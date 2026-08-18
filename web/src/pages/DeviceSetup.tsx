import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import BigButton from '../components/BigButton'

const DEVICES = [
  { id: 'garmin', label: 'นาฬิกา Garmin', desc: 'วัดชีพจรระหว่างเดิน' },
  { id: 'cgm', label: 'เครื่องวัดน้ำตาล CGM', desc: 'ติดที่ต้นแขน วัดระดับน้ำตาลต่อเนื่อง' },
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
        <p className="text-gold-600 font-semibold text-sm">ขั้นตอนที่ 2 จาก 4</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">อุปกรณ์ที่คุณมี</h1>
        <p className="text-ink/70 mt-1">เลือกอุปกรณ์ที่จะเชื่อมต่อกับเว็บแอปนี้</p>
      </div>

      <div className="space-y-3">
        {DEVICES.map((d) => (
          <label
            key={d.id}
            className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card cursor-pointer border-2 transition ${
              selected.includes(d.id) ? 'border-pine-700' : 'border-transparent'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(d.id)}
              onChange={() => toggle(d.id)}
              className="w-7 h-7 accent-pine-700"
            />
            <div>
              <p className="font-display font-semibold text-lg">{d.label}</p>
              <p className="text-ink/60 text-sm">{d.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-pine-50 border border-pine-100 rounded-xl p-4 text-sm text-pine-900/80">
        ขั้นตอนถัดไป: เปิดบลูทูธบนอุปกรณ์ทั้งสองชิ้น แล้วนำไปวางใกล้โทรศัพท์ของคุณ
      </div>

      <BigButton onClick={() => navigate('/connect')} disabled={selected.length === 0}>
        ถัดไป: เชื่อมต่ออุปกรณ์
      </BigButton>
    </div>
  )
}
