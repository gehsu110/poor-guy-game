// Exploration rewards never alter money, ledger entries or daily journey eligibility.
export const FIELD_OBJECTS = [
  { id: "mira", kind: "npc", name: "米菈 · 風鈴工匠", x: -3, z: 1.5 },
  { id: "flower-1", kind: "flower", name: "風鈴花", x: 2.5, z: 1 },
  { id: "flower-2", kind: "flower", name: "風鈴花", x: 4.5, z: -3 },
  { id: "flower-3", kind: "flower", name: "風鈴花", x: -4.5, z: -4 },
  { id: "flower-4", kind: "flower", name: "風鈴花", x: -9, z: -6 },
  { id: "flower-5", kind: "flower", name: "風鈴花", x: 7, z: -12 },
  { id: "flower-6", kind: "flower", name: "風鈴花", x: 1, z: -16 },
  { id: "lamp-1", kind: "beacon", name: "微風古燈", x: -7, z: -7 },
  { id: "lamp-2", kind: "beacon", name: "湖畔古燈", x: 8, z: -8 },
  { id: "lamp-3", kind: "beacon", name: "遺跡古燈", x: -1, z: -17 },
  { id: "chest", kind: "chest", name: "星風寶箱", x: 0, z: -21 },
  { id: "lookout", kind: "landmark", name: "風起之丘", x: -11, z: -12 },
  { id: "lake", kind: "landmark", name: "映星湖", x: 11, z: -6 },
  { id: "ruins", kind: "landmark", name: "風鈴遺跡", x: 3, z: -20 },
];
const known = (kind) =>
  FIELD_OBJECTS.filter((o) => o.kind === kind).map((o) => o.id);
const clean = (values, kind) =>
  Array.isArray(values)
    ? [...new Set(values.filter((id) => known(kind).includes(id)))]
    : [];
