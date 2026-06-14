import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { DEFAULT_CATEGORIES, formatMoney, calcDamage } from '../gameLogic'
import { BottomNav } from './TownScreen'
import battleBg from '../assets/academy-art/home-bg.webp'
import spirit from '../assets/academy-art/spending-spirit.png'

function TierBadge({ tier }) {
  if (tier === 'monthboss') return <span className="academy-status academy-status--boss">月Boss</span>
  if (tier === 'boss' || tier === 'weekend') return <span className="academy-status academy-status--boss">週末Boss</span>
  return <span className="academy-status">今日咒靈</span>
}

function MonsterArea({ monster, currentHp, isHit, damageNumbers }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? Math.max(0, currentHp / monster.maxHp) : 0
  const defeated = currentHp <= 0
  const isAngry = hpPct < 0.3 && !defeated

  return (
    <div className="relative flex h-full flex-col justify-end px-4 pb-3 pt-12">
      <div className="academy-card">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-black text-[#26324A]">{monster.name}</div>
            <div className="text-[10px] font-bold text-[#8E87A8]">
              {defeated ? '淨化完成，今天很穩。' : '輸入一筆消費，施放術式。'}
            </div>
          </div>
          <TierBadge tier={monster.tier} />
        </div>

        <div className="mb-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
          <span>HP</span>
          <span>{defeated ? '0' : formatMoney(currentHp)} / {formatMoney(monster.maxHp)}</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-[#ECE7F5]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#52DED4] via-[#FFD166] to-[#FF7FA3]"
            animate={{ width: `${hpPct * 100}%` }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="relative mx-auto mt-2 flex h-48 w-48 items-center justify-center">
        <motion.div
          className="absolute inset-4 rounded-full bg-[#9B7CFF]/25 blur-2xl"
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-2 h-8 w-36 rounded-full bg-[#8B7CFF]/20 blur-md"
          animate={{ scaleX: defeated ? 0.8 : [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <motion.div
          className={`academy-battle-monster ${isHit ? 'monster-hit' : ''}`}
          animate={
            defeated ? { rotate: [-4, 4, -4], scale: 0.9 } :
            isAngry ? { scale: [1, 1.08, 1] } :
            { y: [0, -8, 0] }
          }
          transition={{ duration: defeated ? 1 : isAngry ? 0.45 : 2.4, repeat: Infinity }}
        >
          {defeated ? <span className="academy-icon academy-icon--star h-16 w-16" /> : <img src={spirit} alt="" draggable="false" />}
        </motion.div>
        {isAngry && <div className="absolute right-6 top-4 h-5 w-5 rounded-full bg-[#FF7FA3] shadow-[0_0_18px_rgba(255,127,163,0.58)]" />}

        {damageNumbers.map(dn => (
          <motion.div
            key={dn.id}
            className="damage-num absolute z-30 font-black"
            style={{
              left: `${dn.x}%`,
              top: `${dn.y}%`,
              color: dn.crit ? '#FFD166' : '#FF7FA3',
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
            className="absolute inset-x-8 top-40 z-20 rounded-3xl border border-[#FFD166]/50 bg-white/90 px-5 py-4 text-center shadow-2xl backdrop-blur"
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4BE]">
              <span className="academy-icon academy-icon--star" />
            </div>
            <div className="mt-1 text-sm font-black text-[#26324A]">淨化成功</div>
            <div className="text-[10px] font-bold text-[#8E87A8]">獎勵已加入你的術師背包</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CategoryIcon({ cat, className = '' }) {
  return <span className={`academy-category-symbol ${className}`} style={{ '--cat-color': cat?.color ?? '#C8A8E9' }} />
}

function CategoryPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {DEFAULT_CATEGORIES.map(cat => (
        <motion.button
          key={cat.id}
          className={`academy-category ${selected === cat.id ? 'is-active' : ''}`}
          onClick={() => onSelect(cat.id)}
          whileTap={{ scale: 0.92 }}
        >
          <CategoryIcon cat={cat} />
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
            className={`academy-key ${isOp ? 'academy-key--op' : ''} ${isEqual ? 'academy-key--submit' : ''}`}
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
      <div className="flex justify-between text-xs font-black text-[#8E87A8]">
        <span>今日消費 <b className="text-[#26324A]">NT${formatMoney(spent)}</b></span>
        <span className={remaining < 0 ? 'text-[#FF6D98]' : 'text-[#24B7B0]'}>
          {remaining < 0 ? `超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
        </span>
      </div>

      <div className="academy-segment">
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
        className="rounded-2xl border border-[#E7DEF6] bg-white/90 px-4 py-3 text-sm font-bold text-[#26324A] outline-none placeholder:text-[#B8AECF] focus:border-[#8B7CFF]"
        maxLength={20}
      />

      {step === 'category' ? (
        <>
          <CategoryPicker selected={category} onSelect={cat => { setCategory(cat); setStep('amount') }} />
          {category && (
            <div className="text-center text-xs font-bold text-[#8E87A8]">
              已選：{currentCat?.label}
              <button className="ml-2 text-[#24B7B0]" onClick={() => setStep('amount')}>繼續</button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="academy-amount">
            <div className="text-xs font-black text-[#8E87A8]">
              {currentCat ? currentCat.label : '尚未選擇分類'}
            </div>
            <div className="mt-1 text-3xl font-black text-[#26324A]">
              NT$ {amount.includes('+') ? amount : formatMoney(Number(amount) || 0)}
            </div>
            {previewDmg && (
              <motion.div
                className="mt-1 text-xs font-black text-[#FF6D98]"
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
          className="text-center text-xs font-black text-[#FF6D98]"
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
      <div className="rounded-2xl bg-white/80 px-3 py-3 text-center text-xs font-bold text-[#8E87A8]">
        還沒有記帳紀錄，輸入消費即可施法。
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
            className="flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 shadow-sm"
            initial={{ x: -14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <CategoryIcon cat={cat} className="h-6 w-6 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-[#26324A]">{cat?.label ?? '其他'}</div>
              {e.note && <div className="truncate text-[10px] font-bold text-[#8E87A8]">{e.note}</div>}
            </div>
            <div className="text-sm font-black text-[#D9961E]">NT${formatMoney(e.amount)}</div>
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
    <div className="academy-screen">
      <img src={battleBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-20 flex items-center gap-2 px-4 pb-1 pt-4">
        <button
          className="tap-bounce rounded-2xl border border-white/60 bg-white/85 px-3 py-2 text-sm font-black text-[#8E87A8] shadow-md"
          onClick={() => navigate('town')}
        >
          ←
        </button>
        <div className="min-w-0 flex-1 text-center">
          <div className="text-sm font-black text-[#26324A]">今日討伐</div>
          <div className="text-[10px] font-bold text-[#8E87A8]">{state.date}</div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/85 px-3 py-2 text-xs font-black text-[#D9961E] shadow-md">
          NT${formatMoney(Math.max(0, budget - totalSpent))}
        </div>
      </div>

      <div className="relative z-10 min-h-[330px] flex-none">
        <MonsterArea
          monster={monster}
          currentHp={currentHp}
          isHit={isHit}
          damageNumbers={damageNumbers}
        />
      </div>

      <div className="relative z-20 flex-1 overflow-y-auto px-4 pb-24">
        <div className="mb-3">
          <div className="mb-1 text-xs font-black text-[#26324A]">今日記錄</div>
          <ExpenseList expenses={expenses} />
        </div>

        <div className="academy-card p-3">
          <div className="mb-2 text-center text-xs font-black text-[#8E87A8]">輸入消費即可施放術式</div>
          <ExpensePanel onSubmit={handleSubmit} budget={budget} spent={totalSpent} />
        </div>
      </div>

      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}
