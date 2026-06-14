import { useState } from 'react'
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

  const budget = profile?.dailyBudget ?? 1000
  const monthlyIncome = profile?.monthlyIncome ?? 0
  const fixedExpense = profile?.fixedExpense ?? 0
  const savingGoal = profile?.savingGoal ?? 0
  const remaining = budget - totalSpent
  const budgetPct = budget > 0 ? Math.min(totalSpent / budget, 1) : 0
  const monthlyFree = Math.max(0, monthlyIncome - fixedExpense - savingGoal)

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
          <FinanceModule title="固定支出" value={`NT$${formatMoney(fixedExpense)}`} sub="房租、訂閱、保險" tone="pink" delay={0.08} />
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
      </div>

      <BottomNav current="quest" navigate={navigate} />
    </div>
  )
}
