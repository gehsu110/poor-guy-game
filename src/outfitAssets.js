/**
 * outfitAssets.js
 * 每套服裝的資產中心 — 新增套裝只要在這裡填一筆。
 * image / video 為 null 表示尚未生成，系統自動降級：
 *   有 video → <video loop autoPlay>
 *   有 image → <motion.img> + CSS 上下動畫
 *   都沒有   → Avatar 元件佔位
 */

// ── 靜態圖 imports ──────────────────────────────────────────────
import girlBaseImg  from './assets/academy-art/home-hero-girl-v2.png'
import boyBaseImg   from './assets/academy-art/home-hero-boy-v2.png'

import girlCrystalGown from './assets/academy-art/generated/outfits/girl-crystal-gown.png'
import girlStarcloak   from './assets/academy-art/generated/outfits/girl-starcloak.png'
import girlSuit        from './assets/academy-art/generated/outfits/girl-suit.png'

import boyCrystalGown  from './assets/academy-art/generated/outfits/boy-crystal-gown.png'
import boyStarcloak    from './assets/academy-art/generated/outfits/boy-starcloak.png'
import boySuit         from './assets/academy-art/generated/outfits/boy-suit.png'

// ── 背景 imports ────────────────────────────────────────────────
import homeBg from './assets/academy-art/home-bg.webp'
// TODO: 每套裝專屬背景，生成後在此 import 並填入 OUTFIT_CONFIG

// ── 影片 (暫用 CDN URL，下載後改為 import) ─────────────────────
// TODO: 下載後改為 import girlAcademyVideo from './assets/academy-art/generated/videos/girl-academy.mp4'
const GIRL_ACADEMY_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260621_043751_f35c2192-a987-4c3d-b350-651f049fd22d.mp4'

// ── 主設定表 ────────────────────────────────────────────────────
export const OUTFIT_CONFIG = {
  academy: {
    name: '星術學院套裝',
    desc: '預設主角造型',
    girlImage: girlBaseImg,
    boyImage:  boyBaseImg,
    girlVideo: GIRL_ACADEMY_VIDEO,
    boyVideo:  null,          // TODO: 生成後填入
    bg:        homeBg,        // TODO: 學院廣場背景
    bgTheme:   'academy',
  },
  saving_hero: {
    name: '省錢勇者套裝',
    desc: '初期成就造型',
    girlImage: girlBaseImg,
    boyImage:  boyBaseImg,
    girlVideo: GIRL_ACADEMY_VIDEO,  // 暫借用
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
 * 根據 outfitId + 性別取得 { image, video, bg }
 * 無對應性別資產時自動 fallback 到另一性別。
 */
export function getOutfitAssets(outfitId, gender = 'girl') {
  const c = OUTFIT_CONFIG[outfitId] ?? OUTFIT_CONFIG.academy
  const image = gender === 'boy'
    ? (c.boyImage  ?? c.girlImage)
    : (c.girlImage ?? c.boyImage)
  const video = gender === 'boy'
    ? (c.boyVideo  ?? c.girlVideo)
    : (c.girlVideo ?? c.boyVideo)
  return { image, video, bg: c.bg }
}
