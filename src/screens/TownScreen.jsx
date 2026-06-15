import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, formatMoney, generateDayMonster, getTitle } from '../gameLogic'
import GameIcon from '../components/GameIcon'
import homeBg from '../assets/academy-art/home-bg.webp'
import avatars from '../assets/academy-art/avatars.png'
import monsterSprites from '../assets/academy-art/monster-sprites.png'

function Avatar({ gender = 'girl', className = '' }) {
  return (
    <div className={`academy-avatar academy-avatar--${gender} ${className}`}>
      <img src={avatars} alt="" draggable="false" />
    </div>
  )
}

function TopHUD({ profile, todayBudget, spent, onAvatarClick }) {
  const title = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  return (
    <div className="academy-hud">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button onClick={onAvatarClick} className="shrink-0">
            <Avatar gender={profile?.avatarGender ?? 'girl'} className="academy-hud-avatar" />
          </button>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-[#8E87A8]">Lv.{profile?.level ?? 1}</div>
            <div className="truncate text-sm font-black text-[#26324A]">{equippedTitle ?? title?.name ?? '菜鳥冒險者'}</div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5 text-[11px]">
          <span className="academy-pill academy-pill--gold"><GameIcon name="yellow-star" />{profile?.stars?.yellow ?? 0}</span>
          <span className="academy-pill academy-pill--purple"><GameIcon name="purple-star" />{profile?.stars?.purple ?? 0}</span>
          <span className="academy-pill academy-pill--pink"><GameIcon name="normal-ticket" />{profile?.tickets?.normal ?? 0}</span>
          <span className="academy-pill academy-pill--gold"><GameIcon name="gold-ticket" />{profile?.tickets?.gold ?? 0}</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
          <span>今日預算</span>
          <span>剩餘 <b className={remaining < 0 ? 'text-[#FF6D98]' : 'text-[#24B7B0]'}>NT${formatMoney(Math.max(0, remaining))}</b></span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#EDE7F7]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#52DED4] via-[#FFD166] to-[#FF7FA3]"
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.45 }}
          />
        </div>
      </div>
    </div>
  )
}

function DailyMonster({ monster, currentHp }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? Math.max(0, currentHp / monster.maxHp) : 0
  const defeated = currentHp <= 0

  return (
    <div className="academy-monster-stage">
      <motion.div
        className={`academy-monster-img academy-monster-sprite academy-monster-sprite--${monster.id}`}
        animate={defeated ? { rotate: [-5, 4, -4] } : { y: [0, -8, 0] }}
        transition={{ duration: defeated ? 0.8 : 2.4, repeat: Infinity }}
      />
      <div className="academy-hp-card">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-black text-[#26324A]">{monster.name}</div>
            <div className="text-[10px] font-bold text-[#8E87A8]">
              {defeated ? '今日咒靈已淨化' : '今日消費咒靈'}
            </div>
          </div>
          <span className={defeated ? 'academy-status academy-status--done' : 'academy-status'}>{defeated ? '完成' : '挑戰中'}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#ECE7F5]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#52DED4] via-[#FFD166] to-[#FF7FA3]"
            animate={{ width: `${hpPct * 100}%` }}
            transition={{ duration: 0.55 }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
          <span>HP {formatMoney(currentHp)} / {formatMoney(monster.maxHp)}</span>
          <span>{monster.tier === 'boss' ? '週末 Boss' : monster.tier === 'monthboss' ? '月底 Boss' : '每日怪'}</span>
        </div>
      </div>
    </div>
  )
}

function AttackEntry({ spent, budget, onClick }) {
  const remaining = budget - spent
  return (
    <motion.button
      className="academy-attack-panel"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between text-xs font-black">
        <span className="text-[#26324A]">今日消費 NT${formatMoney(spent)}</span>
        <span className={remaining < 0 ? 'text-[#FF6D98]' : 'text-[#24B7B0]'}>
          {remaining < 0 ? `超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {['分類', '備註', '金額', '攻擊'].map((step, i) => (
          <div key={step} className={`academy-step ${i === 3 ? 'academy-step--attack' : ''}`}>
            <span>{i + 1}</span>
            <b>{step}</b>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#8B7CFF] to-[#FF7FA3] px-4 py-3 text-center text-sm font-black text-white shadow-lg">
        開始記帳攻擊
      </div>
    </motion.button>
  )
}

export default function TownScreen() {
  const { state, navigate } = useApp()
  const { profile, monster, currentHp, totalSpent } = state
  const budget = profile?.dailyBudget ?? 1000
  const monsterToShow = monster ?? generateDayMonster(state.date, budget)
  const hpToShow = monster ? currentHp : monsterToShow.maxHp

  return (
    <div className="academy-screen" style={{ '--monster-sprites': `url(${monsterSprites})` }}>
      <img src={homeBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-10 px-4 pt-4">
        <TopHUD profile={profile} todayBudget={budget} spent={totalSpent} onAvatarClick={() => navigate('profile')} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-4 pb-24 pt-2">
        <DailyMonster monster={monsterToShow} currentHp={hpToShow} />
        <AttackEntry spent={totalSpent} budget={budget} onClick={() => navigate('battle')} />
      </div>

      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}

export function BottomNav({ current, navigate }) {
  const tabs = [
    { key: 'town', label: '今日', icon: 'battle' },
    { key: 'map', label: '地圖', icon: 'map' },
    { key: 'missions', label: '任務', icon: 'mission' },
    { key: 'shop', label: '補給', icon: 'shop' },
    { key: 'quest', label: '公會', icon: 'guild' },
  ]

  return (
    <div className="academy-dock">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`academy-dock-item ${current === tab.key ? 'is-active' : ''}`}
          onClick={() => navigate(tab.key)}
        >
          <span><GameIcon name={tab.icon} /></span>
          <b>{tab.label}</b>
        </button>
      ))}
    </div>
  )
}
