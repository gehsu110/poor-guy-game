export const SLOTS = [
  { id: "hair", label: "髮型" },
  { id: "top", label: "上衣" },
  { id: "bottom", label: "下身" },
  { id: "hat", label: "帽飾" },
  { id: "prop", label: "手持" },
  { id: "companion", label: "夥伴" },
  { id: "garden", label: "庭院" },
];
export const ITEMS = [
  {
    id: "hair_chestnut",
    slot: "hair",
    name: "栗色短髮",
    look: "short",
    starter: true,
    desc: "被庭院微風吹亂的柔軟短髮。",
  },
  {
    id: "hair_braid",
    slot: "hair",
    name: "可可雙辮",
    look: "braid",
    starter: true,
    desc: "繫上小緞帶，帶著好心情出門。",
  },
  {
    id: "top_mint",
    slot: "top",
    name: "薄荷學徒裝",
    artReady: true,
    look: "mint",
    starter: true,
    desc: "奶油領口與薄荷短斗篷，冒險的第一件衣服。",
  },
  {
    id: "top_courier",
    slot: "top",
    name: "晨光郵差衫",
    look: "courier",
    source: "完成第 1 段旅程",
    node: 1,
    desc: "杏色背心、翻領與小口袋，替你裝好新的故事。",
  },
  {
    id: "top_starlight",
    slot: "top",
    name: "晚星制服",
    artReady: true,
    look: "star",
    cost: 12,
    desc: "星繡外套、海軍領與百褶褲裙，附寫帳與招呼動作的完整套裝。",
  },
  {
    id: "bottom_shorts",
    slot: "bottom",
    name: "靛藍短褲",
    look: "shorts",
    starter: true,
    desc: "輕快又耐穿的學院短褲。",
  },
  {
    id: "bottom_skirt",
    slot: "bottom",
    name: "森林百褶裙",
    look: "skirt",
    starter: true,
    desc: "像翻開書頁一樣的柔軟裙褶。",
  },
  {
    id: "hat_beret",
    slot: "hat",
    name: "奶油貝雷帽",
    look: "beret",
    starter: true,
    desc: "一枚小金星，替每一天留下記號。",
  },
  {
    id: "hat_ribbon",
    slot: "hat",
    name: "梅紫蝴蝶結",
    look: "ribbon",
    starter: true,
    desc: "可以搭配短髮，也能別在雙辮旁。",
  },
  {
    id: "hat_leaf",
    slot: "hat",
    name: "葉芽旅行帽",
    look: "leaf",
    cost: 6,
    desc: "小小的新芽，紀念每一步成長。",
  },
  {
    id: "prop_book",
    slot: "prop",
    name: "星頁手帳",
    look: "book",
    starter: true,
    desc: "收好你的記錄，也收好新的故事。",
  },
  {
    id: "prop_wand",
    slot: "prop",
    name: "月芽魔杖",
    look: "wand",
    cost: 6,
    desc: "木製杖身與月芽金飾，施法時亮起星光。",
  },
  {
    id: "friend_owl",
    slot: "companion",
    name: "書頁小鴞",
    artReady: true,
    look: "owl",
    days: 3,
    source: "累積記錄 3 天",
    desc: "披著薄荷斗篷的小夥伴，會在旅途中幫忙點亮星光。",
  },
  {
    id: "friend_cat",
    slot: "companion",
    name: "收據信差貓",
    artReady: true,
    look: "cat",
    cost: 3,
    currency: "purple",
    desc: "抱著星星錢包的貓咪，旅途中替你送來好運。",
  },
  {
    id: "garden_fern",
    slot: "garden",
    name: "書窗蕨葉",
    look: "fern",
    cost: 6,
    desc: "擺在庭院裡，每天陪你長大一點。",
  },
  {
    id: "garden_lantern",
    slot: "garden",
    name: "晚安星燈",
    look: "lantern",
    node: 5,
    source: "完成庭院章節",
    desc: "一盞暖光，紀念你走過的第一段旅程。",
  },
];
export const ITEM_BY_ID = Object.fromEntries(
  ITEMS.map((item) => [item.id, { currency: "yellow", ...item }]),
);
export const DISPLAY_ITEMS = ITEMS.filter((item) => item.artReady);
export const DISPLAY_SLOTS = [
  { id: "top", label: "套裝" },
  { id: "companion", label: "夥伴" },
];
const LEGACY_EQUIVALENTS = {
  top_starlight: "storybook_star_uniform",
  friend_owl: "storybook_ledger_owl",
};
export const DEFAULT_LOOK = {
  hair: "hair_chestnut",
  top: "top_mint",
  bottom: "bottom_shorts",
  hat: "hat_beret",
  prop: "prop_book",
  companion: null,
  garden: null,
};
export function owns(profile, id) {
  return (
    !!ITEM_BY_ID[id]?.starter ||
    !!profile.collection?.some(
      (item) => item.id === id || item.id === LEGACY_EQUIVALENTS[id],
    )
  );
}
export function normalizeLook(look = {}) {
  return Object.fromEntries(
    SLOTS.map(({ id }) => [
      id,
      look[id] === null && ["hat", "companion", "garden"].includes(id)
        ? null
        : ITEM_BY_ID[look[id]]?.slot === id
          ? look[id]
          : DEFAULT_LOOK[id],
    ]),
  );
}
export function equipLook(profile, look) {
  const next = normalizeLook(look);
  for (const id of Object.values(next))
    if (id && !owns(profile, id))
      throw new Error("試穿的部件尚未取得，請先收藏再穿上。");
  return {
    ...profile,
    equipped: { ...profile.equipped, visualStyle: "layered", layered: next },
  };
}
export function purchase(profile, id, operationId) {
  const item = ITEM_BY_ID[id];
  if (!item || !item.cost) throw new Error("這件收藏請從標示的旅程取得。");
  if (owns(profile, id)) return profile;
  if (!item.artReady) throw new Error("這件收藏尚未開放兌換。");
  const currency = item.currency;
  if ((profile.stars?.[currency] ?? 0) < item.cost)
    throw new Error("星幣還不夠，先把它放進心願吧。");
  return {
    ...profile,
    stars: {
      ...profile.stars,
      [currency]: profile.stars[currency] - item.cost,
    },
    collection: [
      ...(profile.collection ?? []),
      { id, obtainedAt: Date.now(), source: "星頁小店" },
    ],
    walletLog: [
      ...(profile.walletLog ?? []),
      {
        id: operationId,
        source: id,
        currency,
        amount: -item.cost,
        at: Date.now(),
      },
    ].slice(-120),
  };
}

// Purchase and equipment share one repository transaction; retries never charge twice.
export function purchaseAndEquip(profile, id, operationId) {
  const purchased = purchase(profile, id, operationId);
  return equipLook(purchased, {
    ...profile.equipped.layered,
    [ITEM_BY_ID[id].slot]: id,
  });
}
