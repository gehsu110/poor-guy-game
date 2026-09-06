import test from "node:test";
import assert from "node:assert/strict";
import {
  initializeJourney,
  recordDay,
  reviewDay,
  startJourney,
  advanceJourney,
  currentNode,
} from "../src/game/journey.js";
import {
  applyLedgerCommand,
  summarize,
  calendarDate,
  legacyGuildEntries,
} from "../src/game/ledger.js";
import {
  ITEMS,
  DEFAULT_LOOK,
  equipLook,
  owns,
  purchase,
} from "../src/game/catalog.js";
import { validateBackup, mergeProfiles } from "../src/game/backup.js";
const date = "2026-09-06";
const fresh = () =>
  initializeJourney(
    {
      dailyBudget: 500,
      exp: 0,
      stars: { yellow: 0, purple: 0 },
      tickets: { normal: 2, gold: 1 },
      collection: [],
      equipped: {},
      claimedMissions: {},
    },
    {},
    date,
  );
const add = (id, amount = 80, day = date, kind = "expense") => ({
  id,
  operationId: `op-${id}`,
  type: "add",
  data: { date: day, amount: String(amount), category: "餐飲", kind, note: "" },
});
test("one record earns a bounded daily reward independent of expense amount or splitting", () => {
  for (const amounts of [[1], [50000], [10, 20, 30]]) {
    let profile = fresh(),
      records = {};
    amounts.forEach((amount, i) => {
      const result = applyLedgerCommand(
        profile,
        records,
        null,
        add(`row-${i}`, amount),
        date,
      );
      profile = result.profile;
      records = result.records;
    });
    assert.equal(profile.stars.yellow, 2);
    assert.equal(profile.journey.pendingDates.length, 1);
  }
});
test("ledger retry has no duplicate entry delta, currency or adventure token", () => {
  const command = add("receipt");
  const saved = applyLedgerCommand(fresh(), {}, null, command, date);
  const retry = applyLedgerCommand(
    saved.profile,
    saved.records,
    saved.entry,
    command,
    date,
  );
  assert.equal(retry.records[date].spent, 80);
  assert.equal(retry.profile.stars.yellow, 2);
  assert.equal(retry.repeated, true);
});
test("moving an entry updates both dates and rejects another editor with stale revision", () => {
  const saved = applyLedgerCommand(fresh(), {}, null, add("edit"), date);
  const command = {
    id: "edit",
    operationId: "move",
    type: "update",
    expectedRevision: 1,
    data: { date: "2026-09-05", amount: 120, category: "餐飲" },
  };
  const moved = applyLedgerCommand(
    saved.profile,
    saved.records,
    saved.entry,
    command,
    date,
  );
  assert.equal(moved.records[date].spent, 0);
  assert.equal(moved.records["2026-09-05"].spent, 120);
  assert.equal(moved.profile.journey.pendingDates.length, 1);
  assert.throws(
    () =>
      applyLedgerCommand(
        moved.profile,
        moved.records,
        moved.entry,
        { ...command, operationId: "stale" },
        date,
      ),
    /剛剛被修改/,
  );
});
test("deletion preserves an earned journey but cannot farm another reward", () => {
  const saved = applyLedgerCommand(fresh(), {}, null, add("erase"), date);
  const removed = applyLedgerCommand(
    saved.profile,
    saved.records,
    saved.entry,
    { type: "delete", id: "erase", operationId: "delete", expectedRevision: 1 },
    date,
  );
  assert.equal(removed.records[date].spent, 0);
  assert.equal(removed.entry.deleted, true);
  const added = applyLedgerCommand(
    removed.profile,
    removed.records,
    null,
    add("next", 99),
    date,
  );
  assert.equal(added.profile.stars.yellow, 2);
  assert.equal(added.profile.journey.pendingDates.length, 1);
});
test("historical backfill has accurate totals with no retroactive daily rewards", () => {
  const result = applyLedgerCommand(
    fresh(),
    {},
    null,
    add("past", 87.35, "2026-08-31"),
    date,
  );
  assert.equal(result.records["2026-08-31"].expenseMinor, 8735);
  assert.equal(result.profile.stars.yellow, 0);
  assert.equal(result.profile.journey.pendingDates.length, 0);
});
test("income and transfer are distinct from spending in day totals", () => {
  let profile = fresh(),
    records = {};
  for (const command of [
    add("out", 80),
    add("income", 5000, date, "income"),
    add("transfer", 200, date, "transfer"),
  ]) {
    const result = applyLedgerCommand(profile, records, null, command, date);
    profile = result.profile;
    records = result.records;
  }
  assert.equal(records[date].spent, 80);
  assert.equal(records[date].income, 5000);
  assert.equal(records[date].expenseCount, 1);
  assert.equal(records[date].entryCount, 3);
});
test("review uses the latest ledger revision and pays only once", () => {
  const saved = applyLedgerCommand(fresh(), {}, null, add("review"), date);
  assert.throws(
    () => reviewDay(saved.profile, saved.records[date], date, 0),
    /新的變更/,
  );
  const reviewed = reviewDay(saved.profile, saved.records[date], date, 1);
  const twice = reviewDay(reviewed.profile, reviewed.record, date, 1);
  assert.equal(twice.profile.stars.yellow, 3);
});
test("zero spending grants the same day opportunity without manufacturing a purchase", () => {
  const profile = recordDay(fresh(), { noSpend: true }, date, date);
  assert.equal(profile.stars.yellow, 2);
  assert.deepEqual(profile.journey.pendingDates, [date]);
});
test("adventure is persistent, turn checked, amount independent and unlocks an equippable top", () => {
  let profile = recordDay(fresh(), { entryCount: 1 }, date, date);
  profile = startJourney(profile, "library", "journey-a");
  assert.equal(
    startJourney(profile, "forest", "duplicate").journey.active.id,
    "journey-a",
  );
  profile = advanceJourney(profile, "journey-a", 0, "cast");
  assert.equal(profile.journey.active.hp, 60);
  assert.throws(() => advanceJourney(profile, "journey-a", 0, "cast"), /更新/);
  profile = advanceJourney(profile, "journey-a", 1, "quick");
  assert.equal(profile.journey.completed, 1);
  assert.equal(owns(profile, "top_courier"), true);
  assert.equal(profile.journey.pendingDates.length, 0);
  assert.equal(
    equipLook(profile, { ...DEFAULT_LOOK, top: "top_courier" }).equipped.layered
      .top,
    "top_courier",
  );
  assert.throws(() => advanceJourney(profile, "journey-a", 2, "cast"), /結束/);
});
test("prototype wardrobe data preserves 16 independent combinations and optional removal", () => {
  const profile = { ...fresh(), collection: [{ id: "top_courier" }] };
  const seen = new Set();
  for (const hair of ["hair_chestnut", "hair_braid"])
    for (const top of ["top_mint", "top_courier"])
      for (const bottom of ["bottom_shorts", "bottom_skirt"])
        for (const hat of ["hat_beret", "hat_ribbon"]) {
          const look = equipLook(profile, {
            ...DEFAULT_LOOK,
            hair,
            top,
            bottom,
            hat,
          }).equipped.layered;
          seen.add(JSON.stringify(look));
          assert.equal(look.hair, hair);
          assert.equal(look.top, top);
          assert.equal(look.bottom, bottom);
          assert.equal(look.hat, hat);
        }
  assert.equal(seen.size, 16);
  assert.equal(
    equipLook(profile, { ...DEFAULT_LOOK, hat: null }).equipped.layered.hat,
    null,
  );
  assert.throws(
    () => equipLook(profile, { ...DEFAULT_LOOK, top: "top_starlight" }),
    /尚未取得/,
  );
});
test("purchase validates live ownership and cannot deduct twice or go negative", () => {
  const profile = { ...fresh(), stars: { yellow: 20, purple: 0 } };
  const once = purchase(profile, "top_starlight", "buy");
  assert.equal(once.stars.yellow, 8);
  assert.equal(purchase(once, "top_starlight", "buy-again").stars.yellow, 8);
  assert.throws(() => purchase(once, "friend_cat", "insufficient"), /還不夠/);
  assert.throws(() => purchase(profile, "hat_leaf", "not-ready"), /尚未開放/);
  const legacy = { ...profile, collection: [{ id: "storybook_star_uniform" }] };
  assert.equal(purchase(legacy, "top_starlight", "legacy").stars.yellow, 20);
});
test("15 nodes survive month boundaries and missed days without resetting the route", () => {
  let profile = fresh();
  for (let i = 0; i < 15; i++) {
    const day = new Date(Date.UTC(2026, 8, 25 + i * 2))
      .toISOString()
      .slice(0, 10);
    profile = recordDay(profile, { entryCount: 1 }, day, day);
    profile = startJourney(profile, i % 2 ? "forest" : "library", `run-${i}`);
    profile = advanceJourney(profile, `run-${i}`, 0, "quick");
  }
  assert.equal(profile.journey.completed, 15);
  assert.equal(currentNode(profile).finished, true);
  assert.equal(profile.journey.stamps.length, 15);
  assert.equal(owns(profile, "garden_lantern"), true);
});
test("retained journeys cap at three; permanent recorded dates keep accumulating", () => {
  let profile = fresh();
  for (let i = 1; i <= 7; i++) {
    const day = `2026-09-${String(i).padStart(2, "0")}`;
    profile = recordDay(profile, { noSpend: true }, day, day);
  }
  assert.equal(profile.journey.pendingDates.length, 3);
  assert.equal(profile.journey.recordedDates.length, 7);
  assert.equal(owns(profile, "friend_owl"), true);
});
test("Taiwan calendar date is consistent across UTC midnight and month boundary", () => {
  assert.equal(calendarDate(new Date("2026-08-31T16:01:00Z")), "2026-09-01");
  assert.equal(calendarDate(new Date("2026-09-01T00:01:00Z")), "2026-09-01");
});
test("guild migration and ledger summaries do not truncate after 80 entries", () => {
  const rows = legacyGuildEntries(
    {
      guildLedger: Array.from({ length: 125 }, (_, i) => ({
        id: `r${i}`,
        type: i % 2 ? "income" : "fixed",
        date,
        amount: 10,
      })),
    },
    date,
  );
  assert.equal(rows.length, 125);
  const summary = summarize(rows);
  assert.equal(summary.entryCount, 125);
  assert.equal(summary.spent, 630);
  assert.equal(summary.income, 620);
});
test("migration preserves old balances and collection while initializing new slots", () => {
  const old = {
    ...fresh(),
    schemaVersion: 2,
    stars: { yellow: 51, purple: 8 },
    collection: [{ id: "old-coat" }],
  };
  const migrated = initializeJourney(old, {}, date);
  assert.equal(migrated.stars.yellow, 51);
  assert.equal(migrated.tickets.gold, 1);
  assert.ok(migrated.collection.some((i) => i.id === "old-coat"));
  assert.ok(ITEMS.filter((i) => i.starter).every((i) => owns(migrated, i.id)));
});
test("backup rejects malformed entries, preserves current wallet on replay, and unions progress", () => {
  const raw = {
    version: 2,
    profile: { ...fresh(), stars: { yellow: 50, purple: 3 } },
    expenses: [{ ...add("row").data, id: "row" }],
    days: {},
    origin: "another-device",
  };
  const backup = validateBackup(raw, date);
  const once = mergeProfiles(fresh(), backup);
  assert.equal(once.stars.yellow, 50);
  const spent = { ...once, stars: { ...once.stars, yellow: 12 } };
  assert.equal(mergeProfiles(spent, backup).stars.yellow, 12);
  assert.throws(
    () =>
      validateBackup(
        { ...raw, expenses: [...raw.expenses, ...raw.expenses] },
        date,
      ),
    /重複/,
  );
});

test("backup imports legacy income once and expenses invalidate a zero-spend day", () => {
  const raw = {
    version: 2,
    profile: {
      ...fresh(),
      guildLedger: [{ id: "salary", type: "income", date, amount: 1000 }],
    },
    expenses: [],
    days: {},
  };
  const backup = validateBackup(raw, date);
  assert.equal(backup.expenses[0].kind, "income");
  assert.equal(
    validateBackup({ ...raw, expenses: backup.expenses }, date).expenses.length,
    1,
  );
  assert.equal(
    summarize([{ amount: 10, kind: "expense" }], { noSpend: true }).noSpend,
    false,
  );
});
