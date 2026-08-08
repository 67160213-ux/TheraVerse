export type ZoneColor = 'green' | 'red'

export interface VitalReading {
  heartRateBpm: number
  glucoseMgDl: number
  timestamp: number
}

export interface DeviceStatus {
  watchConnected: boolean
  cgmConnected: boolean
  bluetoothSupported: boolean
}

export interface PatientProfile {
  hn: string
  name: string
  age: number
  condition: string
  targetHrLow: number
  targetHrHigh: number
  dailyDistanceGoalM: number
  emergencyPhone: string
  nurseName: string
}

export interface GameState {
  distanceM: number
  discCoins: number
  inventory: string[]
  activeCharacter: string
  lastBossResult: 'victory' | 'defeat' | null
}

export interface RewardVoucher {
  code: string
  discountPercent: number
  claimedAt: number
}
