import { LOCAL_UID, createLocalRepository, withLocalLock, commitLocalGame, commitLocalExpense, checkLedgerRevision } from './localRepository.js'
export { LOCAL_USER } from './localRepository.js'
export { calcLevel } from './progression.js'
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, linkWithPopup, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, documentId, runTransaction } from 'firebase/firestore'

// 請複製 .env.example 為 .env 並填入你的 Firebase 設定
const runtimeEnv = import.meta.env ?? globalThis.process?.env ?? {}
const firebaseConfig = {
  apiKey:            runtimeEnv.VITE_FIREBASE_API_KEY,
  authDomain:        runtimeEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         runtimeEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     runtimeEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: runtimeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             runtimeEnv.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
const app = firebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
const local = () => createLocalRepository(localStorage)
const isLocal = uid => uid === LOCAL_UID

const googleProvider = new GoogleAuthProvider()

// ─── Auth ────────────────────────────────────────────────────────────────────

/** 匿名登入（首次開啟自動呼叫） */
export async function loginAnonymously() {
  const cred = await signInAnonymously(auth)
  await ensureProfile(cred.user.uid)
  return cred.user
}

/** Google 登入 / 綁定匿名帳號 */
export async function loginWithGoogle() {
  if (!auth) throw new Error('尚未設定雲端服務，本機存檔仍保留。')
  if (auth.currentUser?.isAnonymous) {
    const cred = await linkWithPopup(auth.currentUser, googleProvider)
    await ensureProfile(cred.user.uid)
    return cred.user
  } else {
    const cred = await signInWithPopup(auth, googleProvider)
    await ensureProfile(cred.user.uid)
    return cred.user
  }
}

export function onAuth(cb) {
  if (!auth) { queueMicrotask(() => cb(null)); return () => {} }
  return onAuthStateChanged(auth, cb)
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export const DEFAULT_PROFILE = {
  playerName: '新手勇者',
  level: 1,
  exp: 0,
  expToNext: 100,
  title: '菜鳥冒險者',
  stars:      { yellow: 0, purple: 0 },
  tickets:    { normal: 0, gold: 0 },
  dailyBudget: 1000,
  monthlyIncome: 0,
  fixedExpense: 0,
  savingGoal: 0,
  sharedFund: 0,
  guildLedger: [],
  customCategories: [],
  equipped: { set: 'academy_set', outfit: 'academy', accessory: 'star_pin', frame: 'soft_gold' },
  claimedMissions: {},
  guildChallengeClaims: {},
  preferences: { musicEnabled: false, soundEnabled: true, hapticsEnabled: true, dailyReminder: false, reduceMotion: false },
  avatarGender: 'girl',
  consecutiveDays: 0,
  lastActiveDate: null,
  collection: [],
  nameConfirmed: false,
  onboardingDone: false,
  createdAt: serverTimestamp(),
}

export async function ensureProfile(uid) {
  if (isLocal(uid)) return withLocalLock(() => local().mutate(data => { data.profile ??= { ...DEFAULT_PROFILE, createdAt: Date.now() } }))
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) await setDoc(ref, DEFAULT_PROFILE)
}

export async function getProfile(uid) {
  if (isLocal(uid)) return local().read().profile
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateProfile(uid, data) {
  if (isLocal(uid)) return withLocalLock(() => local().mutate(store => { store.profile = { ...store.profile, ...data } }))
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

/** 新增消費記錄 */
export async function addExpense(uid, { category, amount, note = '', date, backfilled = false }) {
  if (isLocal(uid)) return withLocalLock(() => local().mutate(data => {
    const expense = { id: crypto.randomUUID(), category, amount, note, date, backfilled, createdAt: Date.now() }
    data.expenses.push(expense)
    return { id: expense.id }
  }))
  const ref = collection(db, 'users', uid, 'expenses')
  return await addDoc(ref, { category, amount, note, date, backfilled, createdAt: serverTimestamp() })
}

export async function updateExpense(uid, expenseId, data) {
  if (isLocal(uid)) return withLocalLock(() => local().mutate(store => { store.expenses = store.expenses.map(e => e.id === expenseId ? { ...e, ...data } : e) }))
  await updateDoc(doc(db, 'users', uid, 'expenses', expenseId), data)
}

export async function deleteExpense(uid, expenseId) {
  if (isLocal(uid)) return withLocalLock(() => local().mutate(store => { store.expenses = store.expenses.filter(e => e.id !== expenseId) }))
  await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId))
}

/** 取得某日的消費列表 */
export async function getExpensesByDate(uid, date) {
  if (isLocal(uid)) return local().read().expenses.filter(e => e.date === date)
  const ref = collection(db, 'users', uid, 'expenses')
  const q = query(ref, where('date', '==', date))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const at = a.createdAt?.toMillis?.() ?? 0
      const bt = b.createdAt?.toMillis?.() ?? 0
      return at - bt
    })
}

