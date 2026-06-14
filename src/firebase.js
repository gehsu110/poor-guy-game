import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, linkWithPopup, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore'

// ⚠️ 請複製 .env.example 為 .env 並填入你的 Firebase 設定
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

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
  return onAuthStateChanged(auth, cb)
}

// ─── Profile ─────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  level: 1,
  exp: 0,
  expToNext: 100,
  title: '菜鳥冒險者',
  stars:      { yellow: 0, purple: 0 },
  tickets:    { normal: 0, gold: 0 },
  dailyBudget: 1000,
  avatarGender: 'girl',
  consecutiveDays: 0,
  lastActiveDate: null,
  collection: [],
  createdAt: serverTimestamp(),
}

export async function ensureProfile(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) await setDoc(ref, DEFAULT_PROFILE)
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

/** 新增消費記錄 */
export async function addExpense(uid, { category, amount, note, date }) {
  const ref = collection(db, 'users', uid, 'expenses')
  return await addDoc(ref, { category, amount, note, date, createdAt: serverTimestamp() })
}

/** 取得某日的消費列表 */
export async function getExpensesByDate(uid, date) {
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
  const ref = collection(db, 'users', uid, 'expenses')
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate   = `${year}-${String(month).padStart(2, '0')}-31`
  const q = query(ref, where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Daily Record ─────────────────────────────────────────────────────────────

export async function getDayRecord(uid, date) {
  const snap = await getDoc(doc(db, 'users', uid, 'days', date))
  return snap.exists() ? snap.data() : null
}

export async function setDayRecord(uid, date, data) {
  await setDoc(doc(db, 'users', uid, 'days', date), data, { merge: true })
}

// ─── EXP & Level ─────────────────────────────────────────────────────────────

const EXP_TABLE = [0,100,220,370,550,770,1040,1360,1730,2160,2650,3200,3820,4510,5280,6130,7070,8110,9260,10530,12000]

export function calcLevel(totalExp) {
  for (let i = EXP_TABLE.length - 1; i >= 0; i--) {
    if (totalExp >= EXP_TABLE[i]) {
      const lv = i + 1
      const expToNext = lv < EXP_TABLE.length ? EXP_TABLE[i + 1] - EXP_TABLE[i] : 99999
      const expInLevel = totalExp - EXP_TABLE[i]
      return { level: Math.min(lv, 50), expInLevel, expToNext }
    }
  }
  return { level: 1, expInLevel: 0, expToNext: 100 }
}
