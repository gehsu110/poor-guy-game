import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { updateProfile, calcLevel } from '../firebase'
import { BottomNav } from './TownScreen'
import GameIcon from '../components/GameIcon'
import guildBg from '../assets/academy-art/guild-bg.webp'
import { formatMoney, getTitle, todayStr } from '../gameLogic'

const DAILY_POOL = [
  {
    id: 'daily_notes',
    title: '備註整理師',
    desc: '今日 2 筆記帳有備註',
    metric: state => state.expenses.filter(e => e.note?.trim()).length,
    target: 2,
    reward: { exp: 35, yellow: 1 },
  },
  {
    id: 'daily_small',
    title: '小額警戒',
    desc: '記下 2 筆 NT$200 以內消費',
    metric: state => state.expenses.filter(e => Number(e.amount ?? 0) > 0 && Number(e.amount ?? 0) <= 200).length,
    target: 2,
    reward: { exp: 35, yellow: 1 },
  },
  {
    id: 'daily_combo',
    title: '五段連擊',
    desc: '今日記帳 5 筆以上',
    metric: state => state.expenses.length,
    target: 5,
    reward: { exp: 50, yellow: 2 },
  },
  {
    id: 'daily_category',
    title: '分類觀察員',
    desc: '今日使用 2 種消費分類',
    metric: state => new Set(state.expenses.map(e => e.category).filter(Boolean)).size,
    target: 2,
    reward: { exp: 40, yellow: 1 },
  },
  {
    id: 'daily_budget_margin',
    title: '留一點餘裕',
    desc: '有記帳且今日消費低於預算 80%',
    metric: state => state.totalSpent > 0 && state.totalSpent <= (state.profile?.dailyBudget ?? 1000) * 0.8 ? 1 : 0,
    target: 1,
    reward: { exp: 45, yellow: 2 },
  },
  {
    id: 'daily_map_check',
    title: '查看遠征路線',
    desc: '今日開啟地圖確認進度',
    metric: () => 0,
    target: 1,
    reward: { exp: 25, yellow: 1 },
    planned: true,
  },
]

const BASE_DAILY = [
  {
    id: 'first_expense',
    title: '第一次施放記帳術式',
    desc: '建立任一筆今日消費',
    metric: state => state.expenses.length,
    target: 1,
    reward: { exp: 40, yellow: 1 },
  },
  {
    id: 'under_budget',
    title: '預算守門',
    desc: '今日有記帳且仍在預算內',
    metric: state => state.totalSpent > 0 && state.totalSpent <= (state.profile?.dailyBudget ?? 1000) ? 1 : 0,
    target: 1,
    reward: { exp: 45, yellow: 2 },
  },
  {
    id: 'defeat_today',
    title: '今日咒靈淨化',
    desc: '擊殺今日怪物',
    metric: state => state.currentHp <= 0 ? 1 : 0,
    target: 1,
    reward: { exp: 80, purple: 1 },
  },
]

function pickRotatingDaily(state) {
  const date = state.date ?? todayStr()
  const daySeed = Number(date.replaceAll('-', '')) || 1
  const first = daySeed % DAILY_POOL.length
  const second = (first + 2 + (daySeed % 3)) % DAILY_POOL.length
  return [DAILY_POOL[first], DAILY_POOL[second]].filter((item, index, arr) => (
    arr.findIndex(other => other.id === item.id) === index
  ))
}

function materializeMission(template, state, group, extra = {}) {
  const raw = template.metric?.(state) ?? template.progress ?? 0
  return {
    ...template,
    ...extra,
    group,
    progress: Math.min(raw, template.target),
  }
}

