import { calcLevel, weekDates, isRecorded } from "../progression.js";
import { getTitle } from "../gameLogic.js";
import { ITEMS, DEFAULT_LOOK, normalizeLook } from "./catalog.js";
export const CHAPTERS = [
  {
    id: "courtyard",
    name: "第一章・風鈴庭院",
    place: "學院庭院",
    color: "#b8c8a1",
    story: "收好手帳，從熟悉的庭院走向新的故事。",
    nodes: [
      "第一封來信",
      "風鈴下的約定",
      "迷路的金幣精靈",
      "書窗邊的朋友",
      "守護庭院的光",
    ],
  },
  {
    id: "market",
    name: "第二章・晨光市集",
    place: "晨光市集",
    color: "#dbb77e",
    story: "穿過熱鬧的小路，尋找藏在日常裡的寶物。",
    nodes: ["市集的邀請", "郵差的小包裹", "茶攤奇遇", "失物招領處", "晨光鐘塔"],
  },
  {
    id: "forest",
    name: "第三章・書頁森林",
    place: "書頁森林",
    color: "#a6bcb2",
    story: "每一片葉子，都記得你曾經走過。",
    nodes: [
      "森林入口",
      "貓咪留下的腳印",
      "月芽小徑",
      "樹洞裡的信",
      "寫給明天的自己",
    ],
  },
];
export const ROUTES = [
  {
    id: "library",
    name: "書頁小徑",
    desc: "尋找服飾故事，留下書頁印記",
    mark: "書頁印記",
    action: "翻開手帳，喚醒星光",
    color: "#827ba1",
  },
  {
    id: "forest",
    name: "葉芽小徑",
    desc: "聽夥伴說故事，留下葉芽印記",
    mark: "葉芽印記",
    action: "伸出手，借一點森林的力量",
    color: "#71977f",
  },
];
export function addReward(profile, key, reward, now = Date.now()) {
  if (profile.claimedMissions?.[key]) return profile;
  const exp = (profile.exp ?? 0) + (reward.exp ?? 0);
  const level = calcLevel(exp);
  const collection = [...(profile.collection ?? [])];
  for (const id of reward.items ?? [])
    if (!collection.some((item) => item.id === id))
      collection.push({ id, obtainedAt: now, source: key });
  return {
    ...profile,
    exp,
    ...level,
    title: getTitle(level.level).name,
    collection,
    stars: {
      yellow: (profile.stars?.yellow ?? 0) + (reward.yellow ?? 0),
      purple: (profile.stars?.purple ?? 0) + (reward.purple ?? 0),
    },
    claimedMissions: { ...profile.claimedMissions, [key]: true },
    walletLog: [
      ...(profile.walletLog ?? []),
      {
        id: key,
        source: key,
        yellow: reward.yellow ?? 0,
        purple: reward.purple ?? 0,
        at: now,
      },
    ].slice(-120),
  };
}
export function initializeJourney(profile, records, date) {
  if (profile.schemaVersion >= 3) return profile;
  const collection = [...(profile.collection ?? [])];
  for (const item of ITEMS.filter((item) => item.starter))
    if (!collection.some((old) => old.id === item.id))
      collection.push({
        id: item.id,
        source: "starter-v3",
        obtainedAt: Date.now(),
      });
  const recordedDates = Object.keys(records)
    .filter((day) => day < date && isRecorded(records[day]))
    .sort();
  return {
    ...profile,
    schemaVersion: 3,
    saveId: profile.saveId ?? crypto.randomUUID(),
    migratedAt: Date.now(),
    gameStartDate: date,
    collection,
    equipped: {
      ...profile.equipped,
      previousVisualStyle: profile.equipped?.visualStyle ?? "storybook",
      visualStyle: "layered",
      layered: normalizeLook(profile.equipped?.layered ?? DEFAULT_LOOK),
    },
    journey: {
      completed: 0,
      pendingDates: [],
      usedDates: [],
      recordedDates,
      stamps: [],
      active: null,
    },
    wishlist: profile.wishlist ?? ["top_starlight"],
  };
}
export function recordDay(profile, record, date, today) {
  if (date !== today || !((record.entryCount ?? 0) > 0 || record.noSpend))
    return profile;
  const key = `journal3:record:${date}`;
  if (profile.claimedMissions?.[key]) return profile;
  let next = addReward(profile, key, { yellow: 2, exp: 15 });
  const journey = next.journey;
  const recordedDates = [...new Set([...journey.recordedDates, date])].sort();
  const pendingDates = [...new Set([...journey.pendingDates, date])]
    .filter((day) => !journey.usedDates.includes(day))
    .sort()
    .slice(-3);
  next = { ...next, journey: { ...journey, recordedDates, pendingDates } };
  const week = weekDates(date);
  if (recordedDates.filter((day) => week.includes(day)).length >= 5)
    next = addReward(next, `journal3:week:${week[0]}`, {
      yellow: 5,
      purple: 1,
      exp: 50,
    });
  for (const item of ITEMS.filter(
    (item) => item.days && recordedDates.length >= item.days,
  ))
    next = addReward(next, `journal3:milestone:${item.id}`, {
      items: [item.id],
    });
  return next;
}
export function reviewDay(profile, record, date, expectedRevision) {
  if ((record.revision ?? 0) !== expectedRevision)
    throw new Error("帳本有新的變更，請重新確認內容。");
  if (!(record.entryCount > 0 || record.noSpend))
    throw new Error("先記錄今天，或確認今天零消費。");
  return {
    profile: addReward(profile, `journal3:review:${date}`, {
      yellow: 1,
      exp: 5,
    }),
    record: {
      ...record,
      reviewedRevision: expectedRevision,
      reviewedAt: Date.now(),
    },
  };
}
export function currentNode(profile) {
  const completed = profile.journey?.completed ?? 0;
  const finished = completed >= 15;
  const chapterIndex = Math.min(2, Math.floor(completed / 5));
  const nodeIndex = finished ? 4 : completed % 5;
  return {
    chapter: CHAPTERS[chapterIndex],
    chapterIndex,
    nodeIndex,
    index: completed + 1,
    name: CHAPTERS[chapterIndex].nodes[nodeIndex],
    finished,
  };
}
export function startJourney(profile, route, operationId) {
  if (profile.journey.active) return profile;
  const node = currentNode(profile);
  if (node.finished)
    throw new Error("三個章節已完成，收藏與日常記錄會繼續累積。");
  if (!ROUTES.some((item) => item.id === route))
    throw new Error("請選擇一條路線。");
  const date = profile.journey.pendingDates[0];
  if (!date) throw new Error("記錄今天，或確認零消費，就能準備一次冒險。");
  return {
    ...profile,
    journey: {
      ...profile.journey,
      active: {
        id: operationId,
        date,
        route,
        node: node.index,
        turn: 0,
        hp: 100,
        startedAt: Date.now(),
      },
    },
  };
}
export function advanceJourney(profile, id, expectedTurn, skill, shardId) {
  const active = profile.journey.active;
  if (!active || active.id !== id)
    throw new Error("這段旅程已經結束，請查看最新進度。");
  if (active.turn !== expectedTurn)
    throw new Error("旅程剛剛有更新，已同步最新進度。");
  const { hp, foundShards } = resolveStarAction(
    active,
    skill,
    !!profile.equipped?.layered?.companion,
    shardId,
  );
  if (hp > 0)
    return {
      ...profile,
      journey: {
        ...profile.journey,
        active: { ...active, hp, foundShards, turn: active.turn + 1 },
      },
    };
  const items = ITEMS.filter((item) => item.node === active.node).map(
    (item) => item.id,
  );
  const endOfChapter = active.node % 5 === 0;
  let next = addReward(profile, `journey3:${active.node}`, {
    exp: 30,
    purple: endOfChapter ? 1 : 0,
    items,
  });
  next = {
    ...next,
    journey: {
      ...next.journey,
      completed: active.node,
      active: null,
      lastResult: {
        id: active.id,
        node: active.node,
        route: active.route,
        date: active.date,
        seen: false,
      },
      pendingDates: next.journey.pendingDates.filter(
        (day) => day !== active.date,
      ),
      usedDates: [...new Set([...next.journey.usedDates, active.date])],
      stamps: [
        ...next.journey.stamps,
        { node: active.node, route: active.route, at: Date.now() },
      ],
    },
  };
  return next;
}

