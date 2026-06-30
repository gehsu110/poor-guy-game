export const BATTLE_ATTACK_EFFECTS = {
  ledger_seal_strike: {
    name: '帳本星印攻擊',
    rarity: 'R',
    color: '#FFE4A0',
    iconKey: 'star',
    costType: 'yellow',
    cost: 0,
    description: '帳本印章蓄力後向怪物施放星印打擊。',
    presentation: {
      segments: ['attackCharge', 'attackHit', 'attackResolve'],
    },
  },
  star_quill_slash: {
    name: '星羽筆斬擊',
    rarity: 'SR',
    color: '#C8A8E9',
    iconKey: 'crystal',
    costType: 'purple',
    cost: 2,
    description: '星羽筆劃出斜向光痕，命中時留下帳本星塵。',
    presentation: {
      segments: ['attackCharge', 'attackHit', 'attackResolve'],
    },
  },
}

export const DEFAULT_BATTLE_ATTACK_EFFECT = 'ledger_seal_strike'

export function getBattleAttackEffect(id) {
  return BATTLE_ATTACK_EFFECTS[id] ?? BATTLE_ATTACK_EFFECTS[DEFAULT_BATTLE_ATTACK_EFFECT]
}

export function flattenBattleAttackEffects() {
  return Object.entries(BATTLE_ATTACK_EFFECTS).map(([id, effect]) => ({
    id,
    type: 'attackEffect',
    ...effect,
  }))
}