function buildMissionSets(state) {
  const { profile } = state
  const consecutiveDays = profile?.consecutiveDays ?? 0
  const collectionCount = profile?.collection?.length ?? 0
  const level = profile?.level ?? 1
  const rotating = pickRotatingDaily(state)

  const daily = [...BASE_DAILY, ...rotating].map(mission => materializeMission(mission, state, 'daily'))
  const weekly = [
    {
      id: 'week_record_5',
      title: '本週路線亮起',
      desc: '本週累積 5 天完成記帳',
      progress: Math.min(consecutiveDays, 5),
      target: 5,
      reward: { exp: 120, yellow: 5, normalTicket: 1 },
      tag: '週獎勵',
    },
    {
      id: 'week_record_7',
      title: '七日完整遠征',
      desc: '一整週都有記帳，地圖週獎勵預留',
      progress: Math.min(consecutiveDays, 7),
      target: 7,
      reward: { exp: 180, purple: 1, normalTicket: 2 },
      tag: '可接地圖',
    },
  ].map(mission => ({ ...mission, group: 'weekly' }))

  const achievements = [
    {
      id: 'streak_7',
      series: '習慣',
      title: '七日習慣',
      desc: '連續記帳 7 天',
      progress: Math.min(consecutiveDays, 7),
      target: 7,
      reward: { exp: 120, purple: 1 },
    },
    {
      id: 'streak_30',
      series: '習慣',
      title: '月光巡禮',
      desc: '連續記帳 30 天',
      progress: Math.min(consecutiveDays, 30),
      target: 30,
      reward: { exp: 360, purple: 3, goldTicket: 1 },
    },
    {
      id: 'level_5',
      series: '成長',
      title: '見習魔法師',
      desc: '玩家等級達到 Lv.5',
      progress: Math.min(level, 5),
      target: 5,
      reward: { exp: 120, normalTicket: 2 },
    },
    {
      id: 'collector_5',
      series: '收藏',
      title: '補給收藏家',
      desc: '收藏品達 5 件',
      progress: Math.min(collectionCount, 5),
      target: 5,
      reward: { exp: 100, yellow: 3 },
    },
  ].map(mission => ({ ...mission, group: 'achievement' }))

  const activities = [
    {
      id: 'dragon_boat_preview',
      group: 'activity',
      title: '端午河岸祭典',
      desc: '節日週完成指定記帳天數，未來可領限定套裝',
      progress: 0,
      target: 5,
      reward: { exp: 200, purple: 2, outfit: '端午套裝' },
      tag: '活動預告',
      planned: true,
    },
  ]

  return { daily, weekly, achievements, activities }
}

function RewardChips({ reward }) {
  const chips = [
    reward.exp ? { key: 'exp', label: `EXP ${reward.exp}` } : null,
    reward.yellow ? { key: 'yellow', icon: 'coin-gold', value: reward.yellow } : null,
    reward.purple ? { key: 'purple', icon: 'coin-purple', value: reward.purple } : null,
    reward.normalTicket ? { key: 'normalTicket', icon: 'ticket-normal', value: reward.normalTicket } : null,
    reward.goldTicket ? { key: 'goldTicket', icon: 'ticket-gold', value: reward.goldTicket } : null,
    reward.outfit ? { key: 'outfit', label: reward.outfit, special: true } : null,
  ].filter(Boolean)

  return (
    <div className="academy-reward-chips">
      {chips.map(chip => (
        <span key={chip.key} className={`academy-reward-chip ${chip.special ? 'academy-reward-chip--special' : ''}`}>
          {chip.icon ? <GameIcon name={chip.icon} /> : null}
          <b>{chip.label ?? `x${chip.value}`}</b>
        </span>
      ))}
    </div>
  )
}

