import test from "node:test";
import assert from "node:assert/strict";
import { createClothRenderer } from "../src/components/atelier/clothRenderer.js";

test("unavailable WebGL leaves the complete SVG fallback usable", () => {
  assert.equal(createClothRenderer({ getContext: () => null }), null);
});

test("a shader failure releases allocated resources and returns to the fallback", () => {
  const deleted = [];
  const gl = {
    VERTEX_SHADER: 1,
    COMPILE_STATUS: 2,
    createProgram: () => "program",
    createShader: () => "shader",
    shaderSource() {},
    compileShader() {},
    getShaderParameter: () => false,
    deleteProgram: (value) => deleted.push(value),
    deleteShader: (value) => deleted.push(value),
  };
  assert.equal(createClothRenderer({ getContext: () => gl }), null);
  assert.deepEqual(deleted.sort(), ["program", "shader"]);
});
