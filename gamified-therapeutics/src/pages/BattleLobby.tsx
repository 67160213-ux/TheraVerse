import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BigButton from '../components/BigButton'

export default function BattleLobby() {
  const navigate = useNavigate()
  const { game } = useApp()
  const hp = Math.round(60 + Math.min(40, game.distanceM / 100))

  return (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-gold-600 font-semibold text-sm">ท้าดวลบอสประจำวัน</p>
        <h1 className="font-display text-2xl font-bold text-pine-900 mt-1">สมรภูมิรออยู่</h1>
      </div>

      <div className="bg-vital-danger/10 border-2 border-vital-danger/30 rounded-3xl p-6">
        <p className="text-6xl mb-2">👹</p>
        <p className="font-display font-bold text-lg">บอสเบาหวาน ระดับ 3</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5">
        <p className="text-ink/60 text-sm mb-1">พลังชีวิต (HP) ที่แปลงจากความสม่ำเสมอวันนี้</p>
        <div className="h-4 bg-pine-50 rounded-full overflow-hidden">
          <div className="h-full bg-pine-700" style={{ width: `${hp}%` }} />
        </div>
        <p className="font-display text-xl font-bold mt-2">{hp} HP</p>
      </div>

      <p className="text-ink/70 text-sm">
        เดินในจังหวะสม่ำเสมอตามที่เกมนับถอยหลัง เพื่อทำคอมโบโจมตี — ยิ่งชีพจรนิ่ง ยิ่งแรง
      </p>

      <BigButton variant="danger" onClick={() => navigate('/battle/active')}>
        เข้าสู่สมรภูมิ
      </BigButton>
    </div>
  )
}
