import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { DEFAULT_CATEGORIES, formatMoney, calcDamage } from '../gameLogic'
import { BottomNav } from './TownScreen'
import battleBg from '../assets/urban-art/urban-battle-v1.webp'
import spendingCurse from '../assets/urban-art/spending-curse-v1.png'

function TierBadge({ tier }) {
  if (tier === 'monthboss') return <span className="battle-tier battle-tier--gold">月Boss</span>
  if (tier === 'boss' || tier === 'weekend') return <span className="battle-tier battle-tier--coral">週末Boss</span>
  return <span className="battle-tier">今日怪物</span>
}

function MonsterArea({ monster, currentHp, isHit, damageNumbers }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? Math.max(0, currentHp / monster.maxHp) : 0
  const defeated = currentHp <= 0
  const isAngry = hpPct < 0.3 && !defeated

  return (
    <div className="relative flex h-full flex-col justify-end px-4 pb-3 pt-16">
      <div className="battle-boss-plate">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-black text-slate-900">{monster.name}</div>
            <div className="text-[10px] font-bold text-slate-500">
              {defeated ? '討伐完成，今天很穩。' : '輸入一筆消費，給它一擊。'}
            </div>
          </div>
          <TierBadge tier={monster.tier} />
        </div>

        <div className="mb-1 flex justify-between text-[10px] font-black text-slate-500">
          <span>HP</span>
          <span>{defeated ? '0' : formatMoney(currentHp)} / {formatMoney(monster.maxHp)}</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 via-amber-300 to-rose-400"
            animate={{ width: `${hpPct * 100}%` }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="relative mx-auto mt-3 flex h-44 w-44 items-center justify-center">
        <motion.div
          className="absolute inset-5 rounded-full bg-amber-200/25 blur-2xl"
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-2 h-8 w-36 rounded-full bg-[#243B6B]/20 blur-md"
          animate={{ scaleX: defeated ? 0.8 : [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <motion.div
          className={`battle-monster ${isHit ? 'monster-hit' : ''}`}
          animate={
            defeated ? { rotate: [-4, 4, -4], scale: 0.9 } :
            isAngry ? { scale: [1, 1.08, 1] } :
            { y: [0, -8, 0] }
          }
          transition={{ duration: defeated ? 1 : isAngry ? 0.45 : 2.4, repeat: Infinity }}
        >
          {defeated ? '🏆' : <img src={spendingCurse} alt="" className="battle-monster-img" draggable="false" />}
        </motion.div>
        {isAngry && <div className="absolute right-6 top-4 text-xl">💢</div>}

        {damageNumbers.map(dn => (
          <motion.div
            key={dn.id}
            className="damage-num absolute z-30 font-black"
            style={{
              left: `${dn.x}%`,
              top: `${dn.y}%`,
              color: dn.crit ? '#F5B942' : '#F26B6B',
              fontSize: dn.crit ? 30 : 24,
            }}
            initial={{ y: 0, opacity: 1, scale: dn.crit ? 1.35 : 1.15 }}
            animate={{ y: -64, opacity: 0, scale: 0.82 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {dn.crit ? 'CRIT ' : ''}-{formatMoney(dn.value)}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {defeated && (
          <motion.div
            className="absolute inset-x-8 top-40 z-20 rounded-3xl border border-amber-200 bg-white/90 px-5 py-4 text-center shadow-2xl backdrop-blur"
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            <div className="text-3xl">🏆</div>
            <div className="mt-1 text-sm font-black text-slate-900">討伐成功</div>
            <div className="text-[10px] font-bold text-slate-500">獎勵已加入你的冒險背包</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CategoryPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {DEFAULT_CATEGORIES.map(cat => (
        <motion.button
          key={cat.id}
          className={`category-chip ${selected === cat.id ? 'category-chip--active' : ''}`}
          onClick={() => onSelect(cat.id)}
          whileTap={{ scale: 0.92 }}
        >
          <span className="text-xl">{cat.emoji}</span>
          <span className="mt-0.5 text-[10px] font-black">{cat.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

function CalcKeyboard({ value, onChange, onSubmit }) {
  function press(k) {
    if (k === '⌫') onChange(value.slice(0, -1) || '0')
    else if (k === 'AC') onChange('0')
    else if (k === '+') onChange(value + '+')
    else if (value === '0' && k !== '.') onChange(k)
    else onChange(value + k)
  }

  function evalValue() {
    try {
      const parts = value.split('+').map(Number).filter(n => !isNaN(n))
      return parts.reduce((a, b) => a + b, 0)
    } catch {
      return 0
    }
  }

  const keys = ['7', '8', '9', '⌫', '4', '5', '6', '+', '1', '2', '3', 'AC', '0', '.', '=']

  return (
    <div className="grid grid-cols-4 gap-2">
      {keys.map(k => {
        const isEqual = k === '='
        const isOp = k === '+' || k === '⌫' || k === 'AC'
        return (
          <motion.button
            key={k}
            className={`calc-key ${isOp ? 'calc-key--op' : ''} ${isEqual ? 'calc-key--submit' : ''}`}
            onClick={() => isEqual ? onSubmit(evalValue()) : press(k)}
            whileTap={{ scale: 0.9 }}
          >
            {k}
          </motion.button>
        )
      })}
    </div>
  )
}

function ExpensePanel({ onSubmit, budget, spent }) {
  const [category, setCategory] = useState(null)
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('0')
  const [step, setStep] = useState('category')
  const [error, setError] = useState('')

  const remaining = budget - spent
  const currentCat = DEFAULT_CATEGORIES.find(c => c.id === category)

  function handleAmountSubmit(val) {
    const n = Number(val)
    if (!n || n <= 0) {
      setError('請輸入金額')
      return
    }
    if (!category) {
      setError('請選擇分類')
      setStep('category')
      return
    }
    setError('')
    onSubmit({ category, note, amount: n })
    setAmount('0')
    setNote('')
    setCategory(null)
    setStep('category')
  }

  const previewDmg = amount !== '0' && Number(amount) > 0
    ? calcDamage(Number(amount), spent, budget).damage
    : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-xs font-black text-slate-500">
        <span>今日消費 <b className="text-slate-800">NT${formatMoney(spent)}</b></span>
        <span className={remaining < 0 ? 'text-rose-500' : 'text-teal-600'}>
          {remaining < 0 ? `超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
        </span>
      </div>

      <div className="segmented-control">
        {[
          { k: 'category', label: '選分類' },
          { k: 'amount', label: '輸入金額' },
        ].map(t => (
          <button
            key={t.k}
            className={step === t.k ? 'is-active' : ''}
            onClick={() => setStep(t.k)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="備註，可跳過"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-teal-300"
        maxLength={20}
      />

      {step === 'category' ? (
        <>
          <CategoryPicker selected={category} onSelect={cat => { setCategory(cat); setStep('amount') }} />
          {category && (
            <div className="text-center text-xs font-bold text-slate-500">
              已選：{currentCat?.emoji} {currentCat?.label}
              <button className="ml-2 text-teal-600" onClick={() => setStep('amount')}>繼續</button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="amount-display">
            <div className="text-xs font-black text-slate-400">
              {currentCat ? `${currentCat.emoji} ${currentCat.label}` : '尚未選擇分類'}
            </div>
            <div className="mt-1 text-3xl font-black text-[#243B6B]">
              NT$ {amount.includes('+') ? amount : formatMoney(Number(amount) || 0)}
            </div>
            {previewDmg && (
              <motion.div
                className="mt-1 text-xs font-black text-rose-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                預估傷害 -{formatMoney(previewDmg)}
              </motion.div>
            )}
          </div>
          <CalcKeyboard value={amount} onChange={setAmount} onSubmit={handleAmountSubmit} />
        </>
      )}

      {error && (
        <motion.div
          className="text-center text-xs font-black text-rose-500"
          initial={{ x: -5 }}
          animate={{ x: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

function ExpenseList({ expenses }) {
  if (!expenses.length) {
    return (
      <div className="rounded-2xl bg-white/70 px-3 py-3 text-center text-xs font-bold text-slate-400">
        還沒有記帳紀錄，輸入消費即可攻擊。
      </div>
    )
  }

  return (
    <div className="flex max-h-24 flex-col gap-1 overflow-y-auto">
      {[...expenses].reverse().map((e, i) => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === e.category)
        return (
          <motion.div
            key={e.id ?? i}
            className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 shadow-sm"
            initial={{ x: -14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <span className="text-base">{cat?.emoji ?? '✨'}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-slate-700">{cat?.label ?? '其他'}</div>
              {e.note && <div className="truncate text-[10px] font-bold text-slate-400">{e.note}</div>}
            </div>
            <div className="text-sm font-black text-amber-500">NT${formatMoney(e.amount)}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

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
    <div className="relative flex h-full flex-col overflow-hidden bg-[#090F1C]">
      <img
        src={battleBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable="false"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050814]/5 via-[#050814]/15 to-[#050814]/95" />

      <div className="relative z-20 flex items-center gap-2 px-4 pb-1 pt-4">
        <button
          className="tap-bounce rounded-2xl border border-cyan-300/20 bg-[#101827]/85 px-3 py-2 text-sm font-black text-cyan-100 shadow-md"
          onClick={() => navigate('town')}
        >
          ←
        </button>
        <div className="min-w-0 flex-1 text-center">
          <div className="text-sm font-black text-cyan-100">今日討伐</div>
          <div className="text-[10px] font-bold text-cyan-300/70">{state.date}</div>
        </div>
        <div className="rounded-2xl border border-amber-300/25 bg-[#101827]/85 px-3 py-2 text-xs font-black text-amber-300 shadow-md">
          NT${formatMoney(Math.max(0, budget - totalSpent))}
        </div>
      </div>

      <div className="relative z-10 min-h-[340px] flex-none">
        <MonsterArea
          monster={monster}
          currentHp={currentHp}
          isHit={isHit}
          damageNumbers={damageNumbers}
        />
      </div>

      <div className="relative z-20 flex-1 overflow-y-auto px-4 pb-24">
        <div className="mb-3">
          <div className="mb-1 text-xs font-black text-cyan-100">今日記錄</div>
          <ExpenseList expenses={expenses} />
        </div>

        <div className="mobile-panel p-3">
          <div className="mb-2 text-center text-xs font-black text-slate-400">輸入消費即可攻擊</div>
          <ExpensePanel onSubmit={handleSubmit} budget={budget} spent={totalSpent} />
        </div>
      </div>

      <BottomNav current="battle" navigate={navigate} />
    </div>
  )
}
