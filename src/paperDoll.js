/**
 * paperDoll.js — 部件制紙娃娃系統的資產中心。
 *
 * 資料層：玩家分開擁有/裝備「髮型、服裝、道具、背景」，任何部件自由混搭，
 *        不做搭配限制（搭配限制保留給真正的限定商品）。
 * 渲染層：每一種（髮型×服裝×道具）組合對應一張整體生成的角色圖，
 *        對位由生成保證。新增部件時用批次生成補齊該部件的組合列。
 */

import plainBg from './assets/academy-art/paper-doll-set/plain-bg.webp'
import plazaBg from './assets/academy-art/paper-doll-set/plaza-bg.webp'
import castTwinUniformWand from './assets/academy-art/paper-doll-set/combos/twin-uniform-wand-cast.webp'
import baseBody from './assets/academy-art/paper-doll-set/girl-paper-base.png'
import starBeret from './assets/academy-art/paper-doll-set/accessories/star-beret.png'
import savingCrown from './assets/academy-art/paper-doll-set/accessories/saving-crown.png'
import moonGlasses from './assets/academy-art/paper-doll-set/accessories/moon-glasses.png'
import budgetWings from './assets/academy-art/paper-doll-set/accessories/budget-wings.png'
import coinSprite from './assets/academy-art/paper-doll-set/accessories/coin-sprite.png'
import ledgerOwl from './assets/academy-art/paper-doll-set/accessories/ledger-owl.png'
import mintRangerCap from './assets/academy-art/paper-doll-set/accessories/mint-ranger-cap.png'
import moonWitchHat from './assets/academy-art/paper-doll-set/accessories/moon-witch-hat.png'
import mintSquareGlasses from './assets/academy-art/paper-doll-set/accessories/mint-square-glasses.png'
import sunsetHeartGlasses from './assets/academy-art/paper-doll-set/accessories/sunset-heart-glasses.png'
import moonHalo from './assets/academy-art/paper-doll-set/accessories/moon-halo.png'
import ledgerRibbonBow from './assets/academy-art/paper-doll-set/accessories/ledger-ribbon-bow.png'
import savingsPig from './assets/academy-art/paper-doll-set/accessories/savings-pig.png'
import receiptCat from './assets/academy-art/paper-doll-set/accessories/receipt-cat.png'

