import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'
import GameIcon from '../components/GameIcon'
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
  { id: 'night_cape', type: 'outfit', name: '星夜斗篷', rarity: 'SR', color: '#C8A8E9', iconKey: 'heart' },
  { id: 'night_cape_set', type: 'set', name: '星夜斗篷套裝', rarity: 'SR', color: '#C8A8E9', iconKey: 'heart' },
  { id: 'moonlight_set', type: 'set', name: '月光限定套裝', rarity: 'SSR', color: '#FFE4A0', iconKey: 'goldTicket' },
  { id: 'ribbon', type: 'accessory', name: '粉色緞帶', rarity: 'R', color: '#FFB3C6', iconKey: 'ticket' },
  { id: 'crown', type: 'accessory', name: '勇者小冠', rarity: 'SSR', color: '#FFE4A0', iconKey: 'goldTicket' },
]

const DIRECT_ITEMS = [
  { id: 'bg_mint', type: 'background', name: '薄荷晨光背景', costType: 'yellow', cost: 4, rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'bg_ribbon', type: 'background', name: '緞帶學園背景', costType: 'yellow', cost: 6, rarity: 'R', color: '#FFB3C6', iconKey: 'ticket' },
  { id: 'frame_gold', type: 'frame', name: '黃色星星頭像框', costType: 'yellow', cost: 5, rarity: 'R', color: '#FFE4A0', iconKey: 'star' },
  { id: 'mint_coat', type: 'outfit', name: '薄荷外套', costType: 'yellow', cost: 8, rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'mint_supply_set', type: 'set', name: '薄荷補給套裝', costType: 'yellow', cost: 12, rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'pink_robe', type: 'outfit', name: '粉晶禮服', costType: 'purple', cost: 4, rarity: 'SR', color: '#FFB3C6', iconKey: 'heart' },
  { id: 'pink_magic_set', type: 'set', name: '粉晶魔法套裝', costType: 'purple', cost: 6, rarity: 'SR', color: '#FFB3C6', iconKey: 'heart' },
  { id: 'star_pin', type: 'accessory', name: '星星髮夾', costType: 'yellow', cost: 3, rarity: 'R', color: '#FFE4A0', iconKey: 'star' },
  { id: 'fx_moon', type: 'effect', name: '月光術式', costType: 'purple', cost: 2, rarity: 'SR', color: '#C8A8E9', iconKey: 'heart' },
  { id: 'title_budget', type: 'title', name: '預算守門人', costType: 'purple', cost: 3, rarity: 'SR', color: '#A8D8EA', iconKey: 'coin' },
]

const RARITY_CONFIG = {
  SSR: { label: '傳說', color: '#FFD35F', bg: 'linear-gradient(135deg, #FFE981, #FFB84D)', prob: 3 },
  SR: { label: '稀有', color: '#B79BFF', bg: 'linear-gradient(135deg, #D4B9FF, #9A7CFF)', prob: 15 },
  R: { label: '普通', color: '#8FD8EA', bg: 'linear-gradient(135deg, #BFEFFF, #74D3E8)', prob: 82 },
}

