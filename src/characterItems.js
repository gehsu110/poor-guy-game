export const CHARACTER_SLOTS = Object.freeze([
  'aura', 'back', 'body', 'outfit', 'hairBack', 'head', 'hairFront',
  'headwear', 'handLeft', 'handRight', 'front',
])

export const DEFAULT_EQUIPMENT = Object.freeze({
  aura: 'none',
  back: 'none',
  body: 'body_default',
  outfit: 'academy',
  hairBack: 'academy_hair_back',
  head: 'face_default',
  hairFront: 'academy_hair_front',
  headwear: 'star_pin',
  handLeft: 'none',
  handRight: 'none',
  front: 'none',
})

// 資產完成後只需補上 girlAsset / boyAsset，不必改裝備資料結構。
export const CHARACTER_ITEMS = Object.freeze({
  star_pin: {
    id: 'star_pin', slot: 'headwear', name: '見習星徽', rarity: 'common',
    source: { type: 'starter' }, girlAsset: null, boyAsset: null,
  },
  budget_wand: {
    id: 'budget_wand', slot: 'handRight', name: '預算星杖', rarity: 'rare',
    source: { type: 'mission', missionId: 'keep_budget_7_days' }, girlAsset: budgetWand, boyAsset: null,
  },
  ledger_book: {
    id: 'ledger_book', slot: 'handLeft', name: '會發光的帳本', rarity: 'rare',
    source: { type: 'mission', missionId: 'record_30_entries' }, girlAsset: ledgerBook, boyAsset: null,
  },
  saving_crown: {
    id: 'saving_crown', slot: 'headwear', name: '守財小王冠', rarity: 'epic',
    source: { type: 'achievement', achievementId: 'monthly_s_rank' }, girlAsset: savingCrown, boyAsset: null,
  },
})

export function normalizeEquipment(equipped = {}) {
  const legacy = {
    outfit: equipped.outfit,
    headwear: equipped.accessory,
  }
  return { ...DEFAULT_EQUIPMENT, ...legacy, ...equipped }
}

export function getEquippedLayers(equipped, gender = 'girl') {
  const normalized = normalizeEquipment(equipped)
  return CHARACTER_SLOTS.flatMap(slot => {
    const item = CHARACTER_ITEMS[normalized[slot]]
    if (!item) return []
    const asset = gender === 'boy' ? item.boyAsset : item.girlAsset
    return asset ? [{ slot, item, asset }] : []
  })
}
import savingCrown from './assets/character-items/saving-crown.svg'
import ledgerBook from './assets/character-items/ledger-book.svg'
import budgetWand from './assets/character-items/budget-wand.svg'
