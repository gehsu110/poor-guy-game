import test from "node:test";
import assert from "node:assert/strict";
import {
  fieldState,
  fieldAction,
  fieldQuest,
  mergeField,
  FIELD_OBJECTS,
} from "../src/game/exploration.js";
import {
  fieldPath,
  walkable,
  slideMove,
  SPAWN,
} from "../src/components/exploration/fieldLayout.js";
const profile = {
  stars: { yellow: 7, purple: 2 },
  journey: { pendingDates: ["2026-09-06"] },
  exp: 35,
};
test("exploration completes independently, unlocks visible rewards and is idempotent", () => {
  let p = fieldAction(profile, { type: "talk" });
  for (let i = 1; i <= 3; i++)
    p = fieldAction(p, { type: "gather", id: `flower-${i}` });
  p = fieldAction(p, { type: "craft" });
  for (let i = 1; i <= 3; i++)
    p = fieldAction(p, { type: "ignite", id: `lamp-${i}` });
  p = fieldAction(p, { type: "open" });
  assert.equal(fieldState(p).followingWisp, true);
  assert.equal(fieldState(p).wearingBrooch, true);
  assert.deepEqual(fieldAction(p, { type: "open" }), p);
  assert.deepEqual(fieldAction(p, { type: "gather", id: "flower-1" }), p);
  assert.deepEqual(p.stars, profile.stars);
  assert.deepEqual(p.journey, profile.journey);
  assert.equal(p.exp, 35);
  const worn = fieldAction(p, { type: "wear", item: "brooch", value: false });
  assert.equal(
    fieldAction(worn, { type: "craft" }).exploration.wearingBrooch,
    false,
  );
});
test("invalid and out-of-order rewards are rejected, old saves start safely", () => {
  assert.equal(fieldQuest(fieldState(profile)).target, "mira");
  for (const action of [
    { type: "craft" },
    { type: "ignite", id: "lamp-1" },
    { type: "open" },
    { type: "gather", id: "fake" },
    { type: "wear", item: "wisp", value: true },
  ])
    assert.throws(() => fieldAction(profile, action));
  assert.deepEqual(
    fieldState({
      exploration: { flowers: "invalid", lit: ["lamp-1"], treasure: true },
    }).lit,
    [],
  );
});
test("backup merge keeps discovered objects and equipped preference without minting currency", () => {
  const a = {
    exploration: {
      flowers: ["flower-1"],
      brooch: true,
      wearingBrooch: false,
      lit: ["lamp-1"],
    },
  };
  const b = {
    exploration: {
      flowers: ["flower-2"],
      brooch: true,
      lit: ["lamp-2", "lamp-3"],
    },
  };
  const merged = mergeField(a, b);
  assert.equal(merged.flowers.length, 2);
  assert.equal(merged.lit.length, 3);
  assert.equal(merged.wearingBrooch, false);
  assert.deepEqual(mergeField({ exploration: merged }, b), merged);
});
test("all field interactions have reachable paths, paths never cut through obstacles", () => {
  for (const destination of FIELD_OBJECTS) {
    const path = fieldPath(SPAWN, destination);
    assert.ok(path.length, `reachable: ${destination.id}`);
    let last = SPAWN;
    for (const p of path) {
      for (let t = 0; t <= 1; t += 0.1)
        assert.ok(
          walkable(last.x + (p.x - last.x) * t, last.z + (p.z - last.z) * t),
          `clear: ${destination.id}`,
        );
      last = p;
    }
  }
  assert.deepEqual(slideMove({ x: 14.9, z: 0 }, 1, 0), { x: 14.9, z: 0 });
  assert.deepEqual(fieldPath(SPAWN, { x: 11, z: -11 }), []);
});

test("independent wardrobe slots preserve other choices and reject unowned outfits", async () => {
  const { fieldLook, wearFieldLook } =
    await import("../src/game/exploration.js");
  const base = { ...profile, collection: [] };
  const next = wearFieldLook(base, { hair: "braid", hat: "ribbon" });
  assert.equal(fieldLook(next).hair, "braid");
  assert.equal(fieldLook(next).hat, "ribbon");
  assert.equal(fieldLook(next).pack, fieldLook(base).pack);
  assert.throws(() => wearFieldLook(next, { outfit: "star" }));
  const owned = wearFieldLook(
    { ...next, collection: [{ id: "top_starlight" }] },
    { outfit: "star" },
  );
  assert.equal(fieldLook(JSON.parse(JSON.stringify(owned))).outfit, "star");
  assert.equal(fieldLook(owned).hair, "braid");
  assert.deepEqual(owned.stars, base.stars);
});
