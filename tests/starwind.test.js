import test from "node:test";
import assert from "node:assert/strict";
import { initializeJourney } from "../src/game/journey.js";
import {
  equipLook,
  normalizeLook,
  purchaseAndEquip,
  owns,
} from "../src/game/catalog.js";
const fresh = () =>
  initializeJourney(
    {
      stars: { yellow: 20, purple: 3 },
      collection: [{ id: "storybook_star_uniform" }],
      equipped: {},
      claimedMissions: {},
      exp: 0,
      dailyBudget: 500,
    },
    {},
    "2026-09-06",
  );

test("costume and independent accessories survive removal, save reload and another costume choice", () => {
  const profile = fresh();
  const ribbon = equipLook(profile, {
    ...profile.equipped.layered,
    hat: "hat_ribbon",
    prop: null,
  });
  const reloaded = initializeJourney(
    JSON.parse(JSON.stringify(ribbon)),
    {},
    "2026-09-06",
  );
  assert.equal(reloaded.equipped.layered.prop, null);
  assert.equal(reloaded.equipped.layered.hat, "hat_ribbon");
  const night = equipLook(reloaded, {
    ...reloaded.equipped.layered,
    top: "top_starlight",
  });
  assert.equal(night.equipped.layered.hat, "hat_ribbon");
  assert.equal(night.equipped.layered.prop, null);
  assert.deepEqual(night.stars, profile.stars);
  assert.deepEqual(night.collection, profile.collection);
  assert.equal(normalizeLook({ hat: null, prop: null }).hat, null);
});

test("a real accessory purchase preserves outfit, charges once, and cannot be equipped before ownership", () => {
  const profile = equipLook(fresh(), {
    ...fresh().equipped.layered,
    top: "top_starlight",
    hat: "hat_ribbon",
  });
  assert.throws(
    () =>
      equipLook(profile, { ...profile.equipped.layered, prop: "prop_satchel" }),
    /尚未取得/,
  );
  const bought = purchaseAndEquip(profile, "prop_satchel", "buy-bag");
  assert.equal(bought.stars.yellow, 14);
  assert.equal(bought.equipped.layered.top, "top_starlight");
  assert.equal(bought.equipped.layered.hat, "hat_ribbon");
  assert.equal(bought.equipped.layered.prop, "prop_satchel");
  assert.ok(owns(bought, "prop_satchel"));
  const retry = purchaseAndEquip(bought, "prop_satchel", "buy-bag-again");
  assert.equal(retry.stars.yellow, 14);
  assert.equal(retry.walletLog.length, 1);
  const removed = equipLook(retry, {
    ...retry.equipped.layered,
    hat: null,
    prop: null,
  });
  assert.ok(owns(removed, "prop_satchel"));
  assert.equal(removed.equipped.layered.prop, null);
  assert.equal(profile.stars.yellow, 20);
});

test("existing saves keep their look while either traveler and hairstyle survive reload without extra charges", () => {
  const original = fresh();
  assert.equal(original.equipped.layered.body, "body_female");
  for (const body of ["body_female", "body_male"])
    for (const hair of ["hair_chestnut", "hair_braid"]) {
      const worn = equipLook(original, {
        ...original.equipped.layered,
        body,
        hair,
        top: "top_starlight",
        hat: null,
      });
      const reloaded = initializeJourney(
        JSON.parse(JSON.stringify(worn)),
        {},
        "2026-09-07",
      );
      assert.equal(reloaded.equipped.layered.body, body);
      assert.equal(reloaded.equipped.layered.hair, hair);
      assert.equal(reloaded.equipped.layered.top, "top_starlight");
      assert.equal(reloaded.equipped.layered.hat, null);
      assert.deepEqual(reloaded.stars, original.stars);
      assert.deepEqual(reloaded.collection, original.collection);
    }
  assert.equal(normalizeLook({ body: "top_starlight" }).body, "body_female");
});

test("buying an accessory keeps owned trial choices but never equips another unpaid item", () => {
  const profile = fresh();
  const trial = {
    ...profile.equipped.layered,
    body: "body_male",
    hair: "hair_braid",
    hat: "hat_ribbon",
    prop: "prop_satchel",
    companion: "friend_cat",
  };
  const bought = purchaseAndEquip(profile, "prop_satchel", "trial-buy", trial);
  assert.equal(bought.equipped.layered.body, "body_male");
  assert.equal(bought.equipped.layered.hair, "hair_braid");
  assert.equal(bought.equipped.layered.hat, "hat_ribbon");
  assert.equal(bought.equipped.layered.prop, "prop_satchel");
  assert.equal(bought.equipped.layered.companion, null);
  assert.equal(bought.stars.yellow, 14);
  assert.equal(bought.stars.purple, 3);
  const retry = purchaseAndEquip(bought, "prop_satchel", "trial-retry", trial);
  assert.equal(retry.stars.yellow, 14);
  assert.equal(retry.walletLog.length, 1);
  assert.equal(retry.equipped.layered.companion, null);
});
