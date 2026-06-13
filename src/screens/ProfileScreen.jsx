import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { getTitle, TITLES, formatMoney } from '../gameLogic'
import { loginWithGoogle, updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'

// EXP 條
function ExpBar({ expInLevel, expToNext, level }) {
  const pct = expToNext > 0 ? Math.min(expInLevel / expToNext, 1) : 1
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
        <span>EXP</span>
        <span>{expInLevel} / {expToNext}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #C8A8E9, #A8D8EA)' }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  )
}

// 稱號列表
function TitleList({ currentLevel }) {
  return (
    <div className="flex flex-col gap-1.5">
      {TITLES.map((t, i) => {
        const unlocked = currentLevel >= t.minLv
        return (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl ${unlocked ? 'bg-purple-50' : 'bg-gray-50 opacity-50'}`}
          >
            <span className="text-xl">{unlocked ? '✅' : '🔒'}</span>
            <div className="flex-1">
              <div className={`text-xs font-bold ${unlocked ? 'text-slate-700' : 'text-slate-400'}`}>{t.name}</div>
              <div className="text-[10px] text-slate-400">{t.desc}</div>
            </div>
            <div className="text-[10px] text-slate-400">Lv.{t.minLv}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProfileScreen() {
  const { state, navigate } = useApp()
  const { profile, user } = state
  const [tab, setTab] = useState('stats')
  const [editBudget, setEditBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(profile?.dailyBudget ?? 1000))

  const level = profile?.level ?? 1
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const title = getTitle(level)

  async function handleGoogleLink() {
    try {
      await loginWithGoogle()
    } catch (e) {
      console.error(e)
    }
  }

  async function saveBudget() {
    const val = Number(budgetInput)
    if (!val || val < 100) return
    await updateProfile(user.uid, { dailyBudget: val })
    setEditBudget(false)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #F0F0FF 100%)' }}>
      {/* 頂部 */}
      <div className="flex items-center px-4 pt-3 pb-2 gap-2">
        <button className="text-slate-400 tap-bounce" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-slate-700">👤 勇者資料</div>
      </div>

      {/* 大頭貼 + 等級 */}
      <div className="flex flex-col items-center py-4 gap-2">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #C8A8E9, #A8D8EA)' }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🧑‍💼
        </motion.div>
        <div className="text-center">
          <div className="font-black text-slate-700 text-base">{title.name}</div>
          <div className="text-xs text-slate-400">{title.desc}</div>
          <div className="text-xs text-purple-500 font-bold mt-0.5">Lv.{level}</div>
        </div>
        {/* EXP 條 */}
        <div className="w-48">
          <ExpBar expInLevel={expInLevel} expToNext={expToNext} level={level} />
        </div>
      </div>

      {/* 貨幣狀態 */}
      <div className="flex gap-2 mx-4 mb-3">
        {[
          { emoji: '⭐', label: '黃星',   val: profile?.stars?.yellow ?? 0, bg: '#FFF8E1', color: '#F59E0B' },
          { emoji: '💜', label: '紫星',   val: profile?.stars?.purple ?? 0, bg: '#F5F0FF', color: '#9333EA' },
          { emoji: '🎟', label: '扭蛋券', val: profile?.tickets?.normal ?? 0, bg: '#E0F2FE', color: '#0284C7' },
          { emoji: '🎫', label: '金色券', val: profile?.tickets?.gold ?? 0, bg: '#FEF3C7', color: '#D97706' },
        ].map(c => (
          <div key={c.label} className="flex-1 rounded-2xl p-2 text-center" style={{ background: c.bg }}>
            <div className="text-lg">{c.emoji}</div>
            <div className="text-sm font-black" style={{ color: c.color }}>{c.val}</div>
            <div className="text-[9px] text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tab */}
      <div className="flex mx-4 bg-white/60 rounded-2xl p-1 gap-1 mb-2">
        {[{k:'stats',label:'📊 統計'},{k:'titles',label:'🏷️ 稱號'},{k:'settings',label:'⚙️ 設定'}].map(t => (
          <button
            key={t.k}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${tab === t.k ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
            onClick={() => setTab(t.k)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {tab === 'stats' && (
          <div className="flex flex-col gap-3">
            <div className="bg-white/80 rounded-3xl p-4 shadow-sm">
              <div className="font-bold text-slate-600 text-xs mb-3">今日狀態</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '今日消費', val: `NT$${formatMoney(state.totalSpent)}` },
                  { label: '今日預算', val: `NT$${formatMoney(profile?.dailyBudget ?? 1000)}` },
                  { label: '連續記帳', val: `${profile?.consecutiveDays ?? 0}天` },
                  { label: '怪物HP', val: `${formatMoney(state.currentHp)}` },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2">
                    <div className="text-[10px] text-slate-400">{s.label}</div>
                    <div className="text-sm font-black text-slate-700">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'titles' && (
          <div className="bg-white/80 rounded-3xl p-4 shadow-sm">
            <div className="font-bold text-slate-600 text-xs mb-3">所有稱號</div>
            <TitleList currentLevel={level} />
          </div>
        )}

        {tab === 'settings' && (
          <div className="flex flex-col gap-3">
            {/* 今日預算設定 */}
            <div className="bg-white/80 rounded-3xl p-4 shadow-sm">
              <div className="font-bold text-slate-600 text-xs mb-3">每日預算</div>
              {editBudget ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm border border-purple-200 outline-none"
                  />
                  <button
                    className="px-4 py-2 text-white text-sm rounded-xl font-bold tap-bounce"
                    style={{ background: 'linear-gradient(135deg, #C8A8E9, #A8D8EA)' }}
                    onClick={saveBudget}
                  >
                    儲存
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-700">NT${formatMoney(profile?.dailyBudget ?? 1000)}</span>
                  <button
                    className="text-xs text-purple-500 font-bold tap-bounce"
                    onClick={() => setEditBudget(true)}
                  >
                    修改
                  </button>
                </div>
              )}
            </div>

            {/* 帳號 */}
            <div className="bg-white/80 rounded-3xl p-4 shadow-sm">
              <div className="font-bold text-slate-600 text-xs mb-3">帳號</div>
              {user?.isAnonymous ? (
                <div>
                  <div className="text-xs text-slate-400 mb-2">目前使用匿名登入，綁定 Google 帳號可保存進度</div>
                  <button
                    className="w-full py-2.5 rounded-xl font-bold text-sm tap-bounce text-white"
                    style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}
                    onClick={handleGoogleLink}
                  >
                    🔗 綁定 Google 帳號
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">G</div>
                  <div>
                    <div className="text-xs font-bold text-slate-700">{user?.displayName ?? 'Google 用戶'}</div>
                    <div className="text-[10px] text-slate-400">{user?.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav current="profile" navigate={navigate} />
    </div>
  )
}
