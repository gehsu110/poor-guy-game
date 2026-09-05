import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react'
import { onAuth, loginAnonymously, getProfile, updateProfile, ensureProfile, commitExpenseChange, getExpensesByDate, getDayRecord, setDayRecord, getAllDayRecords, transactGame, DEFAULT_PROFILE, LOCAL_USER, firebaseConfigured } from './firebase'
import { todayStr } from './gameLogic'
import { adventureStats, buildMissions, buildRouteMissions, calcLevel, combatState, grantReward, parseAmount, settleRecord } from './progression'
import { DEFAULT_BATTLE_ATTACK_EFFECT } from './battleEffects'
import { normalizeAppearance } from './paperDoll'
import { STORYBOOK_SET_ID } from './storybookCatalog'
import { playGameSound } from './gameAudio'

const Ctx = createContext(null)
const init = { user: null, profile: null, loading: true, error: null, date: todayStr(), monster: null, expenses: [], currentHp: 0, maxHp: 0, totalSpent: 0, settled: false, dayRecord: {}, dayRecords: {}, screen: 'town', screenParams: {}, damageNumbers: [], notification: null, homeEffectPulse: null, pendingHomeSuccessEffect: null, rewardReveal: null, busy: false }
function withStarterHomeEffects(profile) {
  if (!profile) return profile
  const currentEquipped = profile.equipped ?? {}
  const equipped = {
    ...currentEquipped,
    visualStyle: currentEquipped.visualStyle ?? 'storybook',
    appearance: normalizeAppearance(currentEquipped.appearance),
    groundEffect: currentEquipped.groundEffect === undefined ? 'starter_magic_circle' : currentEquipped.groundEffect,
    successEffect: currentEquipped.successEffect === undefined ? 'coin_spark_burst' : currentEquipped.successEffect,
    attackEffect: currentEquipped.attackEffect ?? DEFAULT_BATTLE_ATTACK_EFFECT,
  }
  const collection = [...(profile.collection ?? [])]
  const owned = new Set(collection.map(item => item.id))
  if (!owned.has(STORYBOOK_SET_ID)) collection.push({ id: STORYBOOK_SET_ID, rarity: 'N', obtainedAt: Date.now(), source: 'starter' })
  if (!owned.has('starter_magic_circle')) {
    collection.push({ id: 'starter_magic_circle', rarity: 'R', obtainedAt: Date.now(), source: 'starter' })
  }
  if (!owned.has('coin_spark_burst')) {
    collection.push({ id: 'coin_spark_burst', rarity: 'R', obtainedAt: Date.now(), source: 'starter' })
  }
  if (!owned.has(DEFAULT_BATTLE_ATTACK_EFFECT)) {
    collection.push({ id: DEFAULT_BATTLE_ATTACK_EFFECT, rarity: 'R', obtainedAt: Date.now(), source: 'starter' })
  }
  return { ...profile, equipped, collection }
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': return { ...state, ...action.data, loading: false, error: null }
    case 'ERROR': return { ...state, loading: false, error: action.error }
    case 'BUSY': return { ...state, busy: action.value }
    case 'SET_SCREEN': return { ...state, screen: action.screen, screenParams: action.params ?? {} }
    case 'UPDATE_PROFILE': return { ...state, profile: { ...state.profile, ...action.data } }
    case 'SET_NOTIFICATION': return { ...state, notification: action.notification }
    case 'REVEAL': return { ...state, rewardReveal: action.value }
    case 'ADD_DAMAGE_NUMBER': return { ...state, damageNumbers: [...state.damageNumbers, action.dn] }
    case 'REMOVE_DAMAGE_NUMBER': return { ...state, damageNumbers: state.damageNumbers.filter(d => d.id !== action.id) }
    case 'QUEUE_HOME_SUCCESS_EFFECT': return { ...state, pendingHomeSuccessEffect: action.id }
    case 'PLAY_HOME_SUCCESS_EFFECT': return { ...state, homeEffectPulse: action.id }
    case 'CONSUME_HOME_SUCCESS_EFFECT': return { ...state, pendingHomeSuccessEffect: null, homeEffectPulse: action.id ?? state.pendingHomeSuccessEffect }
    case 'CLEAR_HOME_SUCCESS_EFFECT': return { ...state, homeEffectPulse: null }
    default: return state
  }
}
const deadline = (promise, ms = 12000) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('雲端連線逾時，請檢查網路後重試。')), ms)
  promise.then(value => { clearTimeout(timer); resolve(value) }, error => { clearTimeout(timer); reject(error) })
})

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)
  const latest = useRef(state)
  const locked = useRef(false)
  const timers = useRef(new Set())
  useEffect(() => { latest.current = state }, [state])
  const later = useCallback((fn, ms) => {
    const timer = setTimeout(() => { timers.current.delete(timer); fn() }, ms)
    timers.current.add(timer)
  }, [])
  useEffect(() => { const active = timers.current; return () => active.forEach(clearTimeout) }, [])
  const notify = useCallback(message => {
    const id = crypto.randomUUID()
    dispatch({ type: 'SET_NOTIFICATION', notification: { message, id } })
    later(() => { if (latest.current.notification?.id === id) dispatch({ type: 'SET_NOTIFICATION', notification: null }) }, 3600)
  }, [later])

  const loadGame = useCallback(async (user, date = todayStr()) => {
    await ensureProfile(user.uid)
    let profile = withStarterHomeEffects({ ...DEFAULT_PROFILE, ...await getProfile(user.uid) })
    let records = await getAllDayRecords(user.uid)
    let settlement = null
    // Settle every open recorded day, never empty days or historical backfills.
    const pending = new Set(Object.keys(records).filter(day => day < date && !records[day].settled))
    if (profile.lastActiveDate && profile.lastActiveDate < date && !records[profile.lastActiveDate]?.settled) pending.add(profile.lastActiveDate)
    for (const day of [...pending].sort()) {
      const expenses = await getExpensesByDate(user.uid, day)
      const result = await transactGame(user.uid, day, (freshProfile, record) => settleRecord(day, freshProfile, expenses, record))
      profile = withStarterHomeEffects(result.profile)
      records[day] = result.record
      if (result.record.rewards?.exp) settlement = { title: `${day.slice(5)} 冒險結算`, reward: result.record.rewards, rating: result.record.rating, defeated: result.record.defeated }
    }
    const [expenses, storedRecord] = await Promise.all([getExpensesByDate(user.uid, date), getDayRecord(user.uid, date)])
    const record = { ...storedRecord, budget: expenses.length || storedRecord?.noSpend ? (storedRecord?.budget ?? profile.dailyBudget ?? 1000) : (profile.dailyBudget ?? 1000) }
    const combat = combatState(date, record.budget, expenses, record)
    if (expenses.length && !record.backfilled) Object.assign(record, { entryCount: expenses.length, spent: combat.totalSpent, recordedOnTime: true })
    records = { ...records, [date]: record }
    const stats = adventureStats(records, date)
    profile = { ...profile, ...calcLevel(profile.exp), consecutiveDays: stats.streak, lastActiveDate: date }
    await updateProfile(user.uid, { equipped: profile.equipped, collection: profile.collection, consecutiveDays: stats.streak, lastActiveDate: date })
    await setDayRecord(user.uid, date, record)
    return { user, profile, date, expenses, dayRecord: record, dayRecords: records, ...combat, ...(settlement ? { rewardReveal: settlement } : {}) }
  }, [])

  useEffect(() => {
    let alive = true, generation = 0
    let choseLocal = localStorage.getItem('expense-quest:mode') === 'local'
    async function start(user) {
      const current = ++generation
      try {
        // Explicit local preview is development-only and cannot touch a cloud account.
        const localPreview = import.meta.env.DEV && new URLSearchParams(location.search).get('local') === '1'
        if (localPreview || !firebaseConfigured || choseLocal) user = LOCAL_USER
        else if (!user) {
          try { user = await deadline(loginAnonymously()) }
          catch {
            choseLocal = true
            localStorage.setItem('expense-quest:mode', 'local')
            user = LOCAL_USER
          }
        }
        const data = await deadline(loadGame(user), 20000)
        if (alive && current === generation) dispatch({ type: 'HYDRATE', data })
      } catch (error) {
        if (alive && current === generation) dispatch({ type: 'ERROR', error: error.message })
      }
    }
    const unsub = onAuth(start)
    return () => { alive = false; unsub() }
  }, [loadGame])

  const run = useCallback(async operation => {
    if (locked.current) return false
    locked.current = true
    dispatch({ type: 'BUSY', value: true })
    try {
      let current = latest.current
      if (current.date !== todayStr()) {
        const data = await loadGame(current.user)
        current = { ...current, ...data }
        latest.current = current
        dispatch({ type: 'HYDRATE', data })
      }
      await operation(current)
      return true
    } catch (error) { notify(error.message || '尚未完成儲存，請再試一次。'); return false }
    finally { locked.current = false; dispatch({ type: 'BUSY', value: false }) }
  }, [loadGame, notify])

  const refresh = useCallback(() => run(async current => {
    const data = await loadGame(current.user)
    latest.current = { ...current, ...data }
    dispatch({ type: 'HYDRATE', data })
  }), [loadGame, run])
  useEffect(() => {
    const check = () => { if (document.visibilityState === 'visible' && latest.current.user && latest.current.date !== todayStr()) refresh() }
    const timer = setInterval(check, 15000)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    const storageChanged = event => { if (event.key === 'expense-quest:local:v2' && latest.current.user?.isLocal) refresh() }
    window.addEventListener('storage', storageChanged)
    return () => { clearInterval(timer); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check); window.removeEventListener('storage', storageChanged) }
  }, [refresh])

  const writeToday = useCallback(async (current, expenses, patch = {}, change) => {
    let record = { ...current.dayRecord, ...patch, budget: current.dayRecord.budget ?? current.profile.dailyBudget, settled: false, defeated: false, entryCount: expenses.length, spent: Math.round(expenses.reduce((sum, e) => sum + Number(e.amount), 0) * 100) / 100, recordedOnTime: expenses.length > 0 || !!patch.noSpend }
    const combat = combatState(current.date, record.budget, expenses, record)
    record.defeated = combat.currentHp <= 0
    record = await commitExpenseChange(current.user.uid, current.date, change, record, current.dayRecord.revision ?? 0)
    const dayRecords = { ...current.dayRecords, [current.date]: record }
    const data = { expenses, dayRecord: record, dayRecords, ...combat, profile: { ...current.profile, consecutiveDays: adventureStats(dayRecords, current.date).streak } }
    latest.current = { ...current, ...data }
    dispatch({ type: 'HYDRATE', data })
    return combat
  }, [])

  const submitExpense = useCallback(data => run(async current => {
    const amount = parseAmount(data.amount)
    if (!amount || !data.category) throw new Error('請選擇分類，並輸入有效金額（最多兩位小數）。')
    const expense = { id: crypto.randomUUID(), createdAt: Date.now(), category: data.category, amount, note: (data.note ?? '').trim().slice(0, 80), date: current.date }
    const combat = await writeToday(current, [...current.expenses, expense], { noSpend: false, reviewedAt: null }, { type: 'add', expense })
    const damage = Math.max(0, current.currentHp - combat.currentHp)
    const id = crypto.randomUUID()
    // Damage numbers arrive with the existing charge / impact animation.
    later(() => dispatch({ type: 'ADD_DAMAGE_NUMBER', dn: { id, value: damage, crit: false, x: 48, y: 40 } }), 900)
    later(() => dispatch({ type: 'REMOVE_DAMAGE_NUMBER', id }), 2100)
    dispatch({ type: 'QUEUE_HOME_SUCCESS_EFFECT', id })
    playGameSound('save', current.profile.preferences)
    notify(combat.currentHp <= 0 ? '記帳已儲存，今日討伐完成。獎勵於跨日結算。' : '記帳已儲存，冒險手帳進度已更新。')
    if (current.profile.preferences?.hapticsEnabled !== false && !current.profile.preferences?.reduceMotion && !matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(25)
  }), [run, writeToday, later, notify])
  const updateExpenseEntry = useCallback((id, data) => run(async current => {
    const amount = parseAmount(data.amount)
    if (!amount || !data.category || !current.expenses.some(e => e.id === id)) throw new Error('紀錄或金額無效，請重新選擇。')
    const patch = { category: data.category, amount, note: data.note ?? '' }
    const expense = { ...current.expenses.find(e => e.id === id), ...patch }
    await writeToday(current, current.expenses.map(e => e.id === id ? expense : e), { reviewedAt: null }, { type: 'update', expense })
    notify('紀錄已修改，戰鬥進度已重新計算。')
  }), [run, writeToday, notify])
  const deleteExpenseEntry = useCallback(id => run(async current => {
    await writeToday(current, current.expenses.filter(e => e.id !== id), { reviewedAt: null, noSpend: false }, { type: 'delete', id })
    notify('紀錄已刪除。')
  }), [run, writeToday, notify])
  const recordAction = useCallback(action => run(async current => {
    if (action === 'noSpend' && current.expenses.length) throw new Error('今天已有消費紀錄，不適用零消費。')
    const patch = action === 'noSpend' ? { noSpend: true, recordedOnTime: true } : action === 'review' ? { reviewedAt: Date.now(), reviewedEntryCount: current.expenses.length } : { mapVisited: true }
    const result = await transactGame(current.user.uid, current.date, (profile, fresh) => {
      if (action !== 'map' && (fresh.revision ?? 0) !== (current.dayRecord.revision ?? 0)) throw new Error('帳本剛剛有更新，請重新整理後再確認。')
      if (action === 'noSpend' && fresh.entryCount > 0) throw new Error('今天已有消費紀錄，不適用零消費。')
      return { profile, record: { ...fresh, budget: fresh.budget ?? current.dayRecord.budget ?? profile.dailyBudget, ...patch } }
    })
    const record = result.record
    const data = { dayRecord: record, dayRecords: { ...current.dayRecords, [current.date]: record } }
    latest.current = { ...current, ...data }
    dispatch({ type: 'HYDRATE', data })
    if (action !== 'map') notify(action === 'noSpend' ? '已確認今天零消費；之後仍可補上真實消費。' : '帳本已確認，今日手帳進度已更新。')
  }), [run, notify])
  const claimMission = useCallback(key => run(async current => {
    const result = await transactGame(current.user.uid, current.date, (profile, record) => {
      const live = { ...current, profile, dayRecord: record, dayRecords: { ...current.dayRecords, [current.date]: record } }
      const sets = buildMissions(live)
      const mission = [...sets.daily, ...sets.weekly, ...sets.journey, ...sets.achievements, ...sets.activities, ...buildRouteMissions(live.dayRecords, live.date), sets.chest].find(m => m.key === key)
      if (!mission || mission.planned || mission.progress < mission.target || profile.claimedMissions?.[key]) throw new Error('這份獎勵已領取，或尚未完成條件。')
      return { profile: grantReward(profile, mission.reward, key), record, mission }
    })
    const profile = withStarterHomeEffects(result.profile)
    playGameSound('reward', profile.preferences)
    latest.current = { ...current, profile }
    dispatch({ type: 'UPDATE_PROFILE', data: profile })
    dispatch({ type: 'REVEAL', value: { title: result.mission.title, reward: result.mission.reward, part: result.mission.part, levelUp: profile.level > current.profile.level ? profile.level : null } })
  }), [run])
  const navigate = useCallback((screen, params) => {
    dispatch({ type: 'SET_SCREEN', screen, params })
    if (screen === 'map' && !params?.panel) recordAction('map')
  }, [recordAction])
  return <Ctx.Provider value={{ state, dispatch, submitExpense, updateExpenseEntry, deleteExpenseEntry, recordAction, claimMission, navigate, notify, refresh }}>{children}</Ctx.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() { return useContext(Ctx) }