export function fieldState(profile) {
  const raw = profile.exploration ?? {};
  const brooch = raw.brooch === true;
  const lit = brooch ? clean(raw.lit, "beacon") : [];
  const treasure = lit.length === 3 && raw.treasure === true;
  return {
    flowers: clean(raw.flowers, "flower"),
    lit,
    visited: clean(raw.visited, "landmark"),
    introduced: raw.introduced === true,
    brooch,
    treasure,
    wearingBrooch: brooch && raw.wearingBrooch !== false,
    followingWisp: treasure && raw.followingWisp !== false,
  };
}
export function fieldAction(profile, action) {
  const state = fieldState(profile);
  const object = FIELD_OBJECTS.find((o) => o.id === action.id);
  if (action.type === "gather") {
    if (object?.kind !== "flower") throw new Error("這裡沒有可採集的風鈴花。");
    state.flowers = [...new Set([...state.flowers, object.id])];
  } else if (action.type === "talk") state.introduced = true;
  else if (action.type === "craft") {
    if (!state.introduced || state.flowers.length < 3)
      throw new Error("先與米菈交談，帶回 3 朵風鈴花。");
    if (!state.brooch) {
      state.brooch = true;
      state.wearingBrooch = true;
    }
  } else if (action.type === "ignite") {
    if (object?.kind !== "beacon" || !state.brooch)
      throw new Error("先請米菈製作風鈴胸針，喚醒古燈。");
    state.lit = [...new Set([...state.lit, object.id])];
  } else if (action.type === "discover") {
    if (object?.kind !== "landmark") throw new Error("找不到這個風景。");
    state.visited = [...new Set([...state.visited, object.id])];
  } else if (action.type === "open") {
    if (state.lit.length !== 3)
      throw new Error("三座古燈亮起後，寶箱才會甦醒。");
    if (!state.treasure) {
      state.treasure = true;
      state.followingWisp = true;
    }
  } else if (action.type === "wear") {
    if (action.item === "brooch" && state.brooch)
      state.wearingBrooch = !!action.value;
    else if (action.item === "wisp" && state.treasure)
      state.followingWisp = !!action.value;
    else throw new Error("還沒有取得這份探索收藏。");
  } else throw new Error("無法辨識這個探索動作。");
  return { ...profile, exploration: state };
}
export function mergeField(current, incoming) {
  const a = fieldState(current),
    b = fieldState(incoming);
  return fieldState({
    exploration: {
      ...a,
      flowers: [...a.flowers, ...b.flowers],
      lit: [...a.lit, ...b.lit],
      visited: [...a.visited, ...b.visited],
      introduced: a.introduced || b.introduced,
      brooch: a.brooch || b.brooch,
      treasure: a.treasure || b.treasure,
      wearingBrooch: a.brooch ? a.wearingBrooch : b.wearingBrooch,
      followingWisp: a.treasure ? a.followingWisp : b.followingWisp,
    },
  });
}
export function fieldQuest(state) {
  if (!state.introduced)
    return {
      title: "風裡的第一封信",
      detail: "與路邊的米菈交談",
      target: "mira",
      chapter: "初遇",
    };
  if (!state.brooch)
    return state.flowers.length < 3
      ? {
          title: "帶回風鈴花",
          detail: `採集風鈴花 ${state.flowers.length} / 3`,
          target: known("flower").find((id) => !state.flowers.includes(id)),
          chapter: "工匠的委託",
        }
      : {
          title: "一枚屬於你的胸針",
          detail: "回到米菈身邊製作",
          target: "mira",
          chapter: "工匠的委託",
        };
  if (state.lit.length < 3)
    return {
      title: "讓古老的風再次流動",
      detail: `點亮古燈 ${state.lit.length} / 3`,
      target: known("beacon").find((id) => !state.lit.includes(id)),
      chapter: "風的回聲",
    };
  if (!state.treasure)
    return {
      title: "遺跡裡，有誰在等你",
      detail: "打開遺跡的星風寶箱",
      target: "chest",
      chapter: "風的回聲",
    };
  if (state.visited.length < 3)
    return {
      title: "把風景收進旅途",
      detail: `發現風景 ${state.visited.length} / 3`,
      target: known("landmark").find((id) => !state.visited.includes(id)),
      chapter: "自由漫遊",
    };
  if (state.flowers.length < 6)
    return {
      title: "原野上的最後幾朵花",
      detail: `風鈴花 ${state.flowers.length} / 6`,
      target: known("flower").find((id) => !state.flowers.includes(id)),
      chapter: "自由漫遊",
    };
  return {
    title: "星風原野 · 探索完成",
    detail: "帶著精靈散步，或翻開今日手帳",
    target: null,
    chapter: "自由漫遊",
  };
}
export function objectAvailable(object, state) {
  if (object.kind === "flower") return !state.flowers.includes(object.id);
  if (object.kind === "beacon") return !state.lit.includes(object.id);
  if (object.kind === "landmark") return !state.visited.includes(object.id);
  if (object.kind === "chest") return !state.treasure;
  return true;
}

export const FIELD_STYLE = {
  hair: [
    { id: "bob", name: "微風短髮" },
    { id: "braid", name: "旅人長辮" },
  ],
  outfit: [
    { id: "wind", name: "薄荷披肩" },
    { id: "trail", name: "遠行外套" },
    { id: "star", name: "晚星禮服", requires: "top_starlight" },
  ],
  hat: [
    { id: "beret", name: "星旅貝雷帽" },
    { id: "ribbon", name: "雙葉髮帶" },
    { id: "none", name: "不戴頭飾" },
  ],
  pack: [
    { id: "satchel", name: "皮革小包" },
    { id: "book", name: "魔法手帳" },
    { id: "none", name: "輕裝出門" },
  ],
};
export function fieldLook(profile) {
  const defaults = {
    hair: "bob",
    outfit:
      profile.equipped?.layered?.top === "top_starlight" ? "star" : "wind",
    hat: "beret",
    pack: "satchel",
  };
  return Object.fromEntries(
    Object.entries(FIELD_STYLE).map(([slot, items]) => {
      const item = items.find(
        (i) => i.id === (profile.fieldLook?.[slot] ?? defaults[slot]),
      );
      return [
        slot,
        item &&
        (!item.requires ||
          profile.collection?.some((i) => i.id === item.requires))
          ? item.id
          : items[0].id,
      ];
    }),
  );
}
export function wearFieldLook(profile, look) {
  const proposed = { ...fieldLook(profile), ...look };
  const normalized = fieldLook({ ...profile, fieldLook: proposed });
  if (
    Object.entries(proposed).some(([key, value]) => normalized[key] !== value)
  )
    throw new Error("這個造型尚未取得。");
  return { ...profile, fieldLook: normalized };
}
