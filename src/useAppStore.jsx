import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import {
  onAuth,
  loginAnonymously,
  getProfile,
  updateProfile,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpensesByDate,
  getDayRecord,
  setDayRecord,
  calcLevel,
} from './firebase'
import {
  generateDayMonster,
  calcDamage,
  calcFinalBlow,
  calcRating,
  RATING_REWARDS,
  todayStr,
  getTitle,
} from './gameLogic'

const Ctx = createContext(null)

const init = {
  user: null,
  profile: null,
  loading: true,
  date: todayStr(),
  monster: null,
  expenses: [],
  currentHp: 0,
  maxHp: 0,
  totalSpent: 0,
  settled: false,
  screen: 'town',
  screenParams: {},
  damageNumbers: [],
  notification: null,
  homeEffectPulse: null,
  pendingHomeSuccessEffect: null,
}

const DEMO_PROFILE = {
  playerName: '新手勇者',
  level: 1,
  exp: 0,
  expInLevel: 0,
  expToNext: 100,
  title: '菜鳥冒險者',
  stars: { yellow: 0, purple: 0 },
  tickets: { normal: 0, gold: 0 },
  dailyBudget: 1000,
  monthlyIncome: 0,
  fixedExpense: 0,
  savingGoal: 0,
  sharedFund: 0,
  guildLedger: [],
  customCategories: [],
  equipped: {
    set: 'academy_set',
    outfit: 'academy',
    accessory: 'star_pin',
    frame: 'soft_gold',
    groundEffect: 'starter_magic_circle',
    successEffect: 'coin_spark_burst',
  },
  claimedMissions: {},
  guildChallengeClaims: {},
  preferences: { musicEnabled: false, soundEnabled: true, hapticsEnabled: true, dailyReminder: false, reduceMotion: false },
  avatarGender: 'girl',
  consecutiveDays: 0,
  collection: [],
  nameConfirmed: false,
  onboardingDone: false,
}

function calcCombat(monster, expenses, budget, dayRecord) {
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount ?? 0), 0)
  let hp = monster.maxHp
  let spentBefore = 0
  for (const e of expenses) {
    const { damage } = calcDamage(Number(e.amount ?? 0), spentBefore, budget)
    hp = Math.max(0, hp - damage)
    spentBefore += Number(e.amount ?? 0)
  }
  return {
    totalSpent,
    currentHp: dayRecord?.defeated ? 0 : hp,
    maxHp: monster.maxHp,
    settled: !!dayRecord?.settled,
  }
}

function getKillTicketReward(tier) {
  if (tier === 'monthboss') return { normal: 3, gold: 0 }
  if (tier === 'boss' || tier === 'weekend') return { normal: 2, gold: 0 }
  return { normal: 1, gold: 0 }
}

