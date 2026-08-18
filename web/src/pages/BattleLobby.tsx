import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BigButton from '../components/BigButton'

export default function BattleLobby() {
  const navigate = useNavigate()
  const { game } = useApp()
  const hp = Math.round(60 + Math.min(40, game.distanceM / 100))

  return (
    <div className="gamified-container space-y-6 text-center">
      <div>
        <span className="text-magenta-400 font-display font-bold text-xs uppercase tracking-wider bg-magenta-500/10 px-3 py-1 rounded-full border border-magenta-500/30 shadow-neon-pink">
          ⚔️ BOSS BATTLE ARENA
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white mt-2">สมรภูมิรออยู่</h1>
      </div>

      <div className="bg-navy-950/90 border-2 border-magenta-500/50 rounded-3xl p-6 shadow-neon-pink animate-glowPulse">
        <p className="text-6xl mb-2">👹</p>
        <p className="font-display font-extrabold text-xl text-magenta-400">บอสเบาหวาน ระดับ 3</p>
        <p className="text-slate-400 text-xs mt-1">การต่อสู้ด้วยอัตราการเต้นของหัวใจเรียลไทม์</p>
      </div>

      <div className="gamified-card rounded-2xl p-5 border border-cyan-400/30">
        <p className="text-slate-300 text-xs mb-2">พลังชีวิต (HP) ที่แปลงจากความสม่ำเสมอในการเดินวันนี้</p>
        <div className="h-4 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-cyan-400/30">
          <div className="h-full bg-cyan-400 rounded-full shadow-neon-cyan transition-all" style={{ width: `${hp}%` }} />
        </div>
        <p className="font-display text-2xl font-extrabold text-cyan-400 mt-2">{hp} HP</p>
      </div>

      <p className="text-slate-300 text-xs leading-relaxed px-4">
        เดินในจังหวะสม่ำเสมอตามที่เกมนับถอยหลัง เพื่อทำคอมโบโจมตี — ยิ่งชีพจรนิ่งในโซนปลอดภัย ยิ่งสร้างความเสียหายแรง!
      </p>

      <BigButton variant="danger" onClick={() => navigate('/battle/active')}>
        ⚡ เข้าสู่สมรภูมิ (ENTER ARENA)
      </BigButton>
    </div>
  )
}
