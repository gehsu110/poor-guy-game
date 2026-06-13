// ─── 怪物生成 ─────────────────────────────────────────────────────────────────

const MONSTER_POOL = [
  // 平日怪 (平日, 簡單)
  { id: 'slime',    name: '消費史萊姆',   emoji: '🫧', color: '#A8D8EA', maxHpColor: '#7EC8E3', tier: 'normal' },
  { id: 'rabbit',   name: '帳單兔兔',     emoji: '🐰', color: '#FFB3C6', maxHpColor: '#FF8FA3', tier: 'normal' },
  { id: 'mushroom', name: '零食蘑菇',     emoji: '🍄', color: '#A8E6CF', maxHpColor: '#69D2A8', tier: 'normal' },
  { id: 'coin',     name: '金幣精靈',     emoji: '🪙', color: '#FFE4A0', maxHpColor: '#FFD060', tier: 'normal' },
  { id: 'cat',      name: '慵懶貓貓獸',   emoji: '🐱', color: '#FFCBA4', maxHpColor: '#FFA97A', tier: 'normal' },
  // 週末 Boss
  { id: 'weekend',  name: '週末誘惑魔',   emoji: '🛍️', color: '#C8A8E9', maxHpColor: '#A87DE0', tier: 'weekend' },
  { id: 'sunday',   name: '享樂大魔王',   emoji: '🍔', color: '#FFB3C6', maxHpColor: '#FF6B9D', tier: 'boss' },
  // 月底
  { id: 'month',    name: '月底壓力龍',   emoji: '🐉', color: '#C8A8E9', maxHpColor: '#7B5EA7', tier: 'monthboss' },
]

/**
 * 依日期決定怪物與 HP 係數
 * @param {string} dateStr  YYYY-MM-DD
 * @param {number} budget   今日預算
 */
export function generateDayMonster(dateStr, budget) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const dow = d.getDay() // 0=Sun, 6=Sat
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

  let tier = 'normal'
  let coeff = 1.0

  // 月底壓力區
  const daysLeft = daysInMonth - day
  if (daysLeft === 0) {
    tier = 'monthboss'; coeff = 1.8
  } else if (daysLeft <= 4) {
    const monthCoeffs = [1.5, 1.4, 1.3, 1.2, 1.1]
    coeff = monthCoeffs[daysLeft] ?? 1.1
    tier = 'normal'
  }

  // 週末
  if (dow === 0 && tier !== 'monthboss') { tier = 'boss';    coeff = Math.max(coeff, 1.35) + (daysLeft <= 4 ? 0.1 : 0) }
  if (dow === 6 && tier !== 'monthboss') { tier = 'weekend'; coeff = Math.max(coeff, 1.20) + (daysLeft <= 4 ? 0.1 : 0) }

  coeff = Math.min(coeff, 1.8)

  const pool = MONSTER_POOL.filter(m => {
    if (tier === 'monthboss') return m.tier === 'monthboss'
    if (tier === 'boss')      return m.tier === 'boss'
    if (tier === 'weekend')   return m.tier === 'weekend'
    return m.tier === 'normal'
  })

  // 依日期固定怪物種類（不隨機，確保同一天看同一隻）
  const monster = pool[day % pool.length] ?? MONSTER_POOL[0]

  return {
    ...monster,
    tier,
    hp: Math.round(budget * coeff),
    maxHp: Math.round(budget * coeff),
    coeff,
  }
}

// ─── 傷害計算 ─────────────────────────────────────────────────────────────────

/**
 * 計算本次攻擊傷害
 * @param {number} amount         本筆消費金額
 * @param {number} todayTotal     今日累積支出（不含本筆）
 * @param {number} budget         今日預算
 */
export function calcDamage(amount, todayTotal, budget) {
  const usage = budget > 0 ? todayTotal / budget : 0
  let mult = 1.0
  if (usage < 0.50) mult = 1.2
  else if (usage < 0.85) mult = 1.0
  else if (usage < 1.00) mult = 0.7
  else if (usage < 1.20) mult = 0.35
  else if (usage < 1.50) mult = 0.15
  else mult = 0.05

  const dmg = Math.round(amount * mult)
  return { damage: dmg, mult }
}

/**
 * 日結算最後一擊
 */
export function calcFinalBlow(spent, budget) {
  const remaining = budget - spent
  if (remaining <= 0) return 0
  return Math.round(remaining * 1.0)
}

// ─── 評級 ─────────────────────────────────────────────────────────────────────

export function calcRating(spent, budget, entryCount) {
  const usage = budget > 0 ? spent / budget : 999
  if (usage <= 0.5 && entryCount >= 3) return 'S'
  if (usage <= 1.0 && entryCount >= 3) return 'A'
  if (usage <= 1.0) return 'B'
  return 'C'
}

export const RATING_REWARDS = {
  S: { yellow: 0, purple: 1, ticket: 1, exp: 60 },
  A: { yellow: 3, purple: 0, ticket: 1, exp: 40 },
  B: { yellow: 2, purple: 0, ticket: 0, exp: 25 },
  C: { yellow: 1, purple: 0, ticket: 0, exp: 10 },
}

// ─── 稱號表 ─────────────────────────────────────────────────────────────────────

export const TITLES = [
  { minLv: 1,  name: '菜鳥冒險者',   desc: '剛開始記帳的你' },
  { minLv: 5,  name: '記帳新秀',     desc: '開始養成習慣' },
  { minLv: 10, name: '預算守門人',   desc: '穩定控制支出' },
  { minLv: 15, name: '消費剋星',     desc: '讓怪物聞風喪膽' },
  { minLv: 20, name: '月底倖存者',   desc: '撐過無數月末壓力' },
  { minLv: 30, name: '財務鐵壁',     desc: '超支？不存在的' },
  { minLv: 40, name: '傳說記帳師',   desc: '達到巔峰境界' },
  { minLv: 50, name: '✨ 理財聖賢',  desc: '滿等，真神' },
]

export function getTitle(level) {
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (level >= TITLES[i].minLv) return TITLES[i]
  }
  return TITLES[0]
}

// ─── 分類 ─────────────────────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  { id: 'food',      label: '餐飲',   emoji: '🍱', color: '#FFB3C6' },
  { id: 'transport', label: '交通',   emoji: '🚌', color: '#A8D8EA' },
  { id: 'shopping',  label: '購物',   emoji: '🛍️', color: '#C8A8E9' },
  { id: 'entertain', label: '娛樂',   emoji: '🎮', color: '#A8E6CF' },
  { id: 'health',    label: '醫療',   emoji: '💊', color: '#FFE4A0' },
  { id: 'daily',     label: '日用',   emoji: '🧴', color: '#FFCBA4' },
  { id: 'edu',       label: '學習',   emoji: '📚', color: '#B8E0FF' },
  { id: 'other',     label: '其他',   emoji: '✨', color: '#E8E8E8' },
]

// ─── 工具 ─────────────────────────────────────────────────────────────────────

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function formatMoney(n) {
  return n.toLocaleString('zh-TW')
}
