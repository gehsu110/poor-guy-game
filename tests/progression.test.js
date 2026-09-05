import test from 'node:test'
import assert from 'node:assert/strict'
import { calcDamage, calcRating } from '../src/gameLogic.js'
import { parseAmount, calcLevel, combatState, settleRecord, grantReward, weekDates, adventureStats, buildMissions, buildRouteMissions, shiftDate } from '../src/progression.js'
import { createLocalRepository, LOCAL_KEY } from '../src/localRepository.js'
const profile = () => ({ exp: 0, dailyBudget: 1000, stars: { yellow: 0, purple: 0 }, tickets: { normal: 0, gold: 0 }, collection: [], claimedMissions: {} })
const expense = (amount = 100) => ({ id: 'entry', amount, category: 'food', note: '' })
test('amounts reject malformed sums, nonfinite, negatives, oversized and excess decimals', () => {
  for (const value of ['', '10+', '1++2', '1..2+5', '.5', '-1', 'Infinity', 'NaN', '1.234', '10000000', '1e5', '1+bad']) assert.equal(parseAmount(value), null, value)
  assert.equal(parseAmount('12.50 + 37.25'), 49.75)
  assert.equal(parseAmount('0.1+0.2'), .3)
})
test('splitting an expense cannot generate extra damage across budget bands', () => {
  const total = calcDamage(2000, 0, 1000).damage
  let damage = 0
  for (let i = 0; i < 200; i++) damage += calcDamage(10, i * 10, 1000).damage
  assert.equal(Math.round(damage * 100), total * 100)
  assert.equal(total, 1195)
  assert.equal(calcDamage(1e6, 0, 1000).mult < .1, true)
})
test('rating rewards a truthful single entry instead of requiring artificial splitting', () => {
  assert.equal(calcRating(100, 1000, 1), 'S')
  assert.equal(calcRating(900, 1000, 1), 'A')
  assert.equal(calcRating(1001, 1000, 8), 'C')
})
test('editing a defeated day replays combat instead of preserving stale zero HP', () => {
  const before = combatState('2026-09-01', 1000, [expense(1500)], { defeated: true })
  const after = combatState('2026-09-01', 1000, [expense(10)], { defeated: true })
  assert.equal(before.currentHp, 0)
  assert.equal(after.currentHp, 988)
})
test('day snapshot budget survives later budget changes', () => {
  const result = settleRecord('2026-09-01', { ...profile(), dailyBudget: 100 }, [expense(400)], { budget: 1000 })
  assert.equal(result.record.rating, 'S')
  assert.equal(result.record.defeated, true)
})
test('zero-spend confirmation defeats even the month boss at settlement', () => {
  const result = settleRecord('2026-09-30', profile(), [], { budget: 1000, noSpend: true })
  assert.equal(result.record.defeated, true)
  assert.equal(result.record.spent, 0)
  assert.equal(result.profile.tickets.normal, 3)
})
test('settlement is idempotent and an empty or backfilled day yields no reward', () => {
  const first = settleRecord('2026-09-05', profile(), [expense()], { budget: 1000 })
  const again = settleRecord('2026-09-05', first.profile, [expense()], first.record)
  assert.deepEqual(first.profile, again.profile)
  assert.equal(settleRecord('2026-09-04', profile(), [], {}).profile.exp, 0)
  assert.equal(settleRecord('2026-09-04', profile(), [expense()], { backfilled: true }).profile.exp, 0)
})
test('weekly period handles month/year boundaries and resets independently of streak', () => {
  assert.deepEqual(weekDates('2027-01-01'), ['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03'])
  const records = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [shiftDate('2026-08-24', i), { spent: 20 }]))
  assert.equal(adventureStats(records, '2026-08-31').weekDays, 0)
  assert.equal(adventureStats(records, '2026-08-31').streak, 7)
  assert.equal(adventureStats(records, '2026-09-01').streak, 0)
  assert.equal(adventureStats(records, '2026-09-01').totalDays, 7)
})
test('backfill cannot unlock daily, weekly, chapter or lifetime rewards', () => {
  const records = { '2026-09-01': { backfilled: true, spent: 10 }, '2026-09-02': { noSpend: true }, '2026-09-03': { recordedOnTime: true, backfilled: true, spent: 20 } }
  assert.equal(adventureStats(records, '2026-09-05').totalDays, 2)
  assert.equal(buildRouteMissions(records, '2026-09-05')[0].progress, 2)
})
test('new entries invalidate review until the ledger is confirmed again', () => {
  const state = { date: '2026-09-05', profile: profile(), expenses: [expense()], dayRecords: {}, dayRecord: { recordedOnTime: true, reviewedAt: 123, reviewedEntryCount: 0, mapVisited: true } }
  assert.equal(buildMissions(state).chest.progress, 2)
  state.dayRecord.reviewedEntryCount = 1
  assert.equal(buildMissions(state).chest.progress, 3)
})
test('daily and weekly keys reset while a collection milestone can only be claimed once', () => {
  const state = { date: '2026-09-05', profile: profile(), expenses: [], dayRecords: {}, dayRecord: {} }
  const first = buildMissions(state), next = buildMissions({ ...state, date: '2026-09-07' })
  assert.notEqual(first.daily[0].key, next.daily[0].key)
  assert.notEqual(first.weekly[0].key, next.weekly[0].key)
  assert.equal(first.journey[0].key, next.journey[0].key)
  const reward = { exp: 60, collectionItem: { id: 'pet', rarity: 'R' } }
  const claimed = grantReward(profile(), reward, 'journey_3')
  assert.deepEqual(grantReward(claimed, reward, 'journey_3'), claimed)
  assert.equal(grantReward(claimed, reward, 'another').collection.length, 1)
})
test('growth reaches level 50 without invalid progress bars', () => {
  assert.deepEqual(calcLevel(100), { level: 2, expInLevel: 0, expToNext: 120 })
  assert.equal(calcLevel(14000).level > 21, true)
  assert.deepEqual(calcLevel(1e7), { level: 50, expInLevel: 0, expToNext: 0 })
})
function memoryStorage() {
  const entries = new Map()
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }
}
test('local profiles, ledger and day markers survive repository recreation', () => {
  const storage = memoryStorage()
  createLocalRepository(storage).mutate(data => { data.profile = profile(); data.expenses.push(expense()); data.days['2026-09-05'] = { noSpend: false, recordedOnTime: true } })
  const restored = createLocalRepository(storage).read()
  assert.equal(restored.expenses[0].amount, 100)
  assert.equal(restored.days['2026-09-05'].recordedOnTime, true)
})
test('corrupt or unwritable storage never silently clears an existing save', () => {
  const storage = memoryStorage()
  storage.setItem(LOCAL_KEY, 'broken')
  assert.throws(() => createLocalRepository(storage).mutate(data => { data.profile = profile() }), /無法讀取/)
  assert.equal(storage.getItem(LOCAL_KEY), 'broken')
  assert.throws(() => createLocalRepository({ getItem: () => null, setItem: () => { throw new Error('quota') } }).mutate(() => {}), /儲存空間不足/)
})