export function encounterStep(active, skill, hasCompanion = false) {
  if (!["cast", "friend", "quick"].includes(skill))
    throw new Error("請選擇一個行動。");
  if (skill === "friend" && !hasCompanion)
    throw new Error("先邀請一位夥伴加入旅程。");
  const damage = skill === "quick" ? 100 : skill === "friend" ? 55 : 40;
  return Math.max(0, active.hp - damage);
}

export function foundShardIds(active) {
  const count =
    active.hp <= 0 ? 3 : Math.max(0, Math.floor((100 - active.hp) / 40));
  const saved = [...new Set(active.foundShards ?? [])].filter(
    (id) => Number.isInteger(id) && id >= 0 && id < 3,
  );
  return [...saved, ...[0, 1, 2].filter((id) => !saved.includes(id))].slice(
    0,
    count,
  );
}
export function resolveStarAction(
  active,
  skill,
  hasCompanion = false,
  shardId,
) {
  const found = foundShardIds(active);
  const target = shardId ?? [0, 1, 2].find((id) => !found.includes(id));
  if (
    skill === "cast" &&
    (!Number.isInteger(target) ||
      target < 0 ||
      target > 2 ||
      found.includes(target))
  )
    throw new Error("這片星光已經收好了，找找其他星片吧。");
  const hp = encounterStep(active, skill, hasCompanion);
  const count = hp <= 0 ? 3 : Math.max(0, Math.floor((100 - hp) / 40));
  const order = [
    ...found,
    ...(target === undefined ? [] : [target]),
    ...[0, 1, 2].filter((id) => !found.includes(id) && id !== target),
  ];
  return { hp, foundShards: order.slice(0, count) };
}
