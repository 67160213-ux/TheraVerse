import { useApp } from '../context/AppContext'

export default function VitalsBadge() {
  const { vitals, zone } = useApp()
  const zoneColor = zone === 'green' ? 'text-vital-safe' : 'text-vital-danger'
  const zoneBg = zone === 'green' ? 'bg-vital-safe/10 border-vital-safe/40' : 'bg-vital-danger/10 border-vital-danger/40'
  const zoneLabel = zone === 'green' ? 'โซนปลอดภัย' : 'โซนอันตราย'

  return (
    <div className={`rounded-2xl border-2 px-4 py-3 flex items-center justify-between ${zoneBg}`} role="status">
      <div className="flex gap-5">
        <div>
          <p className="text-xs text-ink/60">ชีพจร</p>
          <p className="font-display text-2xl font-semibold">{vitals.heartRateBpm} <span className="text-sm font-normal">bpm</span></p>
        </div>
        <div>
          <p className="text-xs text-ink/60">น้ำตาล</p>
          <p className="font-display text-2xl font-semibold">{vitals.glucoseMgDl} <span className="text-sm font-normal">mg/dL</span></p>
        </div>
      </div>
      <span className={`font-semibold text-sm ${zoneColor}`}>● {zoneLabel}</span>
    </div>
  )
}
