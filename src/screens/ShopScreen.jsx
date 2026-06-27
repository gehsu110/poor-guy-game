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
  { id: 'night_cape', type: 'outfit', name: '星夜斗篷', rarity: 'SR', color: '#C8A8E9', iconKey: 'heart' },
  { id: 'night_cape_set', type: 'set', name: '星夜斗篷套裝', rarity: 'SR', color: '#C8A8E9', iconKey: 'heart' },
  { id: 'ribbon', type: 'accessory', name: '粉色緞帶', rarity: 'R', color: '#FFB3C6', iconKey: 'ticket' },
  { id: 'crown', type: 'accessory', name: '勇者小冠', rarity: 'SSR', color: '#FFE4A0', iconKey: 'goldTicket' },
]

const EXCHANGE_ITEMS = [
  { id: 'bg_mint', type: 'background', name: '薄荷晨光背景', source: '常駐背景', costType: 'yellow', cost: 4, rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'bg_ribbon', type: 'background', name: '緞帶學園背景', source: '常駐背景', costType: 'yellow', cost: 6, rarity: 'R', color: '#FFB3C6', iconKey: 'ticket' },
  { id: 'frame_gold', type: 'frame', name: '星砂金邊頭像框', source: '頭像框', costType: 'yellow', cost: 5, rarity: 'R', color: '#FFE4A0', iconKey: 'star' },
  { id: 'mint_coat', type: 'outfit', name: '薄荷外套', source: '常駐服裝', costType: 'yellow', cost: 8, rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'mint_supply_set', type: 'set', name: '薄荷補給套裝', source: '普通商店套裝', costType: 'yellow', cost: 12, rarity: 'R', color: '#A8E6CF', iconKey: 'crystal' },
  { id: 'pink_robe', type: 'outfit', name: '粉晶禮服', source: '常駐服裝', costType: 'purple', cost: 4, rarity: 'SR', color: '#FFB3C6', iconKey: 'heart' },
  { id: 'pink_magic_set', type: 'set', name: '粉晶魔法套裝', source: '普通商店套裝', costType: 'purple', cost: 6, rarity: 'SR', color: '#FFB3C6', iconKey: 'heart' },
  { id: 'star_pin', type: 'accessory', name: '星星髮夾', source: '頭飾', costType: 'yellow', cost: 3, rarity: 'R', color: '#FFE4A0', iconKey: 'star' },
  { id: 'title_budget', type: 'title', name: '預算守門人', source: '稱號', costType: 'purple', cost: 3, rarity: 'SR', color: '#A8D8EA', iconKey: 'coin' },
]

