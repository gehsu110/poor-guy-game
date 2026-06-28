export const HOME_SCENE_EFFECTS = {
  backgroundAura: {
    academy_stardust: {
      name: '學院星塵',
      themes: ['academy', 'hero', 'mint', 'crystal', 'night', 'city'],
      rarity: 'R',
      color: '#FFE4A0',
      iconKey: 'star',
      costType: 'yellow',
      cost: 4,
    },
    sakura_petals: {
      name: '櫻燈花瓣',
      themes: ['sakura'],
      rarity: 'R',
      color: '#F3B7C7',
      iconKey: 'ticket',
      costType: 'yellow',
      cost: 5,
    },
    qixi_star_threads: {
      name: '星橋流光',
      themes: ['qixi', 'night'],
      rarity: 'SR',
      color: '#D6C6FF',
      iconKey: 'crystal',
      costType: 'purple',
      cost: 2,
    },
    rainy_afterglow: {
      name: '雨後水光',
      themes: ['rainy'],
      rarity: 'R',
      color: '#A8E6CF',
      iconKey: 'crystal',
      costType: 'yellow',
      cost: 5,
    },
  },
  groundEffect: {
    starter_magic_circle: {
      name: '星砂腳底魔法圈',
      themes: ['academy', 'hero', 'mint', 'crystal', 'night', 'city'],
      rarity: 'R',
      color: '#FFE4A0',
      iconKey: 'star',
      costType: 'yellow',
      cost: 7,
    },
    sakura_lantern_ring: {
      name: '櫻燈舞台光圈',
      themes: ['sakura'],
      rarity: 'R',
      color: '#F3B7C7',
      iconKey: 'ticket',
      costType: 'yellow',
      cost: 7,
    },
    qixi_star_sigil: {
      name: '星橋願望法陣',
      themes: ['qixi', 'night'],
      rarity: 'SR',
      color: '#FFE4A0',
      iconKey: 'star',
      costType: 'purple',
      cost: 3,
    },
    rainy_puddle_shimmer: {
      name: '雨後地面水光',
      themes: ['rainy'],
      rarity: 'R',
      color: '#A8E6CF',
      iconKey: 'crystal',
      costType: 'yellow',
      cost: 7,
    },
  },
  successEffect: {
    coin_spark_burst: {
      name: '金幣小爆光',
      themes: ['academy', 'summer', 'sakura', 'qixi', 'rainy', 'hero', 'mint', 'crystal', 'night', 'city'],
      rarity: 'R',
      color: '#FFE4A0',
      iconKey: 'star',
      costType: 'yellow',
      cost: 6,
    },
    ticket_glow_burst: {
      name: '補給券光束',
      themes: ['academy', 'summer', 'sakura', 'qixi', 'rainy', 'hero', 'mint', 'crystal', 'night', 'city'],
      rarity: 'SR',
      color: '#C8A8E9',
      iconKey: 'ticket',
      costType: 'purple',
      cost: 2,
    },
    star_confetti_burst: {
      name: '星砂彩屑',
      themes: ['academy', 'summer', 'sakura', 'qixi', 'rainy', 'hero', 'mint', 'crystal', 'night', 'city'],
      rarity: 'SR',
      color: '#FFD35F',
      iconKey: 'goldTicket',
      costType: 'purple',
      cost: 3,
    },
  },
}

export const DEFAULT_HOME_EFFECTS_BY_THEME = {
  academy: {
    backgroundAura: 'academy_stardust',
    groundEffect: 'starter_magic_circle',
    successEffect: 'coin_spark_burst',
  },
  summer: {
    backgroundAura: 'academy_stardust',
    groundEffect: 'starter_magic_circle',
    successEffect: 'coin_spark_burst',
  },
  sakura: {
    backgroundAura: 'sakura_petals',
    groundEffect: 'sakura_lantern_ring',
    successEffect: 'coin_spark_burst',
  },
  qixi: {
    backgroundAura: 'qixi_star_threads',
    groundEffect: 'qixi_star_sigil',
    successEffect: 'star_confetti_burst',
  },
  rainy: {
    backgroundAura: 'rainy_afterglow',
    groundEffect: 'rainy_puddle_shimmer',
    successEffect: 'ticket_glow_burst',
  },
}

export const HOME_EFFECT_TYPE_LABELS = {
  backgroundAura: '背景氛圍',
  groundEffect: '地面舞台',
  successEffect: '記帳成功',
}

export function getHomeEffect(type, id) {
  return HOME_SCENE_EFFECTS[type]?.[id] ?? null
}

export function getDefaultHomeEffects(theme = 'academy') {
  return DEFAULT_HOME_EFFECTS_BY_THEME[theme] ?? DEFAULT_HOME_EFFECTS_BY_THEME.academy
}

export function getEquippedHomeEffects(equipped = {}, theme = 'academy') {
  const defaults = getDefaultHomeEffects(theme)
  return {
    backgroundAura: equipped.backgroundAura ?? defaults.backgroundAura,
    groundEffect: equipped.groundEffect ?? defaults.groundEffect,
    successEffect: equipped.successEffect ?? defaults.successEffect,
  }
}

export function flattenHomeSceneEffects() {
  return Object.entries(HOME_SCENE_EFFECTS).flatMap(([type, effects]) => (
    Object.entries(effects).map(([id, effect]) => ({ id, type, ...effect }))
  ))
}
