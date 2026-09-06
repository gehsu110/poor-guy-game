import test from "node:test";
import assert from "node:assert/strict";
import {
  nextStep,
  collectionGoal,
  searchProgress,
} from "../src/game/guidance.js";
import {
  initializeJourney,
  recordDay,
  startJourney,
  advanceJourney,
  encounterStep,
} from "../src/game/journey.js";
import { DISPLAY_ITEMS, purchaseAndEquip, owns } from "../src/game/catalog.js";
const date = "2026-09-06";
const fresh = () =>
  initializeJourney(
    {
      dailyBudget: 500,
      exp: 0,
      stars: { yellow: 0, purple: 0 },
      collection: [],
      equipped: {},
      claimedMissions: {},
    },
    {},
    date,
  );
const recorded = () => recordDay(fresh(), { entryCount: 1 }, date, date);

test("guidance follows the real journey state, including an interrupted adventure", () => {
  assert.equal(nextStep(fresh(), {}, date).kind, "record");
  const ready = recorded();
  assert.equal(nextStep(ready, { entryCount: 1 }, date).label, "出發找星片");
  const active = startJourney(ready, "library", "trip");
  assert.equal(nextStep(active, {}, date).label, "繼續冒險");
  // Pending and active trips remain playable after midnight without another purchase or ledger entry.
  assert.equal(nextStep(ready, {}, "2026-09-07").kind, "adventure");
  assert.equal(nextStep(active, {}, "2026-09-07").kind, "adventure");
});
test("finishing today offers collection; recording more does not imply another rewarded trip", () => {
  const done = advanceJourney(
    startJourney(recorded(), "forest", "trip"),
    "trip",
    0,
    "quick",
  );
  assert.equal(nextStep(done, { entryCount: 1 }, date).kind, "collection");
  assert.equal(
    nextStep(
      recordDay(done, { entryCount: 2 }, date, date),
      { entryCount: 2 },
      date,
    ).kind,
    "collection",
  );
  // Even deleting the final entry does not grant another trip.
  assert.equal(nextStep(done, { entryCount: 0 }, date).kind, "collection");
  assert.equal(nextStep(done, {}, "2026-09-07").kind, "record");
});
test("historical backfill does not claim today was completed", () => {
  const pastOnly = recordDay(fresh(), { entryCount: 1 }, "2026-09-05", date);
  assert.equal(nextStep(pastOnly, {}, date).step, 0);
});
test("three star interactions finish; legacy companion progress remains compatible", () => {
  const profile = recorded();
  const before = structuredClone(profile);
  let active = { hp: 100 };
  assert.equal(searchProgress(active).found, 0);
  for (let i = 1; i <= 3; i++) {
    active = { ...active, hp: encounterStep(active, "cast") };
    assert.equal(searchProgress(active).found, i);
  }
  assert.deepEqual(profile, before); // Practice only needs an encounter, never a profile transaction.
  assert.equal(searchProgress({ hp: 45 }).found, 1);
  assert.equal(searchProgress({ hp: 20 }).found, 2);
  assert.equal(encounterStep({ hp: 45 }, "friend", true), 0);
  assert.throws(() => encounterStep({ hp: 100 }, "friend"), /夥伴/);
});
test("formal result survives reloading and repeating the completed action cannot duplicate a reward", () => {
  const done = advanceJourney(
    startJourney(recorded(), "forest", "trip"),
    "trip",
    0,
    "quick",
  );
  const reloaded = initializeJourney(
    JSON.parse(JSON.stringify(done)),
    {},
    date,
  );
  assert.deepEqual(reloaded.journey.lastResult, {
    id: "trip",
    node: 1,
    route: "forest",
    date,
    seen: false,
  });
  assert.equal(reloaded.journey.stamps.length, 1);
  assert.throws(() => advanceJourney(reloaded, "trip", 0, "quick"));
  assert.equal(reloaded.exp, done.exp);
  assert.equal(reloaded.journey.usedDates.length, 1);
});
test("collection goals only suggest available, unowned art and support completed collections", () => {
  const profile = fresh();
  profile.wishlist = ["missing", "top_courier", "top_starlight"];
  assert.equal(collectionGoal(profile).id, "top_starlight");
  profile.collection.push({ id: "storybook_star_uniform" });
  assert.equal(collectionGoal(profile).id, "friend_owl");
  profile.collection.push(...DISPLAY_ITEMS.map((item) => ({ id: item.id })));
  assert.equal(collectionGoal(profile), null);
});
test("purchase and equip charge once and preserve other worn items", () => {
  const profile = fresh();
  profile.stars.yellow = 20;
  profile.collection.push({ id: "friend_owl" });
  profile.equipped.layered.companion = "friend_owl";
  const worn = purchaseAndEquip(profile, "top_starlight", "purchase");
  assert.ok(owns(worn, "top_starlight"));
  assert.equal(worn.stars.yellow, 8);
  assert.equal(worn.equipped.layered.top, "top_starlight");
  assert.equal(worn.equipped.layered.companion, "friend_owl");
  const retry = purchaseAndEquip(worn, "top_starlight", "retry");
  assert.equal(retry.stars.yellow, 8);
  assert.equal(retry.walletLog.length, 1);
  assert.equal(profile.stars.yellow, 20);
  assert.equal(profile.equipped.layered.top, "top_mint");
  assert.throws(
    () => purchaseAndEquip(fresh(), "top_starlight", "failed"),
    /還不夠/,
  );
});
