import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
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

export default function QuestScreen() {
  const { state, navigate } = useApp()
  const { profile, totalSpent } = state
  const budget = profile?.dailyBudget ?? 1000
  const remaining = budget - totalSpent
  const budgetPct = budget > 0 ? Math.min(totalSpent / budget, 1) : 0

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
          <FinanceModule title="固定支出" value="設定中" sub="房租、訂閱、保險" tone="pink" delay={0.08} />
          <FinanceModule title="儲蓄罐" value="準備中" sub="未來版本解鎖" tone="gold" delay={0.12} />
        </div>

        <div className="academy-card mt-3">
          <div className="mb-3 text-xs font-black text-[#26324A]">基地待辦</div>
          {[
            ['設定月收入', '讓公會知道本月資源'],
            ['設定固定支出', '把訂閱與房租先扣除'],
            ['設定儲蓄目標', '月底結算時追蹤成果'],
          ].map(([title, sub], i) => (
            <div key={title} className="academy-list-row">
              <span className="text-lg">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-[#26324A]">{title}</div>
                <div className="text-[10px] font-bold text-[#8E87A8]">{sub}</div>
              </div>
              <span className="academy-status">規劃</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav current="quest" navigate={navigate} />
    </div>
  )
}
