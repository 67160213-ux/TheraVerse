export function computeZone(heartRateBpm: number, glucoseMgDl: number, targetHrLow: number, targetHrHigh: number): 'green' | 'red' {
  const outOfHr = heartRateBpm < targetHrLow - 20 || heartRateBpm > targetHrHigh
  const glucoseCrash = glucoseMgDl < 70
  return outOfHr || glucoseCrash ? 'red' : 'green'
}

export function randomPromoCode(): string {
  return 'RX-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}
