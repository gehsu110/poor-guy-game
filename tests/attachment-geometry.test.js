import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { attachmentPivot, attachmentPoint } from "../src/character/attachmentGeometry.js";
import { clothFields, motionWeights, rigidAttachmentRegion } from "../src/character/clothMotion.js";

test("rotating a held item keeps its wrist fixed instead of rotating around the book centre", () => {
  const item = { x: 100, y: 200, width: 80, height: 120, angle: 90, pivot: { x: 60, y: 0 } };
  assert.deepEqual(attachmentPivot(item), { x: 160, y: 200 });
  assert.deepEqual(attachmentPoint(item, 160, 200), { x: 160, y: 200 });
  assert.deepEqual(attachmentPoint(item, 160, 240), { x: 120, y: 200 });
  assert.deepEqual(attachmentPivot({ x: 100, y: 200, width: 80 }), { x: 140, y: 260 });
});

test("all fitted grips and their wrists move together without bending the book", () => {
  const grips = JSON.parse(readFileSync(new URL("../src/character/journal-grip.json", import.meta.url)));
  for (const [sex, outfits] of Object.entries(grips)) {
    for (const [top, item] of Object.entries(outfits)) {
      const rigid = rigidAttachmentRegion(item);
      const wrist = attachmentPivot(item);
      const bottom = attachmentPoint(item, item.x + item.width / 2, item.y + item.height);
      const fields = clothFields(sex, top);
      assert.deepEqual(motionWeights(wrist.x, wrist.y, fields, rigid), motionWeights(bottom.x, bottom.y, fields, rigid));
      assert.deepEqual(motionWeights(wrist.x, wrist.y, fields, rigid).slice(0, 3), [0, 0, 0]);
      assert.deepEqual(motionWeights(820, 2350, fields, rigid), [0, 0, 0, 0, 0]);
    }
  }
});
