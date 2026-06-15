import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'
import guildBg from '../assets/academy-art/guild-bg.webp'
import { formatMoney } from '../gameLogic'

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
  const totalFixed = fixedExpense + (ledgerTotals.fixed ?? 0)
  const totalSaving = savingGoal + (ledgerTotals.saving ?? 0)
  const monthlyFree = Math.max(0, totalIncome - totalFixed - totalSaving)

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

  function ledgerLabel(type) {
    if (type === 'income') return '收入'
    if (type === 'saving') return '儲蓄'
    return '固定'
  }

  return (
    <div className="academy-screen">
      <img src={guildBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-10 flex items-center gap-2 px-4 pb-2 pt-4">
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
            <span className="academy-status">Lv.1</span>
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
          <FinanceModule title="今日預算" value={`NT$${formatMoney(budget)}`} sub="每日討伐基準" tone="blue" />
          <FinanceModule title="剩餘預算" value={`NT$${formatMoney(Math.max(0, remaining))}`} sub="可轉最後一擊" tone="green" delay={0.04} />
          <FinanceModule title="固定支出" value={`NT$${formatMoney(totalFixed)}`} sub="房租、訂閱、保險" tone="pink" delay={0.08} />
          <FinanceModule title="本月可用" value={`NT$${formatMoney(monthlyFree)}`} sub="收入扣固定與儲蓄" tone="gold" delay={0.12} />
        </div>

        <div className="academy-card mt-3">
          <div className="mb-3 text-xs font-black text-[#26324A]">基地設定</div>
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
              <div className="text-[10px] font-bold text-[#8E87A8]">儲蓄</div>
              <div className="text-xs font-black text-[#7B63D8]">NT${formatMoney(totalSaving)}</div>
            </div>
            <div className="academy-stat-box text-center">
              <div className="text-[10px] font-bold text-[#8E87A8]">固定</div>
              <div className="text-xs font-black text-[#D9517B]">NT${formatMoney(totalFixed)}</div>
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
