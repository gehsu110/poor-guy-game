/**
 * 簡易全局狀態（不用 Redux，直接用 React context）
 * 提供：user, profile, today 戰鬥狀態
 */
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { onAuth, loginAnonymously, getProfile, updateProfile, addExpense, getExpensesByDate, getDayRecord, setDayRecord, calcLevel } from './firebase'
import { generateDayMonster, calcDamage, calcFinalBlow, calcRating, RATING_REWARDS, todayStr, getTitle } from './gameLogic'

const Ctx = createContext(null)

const init = {
  user: null,
  profile: null,
  loading: true,
  // 今日
  date: todayStr(),
  monster: null,
  expenses: [],
  currentHp: 0,
  maxHp: 0,
  totalSpent: 0,
  settled: false,
  // UI
  screen: 'town',       // town | battle | map | shop | profile
  damageNumbers: [],    // [{id, value, x, y, crit}]
  notification: null,   // {type, message}
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':    return { ...state, user: action.user, loading: false }
    case 'SET_PROFILE': return { ...state, profile: action.profile }
    case 'SET_SCREEN':  return { ...state, screen: action.screen }
    case 'INIT_DAY': {
      const { monster, expenses, dayRecord } = action
      const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
      const budget = state.profile?.dailyBudget ?? 1000
      // 計算怪物當前 HP
      let hp = monster.maxHp
      for (const e of expenses) {
        const { damage } = calcDamage(e.amount, hp === monster.maxHp ? 0 : monster.maxHp - hp, budget)
        hp = Math.max(0, hp - damage)
      }
      return {
        ...state,
        monster,
        expenses,
        currentHp: dayRecord?.defeated ? 0 : hp,
        maxHp: monster.maxHp,
        totalSpent,
        settled: !!dayRecord?.settled,
      }
    }
    case 'ADD_EXPENSE': {
      const { expense, damage } = action
      const newExpenses = [...state.expenses, expense]
      const newHp = Math.max(0, state.currentHp - damage)
      return {
        ...state,
        expenses: newExpenses,
        currentHp: newHp,
        totalSpent: state.totalSpent + expense.amount,
      }
    }
    case 'ADD_DAMAGE_NUMBER': {
      const dn = { id: Date.now() + Math.random(), ...action.dn }
      return { ...state, damageNumbers: [...state.damageNumbers, dn] }
    }
    case 'REMOVE_DAMAGE_NUMBER':
      return { ...state, damageNumbers: state.damageNumbers.filter(d => d.id !== action.id) }
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.data } }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)

  // 1. Auth 監聽
  useEffect(() => {
    const unsub = onAuth(async user => {
      if (!user) {
        try { user = await loginAnonymously() } catch (e) { console.error(e) }
      }
      if (user) {
        dispatch({ type: 'SET_USER', user })
        const profile = await getProfile(user.uid)
        dispatch({ type: 'SET_PROFILE', profile })
        await initToday(user, profile)
      } else {
        dispatch({ type: 'SET_USER', user: null })
      }
    })
    return unsub
  }, [])

  async function initToday(user, profile) {
    const date = todayStr()
    const budget = profile?.dailyBudget ?? 1000
    const monster = generateDayMonster(date, budget)
    const expenses = await getExpensesByDate(user.uid, date)
    const dayRecord = await getDayRecord(user.uid, date)
    dispatch({ type: 'INIT_DAY', monster, expenses, dayRecord })
  }

  // 2. 記帳（攻擊）
  const submitExpense = useCallback(async ({ category, amount, note }) => {
    if (!state.user) return
    const date = todayStr()
    const budget = state.profile?.dailyBudget ?? 1000

    // Firebase 新增
    const expense = { category, amount: Number(amount), note, date }
    await addExpense(state.user.uid, expense)
    const expenseWithId = { ...expense, id: Date.now() }

    // 計算傷害
    const { damage, mult } = calcDamage(Number(amount), state.totalSpent, budget)

    dispatch({ type: 'ADD_EXPENSE', expense: expenseWithId, damage })

    // 傷害數字特效
    const isCrit = mult >= 1.2
    dispatch({
      type: 'ADD_DAMAGE_NUMBER',
      dn: { value: damage, crit: isCrit, x: 45 + Math.random() * 10, y: 35 + Math.random() * 10 }
    })
    setTimeout(() => {
      dispatch({ type: 'REMOVE_DAMAGE_NUMBER', id: Date.now() })
    }, 1000)

    // 更新日記錄
    const newHp = Math.max(0, state.currentHp - damage)
    if (newHp <= 0) {
      // 擊殺！
      await setDayRecord(state.user.uid, date, { defeated: true })
      await giveKillReward()
    }
  }, [state])

  async function giveKillReward() {
    if (!state.user || !state.profile) return
    const tier = state.monster?.tier ?? 'normal'
    const tickets = tier === 'monthboss' ? { gold: 1 } : { normal: tier === 'boss' ? 2 : tier === 'weekend' ? 2 : 1 }
    const newTickets = {
      normal: (state.profile.tickets?.normal ?? 0) + (tickets.normal ?? 0),
      gold:   (state.profile.tickets?.gold   ?? 0) + (tickets.gold   ?? 0),
    }
    await updateProfile(state.user.uid, { tickets: newTickets })
    dispatch({ type: 'UPDATE_PROFILE', data: { tickets: newTickets } })
    dispatch({
      type: 'SET_NOTIFICATION',
      notification: { type: 'kill', message: `💀 擊殺！獲得扭蛋券 x${tickets.normal ?? tickets.gold}` }
    })
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 3000)
  }

  const navigate = useCallback((screen) => {
    dispatch({ type: 'SET_SCREEN', screen })
  }, [])

  return (
    <Ctx.Provider value={{ state, dispatch, submitExpense, navigate }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  return useContext(Ctx)
}
