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

// ── 女生學院服 idle 幀（從影片抽幀 + 黑底去背，4fps × 12幀 = 3s loop）──
import gaF01 from './assets/academy-art/generated/frames/girl-academy/f01.png'
import gaF02 from './assets/academy-art/generated/frames/girl-academy/f02.png'
import gaF03 from './assets/academy-art/generated/frames/girl-academy/f03.png'
import gaF04 from './assets/academy-art/generated/frames/girl-academy/f04.png'
import gaF05 from './assets/academy-art/generated/frames/girl-academy/f05.png'
import gaF06 from './assets/academy-art/generated/frames/girl-academy/f06.png'
import gaF07 from './assets/academy-art/generated/frames/girl-academy/f07.png'
import gaF08 from './assets/academy-art/generated/frames/girl-academy/f08.png'
import gaF09 from './assets/academy-art/generated/frames/girl-academy/f09.png'
import gaF10 from './assets/academy-art/generated/frames/girl-academy/f10.png'
import gaF11 from './assets/academy-art/generated/frames/girl-academy/f11.png'
import gaF12 from './assets/academy-art/generated/frames/girl-academy/f12.png'

const GIRL_ACADEMY_FRAMES = [gaF01,gaF02,gaF03,gaF04,gaF05,gaF06,gaF07,gaF08,gaF09,gaF10,gaF11,gaF12]

// ── 主設定表 ────────────────────────────────────────────────────
export const OUTFIT_CONFIG = {
  academy: {
    name: '星術學院套裝',
    desc: '預設主角造型',
    girlImage:  girlBaseImg,
    boyImage:   boyBaseImg,
    girlFrames: GIRL_ACADEMY_FRAMES,
    boyFrames:  null,           // TODO: 生成男生幀
    girlBlink:  null,
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
