export const SPAWN = { x: 0, z: 5 };
export const BOUNDS = { minX: -15, maxX: 15, minZ: -25, maxZ: 9 };
export const TREES = [
  [-8, 3, 1.2],
  [-10, 0, 1],
  [-12, -4, 1.3],
  [-13, -9, 0.9],
  [-14, -16, 1.2],
  [-10, -19, 1.1],
  [-7, -23, 1.3],
  [7, 4, 1.3],
  [11, 1, 1.1],
  [14, -2, 1.4],
  [14, -13, 1],
  [10, -17, 1.2],
  [7, -23, 1.3],
  [13, -22, 1.5],
  [-5, -10, 0.85],
  [5, -12, 0.9],
  [-11, 7, 1.5],
  [13, 7, 1.4],
  [-15, -24, 1.4],
  [-16, 2, 1.1],
  [18, -6, 1.5],
];
export const OBSTACLES = [
  ...TREES.map(([x, z, s]) => ({ x, z, r: 0.45 * s })),
  { x: -6, z: 0, w: 3.5, d: 3.5 },
  { x: 11, z: -11, r: 3 },
  { x: -3.5, z: -22, r: 0.65 },
  { x: 3.5, z: -22, r: 0.65 },
  { x: -3.5, z: -19, r: 0.65 },
  { x: 3.5, z: -19, r: 0.65 },
];
export function walkable(x, z, padding = 0.32) {
  if (x < BOUNDS.minX || x > BOUNDS.maxX || z < BOUNDS.minZ || z > BOUNDS.maxZ)
    return false;
  return !OBSTACLES.some((o) =>
    o.r
      ? Math.hypot(x - o.x, z - o.z) < o.r + padding
      : Math.abs(x - o.x) < o.w / 2 + padding &&
        Math.abs(z - o.z) < o.d / 2 + padding,
  );
}
export function slideMove(position, dx, dz) {
  let { x, z } = position;
  if (walkable(x + dx, z + dz)) return { x: x + dx, z: z + dz };
  if (walkable(x + dx, z)) x += dx;
  if (walkable(x, z + dz)) z += dz;
  return { x, z };
}
// Small fixed field: bounded A* supports tap-to-walk and accessible destination guidance.
export function fieldPath(start, destination) {
  const key = (x, z) => `${x},${z}`;
  const sx = Math.round(start.x),
    sz = Math.round(start.z);
  const goal = { x: Math.round(destination.x), z: Math.round(destination.z) };
  if (!walkable(goal.x, goal.z)) return [];
  const open = [{ x: sx, z: sz, g: 0, f: 0 }],
    visited = new Set(),
    nodes = new Map([[key(sx, sz), open[0]]]);
  let found;
  for (let i = 0; open.length && i < 1600; i++) {
    open.sort((a, b) => b.f - a.f);
    const current = open.pop(),
      k = key(current.x, current.z);
    if (visited.has(k)) continue;
    visited.add(k);
    if (current.x === goal.x && current.z === goal.z) {
      found = current;
      break;
    }
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) {
      const x = current.x + dx,
        z = current.z + dz,
        nk = key(x, z);
      if (
        !walkable(x, z) ||
        !walkable(current.x + dx, current.z) ||
        !walkable(current.x, current.z + dz) ||
        visited.has(nk)
      )
        continue;
      const g = current.g + Math.hypot(dx, dz);
      if ((nodes.get(nk)?.g ?? Infinity) <= g) continue;
      const node = {
        x,
        z,
        g,
        f: g + Math.hypot(x - goal.x, z - goal.z),
        parent: current,
      };
      nodes.set(nk, node);
      open.push(node);
    }
  }
  if (!found) return [];
  const path = [];
  while (found.parent) {
    path.unshift({ x: found.x, z: found.z });
    found = found.parent;
  }
  return path;
}
