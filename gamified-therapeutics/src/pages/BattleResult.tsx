import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BigButton from '../components/BigButton'

export default function BattleResult() {
  const navigate = useNavigate()
  const { game, patient, setGame } = useApp()
  const clinicalGoalMet = game.distanceM >= (patient?.dailyDistanceGoalM ?? 2000)
  const won = game.lastBossResult === 'victory'

  function claimToken() {
    setGame((g) => ({ ...g, inventory: [...g.inventory, 'เหรียญตราแห่งวินัย'] }))
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6 text-center">
      <p className="text-6xl">{won ? '🏆' : '🛡️'}</p>
      <h1 className="font-display text-2xl font-bold text-pine-900">
        {won ? 'ชนะบอสแล้ว!' : 'แพ้บอสในเกม'}
      </h1>

      {!won && clinicalGoalMet && (
        <p className="text-ink/70">
          แต่ไม่เป็นไร — สถิติการเดินวันนี้ของคุณผ่านเกณฑ์ที่หมอกำหนดครบถ้วน
          ระบบจึงยังมอบรางวัลให้ตามปกติ
        </p>
      )}

      {clinicalGoalMet ? (
        <div className="bg-gold-200 rounded-2xl p-6 border-2 border-gold-400">
          <p className="text-4xl mb-2">🎖️</p>
          <p className="font-display font-bold text-lg">เหรียญตราแห่งวินัย</p>
          <p className="text-ink/60 text-sm">Token of Discipline</p>
        </div>
      ) : (
        <div className="bg-pine-50 rounded-2xl p-6 border-2 border-pine-100">
          <p className="text-ink/70">เดินยังไม่ครบเป้าหมายวันนี้ ลองใหม่พรุ่งนี้นะครับ</p>
        </div>
      )}

      <BigButton onClick={claimToken}>ถัดไป: ส่งรายงานให้แพทย์</BigButton>
    </div>
  )
}