import twinUniformWand from './assets/academy-art/paper-doll-set/combos/twin-uniform-wand.png'
import twinUniformWandBlink from './assets/academy-art/paper-doll-set/combos/twin-uniform-wand-blink.png'
import twinUniformWandHappy from './assets/academy-art/paper-doll-set/combos/twin-uniform-wand-happy.png'
import twinUniformWandIdle from './assets/academy-art/paper-doll-set/combos/twin-uniform-wand-idle.webp'
import twinUniformBook from './assets/academy-art/paper-doll-set/combos/twin-uniform-book.png'
import twinUniformCrystal from './assets/academy-art/paper-doll-set/combos/twin-uniform-crystal.png'
import twinDressWand from './assets/academy-art/paper-doll-set/combos/twin-dress-wand.png'
import twinDressBook from './assets/academy-art/paper-doll-set/combos/twin-dress-book.png'
import twinDressCrystal from './assets/academy-art/paper-doll-set/combos/twin-dress-crystal.png'
import pinkUniformWand from './assets/academy-art/paper-doll-set/combos/pink-uniform-wand.png'
import pinkUniformBook from './assets/academy-art/paper-doll-set/combos/pink-uniform-book.png'
import pinkUniformCrystal from './assets/academy-art/paper-doll-set/combos/pink-uniform-crystal.png'
import pinkDressWand from './assets/academy-art/paper-doll-set/combos/pink-dress-wand.png'
import pinkDressBook from './assets/academy-art/paper-doll-set/combos/pink-dress-book.png'
import pinkDressCrystal from './assets/academy-art/paper-doll-set/combos/pink-dress-crystal.png'
import twinUniformBookBlink from './assets/academy-art/paper-doll-set/combos/twin-uniform-book-blink.png'
import twinUniformBookHappy from './assets/academy-art/paper-doll-set/combos/twin-uniform-book-happy.png'
import twinUniformCrystalBlink from './assets/academy-art/paper-doll-set/combos/twin-uniform-crystal-blink.png'
import twinUniformCrystalHappy from './assets/academy-art/paper-doll-set/combos/twin-uniform-crystal-happy.png'
import twinDressWandBlink from './assets/academy-art/paper-doll-set/combos/twin-dress-wand-blink.png'
import twinDressWandHappy from './assets/academy-art/paper-doll-set/combos/twin-dress-wand-happy.png'
import twinDressBookBlink from './assets/academy-art/paper-doll-set/combos/twin-dress-book-blink.png'
import twinDressBookHappy from './assets/academy-art/paper-doll-set/combos/twin-dress-book-happy.png'
import twinDressCrystalBlink from './assets/academy-art/paper-doll-set/combos/twin-dress-crystal-blink.png'
import twinDressCrystalHappy from './assets/academy-art/paper-doll-set/combos/twin-dress-crystal-happy.png'
import pinkUniformWandBlink from './assets/academy-art/paper-doll-set/combos/pink-uniform-wand-blink.png'
import pinkUniformWandHappy from './assets/academy-art/paper-doll-set/combos/pink-uniform-wand-happy.png'
import pinkUniformBookBlink from './assets/academy-art/paper-doll-set/combos/pink-uniform-book-blink.png'
import pinkUniformBookHappy from './assets/academy-art/paper-doll-set/combos/pink-uniform-book-happy.png'
import pinkUniformCrystalBlink from './assets/academy-art/paper-doll-set/combos/pink-uniform-crystal-blink.png'
import pinkUniformCrystalHappy from './assets/academy-art/paper-doll-set/combos/pink-uniform-crystal-happy.png'
import pinkDressWandBlink from './assets/academy-art/paper-doll-set/combos/pink-dress-wand-blink.png'
import pinkDressWandHappy from './assets/academy-art/paper-doll-set/combos/pink-dress-wand-happy.png'
import pinkDressBookBlink from './assets/academy-art/paper-doll-set/combos/pink-dress-book-blink.png'
import pinkDressBookHappy from './assets/academy-art/paper-doll-set/combos/pink-dress-book-happy.png'
import pinkDressCrystalBlink from './assets/academy-art/paper-doll-set/combos/pink-dress-crystal-blink.png'
import pinkDressCrystalHappy from './assets/academy-art/paper-doll-set/combos/pink-dress-crystal-happy.png'
import twinUniformBookIdle from './assets/academy-art/paper-doll-set/combos/twin-uniform-book-idle.webp'
import twinUniformCrystalIdle from './assets/academy-art/paper-doll-set/combos/twin-uniform-crystal-idle.webp'
import twinDressWandIdle from './assets/academy-art/paper-doll-set/combos/twin-dress-wand-idle.webp'
import twinDressBookIdle from './assets/academy-art/paper-doll-set/combos/twin-dress-book-idle.webp'
import twinDressCrystalIdle from './assets/academy-art/paper-doll-set/combos/twin-dress-crystal-idle.webp'
import pinkDressWandIdle from './assets/academy-art/paper-doll-set/combos/pink-dress-wand-idle.webp'
import pinkDressBookIdle from './assets/academy-art/paper-doll-set/combos/pink-dress-book-idle.webp'
import pinkDressCrystalIdle from './assets/academy-art/paper-doll-set/combos/pink-dress-crystal-idle.webp'

export const PAPER_DOLL_SLOTS = [
  { key: 'hair', label: '髮型' },
  { key: 'outfit', label: '服裝' },
  { key: 'prop', label: '道具' },
  { key: 'action', label: '動作' },
  { key: 'background', label: '背景' },
  { key: 'headwear', label: '帽子・髮飾', overlay: true },
  { key: 'faceAccessory', label: '臉部配件', overlay: true },
  { key: 'backAccessory', label: '背部配件', overlay: true },
  { key: 'companion', label: '寵物夥伴', overlay: true },
]

