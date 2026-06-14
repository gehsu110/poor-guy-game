import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'
import shopBg from '../assets/academy-art/shop-bg.webp'
import shopAssets from '../assets/academy-art/shop-assets.png'

const GACHA_POOL = [
  { id: 'fx_slash', type: 'effect', name: '星軌斬擊', rarity: 'R', color: '#A8D8EA', iconKey: 'crystal' },
  { id: 'fx_fire', type: 'effect', name: '粉晶爆發', rarity: 'SR', color: '#FFB3C6', iconKey: 'star' },
  { id: 'fx_star', type: 'effect', name: '星芒結界', rarity: 'SSR', color: '#FFE4A0', iconKey: 'star' },
  { id: 'fx_ice', type: 'effect', name: '薄荷護盾', rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'title_saving', type: 'title', name: '省錢優等生', rarity: 'R', color: '#A8E6CF', iconKey: 'coin' },
  { id: 'title_hero', type: 'title', name: '記帳魔法使', rarity: 'SR', color: '#C8A8E9', iconKey: 'heart' },
  { id: 'title_legend', type: 'title', name: '理財賢者', rarity: 'SSR', color: '#FFE4A0', iconKey: 'star' },
  { id: 'frame_stars', type: 'frame', name: '星砂邊框', rarity: 'R', color: '#FFE4A0', iconKey: 'ticket' },
  { id: 'frame_ribbon', type: 'frame', name: '緞帶邊框', rarity: 'SR', color: '#FFB3C6', iconKey: 'ticket' },
  { id: 'frame_moon', type: 'frame', name: '月光邊框', rarity: 'SSR', color: '#C8A8E9', iconKey: 'goldTicket' },
]

const RARITY_CONFIG = {
  SSR: { color: '#FFD35F', bg: 'linear-gradient(135deg, #FFE981, #FFB84D)', prob: 3 },
  SR: { color: '#B79BFF', bg: 'linear-gradient(135deg, #D4B9FF, #9A7CFF)', prob: 15 },
  R: { color: '#8FD8EA', bg: 'linear-gradient(135deg, #BFEFFF, #74D3E8)', prob: 82 },
}

const SPRITE_BY_ICON = {
  star: 'star',
  heart: 'heart',
  ticket: 'ticket',
  goldTicket: 'goldTicket',
  box: 'box',
  keeper: 'keeper',
  coin: 'star',
  crystal: 'heart',
}

function ShopSprite({ name, className = '' }) {
  return <span className={`academy-shop-sprite academy-shop-sprite--${name} ${className}`} aria-hidden="true" />
}

function PrizeIcon({ item }) {
  const sprite = SPRITE_BY_ICON[item.iconKey] ?? 'box'
  return (
    <span className="academy-prize-icon grid place-items-center" style={{ '--prize-color': item.color }}>
      <ShopSprite name={sprite} className="h-9 w-9" />
    </span>
  )
}

