import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { updateProfile, calcLevel } from '../firebase'
import { BottomNav } from './TownScreen'
import guildBg from '../assets/academy-art/guild-bg.webp'
import { formatMoney, getTitle } from '../gameLogic'

function buildMissions(state) {
  const { profile, expenses, totalSpent, currentHp } = state
  const consecutiveDays = profile?.consecutiveDays ?? 0
  const collectionCount = profile?.collection?.length ?? 0
  const budget = profile?.dailyBudget ?? 1000

  return [
    {
      id: 'first_expense',
      title: '第一次施放記帳術式',
      desc: '建立任一筆今日消費',
      progress: Math.min(expenses.length, 1),
      target: 1,
      reward: { exp: 40, yellow: 1 },
    },
    {
      id: 'three_entries',
      title: '今日三連記帳',
      desc: '今日記帳 3 筆以上',
      progress: Math.min(expenses.length, 3),
      target: 3,
      reward: { exp: 60, yellow: 2 },
    },
    {
      id: 'under_budget',
      title: '預算守門',
      desc: '今日仍在預算內',
      progress: totalSpent > 0 && totalSpent <= budget ? 1 : 0,
      target: 1,
      reward: { exp: 45, yellow: 2 },
    },
    {
      id: 'defeat_today',
      title: '今日咒靈淨化',
      desc: '擊殺今日怪物',
      progress: currentHp <= 0 ? 1 : 0,
      target: 1,
      reward: { exp: 80, purple: 1 },
    },
    {
      id: 'streak_7',
      title: '七日習慣',
      desc: '連續記帳 7 天',
      progress: Math.min(consecutiveDays, 7),
      target: 7,
      reward: { exp: 120, purple: 1 },
    },
    {
      id: 'collector_5',
      title: '補給收藏家',
      desc: '收藏品達 5 件',
      progress: Math.min(collectionCount, 5),
      target: 5,
      reward: { exp: 100, yellow: 3 },
    },
  ]
}

function RewardText({ reward }) {
  const parts = []
  if (reward.exp) parts.push(`EXP ${reward.exp}`)
  if (reward.yellow) parts.push(`黃色星星 ${reward.yellow}`)
  if (reward.purple) parts.push(`紫色星星 ${reward.purple}`)
  return parts.join(' / ')
}

export default function MissionScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user } = state
  const missions = useMemo(() => buildMissions(state), [state])
  const claimed = profile?.claimedMissions ?? {}
  const completeCount = missions.filter(m => m.progress >= m.target).length

  async function claim(mission) {
    if (claimed[mission.id] || mission.progress < mission.target) return
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
      claimedMissions: { ...claimed, [mission.id]: true },
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

      <div className="relative z-10 flex items-center gap-2 px-4 pb-2 pt-4">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">任務與成就</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-card mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-black text-[#26324A]">習慣任務板</div>
              <div className="text-xs font-bold text-[#8E87A8]">記帳、控支、收藏都會推進成長</div>
            </div>
            <span className="academy-status">{completeCount}/{missions.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {missions.map((mission, i) => {
            const done = mission.progress >= mission.target
            const isClaimed = !!claimed[mission.id]
            const pct = Math.min(mission.progress / mission.target, 1)
            return (
              <motion.div
                key={mission.id}
                className="academy-card"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center gap-3">
                  <span className={`academy-icon ${done ? 'academy-icon--star' : 'academy-icon--unknown'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-[#26324A]">{mission.title}</div>
                    <div className="text-[10px] font-bold text-[#8E87A8]">{mission.desc}</div>
                  </div>
                  <button
                    className={`academy-status ${done && !isClaimed ? 'academy-status--done' : ''}`}
                    onClick={() => claim(mission)}
                  >
                    {isClaimed ? '已領' : done ? '領取' : `${mission.progress}/${mission.target}`}
                  </button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECE7F5]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#52DED4]"
                    animate={{ width: `${pct * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-[10px] font-black text-[#8E87A8]">
                  <RewardText reward={mission.reward} />
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="academy-card mt-3 text-xs font-bold leading-6 text-[#8E87A8]">
          <div className="mb-1 text-xs font-black text-[#26324A]">今日概況</div>
          <div className="flex justify-between"><span>今日消費</span><span>NT${formatMoney(state.totalSpent)}</span></div>
          <div className="flex justify-between"><span>今日記帳</span><span>{state.expenses.length} 筆</span></div>
          <div className="flex justify-between"><span>連續記帳</span><span>{profile?.consecutiveDays ?? 0} 天</span></div>
        </div>
      </div>

      <BottomNav current="missions" navigate={navigate} />
    </div>
  )
}
