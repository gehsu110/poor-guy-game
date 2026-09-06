import * as T from "three";

// One original articulated model. Every slot attaches to the same pivots in all views.
export function makeArt() {
  const materials = new Map(),
    geometries = new Map(),
    customGeometries = new Set();
  const mat = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!materials.has(key))
      materials.set(
        key,
        new T.MeshStandardMaterial({
          color,
          roughness: 0.83,
          metalness: 0,
          ...extra,
        }),
      );
    return materials.get(key);
  };
  const geo = (type) => {
    if (!geometries.has(type))
      geometries.set(
        type,
        type === "sphere"
          ? new T.SphereGeometry(1, 20, 14)
          : type === "box"
            ? new T.BoxGeometry(1, 1, 1)
            : type === "cone"
              ? new T.ConeGeometry(1, 1, 12)
              : new T.CylinderGeometry(1, 1, 1, 16),
      );
    return geometries.get(type);
  };
  const mesh = (
    parent,
    type,
    color,
    pos = [0, 0, 0],
    scale = [1, 1, 1],
    extra = {},
  ) => {
    const m = new T.Mesh(geo(type), mat(color, extra));
    m.position.set(...pos);
    m.scale.set(...scale);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const custom = (parent, geometry, color, pos = [0, 0, 0], extra = {}) => {
    customGeometries.add(geometry);
    const m = new T.Mesh(geometry, mat(color, extra));
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const group = (parent, pos = [0, 0, 0]) => {
    const g = new T.Group();
    g.position.set(...pos);
    parent.add(g);
    return g;
  };
  return {
    mat,
    mesh,
    custom,
    group,
    shared: { has: (g) => [...geometries.values()].includes(g) },
    dispose() {
      for (const g of geometries.values()) g.dispose();
      for (const g of customGeometries) g.dispose();
      for (const m of materials.values()) m.dispose();
    },
  };
}
export function makeTraveler(art, look = {}, reward = {}) {
  const { mesh, custom, group } = art,
    root = new T.Group(),
    body = group(root),
    head = group(body, [0, 1.83, 0]);
  const skin = "#f3c6a8",
    hair = look.hair === "braid" ? "#634130" : "#633d32",
    dark = "#253747",
    gold = "#e2b65f",
    cream = "#fff0cf";
  const star = look.outfit === "star",
    trail = look.outfit === "trail";
  const cloth = star ? "#414773" : trail ? "#d4bea0" : "#78bca3";
  // Fitted tunic, collar, belt and layered tails have separate geometry, not recolored full-body art.
  custom(body, new T.CylinderGeometry(0.25, 0.29, 0.52, 12), dark, [0, 1.2, 0]);
  mesh(body, "sphere", cream, [0, 1.48, 0.015], [0.245, 0.11, 0.18]);
  mesh(body, "box", cream, [0, 1.24, 0.198], [0.13, 0.43, 0.032]);
  mesh(body, "cylinder", "#6b4736", [0, 0.99, 0], [0.3, 0.095, 0.21]);
  mesh(body, "box", gold, [0, 0.99, 0.22], [0.105, 0.09, 0.035]);
  mesh(body, "box", dark, [0, 0.99, 0.244], [0.057, 0.044, 0.014]);
  for (const sign of [-1, 1]) {
    const lapel = mesh(
      body,
      "box",
      cloth,
      [sign * 0.13, 1.32, 0.19],
      [0.16, 0.41, 0.08],
    );
    lapel.rotation.z = sign * -0.2;
    mesh(
      body,
      "sphere",
      gold,
      [sign * 0.15, 1.18, 0.245],
      [0.023, 0.023, 0.012],
    );
    mesh(
      body,
      "sphere",
      gold,
      [sign * 0.15, 1.07, 0.245],
      [0.023, 0.023, 0.012],
    );
    custom(
      body,
      new T.CylinderGeometry(0.17, 0.22, 0.34, 12),
      trail ? dark : cloth,
      [sign * 0.155, 0.87, 0],
    );
  }
  const cape = group(body, [0, 1.49, -0.15]);
  if (!trail) {
    const shape = new T.Shape();
    shape.moveTo(-0.3, 0);
    shape.quadraticCurveTo(-0.36, -0.38, -0.45, -0.7);
    shape.lineTo(-0.13, -0.63);
    shape.lineTo(0, -0.77);
    shape.lineTo(0.13, -0.63);
    shape.lineTo(0.45, -0.7);
    shape.quadraticCurveTo(0.36, -0.38, 0.3, 0);
    shape.closePath();
    custom(
      cape,
      new T.ExtrudeGeometry(shape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelThickness: 0.022,
        bevelSize: 0.025,
        bevelSegments: 2,
        steps: 1,
      }),
      cloth,
    );
    mesh(cape, "box", gold, [0, -0.37, 0.067], [0.019, 0.57, 0.014]);
    for (const s of [-1, 1]) {
      const shoulder = mesh(
        body,
        "sphere",
        cloth,
        [s * 0.24, 1.43, 0],
        [0.22, 0.15, 0.255],
      );
      shoulder.rotation.z = s * -0.15;
    }
  } else {
    for (const s of [-1, 1]) {
      const tail = mesh(
        cape,
        "box",
        cloth,
        [s * 0.2, -0.47, 0],
        [0.31, 0.83, 0.08],
      );
      tail.rotation.z = s * 0.13;
      mesh(body, "box", cloth, [s * 0.21, 1.17, -0.005], [0.13, 0.59, 0.39]);
      mesh(body, "box", gold, [s * 0.277, 1.05, 0.2], [0.018, 0.27, 0.025]);
    }
  }
  const legs = [],
    arms = [],
    knees = [];
  for (const s of [-1, 1]) {
    const leg = group(body, [s * 0.15, 0.79, 0]);
    legs.push(leg);
    mesh(leg, "sphere", skin, [0, -0.14, 0], [0.1, 0.23, 0.11]);
    mesh(leg, "cylinder", cream, [0, -0.3, 0], [0.095, 0.18, 0.095]);
    const knee = group(leg, [0, -0.36, 0]);
    knees.push(knee);
    mesh(knee, "cylinder", "#624536", [0, -0.18, 0], [0.11, 0.33, 0.115]);
    mesh(knee, "cylinder", "#b89568", [0, -0.045, 0], [0.12, 0.065, 0.124]);
    mesh(knee, "sphere", "#654432", [0, -0.34, 0.065], [0.123, 0.09, 0.21]);
    mesh(knee, "box", "#423733", [0, -0.4, 0.045], [0.245, 0.06, 0.33]);
    for (let i = 0; i < 3; i++)
      mesh(
        knee,
        "box",
        "#d7b47e",
        [0, -0.16 - i * 0.045, 0.116],
        [0.1, 0.016, 0.015],
      );
    const arm = group(body, [s * 0.33, 1.41, 0]);
    arms.push(arm);
    mesh(
      arm,
      "sphere",
      trail ? cloth : dark,
      [s * 0.025, -0.15, 0],
      [0.11, 0.23, 0.12],
    );
    mesh(arm, "sphere", cream, [s * 0.03, -0.31, 0], [0.112, 0.07, 0.123]);
    mesh(arm, "sphere", skin, [s * 0.025, -0.43, 0], [0.077, 0.135, 0.085]);
    mesh(
      arm,
      "sphere",
      "#765444",
      [s * 0.025, -0.41, 0.01],
      [0.083, 0.09, 0.09],
    );
    mesh(arm, "sphere", skin, [s * 0.025, -0.49, 0.015], [0.076, 0.072, 0.071]);
  }
  mesh(body, "cylinder", skin, [0, 1.61, 0], [0.082, 0.19, 0.082]);
  mesh(head, "sphere", skin, [0, 0, 0.018], [0.276, 0.31, 0.248]);
  for (const s of [-1, 1])
    mesh(head, "sphere", skin, [s * 0.27, -0.015, 0], [0.055, 0.078, 0.05]);
  // Sculpted hair cap and tapered individual fringe locks.
  const cap = custom(
    head,
    new T.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hair,
    [0, 0.035, -0.015],
  );
  cap.scale.set(0.292, 0.315, 0.269);
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.073,
      length = 0.15 + 0.08 * Math.sin(i * 1.2);
    const lock = mesh(
      head,
      "sphere",
      i % 2 ? hair : "#744939",
      [x, 0.16 - length * 0.15, 0.212 - Math.abs(x) * 0.22],
      [0.079, length, 0.063],
    );
    lock.rotation.z = -0.3 + i * 0.055;
  }
  for (const s of [-1, 1]) {
    const lock = mesh(
      head,
      "sphere",
      hair,
      [s * 0.254, -0.06, -0.01],
      [0.084, 0.26, 0.19],
    );
    lock.rotation.z = s * -0.1;
    mesh(
      head,
      "sphere",
      "#bf8056",
      [s * 0.27, -0.09, 0.163],
      [0.021, 0.16, 0.018],
    );
  }
  const braid = group(head, [0.12, -0.12, -0.21]);
  if (look.hair === "braid") {
    for (let i = 0; i < 6; i++)
      mesh(
        braid,
        "sphere",
        i % 2 ? hair : "#79513b",
        [Math.sin(i * 2.6) * 0.025, -i * 0.115, -0.025 * i],
        [0.089 - i * 0.008, 0.11, 0.075],
      );
    mesh(braid, "sphere", gold, [0, -0.56, -0.13], [0.07, 0.035, 0.07]);
  } else mesh(head, "sphere", hair, [0, -0.08, -0.15], [0.24, 0.235, 0.12]);
  // Large almond eyes with iris, lashes and highlights; face is visible from oblique camera views.
  const eyes = [];
  for (const s of [-1, 1]) {
    const eye = group(head, [s * 0.108, -0.011, 0.24]);
    eyes.push(eye);
    const outline = mesh(
      eye,
      "sphere",
      "#402e35",
      [0, 0, 0],
      [0.082, 0.1, 0.016],
    );
    outline.rotation.z = s * -0.1;
    mesh(eye, "sphere", "#fff6e8", [0, -0.004, 0.008], [0.069, 0.085, 0.013]);
    mesh(
      eye,
      "sphere",
      star ? "#a78ac3" : "#468c85",
      [s * -0.007, -0.009, 0.019],
      [0.042, 0.068, 0.012],
    );
    mesh(
      eye,
      "sphere",
      "#243343",
      [s * -0.007, -0.009, 0.029],
      [0.022, 0.05, 0.008],
    );
    mesh(
      eye,
      "sphere",
      "#ffffff",
      [-0.02, 0.024, 0.036],
      [0.015, 0.019, 0.006],
    );
    mesh(
      eye,
      "sphere",
      "#d8fff0",
      [0.018, -0.04, 0.034],
      [0.008, 0.009, 0.005],
    );
    const lash = mesh(
      eye,
      "box",
      "#402e35",
      [s * 0.063, 0.055, 0.005],
      [0.055, 0.022, 0.019],
    );
    lash.rotation.z = s * 0.43;
    const brow = mesh(
      head,
      "sphere",
      hair,
      [s * 0.107, 0.107, 0.245],
      [0.066, 0.013, 0.012],
    );
    brow.rotation.z = s * -0.13;
    mesh(
      head,
      "sphere",
      "#edab95",
      [s * 0.18, -0.116, 0.205],
      [0.054, 0.023, 0.01],
    );
  }
  mesh(head, "sphere", "#e5aa8c", [0, -0.09, 0.267], [0.025, 0.025, 0.026]);
  const smile = custom(
    head,
    new T.TorusGeometry(0.035, 0.008, 5, 16, Math.PI * 0.68),
    "#a26161",
    [0, -0.151, 0.236],
  );
  smile.rotation.z = Math.PI * 1.16;
  const hat = group(head, [0, 0.26, -0.008]);
  if (look.hat === "beret") {
    mesh(hat, "sphere", cream, [0.025, 0.044, -0.016], [0.337, 0.119, 0.296]);
    const band = mesh(
      hat,
      "cylinder",
      "#c5a778",
      [0, -0.004, 0],
      [0.289, 0.04, 0.259],
    );
    band.rotation.z = -0.06;
    mesh(hat, "sphere", cream, [0.027, 0.146, -0.008], [0.04, 0.033, 0.035]);
    const badge = mesh(
      hat,
      "sphere",
      gold,
      [0.183, 0.043, 0.218],
      [0.05, 0.051, 0.018],
    );
    badge.rotation.z = 0.3;
  } else if (look.hat === "ribbon") {
    for (const s of [-1, 1]) {
      const ribbon = mesh(
        hat,
        "sphere",
        cloth,
        [s * 0.23, 0.025, 0],
        [0.142, 0.073, 0.045],
      );
      ribbon.rotation.z = s * 0.55;
    }
    mesh(hat, "sphere", gold, [0, 0.02, 0.245], [0.035, 0.035, 0.02]);
  }
  const brooch = group(body, [0.015, 1.43, 0.278]);
  brooch.visible = !!reward.wearingBrooch;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    mesh(
      brooch,
      "sphere",
      "#c0f3df",
      [Math.cos(a) * 0.049, Math.sin(a) * 0.049, 0],
      [0.039, 0.024, 0.015],
    );
  }
  mesh(brooch, "sphere", gold, [0, 0, 0.021], [0.03, 0.03, 0.015], {
    emissive: "#866124",
    emissiveIntensity: 0.2,
  });
  const bag = group(body, [0.3, 1.05, -0.02]);
  if (look.pack === "satchel") {
    mesh(bag, "box", "#936344", [0.034, -0.09, 0.035], [0.22, 0.28, 0.21]);
    mesh(bag, "sphere", "#ac7a50", [0.034, 0.025, 0.059], [0.125, 0.05, 0.115]);
    mesh(bag, "box", gold, [0.04, -0.052, 0.148], [0.045, 0.053, 0.017]);
    const strap = mesh(
      body,
      "box",
      "#936344",
      [0.025, 1.24, 0.243],
      [0.035, 0.5, 0.023],
    );
    strap.rotation.z = -0.66;
  } else if (look.pack === "book") {
    const book = mesh(
      bag,
      "box",
      star ? "#886cad" : "#31586a",
      [0.03, -0.13, 0.095],
      [0.2, 0.28, 0.09],
    );
    book.rotation.z = -0.13;
    mesh(bag, "box", cream, [0.03, -0.13, 0.095], [0.179, 0.246, 0.098]);
    mesh(bag, "box", gold, [0.03, -0.13, 0.15], [0.053, 0.081, 0.012]);
  }
  const wisp = group(root, [0.75, 1.45, -0.3]);
  wisp.visible = !!reward.followingWisp;
  mesh(wisp, "sphere", "#b5fff0", [0, 0, 0], [0.14, 0.17, 0.13], {
    emissive: "#51bca7",
    emissiveIntensity: 0.7,
  });
  for (const s of [-1, 1]) {
    const wing = mesh(
      wisp,
      "sphere",
      "#e8fff7",
      [s * 0.19, 0.035, 0],
      [0.16, 0.05, 0.035],
    );
    wing.rotation.z = s * 0.45;
    mesh(
      wisp,
      "sphere",
      "#2d666a",
      [s * 0.04, 0.015, 0.12],
      [0.016, 0.023, 0.009],
    );
  }
  let previousTime = 0,
    phase = 0;
  return {
    root,
    update(t, speed = 0, jump = 0, reduced = false, gesture = 0) {
      phase += Math.min(t - previousTime, 0.05) * speed * 2.9;
      previousTime = t;
      const walk = Math.min(speed / 3.1, 1),
        swing = Math.sin(phase) * 0.65 * walk;
      legs[0].rotation.x = swing;
      legs[1].rotation.x = -swing;
      knees[0].rotation.x = Math.max(0, -swing) * 0.8;
      knees[1].rotation.x = Math.max(0, swing) * 0.8;
      arms[0].rotation.x = -swing * 0.7;
      arms[1].rotation.x = swing * 0.7;
      arms[1].rotation.z = gesture > 0 ? -1.8 + Math.sin(t * 15) * 0.16 : 0;
      body.position.y =
        jump +
        (reduced
          ? 0
          : Math.abs(Math.sin(phase)) * 0.035 * walk +
            Math.sin(t * 2) * 0.007 * (1 - walk));
      body.rotation.z = Math.sin(phase) * 0.018 * walk;
      cape.rotation.x =
        -0.06 - walk * 0.17 + (reduced ? 0 : Math.sin(t * 3) * 0.028);
      braid.rotation.x = walk * 0.2 + (reduced ? 0 : Math.sin(t * 2) * 0.05);
      head.rotation.y = reduced ? 0 : Math.sin(t * 0.62) * 0.04 * (1 - walk);
      for (const eye of eyes)
        eye.scale.y = !reduced && t % 4.7 < 0.12 ? 0.12 : 1;
      wisp.position.set(
        0.7 + Math.sin(t * 1.4) * 0.1,
        1.4 + (reduced ? 0 : Math.sin(t * 2) * 0.09),
        -0.3,
      );
    },
  };
}
