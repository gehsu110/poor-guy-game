import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { getTitle, TITLES, formatMoney } from '../gameLogic'
import { loginWithGoogle, updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'
import profileBg from '../assets/academy-art/profile-bg.webp'
import avatars from '../assets/academy-art/avatars.png'

function AvatarPreview({ gender = 'girl' }) {
  return (
    <div className={`academy-avatar academy-profile-avatar academy-avatar--${gender}`}>
      <img src={avatars} alt="" draggable="false" />
    </div>
  )
}

function ExpBar({ expInLevel, expToNext }) {
  const pct = expToNext > 0 ? Math.min(expInLevel / expToNext, 1) : 1
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
        <span>EXP</span>
        <span>{expInLevel} / {expToNext}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#ECE7F5]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#52DED4]"
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  )
}

function TitleList({ currentLevel }) {
  return (
    <div className="flex flex-col gap-1.5">
      {TITLES.map((t, i) => {
        const unlocked = currentLevel >= t.minLv
        return (
          <div key={i} className={`academy-list-row ${unlocked ? '' : 'opacity-55'}`}>
            <span className={`academy-icon ${unlocked ? 'academy-icon--star' : 'academy-icon--unknown'}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-[#26324A]">{t.name}</div>
              <div className="truncate text-[10px] font-bold text-[#8E87A8]">{t.desc}</div>
            </div>
            <div className="text-[10px] font-black text-[#8E87A8]">Lv.{t.minLv}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProfileScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user } = state
  const [tab, setTab] = useState('stats')
  const [editBudget, setEditBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(profile?.dailyBudget ?? 1000))

  const level = profile?.level ?? 1
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const title = getTitle(level)
  const avatarGender = profile?.avatarGender ?? 'girl'

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
    dispatch({ type: 'UPDATE_PROFILE', data: { dailyBudget: val } })
    setEditBudget(false)
    if (user) {
      try {
        await updateProfile(user.uid, { dailyBudget: val })
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function chooseAvatar(gender) {
    dispatch({ type: 'UPDATE_PROFILE', data: { avatarGender: gender } })
    if (user) {
      try {
        await updateProfile(user.uid, { avatarGender: gender })
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <div className="academy-screen">
      <img src={profileBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-10 flex items-center gap-2 px-4 pb-2 pt-4">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">我的成長</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-card mb-3 text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <AvatarPreview gender={avatarGender} />
          </div>
          <div className="text-base font-black text-[#26324A]">{title.name}</div>
          <div className="text-xs font-bold text-[#8E87A8]">{title.desc}</div>
          <div className="mx-auto mt-2 w-52">
            <ExpBar expInLevel={expInLevel} expToNext={expToNext} />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-2">
          {[
            { label: '黃星', val: profile?.stars?.yellow ?? 0, tone: 'gold' },
            { label: '紫星', val: profile?.stars?.purple ?? 0, tone: 'purple' },
            { label: '補給券', val: profile?.tickets?.normal ?? 0, tone: 'blue' },
            { label: '金券', val: profile?.tickets?.gold ?? 0, tone: 'pink' },
          ].map(c => (
            <div key={c.label} className={`academy-mini-stat academy-mini-stat--${c.tone}`}>
              <div className="text-sm font-black">{c.val}</div>
              <div className="text-[9px] font-bold">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="academy-tabs mb-3">
          {[
            { k: 'stats', label: '狀態' },
            { k: 'titles', label: '稱號' },
            { k: 'settings', label: '設定' },
          ].map(t => (
            <button key={t.k} className={tab === t.k ? 'is-active' : ''} onClick={() => setTab(t.k)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'stats' && (
          <div className="academy-card">
            <div className="mb-3 text-xs font-black text-[#26324A]">今日狀態</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '今日消費', val: `NT$${formatMoney(state.totalSpent)}` },
                { label: '今日預算', val: `NT$${formatMoney(profile?.dailyBudget ?? 1000)}` },
                { label: '連續記帳', val: `${profile?.consecutiveDays ?? 0}天` },
                { label: '咒靈HP', val: `${formatMoney(state.currentHp)}` },
              ].map(s => (
                <div key={s.label} className="academy-stat-box">
                  <div className="text-[10px] font-bold text-[#8E87A8]">{s.label}</div>
                  <div className="text-sm font-black text-[#26324A]">{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'titles' && (
          <div className="academy-card">
            <div className="mb-3 text-xs font-black text-[#26324A]">所有稱號</div>
            <TitleList currentLevel={level} />
          </div>
        )}

        {tab === 'settings' && (
          <div className="flex flex-col gap-3">
            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">主角外觀</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: 'boy', label: '男主角' },
                  { k: 'girl', label: '女主角' },
                ].map(a => (
                  <button
                    key={a.k}
                    className={`academy-avatar-option ${avatarGender === a.k ? 'is-active' : ''}`}
                    onClick={() => chooseAvatar(a.k)}
                  >
                    <AvatarPreview gender={a.k} />
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">每日預算</div>
              {editBudget ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    className="min-w-0 flex-1 rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
                  />
                  <button className="academy-small-button" onClick={saveBudget}>儲存</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#26324A]">NT${formatMoney(profile?.dailyBudget ?? 1000)}</span>
                  <button className="text-xs font-black text-[#8B7CFF]" onClick={() => setEditBudget(true)}>修改</button>
                </div>
              )}
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">帳號</div>
              {user?.isAnonymous ? (
                <div>
                  <div className="mb-2 text-xs font-bold text-[#8E87A8]">目前使用匿名登入，綁定 Google 帳號可保存進度</div>
                  <button className="academy-small-button w-full" onClick={handleGoogleLink}>
                    綁定 Google 帳號
                  </button>
                </div>
              ) : (
                <div className="text-xs font-bold text-[#8E87A8]">{user?.email ?? user?.displayName ?? '已登入'}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav current="profile" navigate={navigate} />
    </div>
  )
}
