/**
 * outfitAssets.js
 * 每套服裝的資產中心 — 新增套裝只要在這裡填一筆。
 * 優先級：frames（多幀動畫）> image（靜態）> null（Avatar 佔位）
 */

// ── 靜態圖 imports ──────────────────────────────────────────────
import girlBaseImg  from './assets/academy-art/generated/home-hero-girl-v2.png'
import boyBaseImg   from './assets/academy-art/generated/home-hero-boy-v2.png'

import girlCrystalGown from './assets/academy-art/generated/outfits/girl-crystal-gown.png'
import girlStarcloak   from './assets/academy-art/generated/outfits/girl-starcloak.png'
import girlSuit        from './assets/academy-art/generated/outfits/girl-suit.png'

import boyCrystalGown  from './assets/academy-art/generated/outfits/boy-crystal-gown.png'
import boyStarcloak    from './assets/academy-art/generated/outfits/boy-starcloak.png'
import boySuit         from './assets/academy-art/generated/outfits/boy-suit.png'

// ── 背景 imports ────────────────────────────────────────────────
import homeBg from './assets/academy-art/home-bg.webp'

// ── 多幀 idle 動畫（透明 PNG，CDN 暫存；之後移本地）──────────────
// 動畫順序：吐氣中性 → 微吸氣 → 吸氣高點 → 微吸氣 → 回中性（loop）
// 眨眼幀獨立傳入 SpriteCharacter，間歇性插入
const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz'
const GIRL_ACADEMY_FRAMES = [
  `${CDN}/hf_20260621_070219_5402d913-4277-413d-b843-a99a031850e3.png`, // F0 中性吐氣
  `${CDN}/hf_20260621_065959_62fc3c72-f6d2-4ff4-a128-a09284a58a21.png`, // F1 微吸氣
  `${CDN}/hf_20260621_070211_433537d3-f230-4748-b29a-71ecd4f2bf5c.png`, // F2 吸氣高點
  `${CDN}/hf_20260621_065959_62fc3c72-f6d2-4ff4-a128-a09284a58a21.png`, // F3 微吸氣（回程）
]
const GIRL_ACADEMY_BLINK = [
  `${CDN}/hf_20260621_070224_3a13ffe6-009f-4bbe-a547-a22bc930fac6.png`, // 眼睛閉上
]

// ── 主設定表 ────────────────────────────────────────────────────
export const OUTFIT_CONFIG = {
  academy: {
    name: '星術學院套裝',
    desc: '預設主角造型',
    girlImage:  girlBaseImg,
    boyImage:   boyBaseImg,
    girlFrames: GIRL_ACADEMY_FRAMES,
    boyFrames:  null,           // TODO: 生成男生幀
    girlBlink:  GIRL_ACADEMY_BLINK,
    boyBlink:   null,
    girlVideo:  null,
    boyVideo:   null,
    bg:         homeBg,
    bgTheme:    'academy',
  },
  saving_hero: {
    name: '省錢勇者套裝',
    desc: '初期成就造型',
    girlImage: girlBaseImg,
    boyImage:  boyBaseImg,
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg,
    bgTheme:   'hero',
  },
  mint_coat: {
    name: '薄荷補給套裝',
    desc: '黃星直購造型',
    girlImage: null,   // TODO: girl-mint-coat.png 尚未下載
    boyImage:  null,   // TODO: 尚未生成
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg, // TODO: 清新公園/咖啡廳背景
    bgTheme:   'mint',
  },
  pink_robe: {
    name: '粉晶禮服套裝',
    desc: '紫星直購造型',
    girlImage: girlCrystalGown,
    boyImage:  boyCrystalGown,
    girlVideo: null,   // TODO: 生成後填入
    boyVideo:  null,
    bg:        homeBg, // TODO: 華麗舞廳/城堡背景
    bgTheme:   'crystal',
  },
  night_cape: {
    name: '星夜斗篷套裝',
    desc: '一般扭蛋稀有',
    girlImage: girlStarcloak,
    boyImage:  boyStarcloak,
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg, // TODO: 夜空/魔法森林背景
    bgTheme:   'night',
  },
  suit: {
    name: '都市精英套裝',
    desc: '職場感限定套裝',
    girlImage: girlSuit,
    boyImage:  boySuit,
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg, // TODO: 現代都市/辦公室背景
    bgTheme:   'city',
  },
  moonlight: {
    name: '月光限定套裝',
    desc: '金色池限定',
    girlImage: null,
    boyImage:  null,
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg, // TODO: 月光夜景背景
    bgTheme:   'moonlight',
  },
}

/**
 * 根據 outfitId + 性別取得 { frames, blink, image, video, bg }
 * 優先級：frames > image > null
 */
export function getOutfitAssets(outfitId, gender = 'girl') {
  const c = OUTFIT_CONFIG[outfitId] ?? OUTFIT_CONFIG.academy
  const frames = gender === 'boy'
    ? (c.boyFrames ?? c.girlFrames ?? null)
    : (c.girlFrames ?? c.boyFrames ?? null)
  const blink = gender === 'boy'
    ? (c.boyBlink ?? c.girlBlink ?? null)
    : (c.girlBlink ?? c.boyBlink ?? null)
  const image = gender === 'boy'
    ? (c.boyImage  ?? c.girlImage)
    : (c.girlImage ?? c.boyImage)
  const video = gender === 'boy'
    ? (c.boyVideo  ?? c.girlVideo)
    : (c.girlVideo ?? c.boyVideo)
  return { frames, blink, image, video, bg: c.bg }
}
