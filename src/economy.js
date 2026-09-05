export function currencyFromState(stars = {}, tickets = {}) {
  return { yellow: stars.yellow ?? 0, purple: stars.purple ?? 0, normalTicket: tickets.normal ?? 0, goldTicket: tickets.gold ?? 0 }
}
export function hasResources(resources, cost = {}) {
  return Object.entries(cost).every(([key, value]) => Number.isFinite(value) && value >= 0 && (resources[key] ?? 0) >= value)
}
export function applyResourceDelta(stars = {}, tickets = {}, delta = {}, direction = 1) {
  return { stars: { ...stars, yellow: (stars.yellow ?? 0) + direction * (delta.yellow ?? 0), purple: (stars.purple ?? 0) + direction * (delta.purple ?? 0) }, tickets: { ...tickets, normal: (tickets.normal ?? 0) + direction * (delta.normalTicket ?? 0), gold: (tickets.gold ?? 0) + direction * (delta.goldTicket ?? 0) } }
}
function spend(profile, cost) {
  if (!hasResources(currencyFromState(profile.stars, profile.tickets), cost)) throw new Error('收藏資源不足，先完成今日手帳或本週任務。')
  return { ...profile, ...applyResourceDelta(profile.stars, profile.tickets, cost, -1) }
}
export function purchaseItem(profile, item, now = Date.now()) {
  if (item.disabled) throw new Error('這件商品尚未開放。')
  if (!item.reward && profile.collection?.some(entry => entry.id === item.id)) return profile
  const paid = spend(profile, { [item.costType]: item.cost })
  return item.reward
    ? { ...paid, ...applyResourceDelta(paid.stars, paid.tickets, item.reward) }
    : { ...paid, collection: [...(paid.collection ?? []), { id: item.id, rarity: item.rarity, obtainedAt: now, source: 'exchange' }] }
}
export function claimShopSupply(profile, date, item) {
  if (item.disabled) throw new Error('這份補給尚未開放。')
  const claims = profile.shop?.dailySupplyDate === date ? profile.shop.dailySupplyClaims ?? [] : []
  if (claims.includes(item.id)) return profile
  const paid = spend(profile, item.cost)
  return { ...paid, ...applyResourceDelta(paid.stars, paid.tickets, item.reward), shop: { ...profile.shop, dailySupplyDate: date, dailySupplyClaims: [...claims, item.id] } }
}
export function openSupply(profile, results, gold, now = Date.now()) {
  const paid = spend(profile, { [gold ? 'goldTicket' : 'normalTicket']: results.length })
  const owned = new Set((paid.collection ?? []).map(item => item.id))
  const collection = [...(paid.collection ?? [])]
  const duplicates = { yellow: 0, purple: 0 }
  results.forEach((item, index) => {
    if (owned.has(item.id)) {
      if (item.rarity === 'SSR') duplicates.purple++
      else duplicates.yellow += item.rarity === 'SR' ? 2 : 1
    } else {
      owned.add(item.id)
      collection.push({ id: item.id, rarity: item.rarity, obtainedAt: now + index, source: 'supply' })
    }
  })
  return { ...paid, ...applyResourceDelta(paid.stars, paid.tickets, duplicates), collection }
}
