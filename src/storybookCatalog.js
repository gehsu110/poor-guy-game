export const STORYBOOK_SET_ID = 'storybook_apprentice'
export const STORYBOOK_OWL_ID = 'storybook_ledger_owl'
export const STORYBOOK_OUTFITS = {
  mint: { id: STORYBOOK_SET_ID, name: '薄荷學徒裝', desc: '薄荷斗篷與隨身帳本，免費的第一件冒險服。', rarity: 'N', costType: 'yellow', cost: 0, type: 'storybookOutfit', key: 'mint' },
  star: { id: 'storybook_star_uniform', name: '晚星制服', desc: '星繡短外套、海軍領與百褶褲裙；附寫帳與招呼動作。', rarity: 'R', costType: 'yellow', cost: 12, type: 'storybookOutfit', key: 'star' },
}
export const STORYBOOK_ITEMS = {
  owl: { id: STORYBOOK_OWL_ID, name: '書頁小鴞', desc: '披著薄荷斗篷的圖書館小夥伴，替你珍藏每一天。', rarity: 'SR', series: '薄荷帳本' },
}
export const isStorybook = profile => profile?.equipped?.visualStyle !== 'classic'
export function equipStorybookParts(profile, parts) {
  const outfit = STORYBOOK_OUTFITS[parts.storybookOutfit ?? profile.equipped?.storybookOutfit ?? 'mint']
  if (!outfit || (outfit.key !== 'mint' && !profile.collection?.some(item => item.id === outfit.id))) throw new Error('請先收藏這件衣服。')
  const companion = parts.storybookCompanion === undefined ? profile.equipped?.storybookCompanion : parts.storybookCompanion
  if (companion && !profile.collection?.some(item => item.id === companion)) throw new Error('請先在冒險手帳領取這位夥伴。')
  return { ...profile, equipped: { ...profile.equipped, visualStyle: 'storybook', storybookOutfit: outfit.key, storybookCompanion: companion ?? null } }
}
