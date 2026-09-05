import test from 'node:test'
import assert from 'node:assert/strict'
import { purchaseItem, claimShopSupply, openSupply } from '../src/economy.js'
import { createLocalRepository, commitLocalGame } from '../src/localRepository.js'
const profile = () => ({ stars: { yellow: 20, purple: 2 }, tickets: { normal: 3, gold: 1 }, collection: [], shop: {} })
const item = { id: 'shirt', costType: 'yellow', cost: 12, rarity: 'R' }
test('a collectible purchase deducts once even when another tab repeats the purchase', () => {
  const first = purchaseItem(profile(), item)
  assert.equal(first.stars.yellow, 8)
  assert.deepEqual(purchaseItem(first, item), first)
  assert.throws(() => purchaseItem(first, { ...item, id: 'other' }), /不足/)
  assert.equal(first.stars.yellow, 8)
})
test('daily supply is idempotent and resets on the next date', () => {
  const supply = { id: 'daily_yellow', reward: { yellow: 1 } }
  const first = claimShopSupply(profile(), '2026-09-05', supply)
  assert.equal(first.stars.yellow, 21)
  assert.equal(claimShopSupply(first, '2026-09-05', supply).stars.yellow, 21)
  assert.equal(claimShopSupply(first, '2026-09-06', supply).stars.yellow, 22)
})
test('supply duplicates credit compensation with no negative tickets or duplicate items', () => {
  const prize = { id: 'title', rarity: 'SR' }
  const opened = openSupply(profile(), [prize, prize], false)
  assert.equal(opened.tickets.normal, 1)
  assert.equal(opened.stars.yellow, 22)
  assert.equal(opened.collection.length, 1)
  assert.throws(() => openSupply(opened, [prize, prize], false), /不足/)
})
test('failed purchase storage does not lose currencies or report ownership', () => {
  let raw, blocked = false
  const repo = createLocalRepository({ getItem: () => raw, setItem: (_, value) => { if (blocked) throw new Error('quota'); raw = value } })
  repo.mutate(data => { data.profile = profile() })
  blocked = true
  assert.throws(() => commitLocalGame(repo, '2026-09-06', (fresh, record) => ({ profile: purchaseItem(fresh, item), record })), /無法寫入/)
  assert.equal(repo.read().profile.stars.yellow, 20)
  assert.equal(repo.read().profile.collection.length, 0)
})

test('changing a storybook outfit preserves the independent companion and old appearance', async () => {
  const { equipStorybookParts, STORYBOOK_OWL_ID, STORYBOOK_OUTFITS } = await import('../src/storybookCatalog.js')
  const base = { ...profile(), equipped: { appearance: { hair: 'pink' }, storybookCompanion: STORYBOOK_OWL_ID }, collection: [{ id: STORYBOOK_OWL_ID }, { id: STORYBOOK_OUTFITS.star.id }] }
  const dressed = equipStorybookParts(base, { storybookOutfit: 'star' })
  assert.equal(dressed.equipped.storybookOutfit, 'star')
  assert.equal(dressed.equipped.storybookCompanion, STORYBOOK_OWL_ID)
  assert.deepEqual(dressed.equipped.appearance, { hair: 'pink' })
  assert.throws(() => equipStorybookParts(profile(), { storybookOutfit: 'star' }), /先收藏/)
  const alone = equipStorybookParts(dressed, { storybookCompanion: null })
  assert.equal(alone.equipped.storybookOutfit, 'star')
  assert.equal(alone.equipped.storybookCompanion, null)
})
