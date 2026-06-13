import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { formatMoney, getTitle } from '../gameLogic'

// ─── 星星背景 ───────────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 37 + 13) % 100,
    y: (i * 53 + 7) % 65,
    size: i % 3 === 0 ? 2 : 1,
    delay: (i * 0.3) % 3,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white star"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── 魔法浮島（建築底座）──────────────────────────────────────────────────

function FloatingIsland({ children, x, y, size = 'md', onClick, badge, label, sublabel, glowColor = '#9B6DFF' }) {
  const [pop, setPop] = useState(false)

  function handleClick() {
    setPop(true)
    setTimeout(() => setPop(false), 400)
    onClick?.()
  }

  const sizeMap = { lg: 130, md: 100, sm: 80 }
  const s = sizeMap[size]

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ left: x, top: y, transform: 'translateX(-50%)' }}
      onClick={handleClick}
      whileHover={{ y: -5, filter: `drop-shadow(0 0 12px ${glowColor})` }}
      animate={pop ? { scale: [1, 1.12, 0.95, 1.04, 1], y: [0, -8, 2, -3, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* 建築主體 */}
      <div className="relative" style={{ width: s, height: s * 1.1 }}>
        {/* 持續光暈 */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg opacity-30"
          style={{ background: glowColor }}
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <BuildingRPG size={s} glowColor={glowColor} label={label} />
        {/* 徽章 */}
        {badge && (
          <motion.div
            className="absolute -top-2 -right-2 min-w-5 h-5 bg-rpg-red rounded-full text-white text-[10px] flex items-center justify-center font-bold px-1"
            style={{ boxShadow: '0 0 8px rgba(255,76,106,0.8)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {badge}
          </motion.div>
        )}
      </div>
      {/* 招牌 */}
      <div className="mt-1 text-center">
        <div
          className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{
            background: 'rgba(10,8,26,0.8)',
            border: `1px solid ${glowColor}44`,
            color: '#F0C040',
            textShadow: '0 0 8px rgba(240,192,64,0.6)',
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] mt-0.5" style={{ color: '#7070A0' }}>{sublabel}</div>
        )}
      </div>
    </motion.div>
  )
}

function BuildingRPG({ size: s, glowColor, label }) {
  // 根據 label 決定建築風格
  const isCastle  = label?.includes('城堡') || label?.includes('戰鬥')
  const isShop    = label?.includes('商店') || label?.includes('魔法')
  const isMap     = label?.includes('地圖') || label?.includes('遠征')
  const isQuest   = label?.includes('任務') || label?.includes('公告')
  const isHero    = label?.includes('勇者') || label?.includes('小屋')

  const emoji = isCastle ? '🏰' : isShop ? '🔮' : isMap ? '🗺️' : isQuest ? '📜' : '⚗️'
  const roofColor = isCastle ? '#3D1D8A' : isShop ? '#1D3A8A' : isMap ? '#1D5A3A' : isQuest ? '#5A3A1D' : '#3A1D5A'
  const wallColor = isCastle ? '#221D3A' : isShop ? '#1D2540' : isMap ? '#1D2E28' : isQuest ? '#2E2218' : '#251D30'

  const roofH = s * 0.38
  const bodyH = s * 0.62

  return (
    <svg width={s} height={s * 1.1} viewBox={`0 0 ${s} ${s * 1.1}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`glow-${label}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`wall-${label}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={wallColor} />
          <stop offset="100%" stopColor={lightenHex(wallColor, 15)} />
        </linearGradient>
      </defs>

      {/* 城堡旗幟 */}
      {isCastle && (
        <>
          <rect x={s*0.46} y={2} width={3} height={roofH*0.6} fill="#F0C040" />
          <polygon points={`${s*0.49},2 ${s*0.49+14},8 ${s*0.49},14`} fill="#FF4C6A" />
        </>
      )}

      {/* 屋頂 */}
      <polygon
        points={`${s/2},4 ${s-8},${roofH} 8,${roofH}`}
        fill={roofColor}
        stroke="#F0C040"
        strokeWidth="1.5"
      />
      {/* 屋頂金色光點 */}
      <circle cx={s/2} cy={6} r={4} fill="#F0C040" opacity={0.9} filter={`url(#glow-${label})`} />

      {/* 牆壁 */}
      <rect x={8} y={roofH} width={s-16} height={bodyH} rx={5} fill={`url(#wall-${label})`} />
      {/* 金色邊框 */}
      <rect x={8} y={roofH} width={s-16} height={bodyH} rx={5}
        fill="none" stroke="#F0C040" strokeWidth="1" strokeOpacity="0.4" />

      {/* 窗戶（魔法光窗） */}
      <rect x={s*0.15} y={roofH+bodyH*0.12} width={s*0.24} height={bodyH*0.28} rx={3}
        fill={glowColor} opacity={0.3} />
      <rect x={s*0.15} y={roofH+bodyH*0.12} width={s*0.24} height={bodyH*0.28} rx={3}
        fill="none" stroke={glowColor} strokeWidth="1" />
      <rect x={s*0.61} y={roofH+bodyH*0.12} width={s*0.24} height={bodyH*0.28} rx={3}
        fill={glowColor} opacity={0.3} />
      <rect x={s*0.61} y={roofH+bodyH*0.12} width={s*0.24} height={bodyH*0.28} rx={3}
        fill="none" stroke={glowColor} strokeWidth="1" />

      {/* 門 */}
      <rect x={s*0.34} y={roofH+bodyH*0.55} width={s*0.32} height={bodyH*0.44} rx={s*0.05}
        fill={roofColor} stroke="#F0C040" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx={s*0.62} cy={roofH+bodyH*0.79} r={3} fill="#F0C040" />

      {/* Emoji */}
      <text x={s/2} y={roofH+bodyH*0.40} textAnchor="middle" fontSize={s*0.22} dy="0.35em">
        {emoji}
      </text>

      {/* 浮島底座 */}
      <ellipse cx={s/2} cy={s*1.08} rx={s/2-6} ry={s*0.06}
        fill={glowColor} opacity={0.25} />
    </svg>
  )
}

// ─── 頂部 HUD ─────────────────────────────────────────────────────────────────

function TopHUD({ profile, todayBudget, spent }) {
  const title = profile ? getTitle(profile.level) : null
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  const barGradient = pct < 0.5
    ? 'linear-gradient(90deg, #40D9C0, #9B6DFF)'
    : pct < 0.85
    ? 'linear-gradient(90deg, #F0C040, #FF9B40)'
    : 'linear-gradient(90deg, #FF4C6A, #FF8C40)'

  return (
    <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pb-2">
      <div
        className="rounded-2xl px-3 py-2"
        style={{
          background: 'rgba(13,11,26,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(74,63,122,0.6)',
          borderTopColor: '#F0C04044',
        }}
      >
        <div className="flex items-center justify-between">
          {/* 左：等級 + 稱號 */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #3D1D8A, #9B6DFF)',
                border: '1px solid #F0C04066',
                color: '#F0C040',
                boxShadow: '0 0 10px rgba(155,109,255,0.4)',
              }}
            >
              {profile?.level ?? 1}
            </div>
            <div>
              <div className="text-[10px]" style={{ color: '#7070A0' }}>Lv.{profile?.level ?? 1}</div>
              <div className="text-xs font-bold" style={{ color: '#F0C040' }}>
                {title?.name ?? '菜鳥冒險者'}
              </div>
            </div>
          </div>
          {/* 右：貨幣 */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className="px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(240,192,64,0.15)', color: '#F0C040', border: '1px solid rgba(240,192,64,0.3)' }}
            >⭐ {profile?.stars?.yellow ?? 0}</span>
            <span
              className="px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(155,109,255,0.15)', color: '#9B6DFF', border: '1px solid rgba(155,109,255,0.3)' }}
            >💜 {profile?.stars?.purple ?? 0}</span>
            <span
              className="px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(255,76,106,0.15)', color: '#FF4C6A', border: '1px solid rgba(255,76,106,0.3)' }}
            >🎟 {profile?.tickets?.normal ?? 0}</span>
          </div>
        </div>
        {/* 今日預算條 */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: '#7070A0' }}>
            <span>今日預算</span>
            <span style={{ color: '#C0C8E0' }}>剩餘 <b style={{ color: '#F0C040' }}>NT${formatMoney(Math.max(0, remaining))}</b></span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(74,63,122,0.4)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: barGradient }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 今日狀態卡 ───────────────────────────────────────────────────────────────

function TodayStatusCard({ monster, currentHp, totalSpent, onClick }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? currentHp / monster.maxHp : 0
  const defeated = currentHp <= 0

  return (
    <motion.div
      className="absolute bottom-24 left-3 right-3 cursor-pointer tap-bounce rounded-2xl p-3"
      style={{
        background: 'rgba(13,11,26,0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(74,63,122,0.7)',
        borderTopColor: defeated ? '#40D9C066' : '#F0C04066',
        boxShadow: defeated
          ? '0 0 20px rgba(64,217,192,0.2)'
          : '0 0 20px rgba(155,109,255,0.15)',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="text-4xl"
          animate={defeated ? { rotate: [0, -20, 0] } : { y: [0, -3, 0] }}
          transition={{ duration: defeated ? 0.5 : 2, repeat: Infinity }}
        >
          {defeated ? '💀' : monster.emoji}
        </motion.div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold" style={{ color: '#C0C8E0' }}>{monster.name}</span>
            <span style={{ color: '#7070A0' }}>
              {defeated ? (
                <span style={{ color: '#40D9C0' }}>✅ 已擊殺！</span>
              ) : (
                `HP ${formatMoney(currentHp)} / ${formatMoney(monster.maxHp)}`
              )}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(74,63,122,0.4)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: hpPct > 0.6
                  ? 'linear-gradient(90deg, #40D9C0, #9B6DFF)'
                  : hpPct > 0.3
                  ? 'linear-gradient(90deg, #F0C040, #FF9B40)'
                  : 'linear-gradient(90deg, #FF4C6A, #FF8C40)',
                boxShadow: '0 0 6px currentColor',
              }}
              animate={{ width: `${hpPct * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] mt-1" style={{ color: '#7070A0' }}>
            <span>今日消費 NT${formatMoney(totalSpent)}</span>
            <span style={{ color: '#F0C040' }}>點此開始記帳 ⚔️</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── 通知 Toast ────────────────────────────────────────────────────────────────

function Toast({ notification }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap"
          style={{
            background: 'rgba(13,11,26,0.95)',
            border: '1px solid #F0C04066',
            color: '#F0C040',
            boxShadow: '0 0 20px rgba(240,192,64,0.3)',
          }}
          initial={{ y: -20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0 }}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── 主城場景 ──────────────────────────────────────────────────────────────────

export default function TownScreen() {
  const { state, navigate } = useApp()
  const { profile, monster, currentHp, totalSpent } = state
  const budget = profile?.dailyBudget ?? 1000

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0D0B1A' }}>
      {/* 深空背景漸層 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1A1040 0%, #0D0B1A 70%)',
        }}
      />

      {/* 星星 */}
      <StarField />

      {/* 月亮 */}
      <motion.div
        className="absolute top-14 right-6"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #FFE680, #F0C040)',
            boxShadow: '0 0 20px rgba(240,192,64,0.5), 0 0 50px rgba(240,192,64,0.15)',
          }}
        >
          🌙
        </div>
      </motion.div>

      {/* 魔法光柱（背景裝飾）*/}
      {[80, 200, 330].map((x, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-1 rounded-full"
          style={{
            left: x,
            height: 180 + i * 40,
            background: `linear-gradient(to top, ${['#9B6DFF', '#40D9C0', '#F0C040'][i]}44, transparent)`,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}

      {/* 地面光暈 */}
      <div
        className="absolute bottom-20 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, rgba(61,29,138,0.3), transparent)',
        }}
      />

      {/* ─── 建築群 ─── */}

      {/* 中央 戰鬥城堡 */}
      <FloatingIsland
        label="⚔️ 戰鬥城堡"
        sublabel="記帳 = 攻擊"
        x="50%" y={160}
        size="lg"
        glowColor="#9B6DFF"
        badge={currentHp <= 0 ? '✓' : null}
        onClick={() => navigate('battle')}
      />

      {/* 左側 魔法商店 */}
      <FloatingIsland
        label="🔮 魔法商店"
        sublabel="扭蛋・收集"
        x="22%" y={210}
        size="md"
        glowColor="#40D9C0"
        badge={profile?.tickets?.normal > 0 ? profile.tickets.normal : null}
        onClick={() => navigate('shop')}
      />

      {/* 右側 任務公告 */}
      <FloatingIsland
        label="📜 任務公告"
        sublabel="成就・挑戰"
        x="78%" y={210}
        size="md"
        glowColor="#F0C040"
        onClick={() => navigate('quest')}
      />

      {/* 左下 遠征地圖 */}
      <FloatingIsland
        label="🗺️ 遠征地圖"
        sublabel="本月路線"
        x="22%" y={330}
        size="sm"
        glowColor="#40D9C0"
        onClick={() => navigate('map')}
      />

      {/* 右下 勇者小屋 */}
      <FloatingIsland
        label="⚗️ 勇者小屋"
        sublabel="資料・設定"
        x="78%" y={330}
        size="sm"
        glowColor="#FF4C6A"
        onClick={() => navigate('profile')}
      />

      {/* 頂部 HUD */}
      <TopHUD profile={profile} todayBudget={budget} spent={totalSpent} />

      {/* 今日狀態卡 */}
      <TodayStatusCard
        monster={monster}
        currentHp={currentHp}
        totalSpent={totalSpent}
        budget={budget}
        onClick={() => navigate('battle')}
      />

      {/* Toast */}
      <Toast notification={state.notification} />

      {/* 底部導航 */}
      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}

// ─── 底部導航 ─────────────────────────────────────────────────────────────────

export function BottomNav({ current, navigate }) {
  const tabs = [
    { key: 'town',    label: '主城',  emoji: '🏰' },
    { key: 'battle',  label: '戰鬥',  emoji: '⚔️'  },
    { key: 'map',     label: '地圖',  emoji: '🗺️' },
    { key: 'shop',    label: '商店',  emoji: '🔮' },
    { key: 'profile', label: '我的',  emoji: '👤' },
  ]

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30"
      style={{
        background: 'rgba(13,11,26,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(74,63,122,0.6)',
      }}
    >
      <div className="flex">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 tap-bounce"
            onClick={() => navigate(tab.key)}
          >
            <span className={`text-xl transition-transform ${current === tab.key ? 'scale-125' : 'scale-100'}`}>
              {tab.emoji}
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color: current === tab.key ? '#F0C040' : '#4A3F7A' }}
            >
              {tab.label}
            </span>
            {current === tab.key && (
              <motion.div
                className="w-1 h-1 rounded-full"
                style={{ background: '#F0C040', boxShadow: '0 0 6px #F0C040' }}
                layoutId="navDot"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 色彩工具 ─────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')
}
function lightenHex(hex, amt) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + amt, g + amt, b + amt)
}
