import { ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import PulseDivider from './PulseDivider'

export default function AppShell({ children }: { children: ReactNode }) {
  const { textScale, setTextScale, patient } = useApp()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-pine-700 text-white">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold tracking-tight">วินัยนักสู้</span>
            <span className="text-pine-100/70 text-xs hidden sm:inline">โปรแกรมบำบัดด้วยการเดินเร็ว</span>
          </div>
          <div className="flex items-center gap-3">
            {patient?.hn && (
              <span className="text-sm text-pine-100/90 hidden sm:inline">HN {patient.hn}</span>
            )}
            <div className="flex items-center bg-pine-900/40 rounded-full p-1" role="group" aria-label="ปรับขนาดตัวอักษร">
              {(['base', 'large', 'xl'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setTextScale(s)}
                  aria-pressed={textScale === s}
                  className={`px-2.5 py-1 rounded-full text-sm font-medium transition ${
                    textScale === s ? 'bg-gold-400 text-ink' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {s === 'base' ? 'ก' : s === 'large' ? 'ก+' : 'ก++'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <PulseDivider color="#E2B24B" className="opacity-70" />
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6">{children}</main>
    </div>
  )
}
