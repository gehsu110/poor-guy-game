import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../useAppStore'
import { DEFAULT_CATEGORIES, formatMoney, calcDamage } from '../gameLogic'
import GameIcon from '../components/GameIcon'
import battleBg from '../assets/academy-art/home-bg.webp'
import monsterSlime from '../assets/academy-art/generated/monster-slime.png'
import monsterRabbit from '../assets/academy-art/generated/monster-rabbit.png'
import monsterMushroom from '../assets/academy-art/generated/monster-mushroom.png'
import monsterCoin from '../assets/academy-art/generated/monster-coin.png'
import monsterCat from '../assets/academy-art/generated/monster-cat.png'
import monsterWeekend from '../assets/academy-art/generated/monster-weekend.png'
import monsterSunday from '../assets/academy-art/generated/monster-sunday.png'
import monsterMonth from '../assets/academy-art/generated/monster-month.png'
import { setScreenChrome } from '../screenChrome'
import { DEFAULT_BATTLE_ATTACK_EFFECT, getBattleAttackEffect } from '../battleEffects'

const MONSTER_ART = {
  slime: monsterSlime,
  rabbit: monsterRabbit,
  mushroom: monsterMushroom,
  coin: monsterCoin,
  cat: monsterCat,
  weekend: monsterWeekend,
  sunday: monsterSunday,
  month: monsterMonth,
}

// ─── 攻擊特效：帳本印章蓄力與飛行 ───────────────────────────────────────────
function BattleAttackCharge({ effectId, isCrit }) {
  const effect = getBattleAttackEffect(effectId)
  return (
    <motion.div
      className={`academy-battle-attack-effect academy-battle-attack-effect--${effectId} ${isCrit ? 'is-crit' : ''}`}
      style={{ '--attack-effect-color': effect.color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.15, ease: 'easeOut' }}
    >
      <span className="academy-battle-attack-effect__origin" />
      <span className="academy-battle-attack-effect__track" />
      <span className="academy-battle-attack-effect__seal" />
      <span className="academy-battle-attack-effect__stamp" />
      <span className="academy-battle-attack-effect__paper academy-battle-attack-effect__paper--one" />
      <span className="academy-battle-attack-effect__paper academy-battle-attack-effect__paper--two" />
      <span className="academy-battle-attack-effect__paper academy-battle-attack-effect__paper--three" />
      <span className="academy-battle-attack-effect__star academy-battle-attack-effect__star--one" />
      <span className="academy-battle-attack-effect__star academy-battle-attack-effect__star--two" />
      <span className="academy-battle-attack-effect__star academy-battle-attack-effect__star--three" />
    </motion.div>
  )
}

