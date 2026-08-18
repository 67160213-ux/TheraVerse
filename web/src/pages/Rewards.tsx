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
        <span className="text-action-orange font-display font-semibold text-xs uppercase tracking-wider bg-action-orange/10 px-2.5 py-1 rounded-full border border-action-orange/20">
          🎁 REWARDS & DISCOUNTS
        </span>
        <h1 className="font-display text-2xl font-extrabold text-medical-900 mt-2">แลกส่วนลดค่ายาประจำวัน</h1>
        <p className="text-slate-600 text-sm mt-1">ใช้เหรียญตราแห่งวินัยที่คุณได้รับจากการเดินออกกำลังกายเพื่อแลกส่วนลด</p>
      </div>

      <div className="bg-white rounded-3xl shadow-card p-6 border border-medical-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">เหรียญตราแห่งวินัยคงเหลือ</p>
          <p className="font-display text-4xl font-extrabold text-action-orange mt-1">
            {loading ? '…' : tokenBalance} <span className="text-2xl">🎖️</span>
          </p>
        </div>
        <BigButton full={false} variant="action" onClick={claim} disabled={tokenBalance === 0 || claiming || loading}>
          {claiming ? 'กำลังสร้าง QR...' : 'แลก QR ส่วนลดค่ายา 15%'}
        </BigButton>
      </div>

      {error && <p className="text-magenta-500 font-semibold text-sm text-center">{error}</p>}

      {vouchers.length > 0 && (
        <div className="space-y-3">
          <p className="font-display font-bold text-medical-900 text-lg">คูปองส่วนลดที่คุณมี</p>
          {vouchers.map((v) => (
            <div key={v.code} className="bg-white rounded-2xl shadow-card p-5 border border-medical-100 flex items-center gap-4">
              <div className="w-20 h-20 bg-medical-900 text-action-lime rounded-xl flex flex-col items-center justify-center text-xs font-mono text-center font-bold p-1 shadow-md border border-medical-700">
                <span className="text-lg">QR</span>
                <span>{v.code.slice(-4)}</span>
              </div>
              <div>
                <p className="font-display font-bold text-medical-900 text-base">ส่วนลดค่ายานอกบัญชี {v.discountPercent}%</p>
                <p className="text-action-orange text-sm font-mono font-semibold">{v.code}</p>
                <p className="text-slate-500 text-xs mt-1">แสดง QR แก่เภสัชกรที่ร้านยาพันธมิตรหน้าโรงพยาบาล</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

