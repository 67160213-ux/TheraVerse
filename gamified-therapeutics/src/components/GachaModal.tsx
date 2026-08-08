import { useState } from 'react'

const DROPS = ['การ์ดขุนศึกน้ำตาล', 'เกราะแห่งความสม่ำเสมอ', 'ไอเทมฟื้นพลัง', 'การ์ดพยาบาลคุ้มกัน']

interface Props {
  open: boolean
  onClaim: () => void
}

export default function GachaModal({ open, onClaim }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [drop] = useState(() => DROPS[Math.floor(Math.random() * DROPS.length)])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 bg-ink/70 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-card animate-popIn">
        <p className="font-display font-semibold text-gold-600 mb-1">ครบ 500 เมตร!</p>
        <h2 className="font-display text-xl font-bold mb-4">เปิดกล่องสุ่ม</h2>
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-40 h-40 mx-auto rounded-2xl bg-gold-200 flex items-center justify-center text-5xl mb-4 active:scale-95 transition"
          >
            🎁
          </button>
        ) : (
          <div className="w-40 h-40 mx-auto rounded-2xl bg-pine-50 flex items-center justify-center text-5xl mb-4">
            🃏
          </div>
        )}
        <p className="text-ink/70 mb-5 min-h-[24px]">{revealed ? `คุณได้รับ "${drop}"` : 'แตะกล่องเพื่อเปิด'}</p>
        <button
          onClick={() => {
            onClaim()
            setRevealed(false)
          }}
          disabled={!revealed}
          className="min-h-[56px] w-full rounded-xl bg-pine-700 text-white font-semibold disabled:opacity-40"
        >
          เก็บเข้าคลัง
        </button>
      </div>
    </div>
  )
}
