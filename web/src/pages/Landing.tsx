import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, ApiRequestError } from '../lib/api'
import { speakNarrator } from '../lib/audio'
import BigButton from '../components/BigButton'
import PulseDivider from '../components/PulseDivider'

export default function Landing() {
  const navigate = useNavigate()
  const { patient, setPatient, consentGiven, setConsentGiven, setDevices } = useApp()
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
      
      // Auto-Pairing in Background & sync with backend DB
      try {
        await api.pairDevice(patient.hn, 'WATCH')
        await api.pairDevice(patient.hn, 'CGM')
      } catch (err) {
        console.warn('Auto-pair device warning:', err)
      }

      setDevices({
        watchConnected: true,
        cgmConnected: true,
        bluetoothSupported: true,
      })

      speakNarrator('ยืนยันตัวตนสำเร็จ กำลังเชื่อมต่อนาฬิกา และเครื่องวัดน้ำตาล ในพื้นหลัง')
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
        <span className="inline-block bg-action-orange/10 text-action-orange font-display font-semibold text-sm px-3.5 py-1 rounded-full border border-action-orange/20 mb-3 shadow-sm">
          🏃‍♂️ Active Clinical • บำบัดการเดินเร็ว (Touchpoint 1: Fast Sync)
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-medical-900 leading-snug tracking-tight">
          ทุกก้าวของคุณ<br />คือด่านต่อไปในเกม
        </h1>
        <p className="text-slate-600 mt-3 max-w-md mx-auto text-base leading-relaxed">
          เชื่อมนาฬิกาและเครื่องวัดน้ำตาล เดินตามที่หมอสั่ง แล้วรับเหรียญตราแห่งวินัย
        </p>
      </section>

      <PulseDivider color="#00A896" />

      {!patient?.hn ? (
        <section className="bg-white rounded-3xl shadow-card p-6 border border-medical-100 space-y-5">
          <div>
            <label htmlFor="hn" className="block font-display font-bold text-lg text-medical-900 mb-1">
              รหัสผู้ป่วย (Hospital Number - HN)
            </label>
            <p className="text-xs text-slate-500 mb-3">ระบุ HN เพียงครั้งเดียวเพื่อดึงใบสั่งแพทย์และแผนการเดินบำบัด</p>
            <input
              id="hn"
              inputMode="numeric"
              value={hn}
              onChange={(e) => setHn(e.target.value)}
              placeholder="เช่น 6501234"
              className="w-full min-h-[60px] rounded-xl border-2 border-medical-300 px-4 text-xl font-mono focus:border-medical-700 focus:ring-4 focus:ring-medical-500/20 outline-none transition"
            />
          </div>
          {hnError && <p className="text-magenta-500 font-semibold text-sm">{hnError}</p>}
          <BigButton variant="action" onClick={handleStart} disabled={checking}>
            {checking ? 'กำลังตรวจสอบ...' : 'เริ่มต้นบำบัด (Fast Sync)'}
          </BigButton>
        </section>
      ) : (
        <section className="bg-white rounded-3xl shadow-card p-6 border border-medical-100 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-medical-900">
              ยินยอมการเข้าถึงข้อมูลสุขภาพ (PDPA)
            </h2>
            <span className="text-xs font-mono font-bold bg-medical-50 text-medical-700 px-2.5 py-1 rounded-full border border-medical-200">
              HN {patient.hn}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm">
            แอปจะเชื่อมต่อกับ Smart Watch และเครื่องวัดน้ำตาล (CGM) ของคุณโดยอัตโนมัติ 
            เพื่อบันทึกสัญญาณชีพและส่งตรงถึงทีมแพทย์ที่ดูแลคุณเท่านั้น
          </p>
          <label className="flex items-start gap-3 cursor-pointer bg-medical-50/50 p-4 rounded-xl border border-medical-100">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-medical-700 rounded"
            />
            <span className="text-slate-800 text-sm font-medium">ฉันยินยอมให้เก็บและส่งสัญญาณชีพเข้า Clinical Dashboard ตาม PDPA</span>
          </label>
          <BigButton variant="action" onClick={handleConsent} disabled={!agreed || consenting}>
            {consenting ? 'กำลังเชื่อมต่อในพื้นหลัง...' : 'ยอมรับและจับคู่อุปกรณ์ (Auto-Pairing)'}
          </BigButton>
        </section>
      )}

      {consentGiven === false && (
        <p className="text-center text-xs text-slate-400 font-mono">HN {patient?.hn ? patient.hn : '—'}</p>
      )}
    </div>
  )
}


