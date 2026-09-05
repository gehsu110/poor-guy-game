import test from 'node:test'
import assert from 'node:assert/strict'
import { createLocalRepository, commitLocalExpense, commitLocalGame, withLocalLock } from '../src/localRepository.js'
import { grantReward, settleRecord } from '../src/progression.js'
function fixture() {
  const memory = new Map()
  const repo = createLocalRepository({ getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) })
  repo.mutate(data => { data.profile = { exp: 0, dailyBudget: 500, stars: { yellow: 0 }, tickets: { normal: 0 }, claimedMissions: {}, collection: [] } })
  return repo
}
test('ledger and day snapshot commit together; stale writes cannot duplicate a purchase', () => {
  const repo = fixture()
  const expense = { id: 'entry', date: '2026-09-05', amount: 120, category: 'food' }
  commitLocalExpense(repo, expense.date, { type: 'add', expense }, { budget: 500, spent: 120, entryCount: 1 }, 0)
  assert.equal(repo.read().expenses.length, 1)
  assert.equal(repo.read().days[expense.date].revision, 1)
  assert.throws(() => commitLocalExpense(repo, expense.date, { type: 'add', expense: { ...expense, id: 'duplicate' } }, { spent: 240 }, 0), /帳本剛剛有更新/)
  assert.equal(repo.read().expenses.length, 1)
  commitLocalExpense(repo, expense.date, { type: 'update', expense: { ...expense, amount: 75 } }, { budget: 500, spent: 75, entryCount: 1 }, 1)
  assert.equal(repo.read().expenses[0].amount, 75)
  commitLocalExpense(repo, expense.date, { type: 'delete', id: expense.id }, { budget: 500, spent: 0, entryCount: 0 }, 2)
  assert.equal(repo.read().expenses.length, 0)
  assert.equal(repo.read().days[expense.date].revision, 3)
})
test('simultaneous repeated reward claims credit exactly once', async () => {
  const repo = fixture()
  const reward = { exp: 100, yellow: 2, collectionItem: { id: 'test-owl', rarity: 'SR' } }
  const claim = () => withLocalLock(() => commitLocalGame(repo, '2026-09-05', (profile, record) => ({ profile: grantReward(profile, reward, 'test-reward'), record })))
  await Promise.all([claim(), claim()])
  assert.equal(repo.read().profile.exp, 100)
  assert.equal(repo.read().profile.stars.yellow, 2)
  assert.equal(repo.read().profile.collection.length, 1)
})
test('settlement and reward marker are durable in one commit', () => {
  const repo = fixture()
  repo.mutate(data => { data.days['2026-08-31'] = { budget: 500, noSpend: true } })
  commitLocalGame(repo, '2026-08-31', (profile, record) => settleRecord('2026-08-31', profile, [], record))
  const saved = repo.read()
  assert.equal(saved.days['2026-08-31'].settled, true)
  assert.equal(saved.days['2026-08-31'].defeated, true)
  assert.equal(saved.profile.claimedMissions['settlement:2026-08-31'], true)
  assert.equal(saved.profile.tickets.normal, 3)
})
