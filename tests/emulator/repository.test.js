import { before, beforeEach, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { env } from "node:process";
import {
  initializeTestEnvironment,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  connectFirestoreEmulator,
  setDoc,
  doc,
  getDoc,
  terminate,
} from "firebase/firestore";
env.VITE_FIREBASE_API_KEY = "demo-api-key";
env.VITE_FIREBASE_PROJECT_ID = "demo-starpage";
const { db, DEFAULT_PROFILE } = await import("../../src/firebase.js");
const {
  migrateGame,
  commitLedger,
  readGame,
  gameTransaction,
  gameSnapshot,
  importGame,
} = await import("../../src/gameRepository.js");
const { startJourney, advanceJourney } =
  await import("../../src/game/journey.js");
const { purchaseAndEquip } = await import("../../src/game/catalog.js");
const { validateBackup } = await import("../../src/game/backup.js");
const date = "2026-09-06";
const uid = "alice";
let environment;
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-starpage",
    firestore: {
      host: "127.0.0.1",
      port: 8086,
      rules: await readFile(
        new URL("../../firestore.rules", import.meta.url),
        "utf8",
      ),
    },
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8086, {
    mockUserToken: { sub: uid },
  });
});
beforeEach(async () => {
  await environment.clearFirestore();
  await migrateGame(uid, date);
});
after(async () => {
  await terminate(db);
  await environment.cleanup();
});
const command = (id, amount = 80, day = date) => ({
  id,
  type: "add",
  operationId: `op-${id}`,
  data: {
    amount: String(amount),
    date: day,
    category: "餐飲",
    kind: "expense",
    note: "emulator test",
  },
});
test("owner can save entry + summary + reward atomically and cannot write another account", async () => {
  await commitLedger(uid, command("first"), date);
  const current = await readGame(uid, date);
  assert.equal(current.expenses.length, 1);
  assert.equal(current.dayRecord.spent, 80);
  assert.equal(current.profile.stars.yellow, 2);
  await assertFails(commitLedger("bob", command("forbidden"), date));
  await assertFails(
    environment.unauthenticatedContext().firestore().doc("users/alice").get(),
  );
});
test("simultaneous retries and two independent entries do not duplicate or overwrite", async () => {
  await Promise.all([
    commitLedger(uid, command("same"), date),
    commitLedger(uid, command("same"), date),
  ]);
  await Promise.all([
    commitLedger(uid, command("two", 20), date),
    commitLedger(uid, command("three", 30), date),
  ]);
  const current = await readGame(uid, date);
  assert.equal(current.expenses.length, 3);
  assert.equal(current.dayRecord.spent, 130);
  assert.equal(current.profile.stars.yellow, 2);
});
test("historical backfill and a moved entry maintain both day summaries", async () => {
  await commitLedger(uid, command("past", 22, "2026-09-05"), date);
  await commitLedger(uid, command("move", 80), date);
  await commitLedger(
    uid,
    {
      id: "move",
      operationId: "edit",
      type: "update",
      expectedRevision: 1,
      data: { date: "2026-09-05", amount: 100, category: "餐飲" },
    },
    date,
  );
  assert.equal((await readGame(uid, date)).dayRecord.spent, 0);
  assert.equal((await readGame(uid, "2026-09-05")).dayRecord.spent, 122);
});
test("a failure in any write rejects all of the transaction", async () => {
  const before = await gameSnapshot(uid);
  await assertFails(
    gameTransaction(
      uid,
      (profile, record) => ({
        profile: { ...profile, stars: { yellow: -1, purple: 0 } },
        record: { ...record, spent: 100 },
      }),
      date,
    ),
  );
  const after = await gameSnapshot(uid);
  assert.equal(after.profile.stars.yellow, before.profile.stars.yellow);
  assert.deepEqual(after.days, before.days);
});
test("legacy guild migration remains durable and does not duplicate after retry", async () => {
  await setDoc(doc(db, "users", uid), {
    ...DEFAULT_PROFILE,
    guildLedger: [
      { id: "one", date, amount: 200, type: "income" },
      { id: "two", date, amount: 50, type: "fixed" },
    ],
  });
  await migrateGame(uid, date);
  await migrateGame(uid, date);
  const current = await readGame(uid, date);
  assert.equal(current.expenses.length, 2);
  assert.equal(current.dayRecord.income, 200);
  assert.equal(current.dayRecord.spent, 50);
  assert.equal(
    (await getDoc(doc(db, "users", uid, "backups", "before-v3"))).exists(),
    true,
  );
});
test("adventure completion persists the item and single consumed date together", async () => {
  await commitLedger(uid, command("day"), date);
  await gameTransaction(
    uid,
    (profile, record) => ({
      profile: startJourney(profile, "forest", "trip"),
      record,
    }),
    date,
  );
  await gameTransaction(
    uid,
    (profile, record) => ({
      profile: advanceJourney(profile, "trip", 0, "quick"),
      record,
    }),
    date,
  );
  const current = await readGame(uid, date);
  assert.equal(current.profile.journey.completed, 1);
  assert.ok(
    current.profile.collection.some((item) => item.id === "top_courier"),
  );
  assert.equal(current.profile.journey.pendingDates.length, 0);
  assert.deepEqual(current.profile.journey.lastResult, {
    id: "trip",
    node: 1,
    route: "forest",
    date,
    seen: false,
  });
});
test("chunked backup merge is resumable and does not add the same balance again", async () => {
  const saved = await gameSnapshot(uid);
  const backup = validateBackup(
    {
      ...saved,
      origin: "separate-device",
      profile: {
        ...saved.profile,
        saveId: "other",
        stars: { yellow: 50, purple: 1 },
      },
      expenses: Array.from({ length: 85 }, (_, i) => ({
        id: `import-${i}`,
        amount: 1,
        date,
        category: "餐飲",
      })),
    },
    date,
  );
  await importGame(uid, backup);
  await importGame(uid, backup);
  const current = await readGame(uid, date);
  assert.equal(current.expenses.length, 85);
  assert.equal(current.dayRecord.spent, 85);
  assert.equal(current.profile.stars.yellow, 50);
});

