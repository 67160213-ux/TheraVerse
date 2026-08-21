const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

class ApiRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiRequestError(res.status, body.message ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  // Patients
  lookupOrRegisterPatient: (payload: { hn: string; name?: string; age?: number; condition?: string }) =>
    request<any>('/patients', { method: 'POST', body: JSON.stringify(payload) }),
  getPatient: (hn: string) => request<any>(`/patients/${hn}`),
  giveConsent: (hn: string) => request<any>(`/patients/${hn}/consent`, { method: 'PATCH', body: JSON.stringify({ agreed: true }) }),

  // Devices
  pairDevice: (hn: string, deviceType: 'WATCH' | 'CGM') =>
    request<any>(`/patients/${hn}/devices/pair`, { method: 'POST', body: JSON.stringify({ deviceType, connected: true }) }),
  listDevices: (hn: string) => request<any[]>(`/patients/${hn}/devices`),

  // Sessions
  startSession: (hn: string) => request<any>(`/patients/${hn}/sessions`, { method: 'POST' }),
  postProgress: (
    sessionId: string,
    payload: { heartRateBpm: number; glucoseMgDl: number; deltaDistanceM?: number; gpsLost?: boolean }
  ) => request<any>(`/sessions/${sessionId}/progress`, { method: 'POST', body: JSON.stringify(payload) }),
  completeSession: (sessionId: string, status: 'COMPLETED' | 'ABORTED_CRITICAL' = 'COMPLETED') =>
    request<any>(`/sessions/${sessionId}/complete`, { method: 'POST', body: JSON.stringify({ status }) }),
  getSession: (sessionId: string) => request<any>(`/sessions/${sessionId}`),

  // Battle
  submitBattleResult: (sessionId: string, payload: { outcome: 'VICTORY' | 'DEFEAT'; bossLevel?: number; comboMax?: number }) =>
    request<any>(`/sessions/${sessionId}/battle`, { method: 'POST', body: JSON.stringify(payload) }),

  // Clinical report
  submitClinicalReport: (sessionId: string) => request<any>(`/sessions/${sessionId}/clinical-report`, { method: 'POST' }),
  listClinicalReports: (hn: string) => request<any[]>(`/patients/${hn}/clinical-reports`),

  // Rewards
  getRewards: (hn: string) => request<{ tokenBalance: number; tokens: any[]; vouchers: any[] }>(`/patients/${hn}/rewards`),
  redeemVoucher: (hn: string) => request<any>(`/patients/${hn}/rewards/redeem`, { method: 'POST' }),
  grantToken: (hn: string) => request<any>(`/patients/${hn}/rewards/grant`, { method: 'POST' }),
}

export { ApiRequestError }
