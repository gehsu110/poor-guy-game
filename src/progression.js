import { buildQixiActivityMissions } from './events/qixi2026.js'
import { calcDamage, calcFinalBlow, calcRating, generateDayMonster, getTitle, RATING_REWARDS } from './gameLogic.js'

export const MAX_AMOUNT = 9999999
export function parseAmount(value) {
  const text = String(value).trim()
  if (!/^\d+(?:\.\d{1,2})?(?:\s*\+\s*\d+(?:\.\d{1,2})?)*$/.test(text)) return null
  const amount = Math.round(text.split('+').reduce((sum, part) => sum + Number(part), 0) * 100) / 100
  return Number.isFinite(amount) && amount > 0 && amount <= MAX_AMOUNT ? amount : null
}
export function shiftDate(date, days) {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function weekDates(date) {
  const dow = new Date(`${date}T12:00:00`).getDay()
  const monday = shiftDate(date, -((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => shiftDate(monday, index))
}
const EXP_TABLE = [0,100,220,370,550,770,1040,1360,1730,2160,2650,3200,3820,4510,5280,6130,7070,8110,9260,10530,12000]
while (EXP_TABLE.length < 50) {
  const level = EXP_TABLE.length
  EXP_TABLE.push(EXP_TABLE.at(-1) + 1500 + (level - 20) * 150)
}
export function calcLevel(totalExp = 0) {
  const exp = Math.max(0, Number(totalExp) || 0)
  let index = EXP_TABLE.findLastIndex(threshold => exp >= threshold)
  index = Math.max(0, index)
  return { level: index + 1, expInLevel: index === 49 ? 0 : exp - EXP_TABLE[index], expToNext: index === 49 ? 0 : EXP_TABLE[index + 1] - EXP_TABLE[index] }
}
export function grantReward(profile, reward, key) {
  if (profile.claimedMissions?.[key]) return profile
  const exp = (profile.exp ?? 0) + (reward.exp ?? 0)
  const levelInfo = calcLevel(exp)
  const collection = [...(profile.collection ?? [])]
  if (reward.collectionItem && !collection.some(item => item.id === reward.collectionItem.id)) {
    collection.push({ ...reward.collectionItem, obtainedAt: Date.now(), source: '冒險手帳' })
  }
  return { ...profile, exp, ...levelInfo, title: getTitle(levelInfo.level).name,
    stars: { yellow: (profile.stars?.yellow ?? 0) + (reward.yellow ?? 0), purple: (profile.stars?.purple ?? 0) + (reward.purple ?? 0) },
    tickets: { normal: (profile.tickets?.normal ?? 0) + (reward.normalTicket ?? 0), gold: (profile.tickets?.gold ?? 0) + (reward.goldTicket ?? 0) },
    collection, claimedMissions: { ...profile.claimedMissions, [key]: true } }
}
export function combatState(date, budget, expenses, record = {}) {
  const monster = generateDayMonster(date, budget)
  let totalSpent = 0
  let totalDamage = 0
  for (const expense of expenses) {
    const amount = Number(expense.amount) || 0
    if (amount <= 0) continue
    totalDamage += calcDamage(amount, totalSpent, budget).damage
    totalSpent = Math.round((totalSpent + amount) * 100) / 100
  }
  return { monster, maxHp: monster.maxHp, totalSpent, totalDamage,
    currentHp: record.settled && record.defeated ? 0 : Math.max(0, Math.round((monster.maxHp - totalDamage) * 100) / 100), settled: !!record.settled }
}
export function isRecorded(record) {
  return !!record && (record.recordedOnTime === true || (!record.backfilled && (record.entryCount > 0 || record.spent > 0 || record.noSpend === true)))
}
export function adventureStats(records, date) {
  const dates = Object.keys(records).filter(day => day <= date && isRecorded(records[day])).sort()
  const dateSet = new Set(dates)
  let streak = 0
  for (let day = dateSet.has(date) ? date : shiftDate(date, -1); dateSet.has(day); day = shiftDate(day, -1)) streak++
  let longest = 0, run = 0, previous = null
  for (const day of dates) { run = previous && shiftDate(previous, 1) === day ? run + 1 : 1; longest = Math.max(longest, run); previous = day }
  const week = weekDates(date)
  return { totalDays: dates.length, streak, longest, week, weekDays: week.filter(day => day <= date && dateSet.has(day)).length }
}
export function settleRecord(date, profile, expenses, record = {}) {
  if (record.settled) return { profile, record }
  const budget = record.budget ?? profile.dailyBudget ?? 1000
  const combat = combatState(date, budget, expenses)
  const eligible = !record.backfilled && (expenses.some(e => !e.backfilled) || record.noSpend)
  if (!eligible) return { profile, record: { ...record, budget, settled: true, defeated: false, spent: combat.totalSpent, rating: null, rewards: {} } }
  // 零消費與節制同樣能完成討伐；預算餘裕在跨日才轉成最後一擊。
  const finalDamage = combat.totalSpent <= budget ? Math.max(calcFinalBlow(combat.totalSpent, budget), combat.monster.maxHp - combat.totalDamage) : 0
  const defeated = combat.totalDamage + finalDamage >= combat.monster.maxHp
  const rating = calcRating(combat.totalSpent, budget, expenses.length || 1)
  const base = RATING_REWARDS[rating]
  const normalTicket = defeated ? (combat.monster.tier === 'monthboss' ? 3 : combat.monster.tier === 'normal' ? 1 : 2) : 0
  const rewards = { ...base, normalTicket: record.killRewardGranted ? 0 : normalTicket, exp: base.exp + (defeated ? 20 : 0) + (combat.totalSpent <= budget ? 10 : 0) }
  return { profile: grantReward(profile, rewards, `settlement:${date}`), record: { ...record, budget, settled: true, defeated, rating, spent: combat.totalSpent, entryCount: expenses.length, recordedOnTime: true, totalDamage: combat.totalDamage + finalDamage, finalDamage, rewards, killRewardGranted: defeated } }
}

export const JOURNEY = [
  { id: 'journey_1', target: 1, title: '第一頁，啟程', desc: '如實留下第一天的紀錄', reward: { exp: 30, yellow: 2 }, icon: 'tab-record' },
  { id: 'storybook_3', target: 3, title: '圖書館的新朋友', desc: '累積記帳 3 天，遇見薄荷帳本系列的書頁小鴞', reward: { exp: 30, collectionItem: { id: 'storybook_ledger_owl', rarity: 'SR' } }, part: ['storybook', 'owl'] },
  { id: 'journey_3', target: 3, title: '遇見存錢小豬', desc: '累積記帳 3 天，迎接第一位新夥伴', reward: { exp: 60, collectionItem: { id: 'pd_companion_savings_pig', rarity: 'R' } }, part: ['companion', 'savingsPig'] },
  { id: 'journey_7', target: 7, title: '帳本的守夜人', desc: '累積記帳 7 天，貓頭鷹加入冒險', reward: { exp: 100, collectionItem: { id: 'pd_companion_ledger_owl', rarity: 'SR' } }, part: ['companion', 'ledgerOwl'] },
  { id: 'journey_14', target: 14, title: '來自遠方的收據', desc: '累積記帳 14 天，收到信差貓的來信', reward: { exp: 150, collectionItem: { id: 'pd_companion_receipt_cat', rarity: 'SR' } }, part: ['companion', 'receiptCat'] },
  { id: 'journey_30', target: 30, title: '戴上守財之冠', desc: '累積記帳 30 天，留下屬於你的紀念', reward: { exp: 250, goldTicket: 1, collectionItem: { id: 'pd_headwear_saving_crown', rarity: 'SR' } }, part: ['headwear', 'savingCrown'] },
]
export function buildMissions(state) {
  const date = state.date
  const record = state.dayRecord ?? {}
  const stats = adventureStats(state.dayRecords ?? {}, date)
  const reviewed = record.reviewedEntryCount === state.expenses.length && !!record.reviewedAt
  const daily = [
    { id: 'record', title: '留下今天的一頁', desc: '記一筆真實消費，或確認今天零消費', progress: isRecorded(record) ? 1 : 0, target: 1, action: 'battle', icon: 'tab-record', reward: { exp: 15 } },
    { id: 'map', title: '沿著星圖前進', desc: '打開地圖，看看這週走到了哪裡', progress: record.mapVisited ? 1 : 0, target: 1, action: 'map', icon: 'tab-map', reward: { exp: 10 } },
    { id: 'review', title: '把帳本整理好', desc: '在今日明細確認分類與金額無誤', progress: reviewed && isRecorded(record) ? 1 : 0, target: 1, action: 'battle', params: { review: true }, icon: 'report', reward: { exp: 15 } },
  ].map(m => ({ ...m, group: 'daily', key: `daily-v2:${date}:${m.id}` }))
  const weekly = [3, 5, 7].map((target, index) => ({ id: `week_${target}`, group: 'weekly', key: `week-v2:${stats.week[0]}:${target}`, title: ['點亮三枚足跡', '五日星光旅程', '完整一週的約定'][index], desc: `本週一至週日，累積記帳 ${target} 天`, progress: Math.min(stats.weekDays, target), target, icon: 'tab-map', reward: [{ exp: 50, yellow: 2 }, { exp: 80, yellow: 3, purple: 1, normalTicket: 1 }, { exp: 120, purple: 1, normalTicket: 2 }][index] }))
  const journey = JOURNEY.map(m => ({ ...m, key: m.id, group: 'journey', progress: Math.min(stats.totalDays, m.target) }))
  const chest = { id: 'daily_chest', key: `chest-v2:${date}`, group: 'daily', title: '今日手帳禮', desc: '三個小步驟，為今天蓋一枚星章', progress: daily.filter(m => m.progress >= m.target).length, target: 3, reward: { exp: 30, yellow: 2 }, icon: 'tab-supply' }
  const achievements = [
    { id: 'streak_7', title: '七日習慣', desc: '最長連續記帳 7 天', progress: stats.longest, target: 7, reward: { exp: 120, purple: 1 } },
    { id: 'streak_30', title: '月光巡禮', desc: '最長連續記帳 30 天', progress: stats.longest, target: 30, reward: { exp: 360, purple: 3, goldTicket: 1 } },
    { id: 'level_5', title: '見習魔法師', desc: '玩家等級達到 Lv.5', progress: state.profile?.level ?? 1, target: 5, reward: { exp: 120, normalTicket: 2 } },
    { id: 'collector_5', title: '學院收藏家', desc: '收藏品達 5 件', progress: new Set(state.profile?.collection?.map(item => item.id)).size, target: 5, reward: { exp: 100, yellow: 3 } },
  ].map(m => ({ ...m, key: m.id, group: 'achievement', progress: Math.min(m.progress, m.target) }))
  const activities = buildQixiActivityMissions(state).map(m => ({ ...m, key: m.id }))
  return { daily, weekly, journey, chest, stats, achievements, activities }
}
export function buildRouteMissions(records, date) {
  const month = date.slice(0, 7)
  const daysInMonth = new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0).getDate()
  return [[1,7],[8,14],[15,21],[22,daysInMonth]].map(([start,end], index) => {
    const dates = Array.from({ length: end - start + 1 }, (_, i) => `${month}-${String(start + i).padStart(2,'0')}`)
    return { id: `route_${index}`, key: `map-week-${index + 1}-${dates[0]}`, title: `第 ${index + 1} 區遠征完成`, progress: dates.filter(day => day <= date && isRecorded(records[day])).length, target: dates.length, reward: [{ exp: 80, yellow: 3, purple: 1, normalTicket: 1 },{ exp: 100, yellow: 4, normalTicket: 1 },{ exp: 120, yellow: 5, purple: 1 },{ exp: 160, yellow: 6, normalTicket: 2 }][index] }
  })
}