function withStarterHomeEffects(profile) {
  if (!profile) return profile
  const equipped = {
    ...(profile.equipped ?? {}),
    groundEffect: profile.equipped?.groundEffect ?? 'starter_magic_circle',
    successEffect: profile.equipped?.successEffect ?? 'coin_spark_burst',
  }
  const collection = [...(profile.collection ?? [])]
  const owned = new Set(collection.map(item => item.id))
  if (!owned.has('starter_magic_circle')) {
    collection.push({ id: 'starter_magic_circle', rarity: 'R', obtainedAt: Date.now(), source: 'starter' })
  }
  if (!owned.has('coin_spark_burst')) {
    collection.push({ id: 'coin_spark_burst', rarity: 'R', obtainedAt: Date.now(), source: 'starter' })
  }
  return { ...profile, equipped, collection }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, loading: false }
    case 'SET_PROFILE':
      return { ...state, profile: withStarterHomeEffects(action.profile) }
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, screenParams: action.params ?? {} }
    case 'INIT_DAY': {
      const { monster, expenses, dayRecord } = action
      const budget = state.profile?.dailyBudget ?? action.profile?.dailyBudget ?? 1000
      return {
        ...state,
        monster,
        expenses,
        ...calcCombat(monster, expenses, budget, dayRecord),
      }
    }
    case 'RECALC_DAY': {
      const { expenses, dayRecord } = action
      const budget = state.profile?.dailyBudget ?? 1000
      return {
        ...state,
        expenses,
        ...calcCombat(state.monster, expenses, budget, dayRecord),
      }
    }
    case 'ADD_DAMAGE_NUMBER': {
      const dn = { id: action.dn.id ?? Date.now() + Math.random(), ...action.dn }
      return { ...state, damageNumbers: [...state.damageNumbers, dn] }
    }
    case 'REMOVE_DAMAGE_NUMBER':
      return { ...state, damageNumbers: state.damageNumbers.filter(d => d.id !== action.id) }
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification }
    case 'QUEUE_HOME_SUCCESS_EFFECT':
      return { ...state, pendingHomeSuccessEffect: action.id ?? Date.now() }
    case 'PLAY_HOME_SUCCESS_EFFECT':
      return { ...state, homeEffectPulse: action.id ?? Date.now() }
    case 'CONSUME_HOME_SUCCESS_EFFECT':
      return { ...state, pendingHomeSuccessEffect: null, homeEffectPulse: action.id ?? state.pendingHomeSuccessEffect ?? Date.now() }
    case 'CLEAR_HOME_SUCCESS_EFFECT':
      return { ...state, homeEffectPulse: null }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.data } }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)

  async function settleIfNeeded(uid, profile) {
    const today = todayStr()
    const lastActiveDate = profile?.lastActiveDate
    let nextProfile = profile

    if (lastActiveDate && lastActiveDate < today) {
      nextProfile = await settleDay(uid, lastActiveDate, nextProfile)
    }

    if (nextProfile?.lastActiveDate !== today) {
      nextProfile = { ...nextProfile, lastActiveDate: today }
      await updateProfile(uid, { lastActiveDate: today })
    }

    return nextProfile
  }

  async function settleDay(uid, date, profile) {
    const dayRecord = await getDayRecord(uid, date)
    if (dayRecord?.settled) return profile

    const budget = profile?.dailyBudget ?? 1000
    const expenses = await getExpensesByDate(uid, date)
    if (!expenses.length) {
      await setDayRecord(uid, date, { settled: true, defeated: false, rating: null, spent: 0 })
      await updateProfile(uid, { consecutiveDays: 0 })
      return { ...profile, consecutiveDays: 0 }
    }

    const monster = generateDayMonster(date, budget)
    let spentBefore = 0
    let totalDamage = 0
    for (const e of expenses) {
      const { damage } = calcDamage(Number(e.amount ?? 0), spentBefore, budget)
      totalDamage += damage
      spentBefore += Number(e.amount ?? 0)
    }

    const finalDamage = calcFinalBlow(spentBefore, budget)
    totalDamage += finalDamage
    const defeated = !!dayRecord?.defeated || totalDamage >= monster.maxHp
    const rating = calcRating(spentBefore, budget, expenses.length)
    const baseReward = RATING_REWARDS[rating] ?? RATING_REWARDS.C
    const killReward = defeated && !dayRecord?.killRewardGranted
      ? getKillTicketReward(monster.tier)
      : { normal: 0, gold: 0 }

    const expGain = baseReward.exp + (defeated ? 20 : 0) + (spentBefore <= budget ? 10 : 0)
    const exp = (profile?.exp ?? 0) + expGain
    const levelInfo = calcLevel(exp)
    const newStars = {
      yellow: (profile?.stars?.yellow ?? 0) + (baseReward.yellow ?? 0),
      purple: (profile?.stars?.purple ?? 0) + (baseReward.purple ?? 0),
    }
    const newTickets = {
      normal: (profile?.tickets?.normal ?? 0) + (killReward.normal ?? 0),
      gold: (profile?.tickets?.gold ?? 0) + (killReward.gold ?? 0),
    }
    const consecutiveDays = (profile?.consecutiveDays ?? 0) + 1
    const profileUpdate = {
      exp,
      ...levelInfo,
      title: getTitle(levelInfo.level).name,
      stars: newStars,
      tickets: newTickets,
      consecutiveDays,
    }

    await updateProfile(uid, profileUpdate)
    await setDayRecord(uid, date, {
      settled: true,
      defeated,
      rating,
      spent: spentBefore,
      totalDamage,
      finalDamage,
      rewards: {
        yellow: baseReward.yellow ?? 0,
        purple: baseReward.purple ?? 0,
        normalTicket: killReward.normal ?? 0,
        goldTicket: killReward.gold ?? 0,
        exp: expGain,
      },
      killRewardGranted: defeated || !!dayRecord?.killRewardGranted,
    })

    return { ...profile, ...profileUpdate }
  }

  async function initToday(user, profile) {
    const date = todayStr()
    const budget = profile?.dailyBudget ?? 1000
    const monster = generateDayMonster(date, budget)
    const expenses = await getExpensesByDate(user.uid, date)
    const dayRecord = await getDayRecord(user.uid, date)
    dispatch({ type: 'INIT_DAY', monster, expenses, dayRecord, profile })
  }

  function initLocalDay(profile) {
    const date = todayStr()
    const budget = profile?.dailyBudget ?? 1000
    const monster = generateDayMonster(date, budget)
    dispatch({ type: 'INIT_DAY', monster, expenses: [], dayRecord: null, profile })
  }

  useEffect(() => {
    const unsub = onAuth(async user => {
      if (!user) {
        try {
          user = await loginAnonymously()
        } catch (e) {
          console.warn('匿名登入失敗，使用本機展示模式', e?.code ?? e)
        }
      }
      if (user) {
        dispatch({ type: 'SET_USER', user })
        let profile = await getProfile(user.uid)
        profile = await settleIfNeeded(user.uid, profile)
        const starterProfile = withStarterHomeEffects(profile)
        const needsStarterUpdate = (
          starterProfile?.equipped?.groundEffect !== profile?.equipped?.groundEffect ||
          starterProfile?.equipped?.successEffect !== profile?.equipped?.successEffect ||
          (starterProfile?.collection?.length ?? 0) !== (profile?.collection?.length ?? 0)
        )
        if (needsStarterUpdate) {
          await updateProfile(user.uid, {
            equipped: starterProfile.equipped,
            collection: starterProfile.collection,
          })
          profile = starterProfile
        }
        dispatch({ type: 'SET_PROFILE', profile })
        await initToday(user, profile)
      } else {
        dispatch({ type: 'SET_USER', user: null })
        dispatch({ type: 'SET_PROFILE', profile: DEMO_PROFILE })
        initLocalDay(DEMO_PROFILE)
      }
    })
    return unsub
    // The auth listener is intentionally registered once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshToday = useCallback(async () => {
    if (!state.user || !state.monster) return
    const expenses = await getExpensesByDate(state.user.uid, todayStr())
    const dayRecord = await getDayRecord(state.user.uid, todayStr())
    dispatch({ type: 'RECALC_DAY', expenses, dayRecord })
  }, [state.user, state.monster])

  const submitExpense = useCallback(async ({ category, amount, note }) => {
    const date = todayStr()
    const budget = state.profile?.dailyBudget ?? 1000
    const numericAmount = Number(amount)
    const expense = { category, amount: numericAmount, note, date }
    const ref = state.user
      ? await addExpense(state.user.uid, expense)
      : { id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}` }
    const expenseWithId = { ...expense, id: ref.id }
    const { damage, mult } = calcDamage(numericAmount, state.totalSpent, budget)
    const nextExpenses = [...state.expenses, expenseWithId]
    dispatch({ type: 'RECALC_DAY', expenses: nextExpenses, dayRecord: { defeated: Math.max(0, state.currentHp - damage) <= 0 } })
    dispatch({ type: 'QUEUE_HOME_SUCCESS_EFFECT', id: Date.now() + Math.random() })

    const damageId = Date.now() + Math.random()
    dispatch({
      type: 'ADD_DAMAGE_NUMBER',
      dn: { id: damageId, value: damage, crit: mult >= 1.2, x: 45 + Math.random() * 10, y: 35 + Math.random() * 10 },
    })
    setTimeout(() => dispatch({ type: 'REMOVE_DAMAGE_NUMBER', id: damageId }), 1000)

    const newHp = Math.max(0, state.currentHp - damage)
    if (state.currentHp > 0 && newHp <= 0) {
      if (state.user) await setDayRecord(state.user.uid, date, { defeated: true, settled: false })
      dispatch({
        type: 'SET_NOTIFICATION',
        notification: { type: 'kill', message: '今日咒靈已淨化，獎勵會在每日結算發放。' },
      })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 3000)
    }
  }, [state])

  const updateExpenseEntry = useCallback(async (expenseId, data) => {
    if (!state.user || !expenseId) return
    await updateExpense(state.user.uid, expenseId, {
      category: data.category,
      note: data.note ?? '',
      amount: Number(data.amount),
    })
    await setDayRecord(state.user.uid, todayStr(), { settled: false })
    await refreshToday()
  }, [state, refreshToday])

  const deleteExpenseEntry = useCallback(async (expenseId) => {
    if (!state.user || !expenseId) return
    await deleteExpense(state.user.uid, expenseId)
    await setDayRecord(state.user.uid, todayStr(), { settled: false, defeated: false })
    await refreshToday()
  }, [state, refreshToday])

  const navigate = useCallback((screen, params) => {
    dispatch({ type: 'SET_SCREEN', screen, params })
  }, [])

  return (
    <Ctx.Provider value={{ state, dispatch, submitExpense, updateExpenseEntry, deleteExpenseEntry, navigate }}>
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(Ctx)
}
