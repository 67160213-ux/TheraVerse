import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import { speakNarrator } from '../lib/audio'
import BigButton from '../components/BigButton'

interface Voucher {
  id?: string
  code: string
  discountPercent: number
  claimedAt: string
}

export default function Rewards() {
  const navigate = useNavigate()
  const { patient } = useApp()
  const [tokenBalance, setTokenBalance] = useState(0)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [granting, setGranting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

  const hn = patient?.hn || '6501234'

  async function refresh() {
    setLoading(true)
    try {
      const data = await api.getRewards(hn)
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
  }, [hn])

  async function handleGrantToken() {
    setGranting(true)
    setError(null)
    try {
      await api.grantToken(hn)
      speakNarrator('ได้รับเหรียญตราแห่งวินัยเพิ่ม 1 เหรียญ ยินดีด้วยครับ!')
      await refresh()
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'เพิ่มเหรียญไม่สำเร็จ')
    } finally {
      setGranting(false)
    }
  }

  async function claim() {
    setClaiming(true)
    setError(null)
    try {
      const newVoucher = await api.redeemVoucher(hn)
      speakNarrator('สร้าง QR Code คูปองส่วนลดค่ายา 15 เปอร์เซ็นต์ สำเร็จแล้ว')
      setSelectedVoucher(newVoucher)
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
          🎁 TOUCHPOINT 7: HOSPITAL REWARDS & QR CODES
        </span>
        <h1 className="font-display text-2xl font-extrabold text-medical-900 mt-2">สิทธิประโยชน์และส่วนลดโรงพยาบาล</h1>
        <p className="text-slate-600 text-sm mt-1">ใช้เหรียญตราแห่งวินัยเพื่อแลก QR Code ส่วนลดค่ายา ตรวจแล็บ และอุปกรณ์สุขภาพ</p>
      </div>

      {/* Token Balance & Claim Box */}
      <div className="bg-white rounded-3xl shadow-card p-6 border border-medical-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">เหรียญตราแห่งวินัยคงเหลือ (Discipline Tokens)</p>

          <div className="flex items-center gap-3 mt-1">
            <p className="font-display text-4xl font-extrabold text-action-orange">
              {loading ? '…' : tokenBalance} <span className="text-2xl">🎖️</span>
            </p>

            <button
              onClick={handleGrantToken}
              disabled={granting || loading}
              className="text-xs bg-action-orange/10 hover:bg-action-orange/20 border border-action-orange/30 text-action-orange font-bold px-3 py-1.5 rounded-xl transition"
            >
              {granting ? 'กำลังรับ...' : '✨ +1 เหรียญสะสมวินัย'}
            </button>
          </div>
        </div>

        <BigButton full={false} variant="action" onClick={claim} disabled={tokenBalance === 0 || claiming || loading}>
          {claiming ? 'กำลังสร้าง QR Code...' : 'แลก QR ส่วนลดค่ายา 15%'}
        </BigButton>
      </div>

      {error && <p className="text-magenta-500 font-semibold text-sm text-center bg-magenta-500/10 p-3 rounded-xl border border-magenta-500/30">{error}</p>}

      {/* Hospital Benefits List */}
      <div className="bg-medical-50/60 rounded-2xl p-4 border border-medical-100 text-xs text-medical-900 space-y-1">
        <p className="font-bold font-display text-sm text-medical-900">สิทธิประโยชน์ที่สามารถนำ QR Code ไปแสดง:</p>
        <p className="text-slate-600">💊 1. ส่วนลดค่ายานอกบัญชียาหลัก 15% ณ ร้านยาพันธมิตรโรงพยาบาล</p>
        <p className="text-slate-600">🧪 2. ส่วนลดค่าตรวจแล็บเจาะเลือดติดตาม HbA1c 20%</p>
        <p className="text-slate-600">🩺 3. แลกรับชุดแถบตรวจค่าน้ำตาลและเข็มสะกิดผิวฟรีประจำเดือน</p>
      </div>

      {/* Claimed Vouchers List with REAL QR Codes */}
      {vouchers.length > 0 && (
        <div className="space-y-3">
          <p className="font-display font-bold text-medical-900 text-lg">คูปองส่วนลด QR Code ของคุณ ({vouchers.length})</p>

          <div className="grid grid-cols-1 gap-4">
            {vouchers.map((v) => {
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(v.code)}`
              return (
                <div key={v.code} className="bg-white rounded-3xl shadow-card p-5 border border-medical-100 flex flex-col sm:flex-row items-center gap-5 animate-popIn">
                  <div className="relative group cursor-pointer" onClick={() => setSelectedVoucher(v)}>
                    <img
                      src={qrUrl}
                      alt={`QR Code ${v.code}`}
                      className="w-28 h-28 object-contain p-1.5 bg-white rounded-2xl border-2 border-medical-200 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-2xl flex items-center justify-center text-white text-[10px] font-bold">
                      🔍 ขยาย QR
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <span className="bg-action-orange/10 text-action-orange text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-action-orange/20">
                      สิทธิพิเศษโรงพยาบาล • HN {hn}
                    </span>
                    <p className="font-display font-extrabold text-medical-900 text-lg">ส่วนลดค่ายานอกบัญชี {v.discountPercent}%</p>
                    <p className="text-action-orange font-mono font-bold text-base tracking-wider">{v.code}</p>
                    <p className="text-slate-500 text-xs">แลกเมื่อ {new Date(v.claimedAt).toLocaleDateString('th-TH')}</p>
                  </div>

                  <button
                    onClick={() => setSelectedVoucher(v)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-medical-700 hover:bg-medical-500 text-white font-display font-bold text-xs transition shadow-sm"
                  >
                    📱 สแกน QR Code
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-medical-200">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-display font-bold text-sm text-medical-900">QR Code สิทธิประโยชน์โรงพยาบาล</span>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-medical-50 p-4 rounded-2xl border border-medical-100 flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedVoucher.code)}`}
                alt="QR Code"
                className="w-52 h-52 object-contain p-2 bg-white rounded-xl shadow-md border"
              />
              <p className="font-mono font-bold text-xl text-medical-900 mt-3 tracking-widest">{selectedVoucher.code}</p>
              <span className="text-xs font-semibold text-action-orange mt-1">ส่วนลดค่ายานอกบัญชีหลัก {selectedVoucher.discountPercent}%</span>
            </div>

            <div className="text-xs text-slate-500 space-y-1 text-left bg-slate-50 p-3 rounded-xl">
              <p className="font-semibold text-slate-700">📌 วิธีใช้งาน:</p>
              <p>1. ยื่น QR Code นี้ให้แก่เจ้าหน้าที่เภสัชกร/การเงิน</p>
              <p>2. ใช้รหัส HN {hn} ยืนยันสิทธิ์ ณ โรงพยาบาลหรือร้านยาพันธมิตร</p>
            </div>

            <button
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-3 rounded-xl bg-medical-700 hover:bg-medical-500 text-white font-display font-bold text-sm transition"
            >
              เสร็จสิ้น / ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
      {/* Action Next Steps */}
      <div className="pt-4 space-y-3 border-t border-slate-200">
        <p className="font-display font-bold text-sm text-medical-900 text-center">ขั้นตอนถัดไปที่คุณสามารถทำได้:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 px-4 rounded-2xl bg-medical-50 hover:bg-medical-100 border border-medical-200 text-medical-900 font-display font-bold text-sm transition flex items-center justify-center gap-2"
          >
            📋 ดูรายงานเวชระเบียน (Clinical Dashboard)
          </button>
          <button
            onClick={() => navigate('/pre-run')}
            className="w-full py-3.5 px-4 rounded-2xl bg-action-lime/20 hover:bg-action-lime/30 border border-action-lime/40 text-medical-900 font-display font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            🏃‍♂️ เริ่มภารกิจเดินบำบัดรอบใหม่
          </button>
        </div>
      </div>
    </div>
  )
}
