import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import BigButton from '../components/BigButton'

interface Voucher {
  code: string
  discountPercent: number
  claimedAt: string
}

export default function Rewards() {
  const { patient } = useApp()
  const [tokenBalance, setTokenBalance] = useState(0)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!patient?.hn) return
    setLoading(true)
    try {
      const data = await api.getRewards(patient.hn)
      setTokenBalance(data.tokenBalance)
      setVouchers(data.vouchers)
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'โหลดข้อมูลรางวัลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.hn])

  async function claim() {
    if (!patient?.hn) return
    setClaiming(true)
    setError(null)
    try {
      await api.redeemVoucher(patient.hn)
      await refresh()
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'แลกส่วนลดไม่สำเร็จ')
    } finally {
      setClaiming(false)
    }
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
          <p className="font-display text-3xl font-bold text-gold-600">{loading ? '…' : tokenBalance} 🎖️</p>
        </div>
        <BigButton full={false} variant="gold" onClick={claim} disabled={tokenBalance === 0 || claiming || loading}>
          {claiming ? 'กำลังสร้าง...' : 'แลก QR ส่วนลด 15%'}
        </BigButton>
      </div>

      {error && <p className="text-vital-danger text-sm text-center">{error}</p>}

      {vouchers.length > 0 && (
        <div className="space-y-3">
          <p className="font-display font-semibold">คูปองของคุณ</p>
          {vouchers.map((v) => (
            <div key={v.code} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
              <div className="w-20 h-20 bg-ink text-white rounded-xl flex items-center justify-center text-xs font-mono text-center leading-tight">
                QR
                <br />
                {v.code.slice(-4)}
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
