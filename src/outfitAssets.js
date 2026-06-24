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
import summerBeachBg from './assets/academy-art/summer-set/beach-bg.webp'
import girlSummerIdle from './assets/academy-art/summer-set/girl-summer-idle.webp'
import sakuraFestivalBg from './assets/academy-art/sakura-set/sakura-bg.webp'
import girlSakuraFestival from './assets/academy-art/sakura-set/girl-sakura-festival.webp'

// ── 幀動畫 imports（從影片抽幀 + 黑底去背，4fps × 12幀 = 3s loop）──

// 女生學院服
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

// 女生粉晶禮服
import gcgF01 from './assets/academy-art/generated/frames/girl-crystal-gown/f01.png'
import gcgF02 from './assets/academy-art/generated/frames/girl-crystal-gown/f02.png'
import gcgF03 from './assets/academy-art/generated/frames/girl-crystal-gown/f03.png'
import gcgF04 from './assets/academy-art/generated/frames/girl-crystal-gown/f04.png'
import gcgF05 from './assets/academy-art/generated/frames/girl-crystal-gown/f05.png'
import gcgF06 from './assets/academy-art/generated/frames/girl-crystal-gown/f06.png'
import gcgF07 from './assets/academy-art/generated/frames/girl-crystal-gown/f07.png'
import gcgF08 from './assets/academy-art/generated/frames/girl-crystal-gown/f08.png'
import gcgF09 from './assets/academy-art/generated/frames/girl-crystal-gown/f09.png'
import gcgF10 from './assets/academy-art/generated/frames/girl-crystal-gown/f10.png'
import gcgF11 from './assets/academy-art/generated/frames/girl-crystal-gown/f11.png'
import gcgF12 from './assets/academy-art/generated/frames/girl-crystal-gown/f12.png'
const GIRL_CRYSTAL_GOWN_FRAMES = [gcgF01,gcgF02,gcgF03,gcgF04,gcgF05,gcgF06,gcgF07,gcgF08,gcgF09,gcgF10,gcgF11,gcgF12]

// 女生星夜斗篷
import gscF01 from './assets/academy-art/generated/frames/girl-starcloak/f01.png'
import gscF02 from './assets/academy-art/generated/frames/girl-starcloak/f02.png'
import gscF03 from './assets/academy-art/generated/frames/girl-starcloak/f03.png'
import gscF04 from './assets/academy-art/generated/frames/girl-starcloak/f04.png'
import gscF05 from './assets/academy-art/generated/frames/girl-starcloak/f05.png'
import gscF06 from './assets/academy-art/generated/frames/girl-starcloak/f06.png'
import gscF07 from './assets/academy-art/generated/frames/girl-starcloak/f07.png'
import gscF08 from './assets/academy-art/generated/frames/girl-starcloak/f08.png'
import gscF09 from './assets/academy-art/generated/frames/girl-starcloak/f09.png'
import gscF10 from './assets/academy-art/generated/frames/girl-starcloak/f10.png'
import gscF11 from './assets/academy-art/generated/frames/girl-starcloak/f11.png'
import gscF12 from './assets/academy-art/generated/frames/girl-starcloak/f12.png'
const GIRL_STARCLOAK_FRAMES = [gscF01,gscF02,gscF03,gscF04,gscF05,gscF06,gscF07,gscF08,gscF09,gscF10,gscF11,gscF12]

// 女生都市套裝
import gsF01 from './assets/academy-art/generated/frames/girl-suit/f01.png'
import gsF02 from './assets/academy-art/generated/frames/girl-suit/f02.png'
import gsF03 from './assets/academy-art/generated/frames/girl-suit/f03.png'
import gsF04 from './assets/academy-art/generated/frames/girl-suit/f04.png'
import gsF05 from './assets/academy-art/generated/frames/girl-suit/f05.png'
import gsF06 from './assets/academy-art/generated/frames/girl-suit/f06.png'
import gsF07 from './assets/academy-art/generated/frames/girl-suit/f07.png'
import gsF08 from './assets/academy-art/generated/frames/girl-suit/f08.png'
import gsF09 from './assets/academy-art/generated/frames/girl-suit/f09.png'
import gsF10 from './assets/academy-art/generated/frames/girl-suit/f10.png'
import gsF11 from './assets/academy-art/generated/frames/girl-suit/f11.png'
import gsF12 from './assets/academy-art/generated/frames/girl-suit/f12.png'
const GIRL_SUIT_FRAMES = [gsF01,gsF02,gsF03,gsF04,gsF05,gsF06,gsF07,gsF08,gsF09,gsF10,gsF11,gsF12]

// 男生粉晶禮服
import bcgF01 from './assets/academy-art/generated/frames/boy-crystal-gown/f01.png'
import bcgF02 from './assets/academy-art/generated/frames/boy-crystal-gown/f02.png'
import bcgF03 from './assets/academy-art/generated/frames/boy-crystal-gown/f03.png'
import bcgF04 from './assets/academy-art/generated/frames/boy-crystal-gown/f04.png'
import bcgF05 from './assets/academy-art/generated/frames/boy-crystal-gown/f05.png'
import bcgF06 from './assets/academy-art/generated/frames/boy-crystal-gown/f06.png'
import bcgF07 from './assets/academy-art/generated/frames/boy-crystal-gown/f07.png'
import bcgF08 from './assets/academy-art/generated/frames/boy-crystal-gown/f08.png'
import bcgF09 from './assets/academy-art/generated/frames/boy-crystal-gown/f09.png'
import bcgF10 from './assets/academy-art/generated/frames/boy-crystal-gown/f10.png'
import bcgF11 from './assets/academy-art/generated/frames/boy-crystal-gown/f11.png'
import bcgF12 from './assets/academy-art/generated/frames/boy-crystal-gown/f12.png'
const BOY_CRYSTAL_GOWN_FRAMES = [bcgF01,bcgF02,bcgF03,bcgF04,bcgF05,bcgF06,bcgF07,bcgF08,bcgF09,bcgF10,bcgF11,bcgF12]