// starter: true 的部件為初始擁有；其餘透過商店/活動取得（id 需全域唯一，供 collection 使用）
export const PAPER_DOLL_ITEMS = {
  hair: {
    twin: { id: 'pd_hair_twin', name: '紫雙馬尾', desc: '星星髮夾的雙馬尾', rarity: 'N', starter: true },
    pink: { id: 'pd_hair_pink', name: '粉長捲髮', desc: '蓬鬆的粉色長捲髮', rarity: 'SR', starter: true },
  },
  outfit: {
    base:    { id: 'pd_outfit_base', name: '素體', desc: '未著裝（檢視體型用）', rarity: 'N', starter: true, randomizable: false },
    uniform: { id: 'pd_outfit_uniform', name: '見習制服', desc: '星紋斗篷制服與短靴', rarity: 'N', starter: true },
    dress:   { id: 'pd_outfit_dress', name: '公主紗裙', desc: '星紗澎裙與銀色瑪莉珍鞋', rarity: 'SR', starter: true },
  },
  prop: {
    wand:    { id: 'pd_prop_wand', name: '星光魔杖', desc: '星星尖端會閃爍灑星光', rarity: 'N', starter: true },
    book:    { id: 'pd_prop_book', name: '魔法書', desc: '插著羽毛筆的皮革魔導書', rarity: 'R', starter: true },
    crystal: { id: 'pd_prop_crystal', name: '發光水晶杖', desc: '青藍水晶球散發柔光', rarity: 'SR', starter: true },
  },
  background: {
    plaza: { id: 'pd_bg_plaza', name: '星光學院廣場', desc: '黃昏石板廣場與星空，百搭場景', rarity: 'N', starter: true },
    plain: { id: 'pd_bg_plain', name: '素色舞台', desc: '乾淨的水彩素色背景', rarity: 'N', starter: true },
  },
  action: {
    stand: { id: 'pd_action_stand', name: '站姿', desc: '基本站姿（呼吸＋眨眼）', rarity: 'N', starter: true },
    cast:  {
      id: 'pd_action_cast', name: '施法', desc: '舉杖施法、星光爆發的動作', rarity: 'SR', starter: true,
      compatibleCombos: ['twin-uniform-wand'],
    },
  },
  headwear: {
    none: { id: 'pd_headwear_none', name: '不戴帽子', desc: '保留目前髮型', rarity: 'N', starter: true },
    starBeret: {
      id: 'pd_headwear_star_beret', name: '星院畫家帽', desc: '玫瑰粉星徽貝雷帽', rarity: 'R', starter: true,
      asset: starBeret, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
    savingCrown: {
      id: 'pd_headwear_saving_crown', name: '守財小王冠', desc: '月度預算守護者的金冠', rarity: 'SR', starter: false,
      asset: savingCrown, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
    mintRangerCap: {
      id: 'pd_headwear_mint_ranger_cap', name: '薄荷巡遊帽', desc: '帶星羅盤徽章的學院巡遊帽', rarity: 'R', starter: false,
      asset: mintRangerCap, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
    moonWitchHat: {
      id: 'pd_headwear_moon_witch_hat', name: '月影小魔女帽', desc: '綴著月星吊飾的柔紫尖帽', rarity: 'SR', starter: false,
      asset: moonWitchHat, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
  },
  faceAccessory: {
    none: { id: 'pd_face_none', name: '不戴配件', desc: '露出主角表情', rarity: 'N', starter: true },
    moonGlasses: {
      id: 'pd_face_moon_glasses', name: '月讀圓框眼鏡', desc: '帶星光鏡鏈的學院圓框', rarity: 'R', starter: true,
      asset: moonGlasses, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
    mintSquareGlasses: {
      id: 'pd_face_mint_square_glasses', name: '薄荷算式眼鏡', desc: '金邊薄荷色的圓角方框', rarity: 'R', starter: false,
      asset: mintSquareGlasses, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
    sunsetHeartGlasses: {
      id: 'pd_face_sunset_heart_glasses', name: '晚霞心語眼鏡', desc: '珊瑚金漸層的心形鏡框', rarity: 'SR', starter: false,
      asset: sunsetHeartGlasses, layer: 'front', compatibleOutfits: ['uniform', 'dress'],
    },
  },
  backAccessory: {
    none: { id: 'pd_back_none', name: '無背部配件', desc: '保持簡潔輪廓', rarity: 'N', starter: true },
    budgetWings: {
      id: 'pd_back_budget_wings', name: '預算守護翼', desc: '薄荷與星術紫交織的守護翅膀', rarity: 'SR', starter: false,
      asset: budgetWings, layer: 'back', compatibleOutfits: ['uniform', 'dress'],
    },
    moonHalo: {
      id: 'pd_back_moon_halo', name: '月帳星環', desc: '月光與星圖構成的背後光環', rarity: 'SR', starter: false,
      asset: moonHalo, layer: 'back', compatibleOutfits: ['uniform', 'dress'],
    },
    ledgerRibbonBow: {
      id: 'pd_back_ledger_ribbon_bow', name: '帳本緞帶結', desc: '酒紅與奶油金交織的大緞帶', rarity: 'R', starter: false,
      asset: ledgerRibbonBow, layer: 'back', compatibleOutfits: ['uniform', 'dress'],
    },
  },
  companion: {
    none: { id: 'pd_companion_none', name: '獨自冒險', desc: '暫時不帶夥伴', rarity: 'N', starter: true },
    coinSprite: {
      id: 'pd_companion_coin_sprite', name: '金幣精靈', desc: '喜歡靠近每日預算的小夥伴', rarity: 'R', starter: true,
      asset: coinSprite, layer: 'companion', compatibleOutfits: ['uniform', 'dress'],
    },
    ledgerOwl: {
      id: 'pd_companion_ledger_owl', name: '帳本貓頭鷹', desc: '幫忙看守支出紀錄的夜行夥伴', rarity: 'SR', starter: false,
      asset: ledgerOwl, layer: 'companion', compatibleOutfits: ['uniform', 'dress'],
    },
    savingsPig: {
      id: 'pd_companion_savings_pig', name: '存錢小豬', desc: '會守住零用預算的薄荷小夥伴', rarity: 'R', starter: false,
      asset: savingsPig, layer: 'companion', compatibleOutfits: ['uniform', 'dress'],
    },
    receiptCat: {
      id: 'pd_companion_receipt_cat', name: '收據信差貓', desc: '帶著空白收據卷的記帳信差', rarity: 'SR', starter: false,
      asset: receiptCat, layer: 'companion', compatibleOutfits: ['uniform', 'dress'],
    },
  },
}

export const DEFAULT_APPEARANCE = Object.freeze({
  hair: 'twin',
  outfit: 'uniform',
  prop: 'wand',
  action: 'stand',
  background: 'plaza',
  headwear: 'none',
  faceAccessory: 'none',
  backAccessory: 'none',
  companion: 'coinSprite',
})

// （髮型-服裝-道具）→ 該組合的圖組。idle 為影片抽幀動畫（自帶眨眼），優先於靜態 image。
// 「空手」暫以同組合拿魔杖的圖代替 → 未生成的組合 fallback 規則見 resolveCombo。
const COMBOS = {
  'twin-uniform-wand':    { image: twinUniformWand, blink: twinUniformWandBlink, happy: twinUniformWandHappy, idle: twinUniformWandIdle },
  'twin-uniform-book': { image: twinUniformBook, blink: twinUniformBookBlink, happy: twinUniformBookHappy, idle: twinUniformBookIdle },
  'twin-uniform-crystal': { image: twinUniformCrystal, blink: twinUniformCrystalBlink, happy: twinUniformCrystalHappy, idle: twinUniformCrystalIdle },
  'twin-dress-wand': { image: twinDressWand, blink: twinDressWandBlink, happy: twinDressWandHappy, idle: twinDressWandIdle },
  'twin-dress-book': { image: twinDressBook, blink: twinDressBookBlink, happy: twinDressBookHappy, idle: twinDressBookIdle },
  'twin-dress-crystal': { image: twinDressCrystal, blink: twinDressCrystalBlink, happy: twinDressCrystalHappy, idle: twinDressCrystalIdle },
  'pink-uniform-wand': { image: pinkUniformWand, blink: pinkUniformWandBlink, happy: pinkUniformWandHappy },
  'pink-uniform-book': { image: pinkUniformBook, blink: pinkUniformBookBlink, happy: pinkUniformBookHappy },
  'pink-uniform-crystal': { image: pinkUniformCrystal, blink: pinkUniformCrystalBlink, happy: pinkUniformCrystalHappy },
  'pink-dress-wand': { image: pinkDressWand, blink: pinkDressWandBlink, happy: pinkDressWandHappy, idle: pinkDressWandIdle },
  'pink-dress-book': { image: pinkDressBook, blink: pinkDressBookBlink, happy: pinkDressBookHappy, idle: pinkDressBookIdle },
  'pink-dress-crystal': { image: pinkDressCrystal, blink: pinkDressCrystalBlink, happy: pinkDressCrystalHappy, idle: pinkDressCrystalIdle },
}

const BACKGROUNDS = {
  plaza: { bg: plazaBg, bgTheme: 'plaza' },
  plain: { bg: plainBg, bgTheme: 'plain' },
}

// 動作動畫（影片抽幀 webp），key = `${hair}-${outfit}-${prop}-${action}`；
// 未生成的（組合×動作）自動退回站姿 — 這是產能排程，不是搭配限制
const ACTION_ANIMS = {
  'twin-uniform-wand-cast': castTwinUniformWand,
}

export function normalizeAppearance(appearance = {}) {
  const next = { ...DEFAULT_APPEARANCE, ...appearance }
  for (const { key } of PAPER_DOLL_SLOTS) {
    if (!PAPER_DOLL_ITEMS[key][next[key]]) next[key] = DEFAULT_APPEARANCE[key]
  }
  if (!isPartCompatible('action', next.action, next)) next.action = DEFAULT_APPEARANCE.action
  return next
}

function coreComboKey(appearance) {
  return `${appearance.hair}-${appearance.outfit}-${appearance.prop}`
}

/** 部件是否能和指定外觀真正成立；不把尚未完成的資產 fallback 算成相容。 */
export function isPartCompatible(slot, key, appearance = {}) {
  const item = PAPER_DOLL_ITEMS[slot]?.[key]
  if (!item) return false
  const candidate = { ...DEFAULT_APPEARANCE, ...appearance, [slot]: key }
  if (item.compatibleOutfits && !item.compatibleOutfits.includes(candidate.outfit)) return false
  if (item.compatibleCombos && !item.compatibleCombos.includes(coreComboKey(candidate))) return false
  return true
}

function resolveCombo({ hair, outfit, prop }) {
  if (outfit === 'base') return { image: baseBody }          // 素體：整張素體圖
  const wanted = `${hair}-${outfit}-${prop}`
  if (COMBOS[wanted]) return COMBOS[wanted]
  // 該組合圖尚未生成時退回預設道具，再退回全預設 — 玩家永遠看得到角色
  return COMBOS[`${hair}-${outfit}-${DEFAULT_APPEARANCE.prop}`] ?? COMBOS['twin-uniform-wand']
}

/** 取得目前外觀要顯示的資產 */
export function getPaperDollAssets(appearance) {
  const a = normalizeAppearance(appearance)
  const combo = resolveCombo(a)
  const { bg, bgTheme } = BACKGROUNDS[a.background] ?? BACKGROUNDS.plaza
  const actionAnim = a.action !== 'stand'
    ? (ACTION_ANIMS[`${a.hair}-${a.outfit}-${a.prop}-${a.action}`] ?? null)
    : null
  const showing = actionAnim ?? combo.idle ?? combo.image
  const isAnim = Boolean(actionAnim ?? combo.idle)
  const layers = PAPER_DOLL_SLOTS
    .filter(slot => slot.overlay)
    .flatMap(({ key: slot }) => {
      const item = PAPER_DOLL_ITEMS[slot]?.[a[slot]]
      if (!item?.asset) return []
      if (item.compatibleOutfits && !item.compatibleOutfits.includes(a.outfit)) return []
      return [{ slot, item, asset: item.asset, layer: item.layer ?? 'front' }]
    })
  return {
    image: showing, // animated webp <img> 會自動播放
    staticImage: combo.image,
    blinkSrc: isAnim ? null : (combo.blink ?? null), // 動畫自帶眨眼
    happySrc: actionAnim ? null : (combo.happy ?? null),
    layers,
    bg,
    bgTheme,
  }
}

/** 部件是否已擁有（starter 或 collection 內有其 id） */
export function isPartOwned(slot, key, collectionIds) {
  const item = PAPER_DOLL_ITEMS[slot]?.[key]
  if (!item) return false
  return item.starter || collectionIds.has(item.id)
}

function ownedCompatibleKeys(slot, appearance, collectionIds, { includeNonRandom = false } = {}) {
  return Object.entries(PAPER_DOLL_ITEMS[slot])
    .filter(([key, item]) => (
      (includeNonRandom || item.randomizable !== false)
      && isPartOwned(slot, key, collectionIds)
      && isPartCompatible(slot, key, appearance)
    ))
    .map(([key]) => key)
}

function randomEntry(items, random) {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))]
}

/** 只用已擁有、相容且有正式資產的部件組出新造型。 */
export function randomizeOwnedAppearance(appearance, collectionIds, random = Math.random) {
  const owned = collectionIds instanceof Set ? collectionIds : new Set(collectionIds ?? [])
  const current = normalizeAppearance(appearance)
  const next = { ...current }

  for (const slot of ['hair', 'outfit', 'prop', 'background']) {
    const choices = ownedCompatibleKeys(slot, next, owned)
    if (choices.length) next[slot] = randomEntry(choices, random)
  }

  const actions = ownedCompatibleKeys('action', next, owned)
  next.action = actions.length ? randomEntry(actions, random) : DEFAULT_APPEARANCE.action

  for (const slot of ['headwear', 'faceAccessory', 'backAccessory', 'companion']) {
    const choices = ownedCompatibleKeys(slot, next, owned, { includeNonRandom: true })
    if (choices.length) next[slot] = randomEntry(choices, random)
  }

  const normalized = normalizeAppearance(next)
  if (JSON.stringify(normalized) !== JSON.stringify(current)) return normalized

  // 極端情況下隨機值可能剛好全相同；優先換一個確實有第二選項的槽位。
  for (const slot of PAPER_DOLL_SLOTS.map(item => item.key)) {
    const choices = ownedCompatibleKeys(slot, current, owned)
    const alternative = choices.find(key => key !== current[slot])
    if (alternative) return normalizeAppearance({ ...current, [slot]: alternative })
  }
  return current
}

/** 精確計算玩家目前以正式資產可組出的造型數。 */
export function countOwnedAppearanceCombinations(collectionIds) {
  const owned = collectionIds instanceof Set ? collectionIds : new Set(collectionIds ?? [])
  let total = 0
  const hairKeys = ownedCompatibleKeys('hair', DEFAULT_APPEARANCE, owned)
  const outfitKeys = ownedCompatibleKeys('outfit', DEFAULT_APPEARANCE, owned)
  const propKeys = ownedCompatibleKeys('prop', DEFAULT_APPEARANCE, owned)
  const backgroundCount = ownedCompatibleKeys('background', DEFAULT_APPEARANCE, owned).length

  for (const hair of hairKeys) {
    for (const outfit of outfitKeys) {
      for (const prop of propKeys) {
        const core = { ...DEFAULT_APPEARANCE, hair, outfit, prop }
        const actionCount = ownedCompatibleKeys('action', core, owned).length
        const overlayCount = ['headwear', 'faceAccessory', 'backAccessory', 'companion']
          .map(slot => ownedCompatibleKeys(slot, core, owned, { includeNonRandom: true }).length)
          .reduce((product, count) => product * count, 1)
        total += actionCount * backgroundCount * overlayCount
      }
    }
  }
  return total
}

/** 給商店用：部件 id → { slot, key, item } */
export function findPartById(id) {
  for (const { key: slot } of PAPER_DOLL_SLOTS) {
    for (const [key, item] of Object.entries(PAPER_DOLL_ITEMS[slot])) {
      if (item.id === id) return { slot, key, item }
    }
  }
  return null
}
