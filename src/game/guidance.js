import { currentNode } from "./journey.js";
import { DISPLAY_ITEMS, ITEM_BY_ID, owns } from "./catalog.js";

export function nextStep(profile, record = {}, date) {
  const journey = profile.journey;
  const recorded =
    record.entryCount > 0 ||
    record.noSpend ||
    !!profile.claimedMissions?.[`journal3:record:${date}`];
  if (journey.active)
    return {
      step: 1,
      kind: "adventure",
      label: "繼續冒險",
      title: "精靈還在等你",
      detail: "你的進度已保留，回去找齊星片吧。",
    };
  if (journey.pendingDates.length && !currentNode(profile).finished)
    return {
      step: 1,
      kind: "adventure",
      label: "出發找星片",
      title: "今天的冒險，準備好了",
      detail: `有 ${journey.pendingDates.length} 次冒險可以出發，完成後收下旅程印記。`,
    };
  if (!recorded)
    return {
      step: 0,
      kind: "record",
      label: "記下今天的一筆",
      title: "從今天的記錄開始",
      detail: "記一筆或確認零消費，就能準備一次冒險。",
    };
  return {
    step: 2,
    kind: "collection",
    label: "看看我的旅程印記",
    title: "今天的冒險已完成",
    detail: "收好今天的相遇。想再玩，可以隨時自由探索。",
  };
}

export function collectionGoal(profile) {
  return (
    profile.wishlist
      ?.map((id) => ITEM_BY_ID[id])
      .find((item) => item?.artReady && !owns(profile, item.id)) ??
    DISPLAY_ITEMS.find((item) => !owns(profile, item.id)) ??
    null
  );
}

export function searchProgress(active) {
  const found =
    active.hp <= 0 ? 3 : Math.max(0, Math.floor((100 - active.hp) / 40));
  return { found, remaining: 3 - found, target: found };
}

export const ENCOUNTERS = [
  {
    name: "送信史萊姆",
    request: "信上的星光不見了，可以幫我找回來嗎？",
    thanks: "信又亮起來了！這份相遇，我會記得。",
    clues: ["屋簷下", "書窗旁", "小路上"],
  },
  {
    name: "風鈴小兔",
    request: "風把星片吹散了，風鈴也不唱歌了。",
    thanks: "聽，風鈴又唱歌了！謝謝你陪我找回星光。",
    clues: ["風鈴旁", "門邊", "花叢中"],
  },
  {
    name: "森林菇菇",
    request: "我的小路暗下來了，星片藏在哪裡呢？",
    thanks: "小路亮了！明天也要記得來散步喔。",
    clues: ["樹影裡", "屋簷下", "小路上"],
  },
  {
    name: "金幣精靈",
    request: "我把三片小星光弄丟了，能陪我找找嗎？",
    thanks: "找回來了！把這個小小的紀念收好吧。",
    clues: ["書窗旁", "燈籠邊", "石階上"],
  },
  {
    name: "錢包小貓",
    request: "午睡醒來，我的星光跑到庭院裡了。",
    thanks: "呼嚕…有你一起找，真好。",
    clues: ["花叢中", "門邊", "小路上"],
  },
  {
    name: "購物小龍",
    request: "星片躲進了庭院，幫我把它們帶回來吧。",
    thanks: "口袋裝滿了星光，也裝滿了今天的故事！",
    clues: ["屋簷下", "書窗旁", "石階上"],
  },
  {
    name: "晚星王子",
    request: "星星睡著了，點一下就能喚醒它們。",
    thanks: "晚安之前，還好有你點亮這裡。",
    clues: ["燈籠邊", "樹影裡", "花叢中"],
  },
  {
    name: "帳本小龍",
    request: "手帳裡的星光飛走了，一起把它找回來。",
    thanks: "今天的故事，已經好好收進手帳裡了。",
    clues: ["屋簷下", "門邊", "小路上"],
  },
];
export const encounterFor = (node) =>
  ENCOUNTERS[(node - 1) % ENCOUNTERS.length];
