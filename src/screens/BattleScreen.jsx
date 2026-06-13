import { useState } from 'react'
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

  const hpGrad = hpPct > 0.6
    ? 'linear-gradient(90deg, #40D9C0, #9B6DFF)'
    : hpPct > 0.3
    ? 'linear-gradient(90deg, #F0C040, #FF9B40)'
    : 'linear-gradient(90deg, #FF4C6A, #FF8C40)'

  return (
    <div className="relative flex flex-col items-center pt-2 pb-1">
      {/* 背景魔法光圈 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 180, height: 180,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -30%)',
          background: `radial-gradient(ellipse, ${monster.color ?? '#9B6DFF'}33 0%, transparent 70%)`,
        }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* 名稱 + 類型 */}
      <div className="flex items-center gap-2 mb-1 z-10">
        <span className="text-xs font-bold" style={{ color: '#C0C8E0' }}>{monster.name}</span>
        {monster.tier === 'boss' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(255,76,106,0.2)', color: '#FF4C6A', border: '1px solid #FF4C6A66' }}>
            週末Boss
          </span>
        )}
        {monster.tier === 'monthboss' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse"
            style={{ background: 'rgba(240,192,64,0.2)', color: '#F0C040', border: '1px solid #F0C04066' }}>
            月Boss
          </span>
        )}
      </div>

      {/* HP 條 */}
      <div className="w-56 mb-2 z-10">
        <div className="flex justify-between text-[10px] mb-0.5" style={{ color: '#7070A0' }}>
          <span style={{ color: '#F0C040' }}>HP</span>
          <span>{defeated ? <span style={{ color: '#40D9C0' }}>💀 擊殺！</span> : `${formatMoney(currentHp)} / ${formatMoney(monster.maxHp)}`}</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(74,63,122,0.4)', border: '1px solid rgba(74,63,122,0.6)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: hpGrad, boxShadow: '0 0 8px rgba(155,109,255,0.5)' }}
            animate={{ width: `${hpPct * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
          </motion.div>
        </div>
      </div>

      {/* 怪物主體 */}
      <div className="relative z-10 w-40 h-40 flex items-center justify-center">
        {/* 旋轉魔法陣 */}
        {!defeated && (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{ width: 120, height: 120, border: '1px solid rgba(155,109,255,0.25)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ width: 90, height: 90, border: '1px solid rgba(240,192,64,0.2)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}

        <motion.div
          className={`text-8xl select-none ${isHit ? 'monster-hit' : ''}`}
          animate={
            defeated ? { rotate: [-5, 5, -5], y: [0, -3, 0] } :
            isAngry  ? { scale: [1, 1.08, 1] } :
            { y: [0, -8, 0] }
          }
          transition={{ duration: defeated ? 1 : isAngry ? 0.4 : 2.5, repeat: Infinity }}
        >
          {defeated ? '💀' : monster.emoji}
        </motion.div>

        {isAngry && (
          <motion.div
            className="absolute top-0 right-0 text-lg"
            animate={{ scale: [1, 1.4, 1], rotate: [-10, 10, -10] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            💢
          </motion.div>
        )}

        {/* 傷害數字 */}
        {damageNumbers.map(dn => (
          <motion.div
            key={dn.id}
            className="absolute damage-num"
            style={{
              left: `${dn.x}%`, top: `${dn.y}%`, zIndex: 50,
              color: dn.crit ? '#F0C040' : '#FF4C6A',
              fontSize: dn.crit ? 28 : 22,
            }}
            initial={{ y: 0, opacity: 1, scale: dn.crit ? 1.5 : 1.2 }}
            animate={{ y: -60, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {dn.crit ? '⚡ ' : ''}−{formatMoney(dn.value)}
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
                🏆
              </motion.div>
              <div className="text-sm font-black mt-1" style={{ color: '#F0C040' }}>
                討伐成功！
              </div>
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
            background: selected === cat.id
              ? 'rgba(155,109,255,0.2)'
              : 'rgba(34,29,58,0.8)',
            border: selected === cat.id
              ? '1px solid #9B6DFF'
              : '1px solid rgba(74,63,122,0.4)',
            boxShadow: selected === cat.id ? '0 0 8px rgba(155,109,255,0.4)' : 'none',
          }}
          onClick={() => onSelect(cat.id)}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">{cat.emoji}</span>
          <span className="text-[10px] font-bold mt-0.5"
            style={{ color: selected === cat.id ? '#9B6DFF' : '#7070A0' }}>
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
            className="py-3 rounded-xl text-sm font-bold tap-bounce"
            style={{
              background: isEqual
                ? 'linear-gradient(135deg, #5B3DAA, #9B6DFF)'
                : isOp
                ? 'rgba(155,109,255,0.15)'
                : 'rgba(34,29,58,0.8)',
              border: isEqual
                ? '1px solid #9B6DFF'
                : isOp
                ? '1px solid rgba(155,109,255,0.3)'
                : '1px solid rgba(74,63,122,0.3)',
              color: isEqual ? '#fff' : isOp ? '#9B6DFF' : '#C0C8E0',
              boxShadow: isEqual ? '0 0 12px rgba(155,109,255,0.4)' : 'none',
            }}
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
  const [step, setStep]         = useState('category')
  const [error, setError]       = useState('')

  const remaining = budget - spent

  function handleAmountSubmit(val) {
    const n = Number(val)
    if (!n || n <= 0) { setError('請輸入金額 💰'); return }
    if (!category)    { setError('請選擇分類 🏷️'); setStep('category'); return }
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

  const panelStyle = {
    background: 'rgba(13,11,26,0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(74,63,122,0.6)',
    borderTopColor: '#F0C04044',
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 狀態列 */}
      <div className="flex justify-between items-center px-1 text-xs" style={{ color: '#7070A0' }}>
        <span>今日消費 <b style={{ color: '#C0C8E0' }}>NT${formatMoney(spent)}</b></span>
        <span className={remaining < 0 ? 'font-bold' : ''} style={{ color: remaining < 0 ? '#FF4C6A' : '#7070A0' }}>
          {remaining < 0 ? `⚠️ 超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
        </span>
      </div>

      {/* Tab 切換 */}
      <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(34,29,58,0.8)', border: '1px solid rgba(74,63,122,0.3)' }}>
        {[{k:'category', label:'📂 選分類'},{k:'amount', label:'💰 輸入金額'}].map(t => (
          <button
            key={t.k}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={step === t.k
              ? { background: 'rgba(155,109,255,0.25)', color: '#9B6DFF', border: '1px solid rgba(155,109,255,0.4)' }
              : { color: '#4A3F7A' }
            }
            onClick={() => setStep(t.k)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 備註 */}
      <input
        type="text"
        placeholder="備註（可跳過）..."
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{
          background: 'rgba(34,29,58,0.8)',
          border: '1px solid rgba(74,63,122,0.4)',
          color: '#C0C8E0',
        }}
        maxLength={20}
      />

      {step === 'category' ? (
        <>
          <CategoryPicker selected={category} onSelect={cat => { setCategory(cat); setStep('amount') }} />
          {category && (
            <div className="text-center text-xs" style={{ color: '#7070A0' }}>
              已選：{DEFAULT_CATEGORIES.find(c=>c.id===category)?.emoji} {DEFAULT_CATEGORIES.find(c=>c.id===category)?.label}
              <button className="ml-2 underline" style={{ color: '#9B6DFF' }} onClick={() => setStep('amount')}>繼續 →</button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 金額顯示 */}
          <div className="rounded-2xl px-4 py-3 text-right" style={panelStyle}>
            <div className="text-xs mb-0.5" style={{ color: '#7070A0' }}>
              {category
                ? `${DEFAULT_CATEGORIES.find(c=>c.id===category)?.emoji} ${DEFAULT_CATEGORIES.find(c=>c.id===category)?.label}`
                : <span style={{ color: '#FF4C6A' }}>⚠️ 未選分類</span>
              }
            </div>
            <div className="text-3xl font-black" style={{ color: '#F0C040' }}>
              NT$ {amount.includes('+') ? amount : formatMoney(Number(amount) || 0)}
            </div>
            {previewDmg && (
              <motion.div
                className="text-xs font-bold mt-0.5"
                style={{ color: '#FF4C6A' }}
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
          className="text-center text-xs font-bold"
          style={{ color: '#FF4C6A' }}
          initial={{ x: -5 }}
          animate={{ x: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

// ─── 消費記錄 ──────────────────────────────────────────────────────────────────

function ExpenseList({ expenses }) {
  if (!expenses.length) return (
    <div className="text-center text-sm py-4" style={{ color: '#4A3F7A' }}>
      還沒有記帳紀錄<br />
      <span style={{ color: '#7070A0' }}>輸入消費即可攻擊怪物 ⚔️</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
      {[...expenses].reverse().map((e, i) => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === e.category)
        return (
          <motion.div
            key={e.id ?? i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: 'rgba(34,29,58,0.8)',
              border: '1px solid rgba(74,63,122,0.3)',
            }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <span className="text-base">{cat?.emoji ?? '✨'}</span>
            <div className="flex-1">
              <div className="text-xs font-bold" style={{ color: '#C0C8E0' }}>{cat?.label ?? '其他'}</div>
              {e.note && <div className="text-[10px]" style={{ color: '#7070A0' }}>{e.note}</div>}
            </div>
            <div className="text-sm font-bold" style={{ color: '#F0C040' }}>NT${formatMoney(e.amount)}</div>
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
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#0D0B1A' }}>
      {/* 背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, #1A1040 0%, #0D0B1A 60%)' }} />

      {/* 頂部：返回 + 標題 */}
      <div className="relative z-10 flex items-center px-4 pt-3 pb-1 gap-2">
        <button
          className="tap-bounce text-lg px-2 py-1 rounded-lg"
          style={{ color: '#7070A0', background: 'rgba(34,29,58,0.6)' }}
          onClick={() => navigate('town')}
        >←</button>
        <div className="flex-1 text-center">
          <span className="text-sm font-bold" style={{ color: '#F0C040' }}>⚔️ 今日討伐</span>
        </div>
        <div className="text-xs px-2 py-1 rounded-lg"
          style={{ color: '#7070A0', background: 'rgba(34,29,58,0.6)' }}>
          {state.date}
        </div>
      </div>

      {/* 怪物區 */}
      <div className="relative z-10 px-4 py-1" style={{ minHeight: 220 }}>
        <MonsterArea
          monster={monster}
          currentHp={currentHp}
          isHit={isHit}
          damageNumbers={damageNumbers}
        />
      </div>

      {/* 消費記錄 */}
      <div className="relative z-10 px-4 mb-1">
        <div className="text-xs font-bold mb-1" style={{ color: '#4A3F7A' }}>今日記錄</div>
        <ExpenseList expenses={expenses} />
      </div>

      {/* 記帳輸入面板 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-20">
        <div className="rounded-3xl p-3"
          style={{
            background: 'rgba(13,11,26,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(74,63,122,0.6)',
            borderTopColor: '#F0C04044',
          }}
        >
          <div className="text-xs font-bold text-center mb-2" style={{ color: '#4A3F7A' }}>
            ─ 輸入消費即可攻擊 ─
          </div>
          <ExpensePanel onSubmit={handleSubmit} budget={budget} spent={totalSpent} />
        </div>
      </div>

      <BottomNav current="battle" navigate={navigate} />
    </div>
  )
}