const DAILY_SUPPLIES = [
  {
    id: 'daily_yellow',
    name: '星屑補給',
    desc: '每日免費領取',
    iconKey: 'star',
    reward: { yellow: 1 },
  },
  {
    id: 'daily_ticket',
    name: '補給券委託',
    desc: '用黃星換一次常駐抽獎機會',
    iconKey: 'ticket',
    cost: { yellow: 2 },
    reward: { normalTicket: 1 },
  },
  {
    id: 'daily_gold_seed',
    name: '金券碎光',
    desc: '小額紫星換高級補給進度',
    iconKey: 'goldTicket',
    cost: { purple: 1 },
    reward: { goldTicket: 1 },
  },
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

const RESOURCE_ICON = {
  yellow: 'coin-gold',
  purple: 'coin-purple',
  normalTicket: 'ticket-normal',
  goldTicket: 'ticket-gold',
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

function todayKey() {
  return new Date().toISOString().slice(0, 10)
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

function ResourceAmount({ type, value, compact = false }) {
  return (
    <span className={`academy-resource-amount ${compact ? 'academy-resource-amount--compact' : ''}`}>
      <GameIcon name={RESOURCE_ICON[type]} />
      <b>{value ?? 0}</b>
    </span>
  )
}

function ResourceList({ data, compact = false }) {
  const entries = Object.entries(data ?? {}).filter(([, value]) => value)
  if (!entries.length) return <span className="academy-resource-free">免費</span>
  return (
    <span className="academy-resource-list">
      {entries.map(([type, value]) => (
        <ResourceAmount key={type} type={type} value={value} compact={compact} />
      ))}
    </span>
  )
}

function currencyFromState(stars, tickets) {
  return {
    yellow: stars.yellow ?? 0,
    purple: stars.purple ?? 0,
    normalTicket: tickets.normal ?? 0,
    goldTicket: tickets.gold ?? 0,
  }
}

function hasResources(resources, cost = {}) {
  return Object.entries(cost).every(([key, value]) => (resources[key] ?? 0) >= value)
}

function applyResourceDelta(stars, tickets, delta = {}, direction = 1) {
  return {
    stars: {
      yellow: (stars.yellow ?? 0) + direction * (delta.yellow ?? 0),
      purple: (stars.purple ?? 0) + direction * (delta.purple ?? 0),
    },
    tickets: {
      normal: (tickets.normal ?? 0) + direction * (delta.normalTicket ?? 0),
      gold: (tickets.gold ?? 0) + direction * (delta.goldTicket ?? 0),
    },
  }
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
        <div className="text-xs font-bold text-[#8E87A8]">完成任務或使用補給券來取得收藏品</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => {
        const prize = [...GACHA_POOL, ...EXCHANGE_ITEMS].find(g => g.id === item.id) ?? GACHA_POOL[0]
        const rar = RARITY_CONFIG[prize.rarity] ?? RARITY_CONFIG.R
        const isEquipped = equipped?.[prize.type] === prize.id || equipped?.set === prize.id
        return (
          <div key={`${item.id}-${i}`} className="rounded-2xl bg-white/72 p-2 text-center" style={{ border: `1px solid ${rar.color}` }}>
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
          <div className="text-sm font-black text-[#26324A]">常駐收藏預覽</div>
          <div className="text-[10px] font-bold text-[#8E87A8]">節日完整套裝會留在活動任務線</div>
        </div>
        <span className="academy-status">常駐</span>
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
  const [tab, setTab] = useState('daily')
  const [isDrawing, setIsDrawing] = useState(false)

  const tickets = profile?.tickets ?? { normal: 0, gold: 0 }
  const stars = profile?.stars ?? { yellow: 0, purple: 0 }
  const collection = profile?.collection ?? []
  const equipped = profile?.equipped ?? {}
  const shopState = profile?.shop ?? {}
  const today = todayKey()
  const dailyClaims = shopState.dailySupplyDate === today ? shopState.dailySupplyClaims ?? [] : []
  const resources = currencyFromState(stars, tickets)

  function notify(message) {
    dispatch({ type: 'SET_NOTIFICATION', notification: { type: 'shop', message } })
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2200)
  }

  async function handleGacha(count, isGold) {
    const available = isGold ? tickets.gold : tickets.normal
    if (isDrawing) return
    if (available < count) {
      notify(isGold ? '金色補給券不足，先完成公會月度挑戰。' : '一般補給券不足，先擊殺當日怪物。')
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
    const data = {
      tickets: newTickets,
      stars: {
        yellow: (stars.yellow ?? 0) + duplicateStars.yellow,
        purple: (stars.purple ?? 0) + duplicateStars.purple,
      },
      collection: [...collection, ...newItems],
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
      notify('補給同步失敗，請稍後再試。')
    } finally {
      setIsDrawing(false)
    }
  }

  async function claimDailySupply(item) {
    if (dailyClaims.includes(item.id)) return
    if (!hasResources(resources, item.cost)) {
      notify('資源不足，先完成今日任務或記帳。')
      return
    }
    const afterCost = applyResourceDelta(stars, tickets, item.cost, -1)
    const afterReward = applyResourceDelta(afterCost.stars, afterCost.tickets, item.reward, 1)
    const data = {
      stars: afterReward.stars,
      tickets: afterReward.tickets,
      shop: {
        ...shopState,
        dailySupplyDate: today,
        dailySupplyClaims: [...dailyClaims, item.id],
      },
    }
    dispatch({ type: 'UPDATE_PROFILE', data })
    try {
      if (user) await updateProfile(user.uid, data)
      notify(`${item.name} 已領取`)
    } catch (e) {
      console.error(e)
      dispatch({ type: 'UPDATE_PROFILE', data: { stars, tickets, shop: shopState } })
      notify('每日補給同步失敗，請稍後再試。')
    }
  }

  async function buyExchange(item) {
    const alreadyOwned = collection.some(c => c.id === item.id)
    if (alreadyOwned) {
      await equipItem(item)
      return
    }
    const cost = { [item.costType]: item.cost }
    if (!hasResources(resources, cost)) {
      notify(item.costType === 'purple' ? '紫星不足。' : '黃星不足。')
      return
    }
    const next = applyResourceDelta(stars, tickets, cost, -1)
    const data = {
      stars: next.stars,
      tickets: next.tickets,
      collection: [...collection, { id: item.id, rarity: item.rarity, obtainedAt: Date.now(), source: 'exchange' }],
    }
    dispatch({ type: 'UPDATE_PROFILE', data })
    try {
      if (user) await updateProfile(user.uid, data)
      notify(`${item.name} 已加入收藏`)
    } catch (e) {
      console.error(e)
      dispatch({ type: 'UPDATE_PROFILE', data: { stars, tickets, collection } })
      notify('兌換同步失敗，請稍後再試。')
    }
  }

  async function equipItem(item) {
    const SET_EQUIP = {
      mint_supply_set: { outfit: 'mint_coat', accessory: 'star_pin', frame: 'crystal' },
      pink_magic_set: { outfit: 'pink_robe', accessory: 'ribbon', frame: 'frame_ribbon' },
      night_cape_set: { outfit: 'night_cape', accessory: 'crown', frame: 'moon' },
    }
    const data = item.type === 'set'
      ? { equipped: { ...equipped, ...SET_EQUIP[item.id], set: item.id } }
      : { equipped: { ...equipped, [item.type]: item.id } }
    dispatch({ type: 'UPDATE_PROFILE', data })
    notify(`${item.name} 已裝備`)
    if (user) await updateProfile(user.uid, data)
  }

  return (
    <div className="academy-screen academy-shop-screen" style={{ '--shop-assets': `url(${shopAssets})` }}>
      <img src={shopBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="academy-safe-top relative z-10 flex items-center gap-2 px-4 pb-2">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">補給商店</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-4">
        <div className="academy-shop-counter mb-3">
          <CurrencyCard icon="coin-gold" label="黃星" value={stars.yellow} />
          <CurrencyCard icon="coin-purple" label="紫星" value={stars.purple} />
          <CurrencyCard icon="ticket-normal" label="一般券" value={tickets.normal} />
          <CurrencyCard icon="ticket-gold" label="金券" value={tickets.gold} />
        </div>
        <div className="academy-tabs academy-shop-tabs mb-3">
          <button className={tab === 'daily' ? 'is-active' : ''} onClick={() => setTab('daily')}>每日</button>
          <button className={tab === 'gacha' ? 'is-active' : ''} onClick={() => setTab('gacha')}>補給</button>
          <button className={tab === 'exchange' ? 'is-active' : ''} onClick={() => setTab('exchange')}>兌換</button>
          <button className={tab === 'collection' ? 'is-active' : ''} onClick={() => setTab('collection')}>收藏</button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        {tab === 'daily' && (
          <div className="flex flex-col gap-3">
            <div className="academy-card academy-shop-hero-card">
              <div className="academy-shop-hero">
                <ShopSprite name="keeper" />
                <div>
                  <div className="text-base font-black text-[#26324A]">學院補給櫃台</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-[#8E87A8]">
                    每日補給只提供資源與抽獎券；完整節日套裝保留給活動任務線。
                  </div>
                </div>
              </div>
            </div>

            <section className="academy-shop-section">
              <div className="academy-shop-section__head">
                <div>
                  <b>每日補給</b>
                  <small>{today}</small>
                </div>
                <span className="academy-status">{dailyClaims.length}/{DAILY_SUPPLIES.length}</span>
              </div>
              <div className="academy-shop-supply-grid">
                {DAILY_SUPPLIES.map(item => {
                  const claimed = dailyClaims.includes(item.id)
                  const disabled = claimed || !hasResources(resources, item.cost)
                  return (
                    <button key={item.id} className={`academy-shop-supply ${claimed ? 'is-claimed' : ''}`} onClick={() => claimDailySupply(item)} disabled={claimed}>
                      <PrizeIcon item={{ ...item, color: claimed ? '#D7D0E8' : '#FFE4A0' }} />
                      <span>
                        <b>{item.name}</b>
                        <small>{item.desc}</small>
                      </span>
                      <i>
                        <ResourceList data={item.reward} compact />
                        {item.cost && <em><ResourceList data={item.cost} compact /></em>}
                      </i>
                      <strong>{claimed ? '已領' : disabled ? '不足' : '領取'}</strong>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="academy-shop-section">
              <div className="academy-shop-section__head">
                <div>
                  <b>今日推薦</b>
                  <small>先補資源，再抽常駐收藏</small>
                </div>
              </div>
              <div className="academy-shop-recommend">
                <ShopSprite name="box" />
                <div>
                  <b>一般補給箱</b>
                  <p>用任務與每日補給拿到的補給券抽常駐特效、稱號、頭像框與普通套裝。</p>
                  <button className="academy-small-button" onClick={() => setTab('gacha')}>前往補給</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'gacha' && (
          <div className="flex flex-col gap-3">
            <div className="academy-card">
              <div className="academy-shop-hero">
                <ShopSprite name="keeper" />
                <div>
                  <div className="text-base font-black text-[#26324A]">常駐補給池</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-[#8E87A8]">
                    補給池放常駐收藏；節日完整套裝不放進普通抽獎。
                  </div>
                </div>
              </div>
            </div>

            <div className="academy-card">
              <div className="academy-shop-pool-head">
                <ShopSprite name="box" />
                <div>
                  <b>一般補給箱</b>
                  <small>特效・稱號・邊框・常駐套裝</small>
                </div>
                <ResourceAmount type="normalTicket" value={tickets.normal} />
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
                  <ResourceAmount type="normalTicket" value={1} compact /> 抽 1 次
                </button>
                <button className={`academy-small-button flex-1 ${tickets.normal < 10 || isDrawing ? 'opacity-55' : ''}`} onClick={() => handleGacha(10, false)}>
                  <ResourceAmount type="normalTicket" value={10} compact /> 抽 10 次
                </button>
              </div>
            </div>

            <div className="academy-card" style={{ border: '2px solid rgba(255,211,95,0.86)' }}>
              <div className="academy-shop-pool-head">
                <ShopSprite name="goldTicket" />
                <div>
                  <b>限定金色池</b>
                  <small>傳說機率提升，公會月度挑戰取得</small>
                </div>
                <ResourceAmount type="goldTicket" value={tickets.gold} />
              </div>
              <button className={`academy-small-button w-full ${tickets.gold < 1 || isDrawing ? 'opacity-55' : ''}`} onClick={() => handleGacha(1, true)}>
                <ResourceAmount type="goldTicket" value={1} compact /> 抽 1 次
              </button>
            </div>

            <div className="academy-card">
              <div className="mb-2 text-xs font-black text-[#26324A]">資源獲得方式</div>
              <div className="academy-shop-source-list">
                <span>C/B/A 每日結算</span><ResourceList data={{ yellow: 1 }} compact />
                <span>S 每日結算</span><ResourceList data={{ purple: 1 }} compact />
                <span>擊殺當日怪物</span><ResourceList data={{ normalTicket: 1 }} compact />
                <span>公會月度挑戰</span><ResourceList data={{ goldTicket: 1 }} compact />
              </div>
            </div>
          </div>
        )}

        {tab === 'exchange' && (
          <div className="flex flex-col gap-2">
            <RewardPreview />
            <section className="academy-shop-section">
              <div className="academy-shop-section__head">
                <div>
                  <b>資源兌換</b>
                  <small>常駐收藏與普通套裝</small>
                </div>
              </div>
              <div className="academy-shop-exchange-list">
                {EXCHANGE_ITEMS.map(item => {
                  const owned = collection.some(c => c.id === item.id)
                  const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.R
                  return (
                    <div key={item.id} className="academy-shop-product">
                      <PrizeIcon item={item} />
                      <div className="min-w-0 flex-1">
                        <div className="academy-shop-product__title">
                          <b>{item.name}</b>
                          <span style={{ '--rarity-color': rarity.color }}>{rarity.label}</span>
                        </div>
                        <small>{item.source} / {TYPE_LABELS[item.type] ?? '收集品'}</small>
                      </div>
                      <button className="academy-small-button" onClick={() => buyExchange(item)}>
                        {owned ? '裝備' : <ResourceAmount type={item.costType} value={item.cost} compact />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {tab === 'collection' && (
          <div className="academy-card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-[#26324A]">我的收藏品</div>
                <div className="text-[10px] font-bold text-[#8E87A8]">抽到或兌換後可在這裡裝備</div>
              </div>
              <span className="academy-status">{collection.length}</span>
            </div>
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
