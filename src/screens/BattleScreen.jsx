import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { DEFAULT_CATEGORIES, formatMoney, calcDamage } from '../gameLogic'
import { BottomNav } from './TownScreen'

// ─── 怪物展示區 ──────────────────────────────────────────────────────────────

function MonsterArea({ monster, currentHp, isHit, damageNumbers }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? Math.max(0, currentHp / monster.maxHp) : 0
  const defeated = currentHp <= 0
  const isAngry = hpPct < 0.3 && !defeated

  const hpColor = hpPct > 0.6 ? '#A8E6CF'
    : hpPct > 0.3 ? '#FFE4A0'
    : '#FFB3C6'

  return (
    <div className="relative flex flex-col items-center pt-2 pb-1">
      {/* 背景光暈 */}
      <div
        className="absolute inset-0 opacity-20 rounded-3xl blur-xl"
        style={{ background: monster.color }}
      />

      {/* 怪物名稱 + 類型標籤 */}
      <div className="flex items-center gap-2 mb-1 z-10">
        <span className="text-xs font-bold text-slate-600">{monster.name}</span>
        {monster.tier === 'boss' && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">週末Boss</span>}
        {monster.tier === 'weekend' && <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">週末強敵</span>}
        {monster.tier === 'monthboss' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold animate-pulse">月Boss</span>}
      </div>

      {/* HP 條 */}
      <div className="w-56 mb-2 z-10">
        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
          <span>HP</span>
          <span>{defeated ? '💀 擊殺！' : `${formatMoney(currentHp)} / ${formatMoney(monster.maxHp)}`}</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <motion.div
            className="h-full rounded-full relative"
            style={{ background: `linear-gradient(90deg, ${hpColor}, ${monster.maxHpColor ?? hpColor})` }}
            animate={{ width: `${hpPct * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* 光澤條 */}
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }} />
          </motion.div>
        </div>
      </div>

      {/* 怪物主體 */}
      <div className="relative z-10 w-40 h-40 flex items-center justify-center">
        <motion.div
          className={`text-8xl select-none ${isHit ? 'monster-hit' : ''}`}
          animate={
            defeated ? { rotate: [-5, 5, -5], y: [0, -3, 0] } :
            isAngry  ? { scale: [1, 1.06, 1] } :
            { y: [0, -8, 0] }
          }
          transition={{
            duration: defeated ? 1 : isAngry ? 0.5 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {defeated ? '💀' : monster.emoji}
        </motion.div>

        {/* 憤怒特效 */}
        {isAngry && (
          <motion.div
            className="absolute top-0 right-0 text-lg"
            animate={{ scale: [1, 1.3, 1], rotate: [-10, 10, -10] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            💢
          </motion.div>
        )}

        {/* 傷害數字 */}
        {damageNumbers.map(dn => (
          <motion.div
            key={dn.id}
            className={`absolute damage-num ${dn.crit ? 'text-yellow-500 text-3xl' : 'text-red-400 text-2xl'}`}
            style={{ left: `${dn.x}%`, top: `${dn.y}%`, zIndex: 50 }}
            initial={{ y: 0, opacity: 1, scale: dn.crit ? 1.5 : 1.2 }}
            animate={{ y: -60, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {dn.crit ? '✨ ' : ''}−{formatMoney(dn.value)}
          </motion.div>
        ))}
      </div>

      {/* 擊殺慶祝 */}
      <AnimatePresence>
        {defeated && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="text-4xl"
                animate={{ scale: [0, 1.3, 1], rotate: [0, 15, -5, 0] }}
                transition={{ duration: 0.6 }}
              >
                🎉
              </motion.div>
              <div className="text-sm font-black text-purple-600 mt-1">擊殺成功！</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 分類選擇 ─────────────────────────────────────────────────────────────────

function CategoryPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2 px-1">
      {DEFAULT_CATEGORIES.map(cat => (
        <motion.button
          key={cat.id}
          className="flex flex-col items-center py-2 rounded-xl transition-all tap-bounce"
          style={{
            background: selected === cat.id ? cat.color : '#F8F8F8',
            border: selected === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
          }}
          onClick={() => onSelect(cat.id)}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">{cat.emoji}</span>
          <span className="text-[10px] font-bold mt-0.5" style={{ color: selected === cat.id ? '#333' : '#888' }}>
            {cat.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// ─── 計算機鍵盤 ───────────────────────────────────────────────────────────────

function CalcKeyboard({ value, onChange, onSubmit }) {
  function press(k) {
    if (k === '⌫') {
      onChange(value.slice(0, -1) || '0')
    } else if (k === 'AC') {
      onChange('0')
    } else if (k === '+') {
      onChange(value + '+')
    } else {
      if (value === '0' && k !== '.') onChange(k)
      else onChange(value + k)
    }
  }

  // 計算當前顯示值（處理加法表達式）
  function evalValue() {
    try {
      const parts = value.split('+').map(Number).filter(n => !isNaN(n))
      return parts.reduce((a, b) => a + b, 0)
    } catch { return 0 }
  }

  const keys = ['7','8','9','⌫','4','5','6','+','1','2','3','AC','0','.','=']

  return (
    <div className="grid grid-cols-4 gap-1.5 px-1">
      {keys.map(k => {
        const isEqual = k === '='
        const isOp = k === '+' || k === '⌫' || k === 'AC'
        return (
          <motion.button
            key={k}
            className={`py-3 rounded-xl text-sm font-bold tap-bounce ${
              isEqual ? 'col-span-1 text-white' :
              isOp ? 'text-purple-600 bg-purple-50' :
              'text-slate-700 bg-gray-50'
            }`}
            style={isEqual ? { background: 'linear-gradient(135deg, #C8A8E9, #A8D8EA)' } : {}}
            onClick={() => isEqual ? onSubmit(evalValue()) : press(k)}
            whileTap={{ scale: 0.88 }}
          >
            {k}
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── 記帳輸入面板 ──────────────────────────────────────────────────────────────

function ExpensePanel({ onSubmit, budget, spent }) {
  const [category, setCategory] = useState(null)
  const [note, setNote]         = useState('')
  const [amount, setAmount]     = useState('0')
  const [step, setStep]         = useState('category') // category | amount
  const [error, setError]       = useState('')

  const remaining = budget - spent
  const usagePct  = budget > 0 ? spent / budget : 0

  function handleAmountSubmit(val) {
    const n = Number(val)
    if (!n || n <= 0) { setError('請輸入金額 💰'); return }
    if (!category)    { setError('請選擇分類 🏷️'); setStep('category'); return }
    setError('')
    onSubmit({ category, note, amount: n })
    // 重置
    setAmount('0')
    setNote('')
    setCategory(null)
    setStep('category')
  }

  // 預覽傷害
  const previewDmg = amount !== '0' && Number(amount) > 0
    ? calcDamage(Number(amount), spent, budget).damage
    : null

  return (
    <div className="flex flex-col gap-2">
      {/* 狀態列 */}
      <div className="flex justify-between items-center px-1 text-xs text-slate-500">
        <span>今日消費 <b className="text-slate-700">NT${formatMoney(spent)}</b></span>
        <span className={remaining < 0 ? 'text-red-400 font-bold' : ''}>
          {remaining < 0 ? `⚠️ 超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
        </span>
      </div>

      {/* Tab 切換 */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[{k:'category', label:'📂 選分類'},{k:'amount', label:'💰 輸入金額'}].map(t => (
          <button
            key={t.k}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${step === t.k ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
            onClick={() => setStep(t.k)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 備註輸入（兩頁都顯示） */}
      <input
        type="text"
        placeholder="備註（可跳過）..."
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 focus:border-purple-200"
        maxLength={20}
      />

      {step === 'category' ? (
        <>
          <CategoryPicker selected={category} onSelect={cat => { setCategory(cat); setStep('amount') }} />
          {category && (
            <div className="text-center text-xs text-slate-400">
              已選：{DEFAULT_CATEGORIES.find(c=>c.id===category)?.emoji} {DEFAULT_CATEGORIES.find(c=>c.id===category)?.label}
              <button className="ml-2 text-purple-400 underline" onClick={() => setStep('amount')}>繼續 →</button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 金額顯示 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl px-4 py-3 text-right">
            <div className="text-xs text-slate-400 mb-0.5">
              {category ? `${DEFAULT_CATEGORIES.find(c=>c.id===category)?.emoji} ${DEFAULT_CATEGORIES.find(c=>c.id===category)?.label}` : '⚠️ 未選分類'}
            </div>
            <div className="text-3xl font-black text-slate-700">
              NT$ {amount.includes('+') ? amount : formatMoney(Number(amount) || 0)}
            </div>
            {previewDmg && (
              <motion.div
                className="text-xs text-red-400 font-bold mt-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                預估傷害：−{formatMoney(previewDmg)} ⚔️
              </motion.div>
            )}
          </div>
          <CalcKeyboard value={amount} onChange={setAmount} onSubmit={handleAmountSubmit} />
        </>
      )}

      {error && (
        <motion.div
          className="text-center text-xs text-red-400 font-bold"
          initial={{ x: -5 }}
          animate={{ x: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

// ─── 消費記錄列 ────────────────────────────────────────────────────────────────

function ExpenseList({ expenses }) {
  if (!expenses.length) return (
    <div className="text-center text-slate-300 text-sm py-4">
      還沒有記帳紀錄<br />輸入一筆消費來攻擊怪物！⚔️
    </div>
  )

  return (
    <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
      {[...expenses].reverse().map((e, i) => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === e.category)
        return (
          <motion.div
            key={e.id ?? i}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <span className="text-base">{cat?.emoji ?? '✨'}</span>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-700">{cat?.label ?? '其他'}</div>
              {e.note && <div className="text-[10px] text-slate-400">{e.note}</div>}
            </div>
            <div className="text-sm font-bold text-slate-700">NT${formatMoney(e.amount)}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── 戰鬥主畫面 ────────────────────────────────────────────────────────────────

export default function BattleScreen() {
  const { state, navigate, submitExpense } = useApp()
  const { profile, monster, currentHp, totalSpent, damageNumbers, expenses } = state
  const [isHit, setIsHit] = useState(false)
  const budget = profile?.dailyBudget ?? 1000

  async function handleSubmit(data) {
    setIsHit(true)
    setTimeout(() => setIsHit(false), 500)
    await submitExpense(data)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #E8F0FF 0%, #F0E8FF 50%, #FFF0F8 100%)' }}>

      {/* 頂部：返回 + 標題 */}
      <div className="flex items-center px-4 pt-3 pb-1 gap-2">
        <button className="text-slate-400 tap-bounce text-lg" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center">
          <span className="text-sm font-bold text-slate-600">⚔️ 今日戰鬥</span>
        </div>
        <div className="text-xs text-slate-400">{state.date}</div>
      </div>

      {/* 怪物區（固定高度） */}
      <div className="px-4 py-1" style={{ minHeight: 220 }}>
        <MonsterArea
          monster={monster}
          currentHp={currentHp}
          isHit={isHit}
          damageNumbers={damageNumbers}
        />
      </div>

      {/* 消費記錄 */}
      <div className="px-4 mb-1">
        <div className="text-xs font-bold text-slate-400 mb-1">今日記錄</div>
        <ExpenseList expenses={expenses} />
      </div>

      {/* 記帳輸入（底部面板） */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-md">
          <div className="text-xs font-bold text-center text-slate-500 mb-2">— 輸入消費即可攻擊 —</div>
          <ExpensePanel
            onSubmit={handleSubmit}
            budget={budget}
            spent={totalSpent}
          />
        </div>
      </div>

      <BottomNav current="battle" navigate={navigate} />
    </div>
  )
}