// 男生星夜斗篷
import bscF01 from './assets/academy-art/generated/frames/boy-starcloak/f01.png'
import bscF02 from './assets/academy-art/generated/frames/boy-starcloak/f02.png'
import bscF03 from './assets/academy-art/generated/frames/boy-starcloak/f03.png'
import bscF04 from './assets/academy-art/generated/frames/boy-starcloak/f04.png'
import bscF05 from './assets/academy-art/generated/frames/boy-starcloak/f05.png'
import bscF06 from './assets/academy-art/generated/frames/boy-starcloak/f06.png'
import bscF07 from './assets/academy-art/generated/frames/boy-starcloak/f07.png'
import bscF08 from './assets/academy-art/generated/frames/boy-starcloak/f08.png'
import bscF09 from './assets/academy-art/generated/frames/boy-starcloak/f09.png'
import bscF10 from './assets/academy-art/generated/frames/boy-starcloak/f10.png'
import bscF11 from './assets/academy-art/generated/frames/boy-starcloak/f11.png'
import bscF12 from './assets/academy-art/generated/frames/boy-starcloak/f12.png'
const BOY_STARCLOAK_FRAMES = [bscF01,bscF02,bscF03,bscF04,bscF05,bscF06,bscF07,bscF08,bscF09,bscF10,bscF11,bscF12]

// 男生都市套裝
import bsF01 from './assets/academy-art/generated/frames/boy-suit/f01.png'
import bsF02 from './assets/academy-art/generated/frames/boy-suit/f02.png'
import bsF03 from './assets/academy-art/generated/frames/boy-suit/f03.png'
import bsF04 from './assets/academy-art/generated/frames/boy-suit/f04.png'
import bsF05 from './assets/academy-art/generated/frames/boy-suit/f05.png'
import bsF06 from './assets/academy-art/generated/frames/boy-suit/f06.png'
import bsF07 from './assets/academy-art/generated/frames/boy-suit/f07.png'
import bsF08 from './assets/academy-art/generated/frames/boy-suit/f08.png'
import bsF09 from './assets/academy-art/generated/frames/boy-suit/f09.png'
import bsF10 from './assets/academy-art/generated/frames/boy-suit/f10.png'
import bsF11 from './assets/academy-art/generated/frames/boy-suit/f11.png'
import bsF12 from './assets/academy-art/generated/frames/boy-suit/f12.png'
const BOY_SUIT_FRAMES = [bsF01,bsF02,bsF03,bsF04,bsF05,bsF06,bsF07,bsF08,bsF09,bsF10,bsF11,bsF12]

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
    girlImage: null,
    boyImage:  null,
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg,
    bgTheme:   'mint',
  },
  pink_robe: {
    name: '粉晶禮服套裝',
    desc: '紫星直購造型',
    girlImage:  girlCrystalGown,
    boyImage:   boyCrystalGown,
    girlFrames: GIRL_CRYSTAL_GOWN_FRAMES,
    boyFrames:  BOY_CRYSTAL_GOWN_FRAMES,
    girlBlink:  null,
    boyBlink:   null,
    girlVideo:  null,
    boyVideo:   null,
    bg:         homeBg,
    bgTheme:    'crystal',
  },
  night_cape: {
    name: '星夜斗篷套裝',
    desc: '一般扭蛋稀有',
    girlImage:  girlStarcloak,
    boyImage:   boyStarcloak,
    girlFrames: GIRL_STARCLOAK_FRAMES,
    boyFrames:  BOY_STARCLOAK_FRAMES,
    girlBlink:  null,
    boyBlink:   null,
    girlVideo:  null,
    boyVideo:   null,
    bg:         homeBg,
    bgTheme:    'night',
  },
  suit: {
    name: '都市精英套裝',
    desc: '職場感限定套裝',
    girlImage:  girlSuit,
    boyImage:   boySuit,
    girlFrames: GIRL_SUIT_FRAMES,
    boyFrames:  BOY_SUIT_FRAMES,
    girlBlink:  null,
    boyBlink:   null,
    girlVideo:  null,
    boyVideo:   null,
    bg:         homeBg,
    bgTheme:    'city',
  },
  moonlight: {
    name: '月光限定套裝',
    desc: '金色池限定',
    girlImage: null,
    boyImage:  null,
    girlVideo: null,
    boyVideo:  null,
    bg:        homeBg,
    bgTheme:   'moonlight',
  },
  summer_beach: {
    name: '星潮海灘套裝',
    desc: '夏日海灘主題限定',
    girlImage: girlSummerIdle,
    boyImage: null,
    girlFrames: null,
    boyFrames: null,
    girlVideo: null,
    boyVideo: null,
    bg: summerBeachBg,
    bgTheme: 'summer',
  },
  sakura_festival: {
    name: '櫻燈祭典套裝',
    desc: '月下神社祭典主題限定',
    girlImage: girlSakuraFestival,
    boyImage: null,
    girlFrames: null,
    boyFrames: null,
    girlVideo: null,
    boyVideo: null,
    bg: sakuraFestivalBg,
    bgTheme: 'sakura',
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
  return { frames, blink, image, video, bg: c.bg, bgTheme: c.bgTheme }
}
