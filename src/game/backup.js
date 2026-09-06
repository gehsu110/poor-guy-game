import { validateEntry, entryKind, legacyGuildEntries } from "./ledger.js";
import { calcLevel } from "../progression.js";
import { initializeJourney } from "./journey.js";
export function validateBackup(raw, today) {
  if (
    !raw ||
    raw.version !== 2 ||
    !Array.isArray(raw.expenses) ||
    !raw.profile ||
    typeof raw.profile !== "object" ||
    Array.isArray(raw.profile)
  )
    throw new Error("這不是可讀取的窮鬼勇者備份。");
  if (raw.expenses.length > 20000)
    throw new Error("此備份超過 20,000 筆，請先分批整理。");
  const ids = new Set();
  const expenses = raw.expenses.map((row) => {
    if (!row.id || !/^[\w-]{1,160}$/.test(row.id) || ids.has(row.id))
      throw new Error("備份有重複或無效的記錄識別碼。");
    ids.add(row.id);
    return {
      ...validateEntry({ ...row, kind: entryKind(row) }, today),
      revision: Number.isSafeInteger(row.revision) ? row.revision : 0,
    };
  });
  for (const row of legacyGuildEntries(raw.profile, today)) {
    if (!ids.has(row.id)) {
      expenses.push(validateEntry(row, today));
      ids.add(row.id);
    }
  }
  const profile = initializeJourney(raw.profile, raw.days ?? {}, today);
  if (
    !Array.isArray(profile.collection) ||
    profile.collection.some((item) => !item || typeof item.id !== "string") ||
    !Array.isArray(profile.journey?.recordedDates) ||
    !Array.isArray(profile.journey?.pendingDates) ||
    !Array.isArray(profile.journey?.usedDates) ||
    !Array.isArray(profile.journey?.stamps) ||
    !Number.isInteger(profile.journey?.completed) ||
    profile.journey.completed < 0 ||
    profile.journey.completed > 15
  )
    throw new Error("備份的收藏或旅程格式不完整。");
  for (const amount of [
    profile.exp ?? 0,
    ...Object.values(profile.stars ?? {}),
    ...Object.values(profile.tickets ?? {}),
  ])
    if (!Number.isFinite(amount) || amount < 0 || amount > 1000000000)
      throw new Error("備份的進度數值無效。");
  const origin = String(
    raw.origin ??
      raw.profile.saveId ??
      raw.profile.createdAt ??
      "legacy-backup",
  );
  let hash = 2166136261;
  for (const char of origin)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return {
    ...raw,
    profile,
    expenses,
    origin,
    sourceKey: `source-${(hash >>> 0).toString(16)}`,
  };
}
export function mergeProfiles(current, backup) {
  const source = backup.profile;
  const firstImport =
    !current.importReceipts?.[backup.sourceKey] &&
    source.saveId !== current.saveId;
  const byId = new Map(
    [...(source.collection ?? []), ...(current.collection ?? [])].map(
      (item) => [item.id, item],
    ),
  );
  const journey = current.journey;
  const usedDates = [
    ...new Set([...journey.usedDates, ...source.journey.usedDates]),
  ];
  const pendingDates = [
    ...new Set([...journey.pendingDates, ...source.journey.pendingDates]),
  ]
    .filter((date) => !usedDates.includes(date))
    .sort()
    .slice(-3);
  const progressed =
    source.journey.completed > journey.completed ? source.journey : journey;
  return {
    ...current,
    ...(current.nameConfirmed
      ? {}
      : {
          playerName: source.playerName,
          dailyBudget: source.dailyBudget,
          nameConfirmed: !!source.nameConfirmed,
        }),
    collection: [...byId.values()],
    stars: Object.fromEntries(
      ["yellow", "purple"].map((key) => [
        key,
        firstImport
          ? Math.max(current.stars[key] ?? 0, source.stars?.[key] ?? 0)
          : (current.stars[key] ?? 0),
      ]),
    ),
    tickets: Object.fromEntries(
      ["normal", "gold"].map((key) => [
        key,
        firstImport
          ? Math.max(current.tickets[key] ?? 0, source.tickets?.[key] ?? 0)
          : (current.tickets[key] ?? 0),
      ]),
    ),
    exp: Math.max(current.exp ?? 0, source.exp ?? 0),
    ...calcLevel(Math.max(current.exp ?? 0, source.exp ?? 0)),
    claimedMissions: { ...source.claimedMissions, ...current.claimedMissions },
    journey: {
      ...progressed,
      active:
        source.journey.completed > journey.completed ? null : journey.active,
      usedDates,
      pendingDates,
      recordedDates: [
        ...new Set([...journey.recordedDates, ...source.journey.recordedDates]),
      ].sort(),
      stamps: [
        ...new Map(
          [...source.journey.stamps, ...journey.stamps].map((stamp) => [
            stamp.node,
            stamp,
          ]),
        ).values(),
      ],
    },
    importReceipts: {
      ...current.importReceipts,
      [backup.sourceKey]: { at: Date.now(), count: backup.expenses.length },
    },
  };
}
