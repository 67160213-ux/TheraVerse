import { useApp } from '../context/AppContext'

export default function VitalsBadge() {
  const { vitals, zone } = useApp()
  const isGreen = zone === 'green'

  return (
    <div
      className={`rounded-2xl border-2 px-5 py-4 flex items-center justify-between transition-all duration-300 shadow-md ${
        isGreen
          ? 'bg-medical-50/80 border-medical-500/40 text-medical-900 shadow-neon-cyan/20'
          : 'bg-magenta-500/10 border-magenta-500 text-magenta-600 shadow-neon-pink/40 animate-pulse'
      }`}
      role="status"
    >
      <div className="flex gap-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ชีพจร (Heart Rate)</p>
          <p className="font-display text-2xl font-bold tracking-tight">
            {vitals.heartRateBpm}{' '}
            <span className="text-sm font-semibold text-slate-500">bpm</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">น้ำตาล (CGM)</p>
          <p className="font-display text-2xl font-bold tracking-tight">
            {vitals.glucoseMgDl}{' '}
            <span className="text-sm font-semibold text-slate-500">mg/dL</span>
          </p>
        </div>
      </div>
      <span
        className={`font-display font-bold text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
          isGreen ? 'bg-medical-500 text-white shadow-sm' : 'bg-magenta-500 text-white shadow-neon-pink'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        {isGreen ? 'โซนปลอดภัย' : 'โซนอันตราย!'}
      </span>
    </div>
  )
}

