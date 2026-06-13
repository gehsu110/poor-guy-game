import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { BottomNav } from './TownScreen'

// ─── 扭蛋池 ───────────────────────────────────────────────────────────────────

const GACHA_POOL = [
  // 攻擊特效
  { id: 'fx_slash',    type: 'effect',  name: '劍氣斬擊',   emoji: '⚡', rarity: 'R',  color: '#A8D8EA' },
  { id: 'fx_fire',     type: 'effect',  name: '烈焰衝擊',   emoji: '🔥', rarity: 'SR', color: '#FFB3C6' },
  { id: 'fx_star',     type: 'effect',  name: '星光爆發',   emoji: '✨', rarity: 'SSR',color: '#FFE4A0' },
  { id: 'fx_ice',      type: 'effect',  name: '冰晶穿刺',   emoji: '❄️', rarity: 'R',  color: '#A8E6CF' },
  // 稱號
  { id: 'title_saving',  type: 'title', name: '省錢達人',   emoji: '💰', rarity: 'R',  color: '#A8E6CF' },
  { id: 'title_hero',    type: 'title', name: '記帳英雄',   emoji: '🦸', rarity: 'SR', color: '#C8A8E9' },
  { id: 'title_legend',  type: 'title', name: '財務傳說',   emoji: '👑', rarity: 'SSR',color: '#FFE4A0' },
  // 頭像框
  { id: 'frame_stars',   type: 'frame', name: '星光邊框',   emoji: '🌟', rarity: 'R',  color: '#FFE4A0' },
  { id: 'frame_rainbow', type: 'frame', name: '彩虹邊框',   emoji: '🌈', rarity: 'SR', color: '#FFB3C6' },
  { id: 'frame_dragon',  type: 'frame', name: '龍紋邊框',   emoji: '🐉', rarity: 'SSR',color: '#C8A8E9' },
]

const RARITY_CONFIG = {
  SSR: { color: '#FFD700', bg: 'linear-gradient(135deg, #FFD700, #FFA500)', label: 'SSR', prob: 3  },
  SR:  { color: '#C8A8E9', bg: 'linear-gradient(135deg, #C8A8E9, #A87DE0)', label: 'SR',  prob: 15 },
  R:   { color: '#A8D8EA', bg: 'linear-gradient(135deg, #A8D8EA, #7EC8E3)', label: 'R',   prob: 82 },
}

function drawGacha(count = 1) {
  const results = []
  for (let i = 0; i < count; i++) {
    const rand = Math.random() * 100
    let rarity = rand < 3 ? 'SSR' : rand < 18 ? 'SR' : 'R'
    const pool = GACHA_POOL.filter(g => g.rarity === rarity)
    const item = pool[Math.floor(Math.random() * pool.length)]
    results.push(item)
  }
  return results
}

// ─── 扭蛋結果展示 ─────────────────────────────────────────────────────────────

function GachaResult({ results, onClose }) {
  const [revealed, setRevealed] = useState(0)

  function revealNext() {
    if (revealed < results.length) setRevealed(v => v + 1)
    else onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={revealNext}
    >
      <div className="text-white text-sm mb-6 opacity-60">點擊繼續</div>
      <div className="flex flex-wrap justify-center gap-3 px-6 max-w-xs">
        {results.slice(0, revealed).map((item, i) => {
          const rar = RARITY_CONFIG[item.rarity]
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div
                className="w-20 h-24 rounded-2xl flex flex-col items-center justify-center shadow-xl gap-1"
                style={{ background: item.color, border: `3px solid ${rar.color}` }}
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-[10px] font-bold text-white/80 px-2 py-0.5 rounded-full"
                  style={{ background: rar.bg }}>
                  {item.rarity}
                </span>
              </div>
              <div className="text-white text-xs mt-1 font-bold">{item.name}</div>
            </motion.div>
          )
        })}
      </div>
      {revealed === 0 && (
        <motion.div
          className="text-6xl mt-8"
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          onClick={revealNext}
        >
          🎰
        </motion.div>
      )}
      {revealed < results.length && revealed > 0 && (
        <motion.div
          className="mt-6 text-white text-sm bg-white/20 px-6 py-2 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          點擊揭曉下一個
        </motion.div>
      )}
      {revealed >= results.length && (
        <motion.button
          className="mt-6 text-white text-sm bg-white/20 px-6 py-2 rounded-full font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={onClose}
        >
          收下！🎁
        </motion.button>
      )}
    </div>
  )
}

// ─── 收藏展示 ─────────────────────────────────────────────────────────────────

