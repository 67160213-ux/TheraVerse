import { ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import PulseDivider from './PulseDivider'

export default function AppShell({ children }: { children: ReactNode }) {
  const { textScale, setTextScale, patient } = useApp()

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="bg-gradient-to-r from-medical-900 via-medical-700 to-medical-500 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-action-lime inline-block shadow-neon-cyan animate-pulse"></span>
              วินัยนักสู้
            </span>
            <span className="bg-white/10 text-action-lime text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline border border-action-lime/30">
              Active Clinical
            </span>
          </div>
          <div className="flex items-center gap-3">
            {patient?.hn && (
              <span className="text-sm text-medical-100/90 font-mono hidden sm:inline bg-black/20 px-2.5 py-1 rounded-lg">
                HN {patient.hn}
              </span>
            )}
            <div className="flex items-center bg-black/25 backdrop-blur-sm rounded-full p-1 border border-white/10" role="group" aria-label="ปรับขนาดตัวอักษร">
              {(['base', 'large', 'xl'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setTextScale(s)}
                  aria-pressed={textScale === s}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                    textScale === s ? 'bg-action-orange text-white shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {s === 'base' ? 'ก' : s === 'large' ? 'ก+' : 'ก++'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <PulseDivider color="#00E5FF" className="opacity-90" />
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-5 py-6">{children}</main>
    </div>
  )
}

