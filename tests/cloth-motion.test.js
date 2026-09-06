import test from "node:test";
import assert from "node:assert/strict";
import {
  clothFields,
  createClothMesh,
  motionWeights,
  rigidAttachmentRegion,
} from "../src/character/clothMotion.js";

test("all outfits move loose fabric while the feet and face stay outside fabric deformation", () => {
  for (const sex of ["female", "male"]) {
    for (const top of ["top_mint", "top_starlight"]) {
      const fields = clothFields(sex, top);
      assert.ok(fields.length > 0);
      for (const field of fields)
        assert.ok(Math.abs(motionWeights(field.x, field.y, fields)[0]) >= 8);
      assert.deepEqual(motionWeights(820, 2350, fields), [0, 0, 0, 0, 0]);
      assert.deepEqual(motionWeights(820, 340, fields).slice(0, 3), [0, 0, 0]);
    }
  }
});

test("a waist journal follows one anchor instead of flexing with the skirt", () => {
  const item = {
    x: 635,
    y: 823,
    width: 210,
    height: 330,
    angle: 5,
    handInFront: false,
  };
  const rigid = rigidAttachmentRegion(item);
  const fields = clothFields("female", "top_starlight");
  const top = motionWeights(item.x, item.y, fields, rigid);
  const bottom = motionWeights(
    item.x + item.width,
    item.y + item.height,
    fields,
    rigid,
  );
  assert.deepEqual(top, bottom);
  assert.deepEqual(top.slice(0, 3), [0, 0, 0]);
  assert.ok(top[3] > 0.8);
  assert.equal(rigidAttachmentRegion(null), null);
  assert.deepEqual(motionWeights(820, 2350, fields, rigid), [0, 0, 0, 0, 0]);
});

test("mesh indices stay valid and the source frame remains unchanged", () => {
  const frame = { width: 1696, height: 2528 };
  const { vertices, indices } = createClothMesh(
    frame,
    clothFields("male", "top_starlight"),
  );
  assert.equal(vertices.length, 49 * 73 * 7);
  assert.equal(indices.length, 48 * 72 * 6);
  assert.ok(Math.max(...indices) < vertices.length / 7);
  assert.ok(vertices.every(Number.isFinite));
  assert.deepEqual([...vertices.slice(-7, -5)], [1696, 2528]);
});