// ─── 攻擊特效：命中爆光與收尾 ───────────────────────────────────────────────
function BattleAttackImpact({ effectId, isCrit }) {
  const effect = getBattleAttackEffect(effectId)
  const count = isCrit ? 14 : 9
  const colors = isCrit
    ? ['#FFD166', '#FFFFFF', '#FF7FA3', '#FFE99A', '#C8A8E9']
    : ['#C8A8E9', '#FF7FA3', '#A8E6CF', '#FFFFFF', '#B8E0FF']

  const particles = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360
    const rad = (angle * Math.PI) / 180
    const variance = ((i * 37) % 11) / 10
    const sizeVariance = ((i * 19) % 7) / 6
    const dist = isCrit ? 52 + variance * 36 : 28 + variance * 22
    const size = isCrit ? 7 + sizeVariance * 5 : 4 + sizeVariance * 4
    return { i, rad, dist, size, color: colors[i % colors.length] }
  }), [])  // eslint-disable-line react-hooks/exhaustive-deps

  const stars = useMemo(() => isCrit ? Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * 360 + 36
    const rad = (angle * Math.PI) / 180
    return { i, rad }
  }) : [], [isCrit])

  return (
    <div
      className={`academy-battle-impact academy-battle-impact--${effectId} ${isCrit ? 'is-crit' : ''}`}
      style={{ '--attack-effect-color': effect.color }}
    >
      <span className="academy-battle-impact__seal" />
      <span className="academy-battle-impact__slash academy-battle-impact__slash--one" />
      <span className="academy-battle-impact__slash academy-battle-impact__slash--two" />
      <motion.div
        className="academy-battle-impact__flash"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: isCrit ? 3.5 : 2.5, opacity: 0 }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
      />
      {particles.map(({ i, rad, dist, size, color }) => (
        <motion.div
          key={i}
          className="academy-battle-impact__particle"
          style={{
            width: size, height: size,
            background: color,
            marginLeft: -size / 2, marginTop: -size / 2,
            boxShadow: `0 0 ${size + 2}px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.95, ease: 'easeOut', delay: 0.025 * (i % 4) }}
        />
      ))}
      {stars.map(({ i, rad }) => (
        <motion.div
          key={`star-${i}`}
          className="academy-battle-impact__crit-star"
          style={{ marginLeft: -10, marginTop: -10 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.5 }}
          animate={{ x: Math.cos(rad) * 68, y: Math.sin(rad) * 68, opacity: 0, rotate: 360, scale: 0 }}
          transition={{ duration: 1.05, ease: 'easeOut' }}
        ><span className="academy-impact-star" /></motion.div>
      ))}
    </div>
  )
}

// ─── 攻擊特效：舞台閃光 ──────────────────────────────────────────────────────
function ScreenFlash({ effectId, isCrit }) {
  const effect = getBattleAttackEffect(effectId)
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 rounded-[inherit]"
      style={{
        background: isCrit
          ? 'radial-gradient(ellipse at 50% 45%, rgba(255,209,102,0.12) 0%, transparent 58%)'
          : `radial-gradient(ellipse at 50% 45%, color-mix(in srgb, ${effect.color} 10%, transparent) 0%, transparent 58%)`,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
    />
  )
}

function TierBadge({ tier }) {
  if (tier === 'monthboss') return <span className="academy-status academy-status--boss">月底首領</span>
  if (tier === 'boss' || tier === 'weekend') return <span className="academy-status academy-status--boss">週末首領</span>
  return <span className="academy-status">今日咒靈</span>
}

function getBattleDrop(tier) {
  if (tier === 'monthboss') return { normalTicket: 3 }
  if (tier === 'boss' || tier === 'weekend') return { normalTicket: 2 }
  return { normalTicket: 1 }
}

function BattleRewardPill({ type, value }) {
  const icon = type === 'normalTicket' ? 'ticket-normal' : 'ticket-gold'
  const label = type === 'normalTicket' ? '一般券' : '金券'
  return (
    <span className="academy-battle-reward-pill">
      <GameIcon name={icon} />
      <b>{label} +{value}</b>
    </span>
  )
}

function MonsterArea({ monster, currentHp, totalSpent, isHit, damageNumbers, hitKey, isCrit, showProjectile, showImpact, attackEffectId }) {
  if (!monster) return null
  const hpPct = monster.maxHp > 0 ? Math.max(0, currentHp / monster.maxHp) : 0
  const defeated = currentHp <= 0
  const isAngry = hpPct < 0.3 && !defeated
  const attackPower = Math.max(0, Math.round(totalSpent / 10))
  const attackEffect = getBattleAttackEffect(attackEffectId)
  const drop = getBattleDrop(monster.tier)

  return (
    <div className="academy-battle-arena">
      <div className={`academy-battle-stage ${isHit ? 'is-casting' : ''}`}>
        <div className="academy-battle-stage__title">
          <div>
            <strong>{monster.name}</strong>
            <span>{defeated ? '淨化完成' : '施放記帳攻擊'}</span>
          </div>
          <TierBadge tier={monster.tier} />
        </div>

        <div className="academy-battle-stage__quickstats">
          <span>今日 NT${formatMoney(totalSpent)}</span>
          <span>攻擊 +{attackPower}</span>
          <span>{attackEffect.name}</span>
          <span>HP {Math.round(hpPct * 100)}%</span>
        </div>

        <div className="academy-battle-stage__hp">
          <div className="academy-battle-meter-row">
            <span>HP</span>
            <span>{defeated ? '0' : formatMoney(currentHp)} / {formatMoney(monster.maxHp)}</span>
          </div>
          <div className="academy-battle-meter">
            <motion.div
              animate={{ width: `${hpPct * 100}%` }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="academy-battle-stage__sigil" />
        <div className="academy-battle-stage__rail academy-battle-stage__rail--left" />
        <div className="academy-battle-stage__rail academy-battle-stage__rail--right" />
        <motion.div
          className={`academy-battle-monster ${isHit ? 'monster-hit' : ''}`}
          animate={
            defeated ? { rotate: [-4, 4, -4], scale: 0.9 } :
            isHit ? { x: [0, 12, -8, 4, 0], scale: [1, 0.88, 1.05, 0.97, 1] } :
            isAngry ? { scale: [1, 1.08, 1] } :
            { y: [0, -8, 0] }
          }
          transition={{ duration: defeated ? 1 : isHit ? 0.4 : isAngry ? 0.45 : 2.4, repeat: (defeated || isAngry) ? Infinity : 0 }}
        >
          {defeated
            ? <span className="academy-icon academy-icon--star h-16 w-16" />
            : <img className="academy-battle-monster-art" src={MONSTER_ART[monster.id]} alt="" draggable="false" />}
        </motion.div>
        {isAngry && <div className="academy-battle-alert" />}

        {/* 攻擊特效層 */}
        <AnimatePresence>
          {showProjectile && <BattleAttackCharge key={`proj-${hitKey}`} effectId={attackEffectId} isCrit={isCrit} />}
        </AnimatePresence>
        <AnimatePresence>
          {showImpact && <BattleAttackImpact key={`burst-${hitKey}`} effectId={attackEffectId} isCrit={isCrit} />}
        </AnimatePresence>
        <AnimatePresence>
          {showImpact && <ScreenFlash key={`flash-${hitKey}`} effectId={attackEffectId} isCrit={isCrit} />}
        </AnimatePresence>

        {damageNumbers.map(dn => (
          <motion.div
            key={dn.id}
            className="damage-num absolute z-30 font-black"
            style={{
              left: `${dn.x}%`,
              top: `${dn.y}%`,
              color: dn.crit ? '#FFD166' : '#FF7FA3',
              fontSize: dn.crit ? 30 : 24,
              textShadow: dn.crit ? '0 0 12px #FFD166' : '0 0 8px #FF7FA3',
            }}
            initial={{ y: 0, opacity: 1, scale: dn.crit ? 1.5 : 1.2 }}
            animate={{ y: -72, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
          >
            {dn.crit ? '爆擊 ' : ''}-{formatMoney(dn.value)}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {defeated && (
          <motion.div
            className="academy-battle-clear-card"
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4BE]">
              <span className="academy-icon academy-icon--star" />
            </div>
            <div className="mt-1 text-sm font-black text-[#26324A]">淨化成功</div>
            <div className="mt-1 flex justify-center gap-1">
              <BattleRewardPill type="normalTicket" value={drop.normalTicket} />
            </div>
            <div className="mt-1 text-[10px] font-bold text-[#8E87A8]">任務與結算徽章會在今日結算同步</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CategoryIcon({ cat, className = '' }) {
  return (
    <span className={`academy-category-symbol ${className}`} style={{ '--cat-color': cat?.color ?? '#C8A8E9' }}>
      <GameIcon name={cat?.iconKey ?? 'other'} />
    </span>
  )
}

function evaluateAmount(value) {
  return String(value)
    .split('+')
    .map(Number)
    .filter(Number.isFinite)
    .reduce((sum, number) => sum + number, 0)
}

function CategoryPicker({ selected, onSelect, categories }) {
  return (
    <div className="academy-category-strip">
      {categories.map(cat => (
        <motion.button
          key={cat.id}
          className={`academy-category academy-category--compact ${selected === cat.id ? 'is-active' : ''}`}
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

function CalcKeyboard({ value, onChange }) {
  function press(k) {
    if (k === '⌫') onChange(value.slice(0, -1) || '0')
    else if (k === 'AC') onChange('0')
    else if (k === '+') onChange(value + '+')
    else if (value === '0' && k !== '.') onChange(k)
    else onChange(value + k)
  }

  function evalValue() {
    return evaluateAmount(value)
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
            onClick={() => isEqual ? onChange(String(evalValue())) : press(k)}
            whileTap={{ scale: 0.9 }}
          >
            {k}
          </motion.button>
        )
      })}
    </div>
  )
}

function ExpensePanel({ onSubmit, budget, spent, editingExpense, onCancelEdit, categories }) {
  const [category, setCategory] = useState(editingExpense?.category ?? null)
  const [note, setNote] = useState(editingExpense?.note ?? '')
  const [amount, setAmount] = useState(String(editingExpense?.amount ?? 0))
  const [error, setError] = useState('')
  const [showCalculator, setShowCalculator] = useState(false)

  const currentCat = categories.find(c => c.id === category)

  function handleAmountSubmit(val) {
    const n = Number(val)
    if (!n || n <= 0) {
      setError('請輸入金額')
      return
    }
    if (!category) {
      setError('請選擇分類')
      return
    }
    setError('')
    onSubmit({ category, note, amount: n })
    setAmount('0')
    setNote('')
    setCategory(null)
    onCancelEdit?.()
  }

  const evaluatedAmount = evaluateAmount(amount)
  const previewDmg = evaluatedAmount > 0
    ? calcDamage(evaluatedAmount, spent, budget).damage
    : null

  return (
    <div className="academy-battle-pad">
      <div className="academy-battle-panel-head">
        <div>
          <b>記帳攻擊</b>
          <small>{previewDmg ? `本筆預估傷害 -${formatMoney(previewDmg)}` : '選分類並輸入金額'}</small>
        </div>
      </div>

      {editingExpense && (
        <div className="rounded-2xl bg-[#FFF4BE] px-3 py-2 text-center text-xs font-black text-[#B47B16]">
          正在修改一筆紀錄
          <button className="ml-2 text-[#7B63D8]" onClick={onCancelEdit}>取消</button>
        </div>
      )}

      <CategoryPicker selected={category} categories={categories} onSelect={cat => setCategory(cat)} />

      <div className="academy-battle-entry-row">
        <input
          type="text"
          placeholder="備註，可跳過"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="min-w-0 rounded-2xl border border-[#E7DEF6] bg-white/90 px-3 py-2 text-xs font-bold text-[#26324A] outline-none placeholder:text-[#B8AECF] focus:border-[#8B7CFF]"
          maxLength={20}
        />
        <label className="academy-battle-amount">
          <div className="truncate text-[10px] font-black text-[#8E87A8]">
            {currentCat ? currentCat.label : '選分類'}
          </div>
          <span className="academy-battle-amount__input">
            <b>NT$</b>
            <input
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              aria-label="消費金額"
              value={amount === '0' ? '' : amount}
              placeholder="0"
              onChange={event => setAmount(event.target.value.replace(/[^0-9.+]/g, ''))}
              onKeyDown={event => {
                if (event.key === 'Enter') handleAmountSubmit(evaluatedAmount)
              }}
            />
          </span>
          {previewDmg && <div className="text-[10px] font-black text-[#FF6D98]">傷害 -{formatMoney(previewDmg)}</div>}
        </label>
      </div>

      <div className="academy-battle-actions">
        <button className="academy-calculator-toggle" onClick={() => setShowCalculator(value => !value)}>
          {showCalculator ? '收起加總' : '多筆加總'}
        </button>
        <button className="academy-battle-submit" onClick={() => handleAmountSubmit(evaluatedAmount)}>
          記帳攻擊
        </button>
      </div>

      {createPortal(
        <AnimatePresence>
          {showCalculator && (
          <motion.div
            className="academy-calculator-sheet"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="academy-calculator-sheet__header">
              <div>
                <span>多筆加總</span>
                <b>NT$ {formatMoney(evaluatedAmount)}</b>
              </div>
              <button onClick={() => setShowCalculator(false)}>完成</button>
            </div>
            <CalcKeyboard value={amount || '0'} onChange={setAmount} />
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
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

function ExpenseLogButton({ expenses, categories, onClick }) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
  const latest = [...expenses].reverse()[0]
  const latestCat = categories.find(c => c.id === latest?.category)

  return (
    <button className="academy-battle-log-entry" onClick={onClick}>
      <b>今日明細</b>
      <span>
        {expenses.length
          ? `${expenses.length} 筆・NT$${formatMoney(total)}${latestCat ? `・${latestCat.label}` : ''}`
          : '尚無紀錄'}
      </span>
    </button>
  )
}

function ExpenseLogDrawer({ open, expenses, categories, onClose, onEdit, onDelete }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="academy-battle-log-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="academy-battle-log-backdrop" onClick={onClose} aria-label="關閉今日明細" />
          <motion.div
            className="academy-battle-log-sheet"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="academy-battle-log-sheet__header">
              <div>
                <b>今日明細</b>
                <span>可修改或刪除單筆紀錄</span>
              </div>
              <button onClick={onClose}>完成</button>
            </div>
            <ExpenseList expenses={expenses} categories={categories} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function ExpenseList({ expenses, onEdit, onDelete, categories }) {
  if (!expenses.length) {
    return (
      <div className="academy-battle-empty-log">
        還沒有記帳紀錄，輸入消費即可施法。
      </div>
    )
  }

  return (
    <div className="academy-battle-expense-list">
      {[...expenses].reverse().map((e, i) => {
        const cat = categories.find(c => c.id === e.category)
        return (
          <motion.div
            key={e.id ?? i}
            className="academy-battle-expense-row"
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
            <button className="academy-battle-row-action" onClick={() => onEdit(e)}>改</button>
            <button className="academy-battle-row-action is-danger" onClick={() => onDelete(e.id)}>刪</button>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function BattleScreen() {
  const { state, navigate, submitExpense, updateExpenseEntry, deleteExpenseEntry } = useApp()
  const { profile, monster, currentHp, totalSpent, damageNumbers, expenses } = state
  const [isHit, setIsHit] = useState(false)
  const [isCrit, setIsCrit] = useState(false)
  const [showProjectile, setShowProjectile] = useState(false)
  const [showImpact, setShowImpact] = useState(false)
  const [hitKey, setHitKey] = useState(0)
  const [editingExpense, setEditingExpense] = useState(null)
  const [logOpen, setLogOpen] = useState(false)
  const budget = profile?.dailyBudget ?? 1000
  const categories = [...DEFAULT_CATEGORIES, ...(profile?.customCategories ?? [])]
  const remaining = budget - totalSpent
  const attackEffectId = profile?.equipped?.attackEffect ?? DEFAULT_BATTLE_ATTACK_EFFECT

  useEffect(() => {
    return setScreenChrome({
      color: '#b5d2ff',
      background: 'linear-gradient(180deg, #9fc3f5 0%, #b9d5ff 58%, #d8dcfb 100%)',
    })
  }, [])

  async function handleSubmit(data) {
    const spentBase = editingExpense ? totalSpent - Number(editingExpense.amount ?? 0) : totalSpent
    const { mult } = calcDamage(data.amount, spentBase, budget)
    const crit = mult >= 1.2

    setIsCrit(crit)
    setHitKey(k => k + 1)
    setShowProjectile(true)

    // 投射物飛行後命中
    setTimeout(() => {
      setShowProjectile(false)
      setIsHit(true)
      setShowImpact(true)
    }, 900)

    // 清除命中狀態
    setTimeout(() => {
      setIsHit(false)
      setShowImpact(false)
    }, 2400)

    if (editingExpense) {
      await updateExpenseEntry(editingExpense.id, data)
      setEditingExpense(null)
    } else {
      await submitExpense(data)
    }
  }

  return (
    <div className="academy-screen academy-screen--battle">
      <img src={battleBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-battle-scene-glow" />
      <div className="academy-bg-soft" />

      <div className="academy-safe-top relative z-20 flex items-center gap-2 px-4 pb-1">
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
        <div className={`academy-battle-budget-pill ${remaining < 0 ? 'is-over' : ''}`}>
          {remaining < 0 ? `超支 ${formatMoney(-remaining)}` : `剩餘 ${formatMoney(remaining)}`}
        </div>
        <ExpenseLogButton
          expenses={expenses}
          categories={categories}
          onClick={() => setLogOpen(true)}
        />
      </div>

      <div className="academy-battle-content relative z-10 flex-1 overflow-y-auto px-4">
        <MonsterArea
          monster={monster}
          currentHp={currentHp}
          totalSpent={totalSpent}
          isHit={isHit}
          damageNumbers={damageNumbers}
          hitKey={hitKey}
          isCrit={isCrit}
          showProjectile={showProjectile}
          showImpact={showImpact}
          attackEffectId={attackEffectId}
        />

        <div className="academy-battle-panel">
          <ExpensePanel
            key={editingExpense?.id ?? 'new-expense'}
            onSubmit={handleSubmit}
            budget={budget}
            spent={editingExpense ? totalSpent - Number(editingExpense.amount ?? 0) : totalSpent}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
            categories={categories}
          />
        </div>

      </div>

      <ExpenseLogDrawer
        open={logOpen}
        expenses={expenses}
        categories={categories}
        onClose={() => setLogOpen(false)}
        onEdit={expense => {
          setEditingExpense(expense)
          setLogOpen(false)
        }}
        onDelete={deleteExpenseEntry}
      />

    </div>
  )
}