const TYPE_LABELS = {
  background: '背景',
  effect: '攻擊特效',
  title: '稱號',
  frame: '頭像框',
  outfit: '服裝',
  accessory: '頭飾',
  set: '套裝',
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

function CurrencyCard({ icon, label, value }) {
  return (
    <div className="academy-currency-card">
      <GameIcon name={icon} />
      <div className="min-w-0 text-center">
        <div className="academy-currency-card__label">{label}</div>
        <div className="academy-currency-card__value">{value ?? 0}</div>
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
                {rar.label}
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

function CollectionGrid({ items, equipped, onEquip }) {
  if (!items || !items.length) {
    return (
      <div className="py-8 text-center">
        <ShopSprite name="box" className="mx-auto mb-2 h-20 w-20" />
        <div className="text-sm font-black text-[#26324A]">還沒有收藏品</div>
        <div className="text-xs font-bold text-[#8E87A8]">擊殺當日怪物來取得一般扭蛋券</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => {
        const prize = [...GACHA_POOL, ...DIRECT_ITEMS].find(g => g.id === item.id) ?? GACHA_POOL[0]
        const rar = RARITY_CONFIG[prize.rarity] ?? RARITY_CONFIG.R
        const isEquipped = equipped?.[prize.type] === prize.id
        return (
          <div key={i} className="rounded-2xl bg-white/72 p-2 text-center" style={{ border: `1px solid ${rar.color}` }}>
            <div className="mx-auto mb-1 flex justify-center">
              <PrizeIcon item={prize} />
            </div>
            <div className="truncate text-[10px] font-black text-[#26324A]">{prize.name}</div>
            <button className={`academy-status mt-1 ${isEquipped ? 'academy-status--done' : ''}`} onClick={() => onEquip(prize)}>
              {isEquipped ? '使用中' : '裝備'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function RewardPreview() {
  const previews = [
    { type: 'effect', label: '星軌斬擊', sub: '攻擊特效' },
    { type: 'title', label: '預算守門人', sub: '稱號' },
    { type: 'frame', label: '星砂邊框', sub: '頭像框' },
    { type: 'background', label: '薄荷晨光', sub: '背景' },
  ]
  return (
    <div className="academy-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-black text-[#26324A]">獎勵預覽</div>
          <div className="text-[10px] font-bold text-[#8E87A8]">先看收集品裝上去會長什麼樣</div>
        </div>
        <span className="academy-status">展示</span>
      </div>
      <div className="academy-reward-preview">
        {previews.map(item => (
          <div key={item.type} className="academy-reward-tile">
            <div className={`academy-reward-tile__visual academy-reward-tile__visual--${item.type}`}>
              {item.type === 'title' && <span className="text-[9px] font-black text-[#7B63D8]">稱號</span>}
            </div>
            <div className="academy-reward-tile__label">{item.label}</div>
            <div className="academy-reward-tile__sub">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ShopScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user } = state
  const [gachaResult, setGachaResult] = useState(null)
  const [tab, setTab] = useState('direct')
  const [isDrawing, setIsDrawing] = useState(false)

  const tickets = profile?.tickets ?? { normal: 0, gold: 0 }
  const stars = profile?.stars ?? { yellow: 0, purple: 0 }
  const collection = profile?.collection ?? []
  const equipped = profile?.equipped ?? {}

  async function handleGacha(count, isGold) {
    const available = isGold ? tickets.gold : tickets.normal
    if (isDrawing) return
    if (available < count) {
      dispatch({
        type: 'SET_NOTIFICATION',
        notification: { type: 'shop', message: isGold ? '金色扭蛋券不足，先完成公會月度挑戰。' : '一般扭蛋券不足，先擊殺當日怪物。' },
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
    const ownedIds = new Set(collection.map(item => item.id))
    const newItems = []
    const duplicateStars = { yellow: 0, purple: 0 }
    results.forEach((item, i) => {
      if (ownedIds.has(item.id)) {
        if (item.rarity === 'SSR') duplicateStars.purple += 1
        else duplicateStars.yellow += item.rarity === 'SR' ? 2 : 1
      } else {
        ownedIds.add(item.id)
        newItems.push({ id: item.id, rarity: item.rarity, obtainedAt: now + i })
      }
    })
    const newCollection = [...collection, ...newItems]
    const data = {
      tickets: newTickets,
      stars: {
        yellow: (stars.yellow ?? 0) + duplicateStars.yellow,
        purple: (stars.purple ?? 0) + duplicateStars.purple,
      },
      collection: newCollection,
    }
    const rollback = {
      tickets: profile?.tickets ?? { normal: 0, gold: 0 },
      stars: profile?.stars ?? { yellow: 0, purple: 0 },
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

  async function buyDirect(item) {
    const alreadyOwned = collection.some(c => c.id === item.id)
    if (alreadyOwned) {
      await equipItem(item)
      return
    }
    const current = item.costType === 'purple' ? stars.purple ?? 0 : stars.yellow ?? 0
    if (current < item.cost) {
      dispatch({
        type: 'SET_NOTIFICATION',
        notification: { type: 'shop', message: item.costType === 'purple' ? '紫色星星不足。' : '黃色星星不足。' },
      })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2200)
      return
    }
    const nextStars = {
      yellow: (stars.yellow ?? 0) - (item.costType === 'yellow' ? item.cost : 0),
      purple: (stars.purple ?? 0) - (item.costType === 'purple' ? item.cost : 0),
    }
    const data = {
      stars: nextStars,
      collection: [...collection, { id: item.id, rarity: item.rarity, obtainedAt: Date.now(), source: 'direct' }],
    }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) await updateProfile(user.uid, data)
  }

  async function equipItem(item) {
    const SET_EQUIP = {
      mint_supply_set: { outfit: 'mint_coat', accessory: 'star_pin', frame: 'crystal' },
      pink_magic_set: { outfit: 'pink_robe', accessory: 'ribbon', frame: 'frame_ribbon' },
      night_cape_set: { outfit: 'night_cape', accessory: 'crown', frame: 'moon' },
      moonlight_set: { outfit: 'moonlight', accessory: 'crown', frame: 'frame_moon' },
    }
    const data = item.type === 'set'
      ? { equipped: { ...equipped, ...SET_EQUIP[item.id], set: item.id } }
      : { equipped: { ...equipped, [item.type]: item.id } }
    dispatch({ type: 'UPDATE_PROFILE', data })
    dispatch({ type: 'SET_NOTIFICATION', notification: { type: 'shop', message: `${item.name} 已裝備` } })
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 1800)
    if (user) await updateProfile(user.uid, data)
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
          <CurrencyCard icon="yellow-star" label="黃色星星" value={stars.yellow} />
          <CurrencyCard icon="purple-star" label="紫色星星" value={stars.purple} />
          <CurrencyCard icon="normal-ticket" label="一般扭蛋券" value={tickets.normal} />
          <CurrencyCard icon="gold-ticket" label="金色扭蛋券" value={tickets.gold} />
        </div>
        <div className="academy-tabs mb-3">
          <button className={tab === 'direct' ? 'is-active' : ''} onClick={() => setTab('direct')}>直購</button>
          <button className={tab === 'gacha' ? 'is-active' : ''} onClick={() => setTab('gacha')}>扭蛋</button>
          <button className={tab === 'collection' ? 'is-active' : ''} onClick={() => setTab('collection')}>圖鑑</button>
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
                    用擊殺當日怪物拿到的一般扭蛋券，抽出攻擊特效、稱號和頭像框。
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
                    {v.label} {v.prob}%
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className={`academy-small-button flex-1 ${tickets.normal < 1 || isDrawing ? 'opacity-55' : ''}`} onClick={() => handleGacha(1, false)}>
                  抽 1 次
                </button>
                <button className={`academy-small-button flex-1 ${tickets.normal < 10 || isDrawing ? 'opacity-55' : ''}`} onClick={() => handleGacha(10, false)}>
                  抽 10 次
                </button>
              </div>
              <div className="mt-2 text-center text-xs font-bold text-[#8E87A8]">持有一般扭蛋券：{tickets.normal}</div>
            </div>

            <div className="academy-card" style={{ border: '2px solid rgba(255,211,95,0.86)' }}>
              <div className="mb-3 flex items-center gap-3">
                <ShopSprite name="goldTicket" className="h-14 w-14" />
                <div>
                  <div className="text-sm font-black text-[#26324A]">限定金色池</div>
                  <div className="text-xs font-bold text-[#D79B26]">傳說機率提升，公會月度挑戰取得</div>
                </div>
              </div>
              <button className={`academy-small-button w-full ${tickets.gold < 1 || isDrawing ? 'opacity-55' : ''}`} onClick={() => handleGacha(1, true)}>
                金色扭蛋券抽 1 次
              </button>
              <div className="mt-2 text-center text-xs font-bold text-[#8E87A8]">持有金色扭蛋券：{tickets.gold}</div>
            </div>

            <div className="academy-card text-xs font-bold leading-6 text-[#8E87A8]">
              <div className="mb-1 text-xs font-black text-[#26324A]">貨幣獲得方式</div>
              <div className="flex justify-between"><span>C/B/A 每日結算</span><span>黃色星星 ×1～×3</span></div>
              <div className="flex justify-between"><span>S 每日結算</span><span>紫色星星 ×1</span></div>
              <div className="flex justify-between"><span>擊殺當日怪物</span><span>一般扭蛋券 ×1</span></div>
              <div className="flex justify-between text-[#B47B16]"><span>公會月度挑戰</span><span>金色扭蛋券 ×1</span></div>
            </div>
          </div>
        ) : tab === 'direct' ? (
          <div className="flex flex-col gap-2">
            <RewardPreview />
            {DIRECT_ITEMS.map(item => {
              const owned = collection.some(c => c.id === item.id)
              const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.R
              return (
                <div key={item.id} className="academy-card flex items-center gap-3">
                  <PrizeIcon item={item} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-[#26324A]">{item.name}</div>
                    <div className="text-xs font-bold text-[#8E87A8]">{TYPE_LABELS[item.type] ?? '收集品'} / {rarity.label}</div>
                  </div>
                  <button className="academy-small-button" onClick={() => buyDirect(item)}>
                    {owned ? '裝備' : `${item.costType === 'purple' ? '紫色星星' : '黃色星星'} ${item.cost}`}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="academy-card">
            <div className="mb-3 text-sm font-black text-[#26324A]">我的收藏品</div>
            <CollectionGrid items={collection} equipped={equipped} onEquip={equipItem} />
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
