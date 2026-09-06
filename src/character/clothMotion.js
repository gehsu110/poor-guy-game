// These fields describe loose fabric in the shared 1696 × 2528 art frame.
// Each outfit adds only its fabric weights, never videos for every worn item.
const PROFILES = {
  female: {
    top_mint: [
      { x: 1210, y: 825, rx: 250, ry: 190, dx: 38, dy: -12, phase: 0.2 },
    ],
    top_starlight: [
      { x: 467, y: 1770, rx: 190, ry: 470, dx: -30, dy: 8, phase: 0.3 },
      { x: 1110, y: 1710, rx: 260, ry: 470, dx: 38, dy: -9, phase: 1.4 },
      { x: 780, y: 1310, rx: 260, ry: 150, dx: 8, dy: 3, phase: 0.8 },
    ],
  },
  male: {
    top_mint: [
      { x: 1190, y: 968, rx: 180, ry: 220, dx: 37, dy: -11, phase: 0.2 },
    ],
    top_starlight: [
      { x: 565, y: 1810, rx: 185, ry: 420, dx: -29, dy: 8, phase: 0.4 },
      { x: 1110, y: 1680, rx: 210, ry: 420, dx: 38, dy: -10, phase: 1.5 },
    ],
  },
};

export function clothFields(sex, top) {
  return PROFILES[sex]?.[top] ?? [];
}

const smooth = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function rigidAttachmentRegion(item) {
  if (!item || item.handInFront) return null;
  const cx = item.x + item.width / 2;
  const cy = item.y + 60;
  const angle = (item.angle * Math.PI) / 180;
  const points = [
    [item.x, item.y],
    [item.x + item.width, item.y],
    [item.x, item.y + item.height],
    [item.x + item.width, item.y + item.height],
  ].map(([x, y]) => [
    cx + (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle),
    cy + (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle),
  ]);
  // Pad by two mesh cells so every triangle touching the journal moves rigidly.
  return {
    left: Math.min(...points.map((p) => p[0])) - 72,
    right: Math.max(...points.map((p) => p[0])) + 72,
    top: Math.min(...points.map((p) => p[1])) - 72,
    bottom: Math.max(...points.map((p) => p[1])) + 72,
    breath: smooth((1600 - item.y) / 700),
  };
}

export function motionWeights(x, y, fields, rigid = null) {
  if (
    rigid &&
    x >= rigid.left &&
    x <= rigid.right &&
    y >= rigid.top &&
    y <= rigid.bottom
  ) {
    return [0, 0, 0, rigid.breath, 0];
  }
  let dx = 0;
  let dy = 0;
  let phase = 0;
  let total = 0;
  for (const field of fields) {
    const distance =
      ((x - field.x) / field.rx) ** 2 + ((y - field.y) / field.ry) ** 2;
    const influence = Math.max(0, 1 - distance) ** 2;
    dx += field.dx * influence;
    dy += field.dy * influence;
    phase += field.phase * influence;
    total += influence;
  }
  return [
    dx,
    dy,
    total ? phase / total : 0,
    smooth((1600 - y) / 700),
    smooth((510 - y) / 180),
  ];
}

export function createClothMesh(
  canvas,
  fields,
  attachment = null,
  columns = 48,
  rows = 72,
) {
  const vertices = [];
  const indices = [];
  const rigid = rigidAttachmentRegion(attachment);
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      const x = (col / columns) * canvas.width;
      const y = (row / rows) * canvas.height;
      vertices.push(x, y, ...motionWeights(x, y, fields, rigid));
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
}