function drawGacha(count = 1, gold = false) {
  const results = []
  for (let i = 0; i < count; i++) {
    const rand = Math.random() * 100
    const rarity = gold ? (rand < 12 ? 'SSR' : rand < 45 ? 'SR' : 'R') : rand < 3 ? 'SSR' : rand < 18 ? 'SR' : 'R'
    const pool = GACHA_POOL.filter(g => g.rarity === rarity)
    results.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return results
}

function CurrencyCard({ sprite, label, value }) {
  return (
    <div className="academy-currency-card">
      <ShopSprite name={sprite} />
      <div className="min-w-0">
        <div className="truncate text-[9px] font-black text-[#8E87A8]">{label}</div>
        <div className="truncate">{value ?? 0}</div>
      </div>
    </div>
  )
}

function GachaResult({ results, onClose }) {
  const [revealed, setRevealed] = useState(0)

  function revealNext() {
    if (revealed < results.length) setRevealed(v => v + 1)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#4F3A7D]/48 px-6 backdrop-blur-md" onClick={revealNext}>
      <div className="mb-5 rounded-full bg-white/72 px-4 py-2 text-xs font-black text-[#7B63D8]">點擊揭曉補給</div>
      {revealed === 0 && (
        <motion.div
          className="grid h-32 w-32 place-items-center rounded-[32px] bg-white/84 shadow-2xl"
          animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <ShopSprite name="box" className="h-24 w-24" />
        </motion.div>
      )}
      <div className="grid max-w-xs grid-cols-2 gap-3">
        {results.slice(0, revealed).map((item, i) => {
          const rar = RARITY_CONFIG[item.rarity]
          return (
            <motion.div
              key={`${item.id}-${i}`}
              className="rounded-3xl bg-white/90 p-3 text-center shadow-xl"
              initial={{ scale: 0, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280 }}
              style={{ border: `2px solid ${rar.color}` }}
            >
              <div className="mx-auto mb-2 flex justify-center">
                <PrizeIcon item={item} />
              </div>
              <div className="text-[10px] font-black text-white" style={{ background: rar.bg, borderRadius: 999 }}>
                {item.rarity}
              </div>
              <div className="mt-1 text-xs font-black text-[#26324A]">{item.name}</div>
            </motion.div>
          )
        })}
      </div>
      {revealed > 0 && revealed < results.length && (
        <div className="mt-5 rounded-full bg-white/70 px-5 py-2 text-xs font-black text-[#7B63D8]">下一個</div>
      )}
      {revealed >= results.length && (
        <button className="academy-small-button mt-5" onClick={onClose}>收下補給</button>
      )}
    </div>
  )
}

function CollectionGrid({ items }) {
  if (!items || !items.length) {
    return (
      <div className="py-8 text-center">
        <ShopSprite name="box" className="mx-auto mb-2 h-20 w-20" />
        <div className="text-sm font-black text-[#26324A]">還沒有收藏品</div>
        <div className="text-xs font-bold text-[#8E87A8]">完成每日討伐來取得補給券</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => {
        const prize = GACHA_POOL.find(g => g.id === item.id) ?? GACHA_POOL[0]
        const rar = RARITY_CONFIG[prize.rarity] ?? RARITY_CONFIG.R
        return (
          <div key={i} className="rounded-2xl bg-white/72 p-2 text-center" style={{ border: `1px solid ${rar.color}` }}>
            <div className="mx-auto mb-1 flex justify-center">
              <PrizeIcon item={prize} />
            </div>
            <div className="truncate text-[10px] font-black text-[#26324A]">{prize.name}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function ShopScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user } = state
  const [gachaResult, setGachaResult] = useState(null)
  const [tab, setTab] = useState('gacha')
  const [isDrawing, setIsDrawing] = useState(false)

  const tickets = profile?.tickets ?? { normal: 0, gold: 0 }
  const stars = profile?.stars ?? { yellow: 0, purple: 0 }

  async function handleGacha(count, isGold) {
    const available = isGold ? tickets.gold : tickets.normal
    if (isDrawing) return
    if (available < count) {
      dispatch({
        type: 'SET_NOTIFICATION',
        notification: { type: 'shop', message: isGold ? '金券不足，先挑戰月底 Boss。' : '補給券不足，先完成每日討伐。' },
      })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2400)
      return
    }

    setIsDrawing(true)
    const results = drawGacha(count, isGold)
    const newTickets = {
      normal: (tickets.normal ?? 0) - (isGold ? 0 : count),
      gold: (tickets.gold ?? 0) - (isGold ? count : 0),
    }
    const now = Date.now()
    const newCollection = [
      ...(profile?.collection ?? []),
      ...results.map((item, i) => ({
        id: item.id,
        rarity: item.rarity,
        obtainedAt: now + i,
      })),
    ]
    const data = { tickets: newTickets, collection: newCollection }
    const rollback = {
      tickets: profile?.tickets ?? { normal: 0, gold: 0 },
      collection: profile?.collection ?? [],
    }
    dispatch({ type: 'UPDATE_PROFILE', data })

    try {
      if (user) await updateProfile(user.uid, data)
      setGachaResult(results)
    } catch (e) {
      console.error(e)
      dispatch({ type: 'UPDATE_PROFILE', data: rollback })
      dispatch({
        type: 'SET_NOTIFICATION',
        notification: { type: 'shop', message: '補給同步失敗，請稍後再試。' },
      })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2400)
    } finally {
      setIsDrawing(false)
    }
  }

  return (
    <div className="academy-screen" style={{ '--shop-assets': `url(${shopAssets})` }}>
      <img src={shopBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-10 flex items-center gap-2 px-4 pb-2 pt-4">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">補給商店</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-4">
        <div className="academy-currency-row mb-3">
          <CurrencyCard sprite="star" label="黃星" value={stars.yellow} />
          <CurrencyCard sprite="heart" label="紫心" value={stars.purple} />
          <CurrencyCard sprite="ticket" label="補給券" value={tickets.normal} />
          <CurrencyCard sprite="goldTicket" label="金券" value={tickets.gold} />
        </div>
        <div className="academy-tabs mb-3">
          <button className={tab === 'gacha' ? 'is-active' : ''} onClick={() => setTab('gacha')}>扭蛋補給</button>
          <button className={tab === 'collection' ? 'is-active' : ''} onClick={() => setTab('collection')}>收藏庫</button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        {tab === 'gacha' ? (
          <div className="flex flex-col gap-3">
            <div className="academy-card">
              <div className="academy-shop-hero">
                <ShopSprite name="keeper" />
                <div>
                  <div className="text-base font-black text-[#26324A]">小魔女補給員</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-[#8E87A8]">
                    用每日討伐拿到的補給券，抽出攻擊特效、稱號和頭像框。
                  </div>
                </div>
              </div>
            </div>

            <div className="academy-card">
              <div className="mb-3 flex items-center gap-3">
                <ShopSprite name="box" className="h-16 w-16" />
                <div>
                  <div className="text-sm font-black text-[#26324A]">一般補給箱</div>
                  <div className="text-xs font-bold text-[#8E87A8]">特效・稱號・邊框</div>
                </div>
              </div>
              <div className="mb-3 flex gap-2">
                {Object.entries(RARITY_CONFIG).map(([k, v]) => (
                  <div key={k} className="flex-1 rounded-2xl py-2 text-center text-xs font-black text-white" style={{ background: v.bg }}>
                    {k} {v.prob}%
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="academy-small-button flex-1 disabled:opacity-40" disabled={tickets.normal < 1 || isDrawing} onClick={() => handleGacha(1, false)}>
                  抽 1 次
                </button>
                <button className="academy-small-button flex-1 disabled:opacity-40" disabled={tickets.normal < 10 || isDrawing} onClick={() => handleGacha(10, false)}>
                  抽 10 次
                </button>
              </div>
              <div className="mt-2 text-center text-xs font-bold text-[#8E87A8]">持有補給券：{tickets.normal}</div>
            </div>

            <div className="academy-card" style={{ border: '2px solid rgba(255,211,95,0.86)' }}>
              <div className="mb-3 flex items-center gap-3">
                <ShopSprite name="goldTicket" className="h-14 w-14" />
                <div>
                  <div className="text-sm font-black text-[#26324A]">限定金券池</div>
                  <div className="text-xs font-bold text-[#D79B26]">SSR 機率提升，月 Boss 掉落</div>
                </div>
              </div>
              <button className="academy-small-button w-full disabled:opacity-40" disabled={tickets.gold < 1 || isDrawing} onClick={() => handleGacha(1, true)}>
                金券抽 1 次
              </button>
              <div className="mt-2 text-center text-xs font-bold text-[#8E87A8]">持有金券：{tickets.gold}</div>
            </div>

            <div className="academy-card text-xs font-bold leading-6 text-[#8E87A8]">
              <div className="mb-1 text-xs font-black text-[#26324A]">補給券獲得方式</div>
              <div className="flex justify-between"><span>平日咒靈淨化</span><span>補給券 x1</span></div>
              <div className="flex justify-between"><span>週末 Boss 淨化</span><span>補給券 x2</span></div>
              <div className="flex justify-between text-[#B47B16]"><span>月底 Boss 淨化</span><span>金券 x1</span></div>
            </div>
          </div>
        ) : (
          <div className="academy-card">
            <div className="mb-3 text-sm font-black text-[#26324A]">我的收藏品</div>
            <CollectionGrid items={profile?.collection ?? []} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {gachaResult && <GachaResult results={gachaResult} onClose={() => setGachaResult(null)} />}
      </AnimatePresence>

      <BottomNav current="shop" navigate={navigate} />
    </div>
  )
}
