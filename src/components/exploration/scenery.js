import * as T from "three";
import { TREES, walkable } from "./fieldLayout.js";
import { FIELD_OBJECTS } from "../../game/exploration.js";
import { makeTraveler } from "./character.js";

export function buildScenery(scene, art) {
  const { mesh, custom, group, mat } = art;
  const dynamic = [],
    objects = new Map(),
    trees = [];
  scene.background = new T.Color("#abcbd8");
  scene.fog = new T.Fog("#c7ded9", 28, 72);
  const hemi = new T.HemisphereLight("#e7f8ff", "#6b7853", 2);
  scene.add(hemi);
  const sun = new T.DirectionalLight("#fff0c9", 3.1);
  sun.position.set(-12, 24, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -23,
    right: 23,
    top: 24,
    bottom: -24,
    near: 1,
    far: 65,
  });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(new T.AmbientLight("#dbe6ee", 0.35));
  const ground = mesh(scene, "box", "#8daf76", [0, -0.2, -7], [100, 0.4, 100]);
  ground.castShadow = false;
  // Pale worn paths lead through the field; stones sit in the ground, not on interface panels.
  for (let i = 0; i < 22; i++) {
    const z = 7 - i * 1.45,
      x = Math.sin(i * 0.4) * 1.05;
    const stone = mesh(
      scene,
      "cylinder",
      i % 3 === 0 ? "#d9ccaa" : "#d2c6a6",
      [x, 0.008, z],
      [1.28, 0.035, 0.91],
    );
    stone.rotation.y = i * 0.7;
    stone.castShadow = false;
  }
  for (let i = 0; i < 5; i++)
    mesh(
      scene,
      "cylinder",
      "#d1c3a4",
      [-i * 0.8, 0.012, 2 - i * 0.1],
      [0.65, 0.035, 0.53],
    );
  // Distant ridges and cloud banks give the camera genuine depth.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2,
      r = 53;
    const hill = mesh(
      scene,
      "sphere",
      i % 2 ? "#82a6ab" : "#8fb5b3",
      [Math.sin(a) * r, -3, Math.cos(a) * r - 8],
      [14, 8 + (i % 3) * 3, 12],
    );
    hill.castShadow = false;
    const cloud = group(scene, [
      Math.sin(a) * 42,
      14 + (i % 4),
      Math.cos(a) * 42 - 8,
    ]);
    for (let j = 0; j < 4; j++) {
      const m = mesh(
        cloud,
        "sphere",
        "#f7f4e4",
        [j * 1.9, Math.sin(j) * 0.5, 0],
        [2.3, 1.1, 1.4],
      );
      m.castShadow = false;
    }
  }
  let seed = 542;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  // Instanced vegetation keeps mobile draw calls low.
  const blade = new T.ConeGeometry(0.055, 0.42, 3),
    grass = new T.InstancedMesh(blade, mat("#719f66"), 1300),
    dummy = new T.Object3D();
  let grassCount = 0;
  for (let i = 0; i < 1900 && grassCount < 1300; i++) {
    const x = random() * 35 - 17.5,
      z = random() * 40 - 28;
    if (
      Math.abs(x - Math.sin(((7 - z) / 1.45) * 0.4) * 1.05) < 1.55 ||
      !walkable(x, z, 0)
    )
      continue;
    dummy.position.set(x, 0.14, z);
    dummy.scale.setScalar(0.6 + random());
    dummy.rotation.set(random() * 0.1, random() * 6.28, random() * 0.18);
    dummy.updateMatrix();
    grass.setMatrixAt(grassCount, dummy.matrix);
    grass.setColorAt(
      grassCount,
      new T.Color().setHSL(
        0.23 + random() * 0.025,
        0.28 + random() * 0.14,
        0.43 + random() * 0.13,
      ),
    );
    grassCount++;
  }
  grass.count = grassCount;
  grass.receiveShadow = true;
  scene.add(grass);
  const flowerGeo = new T.SphereGeometry(1, 6, 4),
    carpet = new T.InstancedMesh(flowerGeo, mat("#e8dab5"), 280);
  for (let i = 0; i < 280; i++) {
    const x = random() * 29 - 14.5,
      z = random() * 32 - 24;
    dummy.position.set(x, walkable(x, z, 0) && Math.abs(x) > 2 ? 0.18 : -1, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(0.06, 0.035, 0.06);
    dummy.updateMatrix();
    carpet.setMatrixAt(i, dummy.matrix);
    carpet.setColorAt(
      i,
      new T.Color(
        i % 4 === 0 ? "#b8a7da" : i % 3 === 0 ? "#f0d994" : "#fff2d1",
      ),
    );
  }
  scene.add(carpet);
  for (const [x, z, s] of TREES) {
    const tree = group(scene, [x, 0, z]);
    tree.scale.setScalar(s);
    custom(
      tree,
      new T.CylinderGeometry(0.12, 0.28, 3, 7),
      "#81644d",
      [0, 1.45, 0],
    );
    const crown = group(tree, [0, 2.8, 0]);
    trees.push(crown);
    for (let j = 0; j < 5; j++) {
      const a = j * 2.4;
      mesh(
        crown,
        "sphere",
        ["#719b68", "#82af74", "#94bd7b", "#6d996c", "#a4c58b"][j],
        [Math.cos(a) * 0.66, j * 0.19, Math.sin(a) * 0.6],
        [1.1, 1.0, 1.04],
      );
    }
    mesh(tree, "sphere", "#85a06b", [0, 0.01, 0], [1, 0.035, 0.9]).castShadow =
      false;
  }
  // A little atelier with an awning, stone foundation, books and a hanging lamp.
  const hut = group(scene, [-6, 0, 0]);
  mesh(hut, "box", "#ece0bd", [0, 1.35, 0], [3.25, 2.7, 3.2]);
  mesh(hut, "box", "#9c9676", [0, 0.12, 0], [3.55, 0.24, 3.45]);
  const roof = custom(
    hut,
    new T.ConeGeometry(2.75, 1.7, 4),
    "#547e78",
    [0, 3.42, 0],
  );
  roof.rotation.y = Math.PI / 4;
  mesh(hut, "box", "#795e46", [0, 1.07, 1.62], [0.93, 2.12, 0.07]);
  mesh(hut, "box", "#b5d9c1", [-1, 1.6, 1.63], [0.6, 0.72, 0.06]);
  for (const x of [-1.34, -0.66])
    mesh(hut, "box", "#816444", [x, 1.6, 1.69], [0.045, 0.86, 0.08]);
  mesh(hut, "box", "#816444", [-1, 1.61, 1.69], [0.72, 0.055, 0.08]);
  mesh(hut, "box", "#dbc6a0", [-1, 1.17, 1.73], [0.8, 0.1, 0.3]);
  const awning = mesh(
    hut,
    "box",
    "#9bc5aa",
    [0.65, 2.25, 2.15],
    [1.8, 0.08, 1.25],
  );
  awning.rotation.x = 0.12;
  for (const x of [-0.15, 1.45])
    mesh(hut, "cylinder", "#977454", [x, 1.03, 2.72], [0.045, 2.06, 0.045]);
  mesh(hut, "box", "#9c7954", [0.65, 0.65, 2], [1.35, 0.12, 0.7]);
  for (let i = 0; i < 4; i++)
    mesh(
      hut,
      "box",
      i % 2 ? "#657d92" : "#b49767",
      [0.5, 0.77 + i * 0.085, 2],
      [0.5, 0.07, 0.35],
    );
  mesh(hut, "cylinder", "#dca950", [1.43, 1.94, 2.67], [0.11, 0.24, 0.11], {
    emissive: "#e4bd6e",
    emissiveIntensity: 0.5,
  });
  // Lake surface and concentric ripples, bordered with stones and reeds.
  const lake = mesh(
    scene,
    "cylinder",
    "#6aaeb8",
    [11, 0.012, -11],
    [3, 0.032, 3],
    { roughness: 0.3, metalness: 0.22 },
  );
  lake.castShadow = false;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    mesh(
      scene,
      "sphere",
      "#b0b5a0",
      [11 + Math.cos(a) * 3, 0.07, -11 + Math.sin(a) * 3],
      [0.42, 0.19, 0.32],
    );
  }
  for (let i = 0; i < 3; i++) {
    const ring = custom(
      scene,
      new T.TorusGeometry(0.8 + i * 0.5, 0.014, 5, 48),
      "#b8ded3",
      [11, 0.047 + i * 0.001, -11],
    );
    ring.rotation.x = -Math.PI / 2;
    dynamic.push({ mesh: ring, kind: "ripple", i });
  }
  // Open, walkable ruins frame the reward instead of an impassable building.
  for (const x of [-3.5, 3.5])
    for (const z of [-19, -22]) {
      mesh(scene, "cylinder", "#e4dcc0", [x, 0.15, z], [0.72, 0.3, 0.72]);
      mesh(scene, "cylinder", "#ddd8bb", [x, 1.8, z], [0.43, 3.3, 0.43]);
      mesh(scene, "cylinder", "#bfc5a7", [x, 3.4, z], [0.58, 0.17, 0.58]);
      mesh(scene, "box", "#e7dfc1", [x, 3.57, z], [1.13, 0.21, 1.13]);
      for (let i = 0; i < 5; i++)
        mesh(
          scene,
          "sphere",
          "#87a578",
          [x + 0.43, 1 + i * 0.38, z],
          [0.13, 0.2, 0.16],
        );
    }
  mesh(scene, "box", "#e8dfc0", [0, 3.75, -22], [7.9, 0.28, 0.85]);
  mesh(scene, "box", "#b6bda4", [0, 3.96, -22], [8.15, 0.1, 1]);
  const symbol = custom(
    scene,
    new T.OctahedronGeometry(0.35),
    "#c4e4c3",
    [0, 3.67, -21.47],
    { emissive: "#6fab9a", emissiveIntensity: 0.25 },
  );
  dynamic.push({ mesh: symbol, kind: "gem" });
  for (const object of FIELD_OBJECTS) {
    const g = group(scene, [object.x, 0, object.z]);
    objects.set(object.id, g);
    if (object.kind === "npc") {
      const actor = makeTraveler(art, {
        hair: "braid",
        hat: "ribbon",
        outfit: "trail",
        pack: "book",
      });
      actor.root.rotation.y = 0.35;
      g.add(actor.root);
      dynamic.push({ actor, kind: "npc" });
    } else if (object.kind === "flower") {
      for (let k = 0; k < 3; k++) {
        const f = group(g, [(k - 1) * 0.16, 0.02, Math.sin(k) * 0.12]);
        mesh(f, "cylinder", "#618e70", [0, 0.21, 0], [0.024, 0.42, 0.024]);
        const leaf = mesh(
          f,
          "sphere",
          "#7cb68b",
          [0.085, 0.19, 0],
          [0.12, 0.035, 0.047],
        );
        leaf.rotation.z = 0.35;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          mesh(
            f,
            "sphere",
            "#c6e8eb",
            [Math.cos(a) * 0.093, 0.46, Math.sin(a) * 0.093],
            [0.1, 0.047, 0.083],
            { emissive: "#659493", emissiveIntensity: 0.12 },
          );
        }
        mesh(f, "sphere", "#ffda7e", [0, 0.48, 0], [0.04, 0.035, 0.04]);
      }
      const gem = custom(
        g,
        new T.OctahedronGeometry(0.085),
        "#ffef9e",
        [0, 0.85, 0],
        { emissive: "#ffe38b", emissiveIntensity: 0.6 },
      );
      dynamic.push({ mesh: gem, kind: "gem" });
    } else if (object.kind === "beacon") {
      mesh(g, "cylinder", "#bcc4ac", [0, 0.14, 0], [0.42, 0.28, 0.42]);
      mesh(g, "cylinder", "#d8d5b6", [0, 0.7, 0], [0.2, 1.15, 0.2]);
      mesh(g, "cylinder", "#a4b29d", [0, 1.25, 0], [0.35, 0.13, 0.35]);
      const orb = custom(
        g,
        new T.OctahedronGeometry(0.23),
        "#779e9c",
        [0, 1.62, 0],
      );
      g.userData.orb = orb;
      const halo = custom(
        g,
        new T.TorusGeometry(0.37, 0.025, 6, 28),
        "#d8be75",
        [0, 1.64, 0],
      );
      halo.rotation.x = Math.PI / 2;
      dynamic.push({ mesh: orb, kind: "gem" });
    } else if (object.kind === "chest") {
      mesh(g, "box", "#886445", [0, 0.28, 0], [0.95, 0.5, 0.66]);
      const lid = group(g, [0, 0.51, -0.33]);
      g.userData.lid = lid;
      mesh(lid, "sphere", "#a47b4b", [0, 0.02, 0.33], [0.49, 0.25, 0.34]);
      for (const s of [-1, 1]) {
        mesh(g, "box", "#dec57b", [s * 0.32, 0.29, 0.34], [0.085, 0.53, 0.04]);
        mesh(
          lid,
          "box",
          "#dfc47a",
          [s * 0.32, 0.2, 0.32],
          [0.085, 0.025, 0.63],
        );
      }
      mesh(g, "box", "#edcf7d", [0, 0.36, 0.36], [0.16, 0.19, 0.065]);
    } else {
      mesh(g, "cylinder", "#a6b9a2", [0, 0.035, 0], [0.7, 0.07, 0.7]);
      const mark = custom(
        g,
        new T.OctahedronGeometry(0.13),
        "#f2dfab",
        [0, 0.85, 0],
        { emissive: "#ddca97", emissiveIntensity: 0.5 },
      );
      dynamic.push({ mesh: mark, kind: "gem" });
    }
  }
  return {
    objects,
    update(t, reduced, state) {
      for (const object of FIELD_OBJECTS) {
        const g = objects.get(object.id);
        if (object.kind === "flower")
          g.visible = !state.flowers.includes(object.id);
        if (object.kind === "beacon")
          g.userData.orb.material = mat(
            state.lit.includes(object.id) ? "#e9e7a4" : "#779e9c",
            {
              emissive: state.lit.includes(object.id) ? "#9ce1ba" : "#163438",
              emissiveIntensity: state.lit.includes(object.id) ? 0.8 : 0,
            },
          );
        if (object.kind === "chest")
          g.userData.lid.rotation.x = state.treasure ? -1.4 : 0;
      }
      for (const d of dynamic) {
        if (d.actor) d.actor.update(t, 0, 0, reduced);
        else if (d.kind === "gem") d.mesh.rotation.y = reduced ? 0 : t * 0.65;
        else if (d.kind === "ripple")
          d.mesh.scale.setScalar(
            reduced ? 1 : 1 + Math.sin(t * 0.65 + d.i) * 0.1,
          );
      }
      if (!reduced)
        for (let i = 0; i < trees.length; i++)
          trees[i].rotation.z = Math.sin(t * 0.65 + i) * 0.025;
    },
  };
}