function CollectionGrid({ items }) {
  if (!items || !items.length) {
    return (
      <div className="text-center text-slate-300 py-8">
        <div className="text-4xl mb-2">📦</div>
        <div className="text-sm">還沒有收藏品<br />去扭蛋吧！</div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item, i) => {
        const g = GACHA_POOL.find(g => g.id === item.id) ?? {}
        const rar = RARITY_CONFIG[g.rarity] ?? RARITY_CONFIG.R
        return (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-14 h-16 rounded-xl flex flex-col items-center justify-center shadow-sm"
              style={{ background: g.color ?? '#F0F0F0', border: `2px solid ${rar.color}` }}
            >
              <span className="text-2xl">{g.emoji ?? '?'}</span>
              <span className="text-[9px] font-bold px-1 py-0.5 rounded-full text-white" style={{ background: rar.bg }}>
                {g.rarity}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 text-center leading-tight">{g.name ?? '???'}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 主商店畫面 ────────────────────────────────────────────────────────────────

export default function ShopScreen() {
  const { state, navigate } = useApp()
  const { profile } = state
  const [gachaResult, setGachaResult] = useState(null)
  const [tab, setTab] = useState('gacha') // gacha | collection

  const tickets = profile?.tickets ?? { normal: 0, gold: 0 }

  function handleGacha(count, isGold) {
    const cost = isGold ? count : count
    const available = isGold ? tickets.gold : tickets.normal
    if (available < cost) return

    const results = drawGacha(count)
    setGachaResult(results)
    // TODO: 扣除券 + 儲存到 Firebase
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #FFF0F8 0%, #F0E8FF 100%)' }}>
      {/* 頂部 */}
      <div className="flex items-center px-4 pt-3 pb-2 gap-2">
        <button className="text-slate-400 tap-bounce" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center">
          <span className="text-sm font-black text-slate-700">🛒 魔法商店</span>
        </div>
        {/* 貨幣 */}
        <div className="flex gap-1.5 text-xs">
          <span className="bg-white/80 px-2 py-0.5 rounded-full font-bold text-slate-600">🎟 {tickets.normal}</span>
          <span className="bg-yellow-100 px-2 py-0.5 rounded-full font-bold text-yellow-700">🎫 {tickets.gold}</span>
        </div>
      </div>

      {/* Tab */}
      <div className="flex mx-4 bg-white/60 rounded-2xl p-1 gap-1 mb-3">
        {[{k:'gacha',label:'🎰 扭蛋'},{k:'collection',label:'📦 收藏'}].map(t => (
          <button
            key={t.k}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === t.k ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
            onClick={() => setTab(t.k)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {tab === 'gacha' ? (
          <div className="flex flex-col gap-4">
            {/* 一般扭蛋 */}
            <div className="bg-white/80 rounded-3xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎟</span>
                <div>
                  <div className="font-black text-slate-700">一般扭蛋</div>
                  <div className="text-xs text-slate-400">特效・稱號・邊框</div>
                </div>
              </div>
              {/* 機率說明 */}
              <div className="flex gap-2 mb-3">
                {Object.entries(RARITY_CONFIG).map(([k, v]) => (
                  <div key={k} className="flex-1 text-center py-1.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: v.bg }}>
                    {k} {v.prob}%
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-3 rounded-xl font-bold text-sm tap-bounce text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #A8D8EA, #7EC8E3)' }}
                  disabled={tickets.normal < 1}
                  onClick={() => handleGacha(1, false)}
                >
                  🎟 抽1次
                </button>
                <button
                  className="flex-1 py-3 rounded-xl font-bold text-sm tap-bounce text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #C8A8E9, #A87DE0)' }}
                  disabled={tickets.normal < 10}
                  onClick={() => handleGacha(10, false)}
                >
                  🎟×10 抽10次
                </button>
              </div>
              <div className="text-center text-xs text-slate-400 mt-1">
                持有：{tickets.normal} 張扭蛋券
              </div>
            </div>

            {/* 金色扭蛋 */}
            <div className="bg-white/80 rounded-3xl p-4 shadow-md"
              style={{ border: '2px solid #FFD700' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎫</span>
                <div>
                  <div className="font-black text-slate-700">限定金色扭蛋</div>
                  <div className="text-xs text-orange-400">限定特效・節慶背景</div>
                </div>
              </div>
              <button
                className="w-full py-3 rounded-xl font-bold text-sm tap-bounce text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                disabled={tickets.gold < 1}
                onClick={() => handleGacha(1, true)}
              >
                🎫 金色抽1次
              </button>
              <div className="text-center text-xs text-slate-400 mt-1">
                持有：{tickets.gold} 張金色券（月Boss 擊殺獲得）
              </div>
            </div>

            {/* 獲得管道說明 */}
            <div className="bg-white/60 rounded-2xl p-3 text-xs text-slate-500">
              <div className="font-bold mb-1.5">🎟 扭蛋券獲得方式</div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between"><span>擊殺平日怪物</span><span className="font-bold">×1</span></div>
                <div className="flex justify-between"><span>擊殺週末Boss</span><span className="font-bold">×2</span></div>
                <div className="flex justify-between text-yellow-600"><span>擊殺月Boss 🐉</span><span className="font-bold">金券 ×1</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-3xl p-4 shadow-md">
            <div className="font-black text-slate-700 mb-3">我的收藏品</div>
            <CollectionGrid items={profile?.collection ?? []} />
          </div>
        )}
      </div>

      {/* 扭蛋結果 */}
      <AnimatePresence>
        {gachaResult && (
          <GachaResult
            results={gachaResult}
            onClose={() => setGachaResult(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav current="shop" navigate={navigate} />
    </div>
  )
}
