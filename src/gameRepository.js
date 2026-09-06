import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  runTransaction,
  onSnapshot,
} from "firebase/firestore";
import { db, DEFAULT_PROFILE, ensureProfile } from "./firebase.js";
import {
  LOCAL_UID,
  LOCAL_KEY,
  createLocalRepository,
  withLocalLock,
} from "./localRepository.js";
import {
  applyLedgerCommand,
  calendarDate,
  legacyGuildEntries,
  summarize,
} from "./game/ledger.js";
import { initializeJourney, recordDay, reviewDay } from "./game/journey.js";
const repository = () => createLocalRepository(localStorage);
const local = (uid) => uid === LOCAL_UID;
const userRef = (uid) => doc(db, "users", uid);
const dayRef = (uid, date) => doc(db, "users", uid, "days", date);
const entryRef = (uid, id) => doc(db, "users", uid, "expenses", id);
export async function gameSnapshot(uid) {
  if (local(uid)) return repository().read();
  const [profile, records, entries] = await Promise.all([
    getDoc(userRef(uid)),
    getDocs(collection(db, "users", uid, "days")),
    getDocs(collection(db, "users", uid, "expenses")),
  ]);
  return {
    version: 2,
    origin: uid,
    profile: profile.data(),
    days: Object.fromEntries(records.docs.map((d) => [d.id, d.data()])),
    expenses: entries.docs.map((d) => ({ ...d.data(), id: d.id })),
  };
}
export async function migrateGame(uid, today = calendarDate()) {
  await ensureProfile(uid);
  if (local(uid))
    return withLocalLock(() =>
      repository().mutate((data) => {
        if (data.profile.schemaVersion >= 3) {
          data.profile.saveId ??= crypto.randomUUID();
          return;
        }
        // Keep the complete original save once, before changing any structure.
        const backupKey = `${LOCAL_KEY}:before-v3`;
        if (!localStorage.getItem(backupKey))
          localStorage.setItem(backupKey, JSON.stringify(data));
        for (const row of legacyGuildEntries(data.profile, today))
          if (!data.expenses.some((entry) => entry.id === row.id))
            data.expenses.push(row);
        for (const date of new Set(data.expenses.map((entry) => entry.date)))
          data.days[date] = summarize(
            data.expenses.filter((entry) => entry.date === date),
            data.days[date],
          );
        data.profile = initializeJourney(data.profile, data.days, today);
        data.profile = recordDay(
          data.profile,
          data.days[today] ?? {},
          today,
          today,
        );
      }),
    );
  const initial = await getDoc(userRef(uid));
  if (initial.data()?.schemaVersion >= 3) {
    if (!initial.data().saveId)
      await gameTransaction(uid, (profile, record) => ({
        profile: { ...profile, saveId: profile.saveId ?? crypto.randomUUID() },
        record,
      }));
    return;
  }
  // The legacy guild is at most 80 rows; its migration fits a single Firestore transaction.
  const existing = await gameSnapshot(uid);
  const guild = legacyGuildEntries(existing.profile, today);
  const dates = [...new Set(guild.map((row) => row.date).concat(today))];
  await runTransaction(db, async (tx) => {
    const current = await tx.get(userRef(uid));
    if (current.data()?.schemaVersion >= 3) return;
    if (
      JSON.stringify(current.data()?.guildLedger ?? []) !==
      JSON.stringify(existing.profile.guildLedger ?? [])
    )
      throw new Error("舊帳本剛更新，請重新整理以完成升級。");
    const days = await Promise.all(
      dates.map((date) => tx.get(dayRef(uid, date))),
    );
    const entries = await Promise.all(
      guild.map((row) => tx.get(entryRef(uid, row.id))),
    );
    const records = { ...existing.days };
    dates.forEach((date, index) => {
      const fresh = days[index].data() ?? {};
      if ((fresh.revision ?? 0) !== (existing.days[date]?.revision ?? 0))
        throw new Error("帳本剛更新，請重新整理以完成升級。");
      records[date] = summarize(
        [
          ...existing.expenses.filter((row) => row.date === date),
          ...guild.filter(
            (row, i) => row.date === date && !entries[i].exists(),
          ),
        ],
        fresh,
      );
    });
    let profile = initializeJourney(
      { ...DEFAULT_PROFILE, ...current.data() },
      records,
      today,
    );
    profile = recordDay(profile, records[today] ?? {}, today, today);
    tx.set(doc(db, "users", uid, "backups", "before-v3"), {
      profile: current.data(),
      createdAt: Date.now(),
      note: "原始帳目仍保留於 expenses；公會流水保存在此 profile。",
    });
    guild.forEach((row, i) => {
      if (!entries[i].exists()) tx.set(entryRef(uid, row.id), row);
    });
    dates.forEach((date) =>
      tx.set(dayRef(uid, date), records[date], { merge: true }),
    );
    tx.set(userRef(uid), profile);
  });
}
export async function readGame(uid, date = calendarDate()) {
  if (local(uid)) {
    const data = repository().read();
    return {
      profile: data.profile,
      dayRecord: data.days[date] ?? {},
      expenses: data.expenses.filter(
        (row) => !row.deleted && row.date === date,
      ),
      dayRecords: data.days,
    };
  }
  const [profile, day, expenses] = await Promise.all([
    getDoc(userRef(uid)),
    getDoc(dayRef(uid, date)),
    getDocs(
      query(
        collection(db, "users", uid, "expenses"),
        where("date", "==", date),
      ),
    ),
  ]);
  return {
    profile: profile.data(),
    dayRecord: day.data() ?? {},
    expenses: expenses.docs
      .map((d) => ({ ...d.data(), id: d.id }))
      .filter((row) => !row.deleted),
    dayRecords: {},
  };
}
export async function readMonth(uid, month) {
  if (local(uid))
    return repository()
      .read()
      .expenses.filter((row) => !row.deleted && row.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date));
  const snapshots = await getDocs(
    query(
      collection(db, "users", uid, "expenses"),
      where("date", ">=", `${month}-01`),
      where("date", "<=", `${month}-31`),
      orderBy("date", "desc"),
    ),
  );
  return snapshots.docs
    .map((d) => ({ ...d.data(), id: d.id }))
    .filter((row) => !row.deleted);
}
export async function commitLedger(uid, command, today = calendarDate()) {
  if (local(uid))
    return withLocalLock(() =>
      repository().mutate((data) => {
        const existing = data.expenses.find((row) => row.id === command.id);
        const result = applyLedgerCommand(
          data.profile,
          data.days,
          existing,
          command,
          today,
        );
        data.profile = result.profile;
        data.days = result.records;
        data.expenses = existing
          ? data.expenses.map((row) =>
              row.id === command.id ? result.entry : row,
            )
          : [...data.expenses, result.entry];
        return result;
      }),
    );
  const previousEntry = await getDoc(entryRef(uid, command.id));
  for (const date of new Set(
    [previousEntry.data()?.date, command.data?.date, today].filter(Boolean),
  ))
    await reconcileLegacyDay(uid, date);
  return runTransaction(db, async (tx) => {
    const [profile, entry] = await Promise.all([
      tx.get(userRef(uid)),
      tx.get(entryRef(uid, command.id)),
    ]);
    const dates = [
      ...new Set(
        [entry.data()?.date, command.data?.date, today].filter(Boolean),
      ),
    ];
    const snapshots = await Promise.all(
      dates.map((date) => tx.get(dayRef(uid, date))),
    );
    const records = Object.fromEntries(
      dates.map((date, index) => [date, snapshots[index].data() ?? {}]),
    );
    if (
      command.type !== "add" &&
      entry.data()?.date !== previousEntry.data()?.date
    )
      throw new Error("這筆紀錄剛剛被修改，請重新整理後再編輯。");
    const result = applyLedgerCommand(
      profile.data(),
      records,
      entry.exists() ? { ...entry.data(), id: command.id } : null,
      command,
      today,
    );
    tx.set(userRef(uid), result.profile);
    tx.set(entryRef(uid, command.id), result.entry);
    dates.forEach((date) => {
      if (result.records[date])
        tx.set(dayRef(uid, date), result.records[date], { merge: true });
    });
    return result;
  });
}

