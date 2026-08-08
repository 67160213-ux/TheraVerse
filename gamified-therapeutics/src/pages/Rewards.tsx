import { useState } from 'react'
import { useApp } from '../context/AppContext'
import BigButton from '../components/BigButton'

function randomPromoCode() {
  return 'RX-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function Rewards() {
  const { game, vouchers, addVoucher } = useApp()
  const tokenCount = game.inventory.filter((i) => i === 'เหรียญตราแห่งวินัย').length
  const [claiming, setClaiming] = useState(false)

  async function claim() {
    setClaiming(true)
    await new Promise((res) => setTimeout(res, 800))
    addVoucher({ code: randomPromoCode(), discountPercent: 15, claimedAt: Date.now() })
    setClaiming(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gold-600 font-semibold text-sm">คลังของรางวัล</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">แลกส่วนลดค่ายา</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-between">
        <div>
          <p className="text-ink/60 text-sm">เหรียญตราแห่งวินัยที่มี</p>
          <p className="font-display text-3xl font-bold text-gold-600">{tokenCount} 🎖️</p>
        </div>
        <BigButton full={false} variant="gold" onClick={claim} disabled={tokenCount === 0 || claiming}>
          {claiming ? 'กำลังสร้าง...' : 'แลก QR ส่วนลด 15%'}
        </BigButton>
      </div>

      {vouchers.length > 0 && (
        <div className="space-y-3">
          <p className="font-display font-semibold">คูปองของคุณ</p>
          {vouchers.map((v) => (
            <div key={v.code} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
              <div className="w-20 h-20 bg-ink text-white rounded-xl flex items-center justify-center text-xs font-mono text-center leading-tight">
                QR<br />{v.code.slice(-4)}
              </div>
              <div>
                <p className="font-display font-bold">ส่วนลดค่ายานอกบัญชี {v.discountPercent}%</p>
                <p className="text-ink/60 text-sm font-mono">{v.code}</p>
                <p className="text-ink/40 text-xs">ใช้ได้ที่ร้านยาพันธมิตรหน้าโรงพยาบาล</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
