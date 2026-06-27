export const QIXI_2026_EVENT = {
  id: 'qixi_star_bridge_2026',
  title: '七夕星橋願望祭',
  startDate: '2026-08-19',
  endDate: '2026-08-25',
  setId: 'qixi_star_bridge_set',
  outfitId: 'qixi_star_bridge',
  outfitName: '星橋願望套裝',
}

export const ZHONGYUAN_2026_EVENT = {
  id: 'ghost_month_market_2026',
  title: '中元夜市補給令',
  startDate: '2026-08-27',
  endDate: '2026-08-31',
}

export const QIXI_STAR_BRIDGE_ASSET_SPEC = {
  bgTheme: 'qixi',
  outfitId: QIXI_2026_EVENT.outfitId,
  setId: QIXI_2026_EVENT.setId,
  paths: {
    sourceDir: 'src/assets/academy-art/qixi-set/source/',
    background: 'src/assets/academy-art/qixi-set/qixi-bg.webp',
    girlImage: 'src/assets/academy-art/qixi-set/girl-qixi-star-bridge.webp',
    boyImage: 'src/assets/academy-art/qixi-set/boy-qixi-star-bridge.webp',
  },
  frontendTouchpoints: [
    'src/outfitAssets.js',
    'src/screens/ProfileScreen.jsx',
    'src/screens/TownScreen.jsx',
    'src/theme.css',
  ],
}

function getEventPhase(date, event) {
  if (date < event.startDate) return 'preview'
  if (date > event.endDate) return 'ended'
  return 'active'
}

function plannedForPhase(phase) {
  return phase !== 'active'
}

function activeTag(phase, previewLabel = '8/19 開放') {
  if (phase === 'active') return '活動中'
  if (phase === 'ended') return '已結束'
  return previewLabel
}

export function buildQixiActivityMissions(state) {
  const date = state.date ?? ''
  const phase = getEventPhase(date, QIXI_2026_EVENT)
  const planned = plannedForPhase(phase)
  const expenses = state.expenses ?? []
  const totalSpent = state.totalSpent ?? 0
  const dailyBudget = state.profile?.dailyBudget ?? 1000
  const consecutiveDays = state.profile?.consecutiveDays ?? 0

  const qixiMissions = [
    {
      id: 'qixi_star_bridge_opening',
      group: 'activity',
      title: '星橋啟程',
      desc: '活動期間建立任一筆消費，把今天的帳本點成第一盞星燈',
      progress: planned ? 0 : Math.min(expenses.length, 1),
      target: 1,
      reward: { exp: 80, yellow: 2 },
      tag: activeTag(phase),
      series: '七夕主檔',
      planned,
    },
    {
      id: 'qixi_wish_budget',
      group: 'activity',
      title: '願望金留存',
      desc: '有記帳且今日仍在預算內，替星橋留下願望金',
      progress: planned ? 0 : (totalSpent > 0 && totalSpent <= dailyBudget ? 1 : 0),
      target: 1,
      reward: { exp: 110, purple: 1 },
      tag: activeTag(phase),
      series: '七夕主檔',
      planned,
    },
    {
      id: 'qixi_star_sand_notes',
      group: 'activity',
      title: '星砂記帳三連',
      desc: '同一天記下 3 筆消費，收集星砂修補鵲橋路線',
      progress: planned ? 0 : Math.min(expenses.length, 3),
      target: 3,
      reward: { exp: 130, yellow: 3, normalTicket: 1 },
      tag: activeTag(phase),
      series: '七夕主檔',
      planned,
    },
    {
      id: 'qixi_star_bridge_set',
      group: 'activity',
      title: '星橋願望套裝線',
      desc: '活動週維持 7 天記帳節奏，解鎖星橋願望套裝取得資格',
      progress: planned ? 0 : Math.min(consecutiveDays, 7),
      target: 7,
      reward: {
        exp: 260,
        purple: 3,
        goldTicket: 1,
        outfit: QIXI_2026_EVENT.outfitName,
        collectionItem: {
          id: QIXI_2026_EVENT.setId,
          type: 'set',
          rarity: 'SSR',
          source: QIXI_2026_EVENT.title,
        },
      },
      tag: '套裝線',
      series: '節日限定',
      planned,
    },
  ]

  const zhongyuanPhase = getEventPhase(date, ZHONGYUAN_2026_EVENT)
  const zhongyuanPlanned = plannedForPhase(zhongyuanPhase)
  const zhongyuanMission = {
    id: ZHONGYUAN_2026_EVENT.id,
    group: 'activity',
    title: ZHONGYUAN_2026_EVENT.title,
    desc: '七夕後接續的小活動：用夜市普渡與財務避邪任務收尾夏末檔期',
    progress: zhongyuanPlanned ? 0 : Math.min(expenses.length, 3),
    target: 3,
    reward: { exp: 120, yellow: 5, normalTicket: 1 },
    tag: activeTag(zhongyuanPhase, '8/27 開放'),
    series: '節慶接續',
    planned: zhongyuanPlanned,
  }

  return [...qixiMissions, zhongyuanMission]
}