/** 取得本月消費 */
export async function getMonthExpenses(uid, year, month) {
  if (isLocal(uid)) return local().read().expenses.filter(e => e.date.startsWith(`${year}-${String(month).padStart(2, '0')}-`))
  const ref = collection(db, 'users', uid, 'expenses')
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate   = `${year}-${String(month).padStart(2, '0')}-31`
  const q = query(ref, where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Daily Record ─────────────────────────────────────────────────────────────

export async function getDayRecord(uid, date) {
  if (isLocal(uid)) return local().read().days[date] ?? null
  const snap = await getDoc(doc(db, 'users', uid, 'days', date))
  return snap.exists() ? snap.data() : null
}

export async function setDayRecord(uid, date, data) {
  if (isLocal(uid)) return withLocalLock(() => local().mutate(store => { store.days[date] = { ...store.days[date], ...data } }))
  await setDoc(doc(db, 'users', uid, 'days', date), data, { merge: true })
}

export async function getMonthDayRecords(uid, year, month) {
  if (isLocal(uid)) return Object.entries(local().read().days).filter(([date]) => date.startsWith(`${year}-${String(month).padStart(2, '0')}-`)).map(([date, data]) => ({ ...data, date }))
  const ref = collection(db, 'users', uid, 'days')
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate   = `${year}-${String(month).padStart(2, '0')}-31`
  const q = query(ref, where(documentId(), '>=', startDate), where(documentId(), '<=', endDate))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ date: d.id, ...d.data() }))
}

// Profile, reward marker and daily record commit together; retries cannot duplicate a claim.
export async function transactGame(uid, date, transform) {
  if (isLocal(uid)) return withLocalLock(() => commitLocalGame(local(), date, transform))
  return runTransaction(db, async tx => {
    const profileRef = doc(db, 'users', uid)
    const dayRef = doc(db, 'users', uid, 'days', date)
    const profileSnap = await tx.get(profileRef)
    const daySnap = await tx.get(dayRef)
    const result = transform(profileSnap.data(), daySnap.data() ?? {})
    tx.set(profileRef, result.profile, { merge: true })
    tx.set(dayRef, result.record, { merge: true })
    return result
  })
}
export async function getAllDayRecords(uid) {
  if (isLocal(uid)) return local().read().days
  const snap = await getDocs(collection(db, 'users', uid, 'days'))
  return Object.fromEntries(snap.docs.map(d => [d.id, d.data()]))
}
export async function exportSave(uid) {
  if (isLocal(uid)) return local().read()
  const [profile, days, expensesSnap] = await Promise.all([
    getProfile(uid), getAllDayRecords(uid), getDocs(collection(db, 'users', uid, 'expenses')),
  ])
  return { version: 2, profile, days, expenses: expensesSnap.docs.map(d => ({ ...d.data(), id: d.id })) }
}

/** Atomically save the ledger entry and its day snapshot. Never report a
 * successful entry while the corresponding budget / quest state is missing. */
export async function commitExpenseChange(uid, date, change, record, expectedRevision = 0) {
  const nextRecord = { ...record, revision: expectedRevision + 1 }
  if (isLocal(uid)) return withLocalLock(() => commitLocalExpense(local(), date, change, record, expectedRevision))
  return runTransaction(db, async tx => {
    const dayRef = doc(db, 'users', uid, 'days', date)
    const snapshot = await tx.get(dayRef)
    checkLedgerRevision(snapshot.data(), expectedRevision)
    const expenseRef = doc(db, 'users', uid, 'expenses', change.expense?.id ?? change.id)
    if (change.type === 'delete') tx.delete(expenseRef)
    else tx.set(expenseRef, { ...change.expense, ...(change.type === 'add' ? { createdAt: serverTimestamp() } : {}) })
    tx.set(dayRef, nextRecord, { merge: true })
    return nextRecord
  })
}