function MissionCard({ mission, index, claimed, claimKey, onClaim }) {
  const done = mission.progress >= mission.target
  const isClaimed = !!claimed[claimKey(mission)]
  const pct = Math.min(mission.progress / mission.target, 1)
  const locked = mission.planned

  return (
    <motion.article
      className={`academy-mission-card ${done ? 'is-done' : ''} ${locked ? 'is-planned' : ''}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="academy-mission-card__main">
        <span className={`academy-mission-mark ${done ? 'is-done' : ''}`}>
          <GameIcon name={done ? 'yellow-star' : 'mission'} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="academy-mission-card__title">
            <b>{mission.title}</b>
            {mission.tag && <i>{mission.tag}</i>}
            {mission.series && <i>{mission.series}</i>}
          </div>
          <p>{mission.desc}</p>
        </div>
        <button
          className={`academy-mission-claim ${done && !isClaimed && !locked ? 'is-ready' : ''}`}
          onClick={() => onClaim(mission)}
          disabled={locked || isClaimed || !done}
        >
          {locked ? '預告' : isClaimed ? '已領' : done ? '領取' : `${mission.progress}/${mission.target}`}
        </button>
      </div>
      <div className="academy-mission-progress">
        <motion.i animate={{ width: `${pct * 100}%` }} />
      </div>
      <RewardChips reward={mission.reward} />
    </motion.article>
  )
}

function MissionList({ missions, claimed, claimKey, onClaim, emptyText }) {
  if (!missions.length) {
    return <div className="academy-mission-empty">{emptyText}</div>
  }
  return missions.map((mission, index) => (
    <MissionCard
      key={mission.id}
      mission={mission}
      index={index}
      claimed={claimed}
      claimKey={claimKey}
      onClaim={onClaim}
    />
  ))
}

export default function MissionScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user } = state
  const [tab, setTab] = useState('daily')
  const sets = useMemo(() => buildMissionSets(state), [state])
  const claimed = profile?.claimedMissions ?? {}
  const dateKey = state.date ?? todayStr()
  const allMissions = [...sets.daily, ...sets.weekly, ...sets.achievements, ...sets.activities]
  const doneCount = allMissions.filter(m => m.progress >= m.target).length
  const readyCount = allMissions.filter(m => m.progress >= m.target && !claimed[claimKey(m)] && !m.planned).length
  const dailyDone = sets.daily.filter(m => m.progress >= m.target).length

  function claimKey(mission) {
    return mission.group === 'daily' ? `${dateKey}:${mission.id}` : mission.id
  }

  async function claim(mission) {
    const key = claimKey(mission)
    if (mission.planned || claimed[key] || mission.progress < mission.target) return
    const reward = mission.reward
    const exp = (profile?.exp ?? 0) + (reward.exp ?? 0)
    const levelInfo = calcLevel(exp)
    const data = {
      exp,
      ...levelInfo,
      title: getTitle(levelInfo.level).name,
      stars: {
        yellow: (profile?.stars?.yellow ?? 0) + (reward.yellow ?? 0),
        purple: (profile?.stars?.purple ?? 0) + (reward.purple ?? 0),
      },
      tickets: {
        normal: (profile?.tickets?.normal ?? 0) + (reward.normalTicket ?? 0),
        gold: (profile?.tickets?.gold ?? 0) + (reward.goldTicket ?? 0),
      },
      claimedMissions: { ...claimed, [key]: true },
    }
    dispatch({ type: 'UPDATE_PROFILE', data })
    dispatch({ type: 'SET_NOTIFICATION', notification: { type: 'mission', message: `${mission.title} 獎勵已領取` } })
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2400)
    if (user) await updateProfile(user.uid, data)
  }

  return (
    <div className="academy-screen">
      <img src={guildBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="academy-safe-top relative z-10 flex items-center gap-2 px-4 pb-2">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">任務與成就</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-28">
        <section className="academy-mission-board">
          <div>
            <span>今日任務板</span>
            <h2>完成 {dailyDone}/{sets.daily.length} 個小目標</h2>
            <p>每日任務會依日期輪替；週獎勵與活動會連接地圖進度。</p>
          </div>
          <b>{readyCount} 可領</b>
        </section>

        <div className="academy-mission-tabs">
          {[
            { key: 'daily', label: '每日' },
            { key: 'weekly', label: '每週' },
            { key: 'achievements', label: '成就' },
            { key: 'activity', label: '活動' },
          ].map(item => (
            <button key={item.key} className={tab === item.key ? 'is-active' : ''} onClick={() => setTab(item.key)}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="academy-mission-list">
          {tab === 'daily' && (
            <MissionList missions={sets.daily} claimed={claimed} claimKey={claimKey} onClaim={claim} emptyText="今日沒有任務" />
          )}
          {tab === 'weekly' && (
            <MissionList missions={sets.weekly} claimed={claimed} claimKey={claimKey} onClaim={claim} emptyText="本週獎勵尚未開放" />
          )}
          {tab === 'achievements' && (
            <MissionList missions={sets.achievements} claimed={claimed} claimKey={claimKey} onClaim={claim} emptyText="成就書尚未開放" />
          )}
          {tab === 'activity' && (
            <MissionList missions={sets.activities} claimed={claimed} claimKey={claimKey} onClaim={claim} emptyText="目前沒有活動" />
          )}
        </div>

        <section className="academy-mission-summary">
          <div className="mb-1 text-xs font-black text-[#26324A]">今日概況</div>
          <div><span>今日消費</span><b>NT${formatMoney(state.totalSpent)}</b></div>
          <div><span>今日記帳</span><b>{state.expenses.length} 筆</b></div>
          <div><span>連續記帳</span><b>{profile?.consecutiveDays ?? 0} 天</b></div>
          <div><span>總完成項目</span><b>{doneCount}/{allMissions.length}</b></div>
        </section>
      </div>

      <BottomNav current="missions" navigate={navigate} />
    </div>
  )
}
