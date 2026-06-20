import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, formatMoney, getTitle } from '../gameLogic'
import GameIcon from '../components/GameIcon'
import Avatar from '../components/Avatar'
import homeBg from '../assets/academy-art/home-bg.webp'
import homeHeroBoy from '../assets/academy-art/generated/home-hero-boy-v2.png'
import homeHeroGirl from '../assets/academy-art/generated/home-hero-girl-v2.png'

function TopHUD({ profile, todayBudget, spent, onAvatarClick }) {
  const title = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const playerName = profile?.playerName?.trim() || '窮鬼勇者'
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  return (
    <div className="academy-hud">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button onClick={onAvatarClick} className="shrink-0">
            <Avatar
              gender={profile?.avatarGender ?? 'girl'}
              variant="portrait"
              frame={profile?.equipped?.frame ?? 'soft_gold'}
              outfit={profile?.equipped?.outfit ?? 'academy'}
              accessory={profile?.equipped?.accessory ?? 'star_pin'}
              className="academy-hud-avatar"
            />
          </button>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-[#8E87A8]">等級 {profile?.level ?? 1}・{equippedTitle ?? title?.name ?? '菜鳥冒險者'}</div>
            <div className="truncate text-sm font-black text-[#26324A]">{playerName}</div>
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

function HeroShowcase({ profile, onProfileClick }) {
  const heroImage = (profile?.avatarGender ?? 'girl') === 'boy' ? homeHeroBoy : homeHeroGirl

  return (
    <section className="academy-home-hero">
      <div className="academy-home-hero__shine" />
      <motion.img
        src={heroImage}
        alt=""
        draggable="false"
        className="academy-home-hero__character"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <button className="academy-home-hero__style-button" onClick={onProfileClick} aria-label="更換造型">
        <GameIcon name="shop" />
        <span>造型</span>
      </button>
      <div className="academy-home-collect">
        {[
          { icon: 'shop', title: '造型', sub: '整套主角外觀' },
          { icon: 'yellow-star', title: '夥伴', sub: '陪你記帳' },
          { icon: 'battle', title: '特效', sub: '攻擊時發動' },
        ].map(item => (
          <div key={item.title}>
            <GameIcon name={item.icon} />
            <b>{item.title}</b>
            <span>{item.sub}</span>
          </div>
        ))}
      </div>
    </section>
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
  const { profile, totalSpent } = state
  const budget = profile?.dailyBudget ?? 1000

  return (
    <div className="academy-screen">
      <img src={homeBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-10 px-4 pt-4">
        <TopHUD profile={profile} todayBudget={budget} spent={totalSpent} onAvatarClick={() => navigate('profile')} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-4 pb-24 pt-2">
        <HeroShowcase profile={profile} onProfileClick={() => navigate('profile')} />
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
