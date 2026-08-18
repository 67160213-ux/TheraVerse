import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import BigButton from '../components/BigButton'
import PulseDivider from '../components/PulseDivider'

export default function Landing() {
  const navigate = useNavigate()
  const { patient, setPatient, consentGiven, setConsentGiven } = useApp()
  const [hn, setHn] = useState('')
  const [checking, setChecking] = useState(false)
  const [hnError, setHnError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [consenting, setConsenting] = useState(false)

  async function handleStart() {
    if (hn.trim().length < 4) {
      setHnError('กรุณากรอกรหัสผู้ป่วย (HN) อย่างน้อย 4 หลัก')
      return
    }
    setHnError(null)
    setChecking(true)
    try {
      // Real lookup/registration against the API's Patient table.
      const record = await api.lookupOrRegisterPatient({ hn: hn.trim() })
      setPatient({ ...(patient as any), ...record })
      if (record.consentGiven) setConsentGiven(true)
    } catch (e) {
      setHnError(e instanceof ApiRequestError ? e.message : 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setChecking(false)
    }
  }

  async function handleConsent() {
    if (!patient?.hn) return
    setConsenting(true)
    try {
      const updated = await api.giveConsent(patient.hn)
      setPatient({ ...(patient as any), ...updated })
      setConsentGiven(true)
      navigate('/device-setup')
    } catch (e) {
      setHnError(e instanceof ApiRequestError ? e.message : 'บันทึกความยินยอมไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setConsenting(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="text-center pt-4">
        <p className="font-display text-gold-600 font-semibold mb-2">โปรแกรมบำบัดด้วยการเดินเร็ว</p>
        <h1 className="font-display text-3xl font-bold text-pine-900 leading-snug">
          ทุกก้าวของคุณ<br />คือด่านต่อไปในเกม
        </h1>
        <p className="text-ink/70 mt-3">
          เชื่อมนาฬิกาและเครื่องวัดน้ำตาล เดินตามที่หมอสั่ง แล้วรับเหรียญตราแห่งวินัย
        </p>
      </section>

      <PulseDivider />

      {!patient?.hn ? (
        <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <label htmlFor="hn" className="block font-semibold text-lg">
            รหัสผู้ป่วย (Hospital Number)
          </label>
          <input
            id="hn"
            inputMode="numeric"
            value={hn}
            onChange={(e) => setHn(e.target.value)}
            placeholder="เช่น 6501234"
            className="w-full min-h-[60px] rounded-xl border-2 border-pine-300 px-4 text-xl focus:border-pine-700"
          />
          {hnError && <p className="text-vital-danger text-sm">{hnError}</p>}
          <BigButton onClick={handleStart} disabled={checking}>
            {checking ? 'กำลังตรวจสอบ...' : 'เริ่มต้นบำบัด'}
          </BigButton>
        </section>
      ) : (
        <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <h2 className="font-display text-xl font-semibold text-pine-900">
            ยินยอมการเข้าถึงข้อมูลสุขภาพ (PDPA)
          </h2>
          <p className="text-ink/80 leading-relaxed">
            แอปนี้จะขอเชื่อมต่อกับนาฬิกา Garmin และเครื่องวัดน้ำตาล (CGM) ของคุณ
            เพื่อบันทึกและส่งข้อมูลชีพจรและระดับน้ำตาลให้ทีมแพทย์ที่ดูแลคุณเท่านั้น
            ข้อมูลจะไม่ถูกเปิดเผยแก่บุคคลภายนอก
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1.5 w-6 h-6 accent-pine-700"
            />
            <span className="text-ink/90">ฉันยินยอมให้เก็บและใช้ข้อมูลสุขภาพของฉันตามที่ระบุไว้</span>
          </label>
          <BigButton onClick={handleConsent} disabled={!agreed || consenting}>
            {consenting ? 'กำลังบันทึก...' : 'ยอมรับและดำเนินการต่อ'}
          </BigButton>
        </section>
      )}

      {consentGiven === false && (
        <p className="text-center text-xs text-ink/40">HN {patient?.hn ? patient.hn : '—'}</p>
      )}
    </div>
  )
}