test("editing an old date repairs missing day counters from real source rows", async () => {
  const oldDate = "2026-08-15";
  await setDoc(doc(db, "users", uid, "expenses", "old-one"), {
    amount: 35,
    date: oldDate,
    category: "餐飲",
  });
  await setDoc(doc(db, "users", uid, "expenses", "old-two"), {
    amount: 65,
    date: oldDate,
    category: "餐飲",
  });
  await setDoc(doc(db, "users", uid, "days", oldDate), { spent: 100 });
  await commitLedger(
    uid,
    {
      id: "old-one",
      operationId: "old-edit",
      type: "update",
      expectedRevision: 0,
      data: { amount: 50, date: oldDate, category: "餐飲" },
    },
    date,
  );
  const saved = await readGame(uid, oldDate);
  assert.equal(saved.dayRecord.spent, 115);
  assert.equal(saved.dayRecord.entryCount, 2);
  assert.equal(saved.dayRecord.expenseCount, 2);
});

test("purchase-and-equip retries commit one debit with the worn outfit", async () => {
  await gameTransaction(
    uid,
    (profile, record) => ({
      profile: { ...profile, stars: { yellow: 20, purple: 0 } },
      record,
    }),
    date,
  );
  await Promise.all(
    ["buy-a", "buy-b"].map((id) =>
      gameTransaction(
        uid,
        (profile, record) => ({
          profile: purchaseAndEquip(profile, "top_starlight", id),
          record,
        }),
        date,
      ),
    ),
  );
  const current = await readGame(uid, date);
  assert.equal(current.profile.stars.yellow, 8);
  assert.equal(current.profile.equipped.layered.top, "top_starlight");
  assert.equal(
    current.profile.collection.filter((item) => item.id === "top_starlight")
      .length,
    1,
  );
  assert.equal(
    current.profile.walletLog.filter((item) =>
      ["buy-a", "buy-b"].includes(item.id),
    ).length,
    1,
  );
  const before = await gameSnapshot(uid);
  await assert.rejects(
    gameTransaction(
      uid,
      (profile, record) => ({
        profile: purchaseAndEquip(profile, "friend_cat", "too-poor"),
        record,
      }),
      date,
    ),
    /還不夠/,
  );
  assert.deepEqual((await gameSnapshot(uid)).profile, before.profile);
});
