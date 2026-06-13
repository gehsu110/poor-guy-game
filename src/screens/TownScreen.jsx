import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { formatMoney, todayStr, getTitle } from '../gameLogic'

// ─── 浮雲元件 ───────────────────────────────────────────────────────────────

function Cloud({ style }) {
  return (
    <motion.div
      className="absolute opacity-80"
      style={style}
      animate={{ x: [0, 15, 0] }}
      transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="80" height="40" viewBox="0 0 80 40">
        <ellipse cx="40" cy="28" rx="38" ry="14" fill="white" />
        <ellipse cx="28" cy="22" rx="18" ry="15" fill="white" />
        <ellipse cx="52" cy="20" rx="16" ry="13" fill="white" />
      </svg>
    </motion.div>
  )
}

// ─── 建築元件 ───────────────────────────────────────────────────────────────

function Building({ label, emoji, subLabel, color, glow, onClick, style, size = 'md', badge }) {
  const [popping, setPopping] = useState(false)

  function handleClick() {
    setPopping(true)
    setTimeout(() => setPopping(false), 300)
    onClick?.()
  }

  const sizeMap = {
    lg: { w: 100, h: 120 },
    md: { w: 80,  h: 95  },
    sm: { w: 64,  h: 76  },
  }
  const { w, h } = sizeMap[size]

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer tap-bounce"
      style={style}
      animate={popping ? { scale: [1, 1.12, 0.96, 1.04, 1], y: [0, -6, 2, -2, 0] } : {}}
      transition={{ duration: 0.35 }}
      onClick={handleClick}
      whileHover={{ y: -3 }}
    >
      {/* 建築本體 */}
      <div className="relative" style={{ width: w, height: h }}>
        {/* 光暈 */}
        {glow && (
          <div
            className="absolute inset-0 rounded-2xl blur-md opacity-40"
            style={{ background: glow, transform: 'scale(1.1)' }}
          />
        )}
        {/* 建築 SVG */}
        <BuildingSVG color={color} emoji={emoji} w={w} h={h} size={size} />
        {/* 徽章 */}
        {badge && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-sm">
            {badge}
          </div>
        )}
      </div>
      {/* 招牌文字 */}
      <div className="mt-1 text-center">
        <div className="text-xs font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
          {label}
        </div>
        {subLabel && <div className="text-[10px] text-slate-500 mt-0.5">{subLabel}</div>}
      </div>
    </motion.div>
  )
}

