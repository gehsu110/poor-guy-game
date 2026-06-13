import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { formatMoney, getTitle } from '../gameLogic'
import townBg from '../assets/game-art/town-bg-v1.webp'

function ResourcePill({ children, tone = 'gold' }) {
  return (
    <span className={`mobile-resource mobile-resource--${tone}`}>
      {children}
    </span>
  )
}

function TopHUD({ profile, todayBudget, spent }) {
  const title = profile ? getTitle(profile.level) : null
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  return (
    <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4">
      <div className="mobile-hud">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="mobile-level-badge">{profile?.level ?? 1}</div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Lv.{profile?.level ?? 1}
              </div>
              <div className="truncate text-sm font-black text-slate-800">
                {title?.name ?? '菜鳥冒險者'}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[11px]">
            <ResourcePill>⭐ {profile?.stars?.yellow ?? 0}</ResourcePill>
            <ResourcePill tone="purple">💜 {profile?.stars?.purple ?? 0}</ResourcePill>
            <ResourcePill tone="coral">🎟 {profile?.tickets?.normal ?? 0}</ResourcePill>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500">
            <span>今日預算</span>
            <span>
              剩餘 <b className={remaining < 0 ? 'text-rose-500' : 'text-amber-500'}>NT${formatMoney(Math.max(0, remaining))}</b>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
            <motion.div
              className={`h-full rounded-full ${pct < 0.85 ? 'bg-gradient-to-r from-teal-400 to-amber-300' : 'bg-gradient-to-r from-amber-400 to-rose-400'}`}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureGate({ icon, title, subtitle, badge, tone, onClick, delay = 0 }) {
  return (
    <motion.button
      className={`town-gate town-gate--${tone}`}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.28 }}
    >
      {badge && <span className="town-gate__badge">{badge}</span>}
      <span className="town-gate__icon">{icon}</span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-xs font-black text-slate-800">{title}</span>
        <span className="block truncate text-[10px] font-bold text-slate-500">{subtitle}</span>
      </span>
    </motion.button>
  )
}

function TodayStatusCard({ monster, currentHp, totalSpent, budget, onClick }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? Math.max(0, currentHp / monster.maxHp) : 0
  const defeated = currentHp <= 0
  const remaining = budget - totalSpent

  return (
    <motion.button
      className="today-quest-card"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative flex items-center gap-3">
        <motion.div
          className="today-monster-token"
          animate={defeated ? { rotate: [0, -10, 8, 0] } : { y: [0, -5, 0] }}
          transition={{ duration: defeated ? 0.8 : 2.4, repeat: Infinity }}
        >
          {defeated ? '🏆' : monster.emoji}
        </motion.div>

        <div className="min-w-0 flex-1 text-left">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-900">{monster.name}</div>
              <div className="text-[10px] font-bold text-slate-500">
                {defeated ? '今日討伐完成' : '今日消費怪物'}
              </div>
            </div>
            <span className={`quest-status ${defeated ? 'quest-status--done' : ''}`}>
              {defeated ? '完成' : '挑戰中'}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200/90">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400"
              animate={{ width: `${hpPct * 100}%` }}
              transition={{ duration: 0.55 }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>HP {formatMoney(currentHp)} / {formatMoney(monster.maxHp)}</span>
            <span className={remaining < 0 ? 'text-rose-500' : 'text-teal-600'}>
              {remaining < 0 ? `超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/65 px-3 py-2 text-xs font-black text-slate-700">
        <span>今日消費 NT${formatMoney(totalSpent)}</span>
        <span className="text-teal-600">開始記帳攻擊</span>
      </div>
    </motion.button>
  )
}

function Toast({ notification }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="absolute left-1/2 top-24 z-50 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-amber-200 bg-white/95 px-4 py-2 text-sm font-black text-amber-600 shadow-xl"
          initial={{ y: -18, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -18, opacity: 0 }}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function TownScreen() {
  const { state, navigate } = useApp()
  const { profile, monster, currentHp, totalSpent } = state
  const budget = profile?.dailyBudget ?? 1000

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FFF7E8]">
      <img
        src={townBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable="false"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-[#243B6B]/20" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#243B6B]/45 to-transparent" />

      <TopHUD profile={profile} todayBudget={budget} spent={totalSpent} />

      <div className="absolute inset-x-0 bottom-[76px] z-20 px-4">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <FeatureGate
            icon="🔮"
            title="魔法商店"
            subtitle="扭蛋・收藏"
            badge={profile?.tickets?.normal > 0 ? profile.tickets.normal : null}
            tone="teal"
            onClick={() => navigate('shop')}
          />
          <FeatureGate
            icon="📜"
            title="任務公告"
            subtitle="成就・挑戰"
            tone="gold"
            onClick={() => navigate('quest')}
            delay={0.04}
          />
          <FeatureGate
            icon="🗺️"
            title="遠征地圖"
            subtitle="本月路線"
            tone="blue"
            onClick={() => navigate('map')}
            delay={0.08}
          />
          <FeatureGate
            icon="👤"
            title="勇者小屋"
            subtitle="資料・設定"
            tone="coral"
            onClick={() => navigate('profile')}
            delay={0.12}
          />
        </div>

        <TodayStatusCard
          monster={monster}
          currentHp={currentHp}
          totalSpent={totalSpent}
          budget={budget}
          onClick={() => navigate('battle')}
        />
      </div>

      <Toast notification={state.notification} />
      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}

export function BottomNav({ current, navigate }) {
  const tabs = [
    { key: 'town', label: '主城', emoji: '🏰' },
    { key: 'battle', label: '戰鬥', emoji: '⚔️' },
    { key: 'map', label: '地圖', emoji: '🗺️' },
    { key: 'shop', label: '商店', emoji: '🔮' },
    { key: 'profile', label: '我的', emoji: '👤' },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-white/35 bg-white/88 shadow-[0_-10px_30px_rgba(36,59,107,0.12)] backdrop-blur-xl">
      <div className="flex px-2 pb-2 pt-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className="tap-bounce relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5"
            onClick={() => navigate(tab.key)}
          >
            <span className={`text-xl transition-transform ${current === tab.key ? 'scale-110' : 'scale-100 opacity-70'}`}>
              {tab.emoji}
            </span>
            <span className={`text-[10px] font-black ${current === tab.key ? 'text-[#243B6B]' : 'text-slate-400'}`}>
              {tab.label}
            </span>
            {current === tab.key && (
              <motion.div
                className="absolute bottom-0 h-1 w-1 rounded-full bg-amber-400"
                layoutId="navDot"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
