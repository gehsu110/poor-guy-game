export const LOCAL_UID = 'local-device'
export const LOCAL_KEY = 'expense-quest:local:v2'
export const LOCAL_USER = Object.freeze({ uid: LOCAL_UID, isAnonymous: true, isLocal: true })

export function createLocalRepository(storage) {
  function read() {
    const raw = storage.getItem(LOCAL_KEY)
    if (!raw) return { version: 2, profile: null, expenses: [], days: {} }
    try {
      const value = JSON.parse(raw)
      if (value.version !== 2 || !Array.isArray(value.expenses) || !value.days || typeof value.days !== 'object') throw new Error()
      return value
    } catch { throw new Error('本機存檔無法讀取。請先匯出原始存檔，勿清除瀏覽器資料。') }
  }
  function mutate(fn) {
    const data = read()
    const result = fn(data)
    try { storage.setItem(LOCAL_KEY, JSON.stringify(data)) }
    catch { throw new Error('儲存空間不足或無法寫入。這次操作尚未儲存，請匯出備份後再試。') }
    return result
  }
  return { read, mutate }
}
export function commitLocalGame(repository, date, transform) {
  return repository.mutate(data => {
    const result = transform(data.profile, data.days[date] ?? {})
    data.profile = result.profile
    data.days[date] = result.record
    return result
  })
}
export function checkLedgerRevision(current, expectedRevision) {
  if ((current?.revision ?? 0) !== expectedRevision) throw new Error('帳本剛剛有更新，請重新整理後再送出。')
}
export function commitLocalExpense(repository, date, change, record, expectedRevision = 0) {
  return repository.mutate(data => {
    checkLedgerRevision(data.days[date], expectedRevision)
    if (change.type === 'add') {
      if (data.expenses.some(e => e.id === change.expense.id)) throw new Error('這筆紀錄已儲存，請重新整理帳本。')
      data.expenses.push(change.expense)
    } else if (change.type === 'update') data.expenses = data.expenses.map(e => e.id === change.expense.id ? change.expense : e)
    else if (change.type === 'delete') data.expenses = data.expenses.filter(e => e.id !== change.id)
    else throw new Error('無法辨識這次帳本操作。')
    data.days[date] = { ...record, revision: expectedRevision + 1 }
    return data.days[date]
  })
}
export async function withLocalLock(callback) {
  if (globalThis.navigator?.locks) return navigator.locks.request('expense-quest-local-write', callback)
  return callback()
}
