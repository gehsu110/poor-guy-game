import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { BottomNav } from './TownScreen'

const QUESTS = [
  // 成就型
  { id: 'first_record',    name: '第一筆記帳',     desc: '記下你的第一筆消費',     emoji: '✏️', reward: { exp: 50, yellow: 2 },  required: 1,   type: 'count', key: 'totalEntries' },
  { id: 'first_kill',      name: '初次擊殺',        desc: '擊殺你的第一隻怪物',     emoji: '⚔️', reward: { exp: 80, ticket: 1 }, required: 1,   type: 'count', key: 'totalKills' },
  { id: 'streak_7',        name: '七日連勤',        desc: '連續記帳 7 天',          emoji: '🔥', reward: { exp: 200, ticket: 2 },required: 7,   type: 'streak', key: 'consecutiveDays' },
  { id: 'streak_30',       name: '月度傳說',        desc: '連續記帳 30 天',         emoji: '🌟', reward: { exp: 800, purple: 2 }, required: 30,  type: 'streak', key: 'consecutiveDays' },
  { id: 'entries_100',     name: '百筆勇者',        desc: '累積記帳 100 筆',        emoji: '📚', reward: { exp: 300, yellow: 5 }, required: 100, type: 'count', key: 'totalEntries' },
  { id: 'kills_50',        name: '連勝50場',        desc: '累積擊殺 50 隻怪物',     emoji: '💀', reward: { exp: 500, ticket: 3 }, required: 50,  type: 'count', key: 'totalKills' },
  { id: 'first_s',         name: '完美守護',        desc: '獲得第一個 S 評級',      emoji: '✨', reward: { exp: 150, purple: 1 }, required: 1,   type: 'count', key: 'sRatings' },
  { id: 'first_monthboss', name: '月底英雄',        desc: '擊殺月Boss',             emoji: '🐉', reward: { exp: 500, gold: 1 },   required: 1,   type: 'count', key: 'monthBossKills' },
]

function QuestCard({ quest, progress, done }) {
  const pct = Math.min(progress / quest.required, 1)

  return (
    <motion.div
      className={`flex items-center gap-3 px-3 py-3 rounded-2xl ${done ? 'bg-green-50' : 'bg-white/70'}`}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
        {done ? '✅' : quest.emoji}
      </div>
      <div className="flex-1">
        <div className={`text-xs font-bold ${done ? 'text-green-700' : 'text-slate-700'}`}>{quest.name}</div>
        <div className="text-[10px] text-slate-400">{quest.desc}</div>
        {!done && (
          <div className="mt-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-purple-300" style={{ width: `${pct * 100}%` }} />
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">{progress} / {quest.required}</div>
          </div>
        )}
      </div>
      <div className="text-right text-[10px] text-slate-500">
        {quest.reward.exp && <div>EXP+{quest.reward.exp}</div>}
        {quest.reward.ticket && <div>🎟+{quest.reward.ticket}</div>}
        {quest.reward.gold && <div>🎫+{quest.reward.gold}</div>}
        {quest.reward.purple && <div>💜+{quest.reward.purple}</div>}
        {quest.reward.yellow && <div>⭐+{quest.reward.yellow}</div>}
      </div>
    </motion.div>
  )
}

export default function QuestScreen() {
  const { state, navigate } = useApp()
  const { profile } = state

  // 取得進度（真實要從 Firebase 讀，這裡先用 profile 估算）
  const getProgress = (key) => {
    const map = {
      totalEntries: state.expenses?.length ?? 0,
      totalKills: 0,
      consecutiveDays: profile?.consecutiveDays ?? 0,
      sRatings: 0,
      monthBossKills: 0,
    }
    return map[key] ?? 0
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #FFFBF0 0%, #F0F8FF 100%)' }}>
      {/* 頂部 */}
      <div className="flex items-center px-4 pt-3 pb-2 gap-2">
        <button className="text-slate-400 tap-bounce" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-slate-700">📜 任務 & 成就</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="flex flex-col gap-2 py-2">
          {QUESTS.map(q => {
            const progress = getProgress(q.key)
            const done = progress >= q.required
            return <QuestCard key={q.id} quest={q} progress={progress} done={done} />
          })}
        </div>
      </div>

      <BottomNav current="quest" navigate={navigate} />
    </div>
  )
}
