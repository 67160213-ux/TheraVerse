import { createContext, useContext, useMemo, useState, ReactNode } from 'react'
import type { DeviceStatus, GameState, PatientProfile, RewardVoucher, VitalReading } from '../types'

interface AppContextValue {
  patient: PatientProfile | null
  setPatient: (p: PatientProfile) => void
  consentGiven: boolean
  setConsentGiven: (v: boolean) => void
  devices: DeviceStatus
  setDevices: (updater: DeviceStatus | ((d: DeviceStatus) => DeviceStatus)) => void
  vitals: VitalReading
  setVitals: (updater: VitalReading | ((v: VitalReading) => VitalReading)) => void
  zone: 'green' | 'red'
  game: GameState
  setGame: (updater: (g: GameState) => GameState) => void
  vouchers: RewardVoucher[]
  addVoucher: (v: RewardVoucher) => void
  textScale: 'base' | 'large' | 'xl'
  setTextScale: (s: 'base' | 'large' | 'xl') => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DEFAULT_PATIENT: PatientProfile = {
  hn: '',
  name: 'ลุงสมศักดิ์',
  age: 62,
  condition: 'เบาหวานชนิดที่ 2 และไขมันในเลือดสูง',
  targetHrLow: 90,
  targetHrHigh: 128,
  dailyDistanceGoalM: 2000,
  emergencyPhone: 'tel:1669',
  nurseName: 'พยาบาลอรุณี',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const [devices, setDevices] = useState<DeviceStatus>({
    watchConnected: false,
    cgmConnected: false,
    bluetoothSupported: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  })
  const [vitals, setVitals] = useState<VitalReading>({
    heartRateBpm: 78,
    glucoseMgDl: 118,
    timestamp: Date.now(),
  })
  const [game, setGameState] = useState<GameState>({
    distanceM: 0,
    discCoins: 3,
    inventory: ['ขุนศึกเบาหวาน'],
    activeCharacter: 'ขุนศึกเบาหวาน',
    lastBossResult: null,
  })
  const [vouchers, setVouchers] = useState<RewardVoucher[]>([])
  const [textScale, setTextScaleState] = useState<'base' | 'large' | 'xl'>('large')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const zone = useMemo<'green' | 'red'>(() => {
    const low = patient?.targetHrLow ?? DEFAULT_PATIENT.targetHrLow
    const high = patient?.targetHrHigh ?? DEFAULT_PATIENT.targetHrHigh
    const outOfHr = vitals.heartRateBpm < low - 20 || vitals.heartRateBpm > high
    const glucoseCrash = vitals.glucoseMgDl < 70
    return outOfHr || glucoseCrash ? 'red' : 'green'
  }, [vitals, patient])

  function setGame(updater: (g: GameState) => GameState) {
    setGameState((prev) => updater(prev))
  }

  function addVoucher(v: RewardVoucher) {
    setVouchers((prev) => [v, ...prev])
  }

  function setTextScale(s: 'base' | 'large' | 'xl') {
    setTextScaleState(s)
    document.body.setAttribute('data-text-scale', s)
  }

  const value: AppContextValue = {
    patient: patient ?? DEFAULT_PATIENT,
    setPatient,
    consentGiven,
    setConsentGiven,
    devices,
    setDevices,
    vitals,
    setVitals,
    zone,
    game,
    setGame,
    vouchers,
    addVoucher,
    textScale,
    setTextScale,
    sessionId,
    setSessionId,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