function BuildingSVG({ color, emoji, w, h, size }) {
  const roofH = h * 0.42
  const bodyH = h * 0.58
  const lighter = lightenHex(color, 30)
  const darker  = darkenHex(color, 20)

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      {/* 屋頂 */}
      <polygon
        points={`${w/2},4 ${w-6},${roofH} 6,${roofH}`}
        fill={darker}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 煙囪 (大建築才有) */}
      {size === 'lg' && (
        <>
          <rect x={w*0.65} y={h*0.08} width={w*0.1} height={h*0.28} rx="2" fill={darkenHex(color, 35)} />
          <motion.ellipse
            cx={w*0.70} cy={h*0.07} rx={w*0.06} ry={h*0.03}
            fill="#ddd" opacity={0.8}
            animate={{ y: [-2, -6, -2], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}
      {/* 牆壁 */}
      <rect x={6} y={roofH} width={w-12} height={bodyH} rx={4} fill={lighter} />
      {/* 窗戶 */}
      <rect x={w*0.18} y={roofH + bodyH*0.15} width={w*0.22} height={bodyH*0.28} rx={3} fill="white" opacity={0.9} />
      <rect x={w*0.60} y={roofH + bodyH*0.15} width={w*0.22} height={bodyH*0.28} rx={3} fill="white" opacity={0.9} />
      {/* 門 */}
      <rect x={w*0.35} y={roofH + bodyH*0.55} width={w*0.30} height={bodyH*0.44} rx={4} fill={darkenHex(color, 10)} />
      <circle cx={w*0.62} cy={roofH + bodyH*0.79} r={w*0.025} fill="white" />
      {/* Emoji */}
      <text x={w/2} y={roofH + bodyH*0.40} textAnchor="middle" fontSize={size === 'sm' ? 14 : 18} dy="0.35em">
        {emoji}
      </text>
      {/* 底部陰影線 */}
      <ellipse cx={w/2} cy={h-2} rx={w/2-8} ry={4} fill="rgba(0,0,0,0.08)" />
    </svg>
  )
}

// ─── 主城底部小路與草地 ────────────────────────────────────────────────────

function TownGround() {
  return (
    <svg width="100%" height="100" viewBox="0 0 430 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      {/* 草地 */}
      <ellipse cx="215" cy="80" rx="260" ry="50" fill="#C8E6C9" />
      {/* 小路 */}
      <ellipse cx="215" cy="95" rx="80" ry="15" fill="#F5DEB3" opacity="0.8" />
      {/* 花朵裝飾 */}
      {[60, 130, 300, 370].map((x, i) => (
        <g key={i} transform={`translate(${x}, 60)`}>
          <circle cx="0" cy="0" r="5" fill={['#FFB3C6','#FFE4A0','#A8E6CF','#C8A8E9'][i]} />
          <text x="0" y="4" textAnchor="middle" fontSize="10">🌸</text>
        </g>
      ))}
    </svg>
  )
}

// ─── 頂部 HUD ─────────────────────────────────────────────────────────────────

function TopHUD({ profile, todayBudget, spent }) {
  const title = profile ? getTitle(profile.level) : null
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  const barColor = pct < 0.5 ? '#A8E6CF' : pct < 0.85 ? '#FFE4A0' : '#FFB3C6'

  return (
    <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pb-2">
      <div className="bg-white/75 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          {/* 左：等級 + 稱號 */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ background: 'linear-gradient(135deg, #C8A8E9, #A8D8EA)' }}>
              {profile?.level ?? 1}
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Lv.{profile?.level ?? 1}</div>
              <div className="text-xs font-bold text-slate-700">{title?.name ?? '菜鳥冒險者'}</div>
            </div>
          </div>
          {/* 右：貨幣 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
              ⭐ {profile?.stars?.yellow ?? 0}
            </span>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
              💜 {profile?.stars?.purple ?? 0}
            </span>
            <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">
              🎟 {profile?.tickets?.normal ?? 0}
            </span>
          </div>
        </div>
        {/* 今日預算條 */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>今日預算</span>
            <span>剩餘 <b className="text-slate-700">NT${formatMoney(Math.max(0, remaining))}</b></span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor }}
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

function TodayStatusCard({ monster, currentHp, totalSpent, budget, onClick }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? currentHp / monster.maxHp : 0
  const defeated = currentHp <= 0

  return (
    <motion.div
      className="absolute bottom-24 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-md cursor-pointer tap-bounce"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-3">
        {/* 怪物小圖 */}
        <motion.div
          className="text-4xl"
          animate={defeated ? { rotate: [0, -20, 0] } : { y: [0, -3, 0] }}
          transition={{ duration: defeated ? 0.5 : 2, repeat: Infinity }}
        >
          {defeated ? '💀' : monster.emoji}
        </motion.div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-700">{monster.name}</span>
            <span className="text-slate-500">
              {defeated ? '✅ 已擊殺！' : `HP ${formatMoney(currentHp)} / ${formatMoney(monster.maxHp)}`}
            </span>
          </div>
          {/* HP 條 */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: hpPct > 0.6 ? `linear-gradient(90deg, ${monster.color}, ${monster.maxHpColor})`
                  : hpPct > 0.3 ? 'linear-gradient(90deg, #FFE4A0, #FFA97A)'
                  : 'linear-gradient(90deg, #FFB3C6, #FF6B9D)',
              }}
              animate={{ width: `${hpPct * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>今日消費 NT${formatMoney(totalSpent)}</span>
            <span>點此開始記帳 ⚔️</span>
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
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl px-4 py-2 shadow-lg text-sm font-bold text-slate-700"
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
    <div className="relative w-full h-full overflow-hidden">
      {/* 天空背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #B8DCFF 0%, #D4EDFF 40%, #E8F4FD 70%, #C8E6C9 100%)',
        }}
      />

      {/* 雲朵 */}
      <Cloud style={{ top: 80, left: -10 }} />
      <Cloud style={{ top: 110, right: 20, transform: 'scaleX(-1)' }} />
      <Cloud style={{ top: 60, left: '40%' }} />

      {/* 太陽 */}
      <motion.div
        className="absolute top-16 right-8"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="w-14 h-14 rounded-full bg-yellow-200 flex items-center justify-center text-2xl shadow-lg"
          style={{ boxShadow: '0 0 20px rgba(255, 220, 100, 0.5)' }}>
          ☀️
        </div>
      </motion.div>

      {/* ─── 建築群 ─── */}

      {/* 中央 城堡（戰鬥入口）*/}
      <Building
        label="⚔️ 戰鬥城堡"
        subLabel="記帳 = 攻擊"
        emoji="🏰"
        color="#C8A8E9"
        glow="linear-gradient(135deg, #C8A8E9, #A8D8EA)"
        size="lg"
        style={{ left: '50%', transform: 'translateX(-50%)', top: 165 }}
        badge={currentHp <= 0 ? '✓' : null}
        onClick={() => navigate('battle')}
      />

      {/* 左側 商店 */}
      <Building
        label="🛒 魔法商店"
        subLabel="扭蛋・收集品"
        emoji="🏪"
        color="#A8E6CF"
        size="md"
        style={{ left: 16, top: 205 }}
        badge={profile?.tickets?.normal > 0 ? profile.tickets.normal : null}
        onClick={() => navigate('shop')}
      />

      {/* 右側 任務公告欄 */}
      <Building
        label="📜 任務公告"
        subLabel="成就・挑戰"
        emoji="📌"
        color="#FFE4A0"
        size="md"
        style={{ right: 16, top: 205 }}
        onClick={() => navigate('quest')}
      />

      {/* 左下 地圖室 */}
      <Building
        label="🗺️ 遠征地圖"
        subLabel="本月路線"
        emoji="🗾"
        color="#A8D8EA"
        size="sm"
        style={{ left: 28, top: 315 }}
        onClick={() => navigate('map')}
      />

      {/* 右下 英雄小屋 */}
      <Building
        label="🏠 勇者小屋"
        subLabel="資料・設定"
        emoji="🧑‍💼"
        color="#FFCBA4"
        size="sm"
        style={{ right: 28, top: 315 }}
        onClick={() => navigate('profile')}
      />

      {/* 草地 */}
      <div className="absolute bottom-28 left-0 right-0">
        <TownGround />
      </div>

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

      {/* 通知 Toast */}
      <Toast notification={state.notification} />

      {/* 底部導航 */}
      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}

// ─── 底部導航 ─────────────────────────────────────────────────────────────────

export function BottomNav({ current, navigate }) {
  const tabs = [
    { key: 'town',    label: '主城',  emoji: '🏘️' },
    { key: 'battle',  label: '戰鬥',  emoji: '⚔️'  },
    { key: 'map',     label: '地圖',  emoji: '🗺️' },
    { key: 'shop',    label: '商店',  emoji: '🛒' },
    { key: 'profile', label: '我的',  emoji: '👤' },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-t border-gray-100">
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
            <span className={`text-[10px] font-bold ${current === tab.key ? 'text-purple-600' : 'text-slate-400'}`}>
              {tab.label}
            </span>
            {current === tab.key && (
              <motion.div
                className="w-1 h-1 rounded-full bg-purple-400"
                layoutId="navDot"
              />
            )}
          </button>
        ))}
      </div>
      <div className="h-safe-area-bottom" />
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
function darkenHex(hex, amt) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r - amt, g - amt, b - amt)
}
