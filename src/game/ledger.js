import { parseAmount } from "../progression.js";
import { recordDay } from "./journey.js";
import { validDate } from "./date.js";
export { calendarDate, validDate, GAME_TIMEZONE } from "./date.js";
export const minor = (value) => Math.round(Number(value ?? 0) * 100);
export const entryKind = (entry) =>
  entry.kind ??
  (entry.type === "income"
    ? "income"
    : entry.type === "saving"
      ? "transfer"
      : "expense");
export function summarize(entries, previous = {}) {
  const active = entries.filter((entry) => !entry.deleted);
  const expenseMinor = active
    .filter((entry) => entryKind(entry) === "expense")
    .reduce(
      (sum, entry) => sum + (entry.amountMinor ?? minor(entry.amount)),
      0,
    );
  const incomeMinor = active
    .filter((entry) => entryKind(entry) === "income")
    .reduce(
      (sum, entry) => sum + (entry.amountMinor ?? minor(entry.amount)),
      0,
    );
  return {
    ...previous,
    expenseMinor,
    incomeMinor,
    spent: expenseMinor / 100,
    income: incomeMinor / 100,
    entryCount: active.length,
    expenseCount: active.filter((entry) => entryKind(entry) === "expense")
      .length,
    noSpend: expenseMinor > 0 ? false : !!previous.noSpend,
  };
}
export function validateEntry(input, today) {
  const amount = parseAmount(input.amount);
  if (!amount)
    throw new Error("請輸入大於 0 的金額，最多兩位小數；可以用 + 加總。");
  if (!validDate(input.date) || input.date > today)
    throw new Error("請選擇今天或之前的有效日期。");
  if (!["expense", "income", "transfer"].includes(input.kind ?? "expense"))
    throw new Error("請選擇正確的記錄類型。");
  if (!input.category?.trim()) throw new Error("請選擇或填寫分類。");
  return {
    ...input,
    kind: input.kind ?? "expense",
    amount,
    amountMinor: minor(amount),
    currency: "TWD",
    category: input.category.trim().slice(0, 24),
    note: (input.note ?? "").trim().slice(0, 160),
  };
}
// One transaction updates the source entry, both dates when moved, and the reward receipt.
export function applyLedgerCommand(profile, records, existing, command, today) {
  if (!command.id || !command.operationId)
    throw new Error("這筆操作缺少識別碼。");
  if (existing?.lastOperationId === command.operationId)
    return { profile, records, entry: existing, repeated: true };
  if (command.type === "add" && existing)
    throw new Error("這笔紀錄已存在，請重新整理。");
  if (command.type !== "add" && (!existing || existing.deleted))
    throw new Error("紀錄已刪除或不存在。");
  if (
    command.type !== "add" &&
    (existing.revision ?? 0) !== command.expectedRevision
  )
    throw new Error("這筆紀錄剛剛被修改，請重新整理後再編輯。");
  if (!["add", "update", "delete"].includes(command.type))
    throw new Error("無法辨識帳本操作。");
  let entry =
    command.type === "delete"
      ? { ...existing, deleted: true }
      : validateEntry({ ...existing, ...command.data, id: command.id }, today);
  entry = {
    ...entry,
    revision: (existing?.revision ?? 0) + 1,
    lastOperationId: command.operationId,
    createdAt: existing?.createdAt ?? command.at ?? Date.now(),
    updatedAt: command.at ?? Date.now(),
    backfilled: existing?.backfilled ?? entry.date < today,
  };
  const nextRecords = { ...records };
  for (const date of new Set([existing?.date, entry.date].filter(Boolean))) {
    const previous = nextRecords[date] ?? {};
    let expenseMinor = previous.expenseMinor ?? minor(previous.spent);
    let incomeMinor = previous.incomeMinor ?? minor(previous.income);
    let entryCount = previous.entryCount ?? 0;
    let expenseCount = previous.expenseCount ?? previous.entryCount ?? 0;
    for (const [row, direction] of [
      [existing, -1],
      [entry, 1],
    ]) {
      if (!row || row.deleted || row.date !== date) continue;
      entryCount += direction;
      if (entryKind(row) === "expense") {
        expenseMinor += direction * (row.amountMinor ?? minor(row.amount));
        expenseCount += direction;
      }
      if (entryKind(row) === "income")
        incomeMinor += direction * (row.amountMinor ?? minor(row.amount));
    }
    if (expenseMinor < 0 || incomeMinor < 0 || entryCount < 0)
      throw new Error("帳本摘要需要重新整理，這次變更尚未存檔。");
    const noSpend = expenseCount ? false : !!previous.noSpend;
    nextRecords[date] = {
      ...previous,
      budget: previous.budget ?? profile.dailyBudget ?? 1000,
      expenseMinor,
      incomeMinor,
      spent: expenseMinor / 100,
      income: incomeMinor / 100,
      entryCount,
      expenseCount,
      noSpend,
      revision: (previous.revision ?? 0) + 1,
      reviewedAt: null,
      schemaVersion: 3,
      settled: true,
      recordedOnTime:
        date === today ? entryCount > 0 || noSpend : !!previous.recordedOnTime,
      backfilled: date !== today && !previous.recordedOnTime,
    };
  }
  return {
    profile: recordDay(profile, nextRecords[today] ?? {}, today, today),
    records: nextRecords,
    entry,
  };
}
export function legacyGuildEntries(profile, today) {
  return (profile.guildLedger ?? [])
    .map((row, index) => ({
      id: `guild-${row.id ?? index}`,
      date: validDate(row.date) ? row.date : today,
      amount: Number(row.amount) || 0,
      amountMinor: minor(row.amount),
      kind:
        row.type === "income"
          ? "income"
          : row.type === "saving"
            ? "transfer"
            : "expense",
      category:
        row.type === "income"
          ? "其他收入"
          : row.type === "saving"
            ? "儲蓄移轉"
            : "固定支出",
      note: row.note ?? "",
      source: "legacy-guild",
      createdAt: row.createdAt ?? Date.now(),
      revision: 0,
      backfilled: true,
    }))
    .filter((entry) => entry.amount > 0);
}
