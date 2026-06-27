import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { calcLevel, updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'
import guildBg from '../assets/academy-art/guild-bg.webp'
import { formatMoney, getTitle } from '../gameLogic'

function FinanceModule({ title, value, sub, tone = 'purple', delay = 0 }) {
  return (
    <motion.div
      className={`academy-guild-module academy-guild-module--${tone}`}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
    >
      <div className="text-[10px] font-black text-[#8E87A8]">{title}</div>
      <div className="mt-1 text-lg font-black text-[#26324A]">{value}</div>
      <div className="mt-0.5 text-[10px] font-bold text-[#8E87A8]">{sub}</div>
    </motion.div>
  )
}

function PlanningRow({ label, sub, field, value, editing, inputValue, onEdit, onChange, onSave }) {
  return (
    <div className="academy-list-row">
      <span className="academy-icon academy-icon--coin" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-black text-[#26324A]">{label}</div>
        <div className="text-[10px] font-bold text-[#8E87A8]">{sub}</div>
        {editing && (
          <input
            type="number"
            value={inputValue}
            onChange={e => onChange(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
            placeholder="輸入金額"
          />
        )}
      </div>
      {editing ? (
        <button className="academy-small-button" onClick={() => onSave(field)}>儲存</button>
      ) : (
        <button className="academy-status" onClick={() => onEdit(field, value)}>
          {value > 0 ? `NT$${formatMoney(value)}` : '設定'}
        </button>
      )}
    </div>
  )
}

function ChallengeRow({ title, sub, done, claimed, reward, onClaim }) {
  return (
    <div className="academy-challenge-row">
      <div className={`academy-challenge-mark ${done ? 'is-done' : ''}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-black text-[#26324A]">{title}</div>
        <div className="truncate text-[10px] font-bold text-[#8E87A8]">{sub}</div>
      </div>
      <button className={`academy-status ${done && !claimed ? 'academy-status--done' : ''}`} onClick={onClaim}>
        {claimed ? '已領' : done ? '領取' : reward}
      </button>
    </div>
  )
}

export default function QuestScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, totalSpent, user } = state
  const [editing, setEditing] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [ledgerType, setLedgerType] = useState('income')
  const [ledgerAmount, setLedgerAmount] = useState('')
  const [ledgerNote, setLedgerNote] = useState('')

  const budget = profile?.dailyBudget ?? 1000
  const monthlyIncome = profile?.monthlyIncome ?? 0
  const fixedExpense = profile?.fixedExpense ?? 0
  const savingGoal = profile?.savingGoal ?? 0
  const sharedFund = profile?.sharedFund ?? 0
  const remaining = budget - totalSpent
  const budgetPct = budget > 0 ? Math.min(totalSpent / budget, 1) : 0
  const guildLedger = useMemo(() => profile?.guildLedger ?? [], [profile?.guildLedger])
  const monthlyKey = new Date().toISOString().slice(0, 7)
  const monthlyLedger = useMemo(
    () => guildLedger.filter(row => String(row.date ?? '').startsWith(monthlyKey)),
    [guildLedger, monthlyKey],
  )
  const ledgerTotals = monthlyLedger.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + Number(row.amount ?? 0)
    return acc
  }, {})
  const totalIncome = monthlyIncome + (ledgerTotals.income ?? 0)
  const fixedPaid = ledgerTotals.fixed ?? 0
  const actualSaving = ledgerTotals.saving ?? 0
  const commonFund = Math.max(0, sharedFund + totalIncome + actualSaving - fixedPaid)
  const monthlyFree = Math.max(0, totalIncome - fixedExpense - actualSaving)
  const guildChallengeTarget = savingGoal > 0 ? savingGoal : 3000
  const fixedBossHp = fixedExpense
  const fixedBossProgress = fixedBossHp > 0 ? Math.min(fixedPaid / fixedBossHp, 1) : 0
  const fixedBossDefeated = fixedExpense > 0 && fixedPaid >= fixedExpense
  const challengeClaims = profile?.guildChallengeClaims ?? {}
  const stableChallengeDone = (profile?.consecutiveDays ?? 0) >= 25
  const savingChallengeDone = actualSaving >= guildChallengeTarget
  const responsibilityChallengeDone = fixedBossDefeated
  const allChallengeDone = stableChallengeDone && savingChallengeDone && responsibilityChallengeDone
  const allChallengeClaimed = !!challengeClaims[`${monthlyKey}_all`]

  function editField(field, value) {
    setEditing(field)
    setInputValue(String(value || ''))
  }

  async function saveField(field) {
    const value = Math.max(0, Number(inputValue) || 0)
    const data = { [field]: value }
    dispatch({ type: 'UPDATE_PROFILE', data })
    setEditing(null)
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function addLedgerEntry() {
    const amount = Math.max(0, Number(ledgerAmount) || 0)
    if (!amount) return
    const row = {
      id: `ledger_${Date.now()}`,
      type: ledgerType,
      amount,
      note: ledgerNote.trim().slice(0, 18),
      date: new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
    }
    const data = { guildLedger: [row, ...guildLedger].slice(0, 80) }
    dispatch({ type: 'UPDATE_PROFILE', data })
    setLedgerAmount('')
    setLedgerNote('')
    dispatch({ type: 'SET_NOTIFICATION', notification: { type: 'guild', message: '公會流水已記錄' } })
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 1800)
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function deleteLedgerEntry(id) {
    const data = { guildLedger: guildLedger.filter(row => row.id !== id) }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function claimGuildChallenge() {
    await claimChallenge({
      key: 'responsibility',
      done: responsibilityChallengeDone,
      reward: { goldTicket: 1, exp: 100 },
      message: '財務責任達成，金色扭蛋券 x1',
    })
  }

  async function claimChallenge({ key, done, reward, message }) {
    const claimKey = `${monthlyKey}_${key}`
    if (!done || challengeClaims[claimKey]) return
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
      guildChallengeClaims: {
        ...challengeClaims,
        [claimKey]: true,
      },
    }
    dispatch({ type: 'UPDATE_PROFILE', data })
    dispatch({ type: 'SET_NOTIFICATION', notification: { type: 'guild', message } })
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2200)
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function claimAllChallengeBonus() {
    await claimChallenge({
      key: 'all',
      done: allChallengeDone,
      reward: { goldTicket: 1, exp: 80 },
      message: '三項挑戰完成，金色扭蛋券 x1',
    })
  }

  function ledgerLabel(type) {
    if (type === 'income') return '收入'
    if (type === 'saving') return '儲蓄'
    return '固定'
  }

  return (
    <div className="academy-screen">
      <img src={guildBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="academy-safe-top relative z-10 flex items-center gap-2 px-4 pb-2">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">公會基地</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-card mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-black text-[#26324A]">家庭財務俱樂部</div>
              <div className="text-xs font-bold text-[#8E87A8]">收入、儲蓄、固定支出集中管理</div>
            </div>
            <span className="academy-status">等級 1</span>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
              <span>今日預算壓力</span>
              <span>{Math.round(budgetPct * 100)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#ECE7F5]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#52DED4] via-[#FFD166] to-[#FF7FA3]"
                animate={{ width: `${budgetPct * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FinanceModule title="共同基金" value={`NT$${formatMoney(commonFund)}`} sub="收入與儲蓄扣固定支出" tone="blue" />
          <FinanceModule title="剩餘預算" value={`NT$${formatMoney(Math.max(0, remaining))}`} sub="可轉最後一擊" tone="green" delay={0.04} />
          <FinanceModule title="固定支出" value={`NT$${formatMoney(fixedExpense)}`} sub={`已繳 NT$${formatMoney(fixedPaid)}`} tone="pink" delay={0.08} />
          <FinanceModule title="本月可用" value={`NT$${formatMoney(monthlyFree)}`} sub="收入扣固定與儲蓄" tone="gold" delay={0.12} />
        </div>

        <div className="academy-card mt-3">
          <div className="mb-3 text-xs font-black text-[#26324A]">基地設定</div>
          <PlanningRow
            label="設定共同基金"
            sub="目前可用家庭資產池"
            field="sharedFund"
            value={sharedFund}
            editing={editing === 'sharedFund'}
            inputValue={inputValue}
            onEdit={editField}
            onChange={setInputValue}
            onSave={saveField}
          />
          <PlanningRow
            label="設定月收入"
            sub="讓公會知道本月資源"
            field="monthlyIncome"
            value={monthlyIncome}
            editing={editing === 'monthlyIncome'}
            inputValue={inputValue}
            onEdit={editField}
            onChange={setInputValue}
            onSave={saveField}
          />
          <PlanningRow
            label="設定固定支出"
            sub="把訂閱與房租先扣除"
            field="fixedExpense"
            value={fixedExpense}
            editing={editing === 'fixedExpense'}
            inputValue={inputValue}
            onEdit={editField}
            onChange={setInputValue}
            onSave={saveField}
          />
          <PlanningRow
            label="設定儲蓄目標"
            sub="月底結算時追蹤成果"
            field="savingGoal"
            value={savingGoal}
            editing={editing === 'savingGoal'}
            inputValue={inputValue}
            onEdit={editField}
            onChange={setInputValue}
            onSave={saveField}
          />
        </div>

        <div className="academy-card mt-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-[#26324A]">固定支出首領</div>
              <div className="text-[10px] font-bold text-[#8E87A8]">固定支出繳清後擊殺首領</div>
            </div>
            <span className={`academy-status ${fixedBossDefeated ? 'academy-status--done' : ''}`}>
              {fixedBossHp <= 0 ? '未設定' : fixedBossDefeated ? '擊殺' : `${formatMoney(Math.min(fixedPaid, fixedBossHp))}/${formatMoney(fixedBossHp)}`}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#ECE7F5]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FFB3C6] via-[#FFD166] to-[#8B7CFF]"
              animate={{ width: `${fixedBossProgress * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-black text-[#8E87A8]">
            <span>已繳固定支出 NT${formatMoney(fixedPaid)}</span>
            <span>{fixedBossHp > 0 ? `首領血量 NT${formatMoney(fixedBossHp)}` : '請先設定固定支出'}</span>
          </div>
        </div>

        <div className="academy-card mt-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-[#26324A]">公會月度挑戰</div>
              <div className="text-[10px] font-bold text-[#8E87A8]">第一版固定三項挑戰</div>
            </div>
            <button
              className={`academy-status ${allChallengeDone && !allChallengeClaimed ? 'academy-status--done' : ''}`}
              onClick={claimAllChallengeBonus}
            >
              {allChallengeClaimed ? '全領' : allChallengeDone ? '額外領取' : '進行中'}
            </button>
          </div>
          <ChallengeRow
            title="穩定記帳"
            sub={`連續記帳 ${profile?.consecutiveDays ?? 0}/25 天`}
            done={stableChallengeDone}
            claimed={!!challengeClaims[`${monthlyKey}_stable`]}
            reward="黃星 x10"
            onClaim={() => claimChallenge({
              key: 'stable',
              done: stableChallengeDone,
              reward: { yellow: 10, exp: 80 },
              message: '穩定記帳達成，黃色星星 x10',
            })}
          />
          <ChallengeRow
            title="預算節制"
            sub={`本月儲蓄 NT${formatMoney(actualSaving)} / NT${formatMoney(guildChallengeTarget)}`}
            done={savingChallengeDone}
            claimed={!!challengeClaims[`${monthlyKey}_saving`]}
            reward="紫星 x1"
            onClaim={() => claimChallenge({
              key: 'saving',
              done: savingChallengeDone,
              reward: { purple: 1, exp: 80 },
              message: '預算節制達成，紫色星星 x1',
            })}
          />
          <ChallengeRow
            title="財務責任"
            sub="固定支出首領擊殺"
            done={responsibilityChallengeDone}
            claimed={!!challengeClaims[`${monthlyKey}_responsibility`]}
            reward="金色券"
            onClaim={claimGuildChallenge}
          />
        </div>

        <div className="academy-card mt-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-[#26324A]">公會流水帳</div>
              <div className="text-[10px] font-bold text-[#8E87A8]">記錄收入、儲蓄、固定支出</div>
            </div>
            <span className="academy-status">{monthlyKey}</span>
          </div>
          <div className="academy-segment mb-3">
            {[
              { k: 'income', label: '收入' },
              { k: 'saving', label: '儲蓄' },
              { k: 'fixed', label: '固定' },
            ].map(t => (
              <button key={t.k} className={ledgerType === t.k ? 'is-active' : ''} onClick={() => setLedgerType(t.k)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_1.2fr_auto] gap-2">
            <input
              type="number"
              value={ledgerAmount}
              onChange={e => setLedgerAmount(e.target.value)}
              className="min-w-0 rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
              placeholder="金額"
            />
            <input
              type="text"
              value={ledgerNote}
              onChange={e => setLedgerNote(e.target.value)}
              className="min-w-0 rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
              placeholder="備註"
              maxLength={18}
            />
            <button className="academy-small-button" onClick={addLedgerEntry}>加入</button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="academy-stat-box text-center">
              <div className="text-[10px] font-bold text-[#8E87A8]">收入</div>
              <div className="text-xs font-black text-[#178B82]">NT${formatMoney(totalIncome)}</div>
            </div>
            <div className="academy-stat-box text-center">
              <div className="text-[10px] font-bold text-[#8E87A8]">儲蓄目標</div>
              <div className="text-xs font-black text-[#7B63D8]">NT${formatMoney(savingGoal)}</div>
            </div>
            <div className="academy-stat-box text-center">
              <div className="text-[10px] font-bold text-[#8E87A8]">固定已繳</div>
              <div className="text-xs font-black text-[#D9517B]">NT${formatMoney(fixedPaid)}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {monthlyLedger.length === 0 ? (
              <div className="rounded-2xl bg-white/70 px-3 py-3 text-center text-xs font-bold text-[#8E87A8]">
                本月還沒有公會流水
              </div>
            ) : monthlyLedger.slice(0, 6).map(row => (
              <div key={row.id} className="academy-ledger-row">
                <span className={`academy-ledger-type academy-ledger-type--${row.type}`}>{ledgerLabel(row.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-black text-[#26324A]">{row.note || '未填備註'}</div>
                  <div className="text-[10px] font-bold text-[#8E87A8]">{row.date}</div>
                </div>
                <div className="text-xs font-black text-[#26324A]">NT${formatMoney(row.amount)}</div>
                <button className="text-[10px] font-black text-[#FF6D98]" onClick={() => deleteLedgerEntry(row.id)}>刪除</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav current="quest" navigate={navigate} />
    </div>
  )
}