// Older releases did not always maintain day counters. Rebuild those days from
// their source rows once before applying deltas; a concurrent v3 writer wins.
async function reconcileLegacyDay(uid, date) {
  const previous = await getDoc(dayRef(uid, date));
  if (previous.data()?.schemaVersion >= 3) return;
  const rows = await getDocs(
    query(collection(db, "users", uid, "expenses"), where("date", "==", date)),
  );
  await runTransaction(db, async (tx) => {
    const current = await tx.get(dayRef(uid, date));
    if (current.data()?.schemaVersion >= 3) return;
    if ((current.data()?.revision ?? 0) !== (previous.data()?.revision ?? 0))
      throw new Error("帳本剛更新，請重新整理後再試。");
    tx.set(dayRef(uid, date), {
      ...summarize(
        rows.docs.map((row) => row.data()),
        current.data(),
      ),
      revision: (current.data()?.revision ?? 0) + 1,
      schemaVersion: 3,
      reviewedAt: null,
    });
  });
}
export async function gameTransaction(uid, transform, date = calendarDate()) {
  if (local(uid))
    return withLocalLock(() =>
      repository().mutate((data) => {
        const result = transform(data.profile, data.days[date] ?? {});
        data.profile = result.profile;
        data.days[date] = result.record;
        return result;
      }),
    );
  return runTransaction(db, async (tx) => {
    const [profile, record] = await Promise.all([
      tx.get(userRef(uid)),
      tx.get(dayRef(uid, date)),
    ]);
    const result = transform(profile.data(), record.data() ?? {});
    tx.set(userRef(uid), result.profile);
    tx.set(dayRef(uid, date), result.record, { merge: true });
    return result;
  });
}
export async function confirmDay(
  uid,
  action,
  expectedRevision,
  date = calendarDate(),
) {
  return gameTransaction(
    uid,
    (profile, record) => {
      if (action === "review")
        return reviewDay(profile, record, date, expectedRevision);
      if ((record.revision ?? 0) !== expectedRevision)
        throw new Error("帳本有更新，請先重新確認。");
      if ((record.expenseCount ?? record.entryCount ?? 0) > 0)
        throw new Error("今天已有支出，不能確認零消費。");
      const next = {
        ...record,
        noSpend: true,
        recordedOnTime: true,
        settled: true,
        budget: record.budget ?? profile.dailyBudget,
        revision: (record.revision ?? 0) + 1,
      };
      return { profile: recordDay(profile, next, date, date), record: next };
    },
    date,
  );
}
export function watchGame(uid, changed, failed) {
  if (local(uid)) {
    const listener = (event) => {
      if (event.key === LOCAL_KEY) changed();
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }
  let initial = true;
  return onSnapshot(
    userRef(uid),
    () => {
      if (initial) {
        initial = false;
        return;
      }
      changed();
    },
    failed,
  );
}

// Import only missing IDs. Each chunk and its affected day totals commit together;
// an interrupted import can be resumed without duplicating transactions.
export async function importGame(uid, backup, onProgress = () => {}) {
  const { mergeProfiles } = await import("./game/backup.js");
  const before = await gameSnapshot(uid);
  const sameSource =
    backup.origin === uid ||
    (backup.profile.saveId && backup.profile.saveId === before.profile.saveId);
  const incoming = backup.expenses.map((row) => ({
    ...row,
    id: sameSource ? row.id : `${backup.sourceKey}-${row.id}`,
    backfilled: true,
  }));
  if (local(uid))
    return withLocalLock(() =>
      repository().mutate((data) => {
        const restoreKey = `${LOCAL_KEY}:before-import`;
        localStorage.setItem(restoreKey, JSON.stringify(data));
        const ids = new Set(data.expenses.map((row) => row.id));
        const added = incoming.filter((row) => !ids.has(row.id));
        data.expenses.push(...added);
        for (const date of new Set(added.map((row) => row.date)))
          data.days[date] = {
            ...summarize(
              data.expenses.filter((row) => row.date === date),
              data.days[date],
            ),
            revision: (data.days[date]?.revision ?? 0) + 1,
            schemaVersion: 3,
            reviewedAt: null,
          };
        data.profile = mergeProfiles(data.profile, backup);
        onProgress(incoming.length, incoming.length);
      }),
    );
  await runTransaction(db, async (tx) => {
    const current = await tx.get(userRef(uid));
    tx.set(doc(db, "users", uid, "backups", `import-${backup.sourceKey}`), {
      profile: current.data(),
      createdAt: Date.now(),
    });
  });
  for (let offset = 0; offset < incoming.length; offset += 80) {
    const batch = incoming.slice(offset, offset + 80);
    for (const date of new Set(batch.map((row) => row.date)))
      await reconcileLegacyDay(uid, date);
    await runTransaction(db, async (tx) => {
      const snapshots = await Promise.all(
        batch.map((row) => tx.get(entryRef(uid, row.id))),
      );
      const missing = batch.filter((_, index) => !snapshots[index].exists());
      const dates = [...new Set(missing.map((row) => row.date))];
      const daySnapshots = await Promise.all(
        dates.map((date) => tx.get(dayRef(uid, date))),
      );
      dates.forEach((date, index) => {
        const previous = daySnapshots[index].data() ?? {};
        const delta = summarize(missing.filter((row) => row.date === date));
        tx.set(
          dayRef(uid, date),
          {
            ...previous,
            expenseMinor:
              (previous.expenseMinor ??
                Math.round((previous.spent ?? 0) * 100)) + delta.expenseMinor,
            incomeMinor:
              (previous.incomeMinor ??
                Math.round((previous.income ?? 0) * 100)) + delta.incomeMinor,
            spent: (previous.spent ?? 0) + delta.spent,
            income: (previous.income ?? 0) + delta.income,
            entryCount: (previous.entryCount ?? 0) + delta.entryCount,
            expenseCount:
              (previous.expenseCount ?? previous.entryCount ?? 0) +
              delta.expenseCount,
            revision: (previous.revision ?? 0) + 1,
            schemaVersion: 3,
            noSpend: delta.expenseCount ? false : !!previous.noSpend,
            reviewedAt: null,
          },
          { merge: true },
        );
      });
      missing.forEach((row) => tx.set(entryRef(uid, row.id), row));
    });
    onProgress(Math.min(incoming.length, offset + 80), incoming.length);
  }
  await gameTransaction(uid, (profile, record) => ({
    profile: mergeProfiles(profile, backup),
    record,
  }));
}
