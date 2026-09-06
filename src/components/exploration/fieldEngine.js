import * as T from "three";
import { makeArt, makeTraveler } from "./character.js";
import { buildScenery } from "./scenery.js";
import { SPAWN, fieldPath, slideMove } from "./fieldLayout.js";
import { FIELD_OBJECTS, objectAvailable } from "../../game/exploration.js";

export function createField(
  canvas,
  initial,
  onFrame,
  onInteract,
  onError,
  studio = false,
) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: studio,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new T.Scene(),
    art = makeArt();
  let config = initial,
    scenery;
  if (studio) {
    scene.add(new T.HemisphereLight("#e7f6ff", "#687e85", 2.8));
    const light = new T.DirectionalLight("#ffeaca", 3.2);
    light.position.set(-3, 5, 5);
    scene.add(light);
    const rim = new T.DirectionalLight("#a8e6e9", 2);
    rim.position.set(3, 2, -3);
    scene.add(rim);
    const plinth = art.mesh(
      scene,
      "cylinder",
      "#42696e",
      [0, -0.09, 0],
      [0.85, 0.18, 0.85],
    );
    plinth.receiveShadow = true;
    art.custom(
      scene,
      new T.TorusGeometry(0.77, 0.018, 6, 64),
      "#d7bd78",
      [0, 0.012, 0],
    ).rotation.x = Math.PI / 2;
  } else scenery = buildScenery(scene, art);
  let actor = makeTraveler(art, config.look, config.field);
  scene.add(actor.root);
  const camera = new T.PerspectiveCamera(studio ? 32 : 48, 1, 0.1, 110);
  const position = { ...(initial.position ?? SPAWN) };
  const controls = { x: 0, z: 0, run: false },
    keys = new Set();
  let yaw = studio ? -0.2 : 0,
    pitch = 0.39,
    path = [],
    target = null,
    paused = !!config.paused,
    needsFrame = true;
  let time = 0,
    last = 0,
    lastHud = 0,
    velocityY = 0,
    jumpY = 0,
    gestureUntil = 0,
    rotation = 0,
    disposed = false;
  const forward = new T.Vector3(),
    lookAt = new T.Vector3(),
    cameraGoal = new T.Vector3();
  const ray = new T.Raycaster(),
    plane = new T.Plane(new T.Vector3(0, 1, 0), 0),
    point = new T.Vector3();
  const listeners = [];
  const listen = (element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    listeners.push(() => element.removeEventListener(event, handler, options));
  };
  const reset = () => {
    keys.clear();
    controls.x = 0;
    controls.z = 0;
    controls.run = false;
  };
  const nearest = () =>
    FIELD_OBJECTS.filter((o) => objectAvailable(o, config.field))
      .map((o) => ({
        ...o,
        distance: Math.hypot(position.x - o.x, position.z - o.z),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
  const interact = () => {
    const item = nearest();
    if (!paused && !studio && item?.distance < 1.8) {
      gestureUntil = time + 0.65;
      onInteract(item.id);
    }
  };
  const hop = () => {
    if (!paused && jumpY === 0) velocityY = 4.5;
  };
  const keydown = (e) => {
    if (
      paused ||
      studio ||
      e.target.closest('input,textarea,select,button,[role="dialog"]')
    )
      return;
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ShiftLeft",
        "ShiftRight",
        "Space",
        "KeyE",
      ].includes(e.code)
    ) {
      e.preventDefault();
      keys.add(e.code);
      if (e.code === "KeyE" && !e.repeat) interact();
      if (e.code === "Space" && !e.repeat) hop();
    }
  };
  listen(window, "keydown", keydown);
  listen(window, "keyup", (e) => keys.delete(e.code));
  listen(window, "blur", reset);
  listen(document, "visibilitychange", () => {
    reset();
    needsFrame = true;
    last = 0;
  });
  let pointer = null;
  listen(canvas, "pointerdown", (e) => {
    if (paused) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(e.pointerId);
    pointer = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: 0,
    };
  });
  listen(canvas, "pointermove", (e) => {
    if (!pointer || pointer.id !== e.pointerId || paused) return;
    const dx = e.clientX - pointer.x,
      dy = e.clientY - pointer.y;
    pointer.moved += Math.abs(dx) + Math.abs(dy);
    yaw -= dx * 0.006;
    pitch = T.MathUtils.clamp(pitch + dy * 0.003, 0.18, 0.9);
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    needsFrame = true;
  });
  listen(canvas, "pointerup", (e) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    if (pointer.moved < 8 && !studio && !paused) {
      const rect = canvas.getBoundingClientRect();
      ray.setFromCamera(
        new T.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      if (ray.ray.intersectPlane(plane, point)) {
        path = fieldPath(position, point);
        target = null;
      }
    }
    pointer = null;
  });
  listen(canvas, "pointercancel", () => {
    pointer = null;
  });
  listen(canvas, "webglcontextlost", (e) => {
    e.preventDefault();
    onError("3D 畫面暫停了，可以重新載入或使用文字探索。");
  });
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (width && height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      needsFrame = true;
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  const cameraPosition = (snap = false) => {
    if (studio) {
      camera.position.set(Math.sin(yaw) * 4.7, 2.25, Math.cos(yaw) * 4.7);
      camera.lookAt(0, 1.23, 0);
      return;
    }
    const distance = camera.aspect < 0.8 ? 6.9 : 6;
    lookAt.set(position.x, 1.05, position.z);
    cameraGoal.set(
      position.x + Math.sin(yaw) * distance * Math.cos(pitch),
      1.05 + Math.sin(pitch) * distance,
      position.z + Math.cos(yaw) * distance * Math.cos(pitch),
    );
    if (snap || config.reduced) camera.position.copy(cameraGoal);
    else camera.position.lerp(cameraGoal, 0.16);
    camera.lookAt(lookAt);
  };
  cameraPosition(true);
  const frame = (now) => {
    if (disposed || document.hidden) {
      last = 0;
      return;
    }
    if (paused && !studio && !needsFrame) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
    last = now;
    time += dt;
    let speed = 0;
    if (!paused && !studio) {
      let x =
        controls.x +
        (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
        (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
      let z =
        controls.z +
        (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) -
        (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0);
      if (Math.hypot(x, z) > 0.08) {
        path = [];
        target = null;
        forward.set(
          x * Math.cos(yaw) + z * Math.sin(yaw),
          0,
          -x * Math.sin(yaw) + z * Math.cos(yaw),
        );
      } else if (
        path.length &&
        target &&
        Math.hypot(
          position.x - FIELD_OBJECTS.find((o) => o.id === target).x,
          position.z - FIELD_OBJECTS.find((o) => o.id === target).z,
        ) < 1.25
      ) {
        path = [];
        target = null;
        forward.set(0, 0, 0);
      } else if (path.length) {
        const next = path[0],
          dx = next.x - position.x,
          dz = next.z - position.z;
        if (Math.hypot(dx, dz) < 0.18) path.shift();
        forward.set(dx, 0, dz);
      } else forward.set(0, 0, 0);
      if (forward.length() > 0.08) {
        speed =
          controls.run || keys.has("ShiftLeft") || keys.has("ShiftRight")
            ? 4.3
            : 2.7;
        forward.normalize().multiplyScalar(speed * dt);
        const next = slideMove(position, forward.x, forward.z),
          actual = Math.hypot(next.x - position.x, next.z - position.z);
        if (actual < 0.0001) {
          path = [];
          target = null;
          speed = 0;
        } else {
          rotation = Math.atan2(next.x - position.x, next.z - position.z);
          Object.assign(position, next);
        }
      }
      if (jumpY > 0 || velocityY > 0) {
        velocityY -= 11 * dt;
        jumpY = Math.max(0, jumpY + velocityY * dt);
        if (jumpY === 0) velocityY = 0;
      }
    }
    actor.root.position.set(
      studio ? 0 : position.x,
      0,
      studio ? 0 : position.z,
    );
    if (!studio)
      actor.root.rotation.y +=
        Math.atan2(
          Math.sin(rotation - actor.root.rotation.y),
          Math.cos(rotation - actor.root.rotation.y),
        ) * Math.min(1, dt * 14);
    actor.update(
      time,
      speed,
      config.reduced ? 0 : jumpY,
      config.reduced,
      gestureUntil - time,
    );
    scenery?.update(time, config.reduced, config.field);
    cameraPosition(needsFrame);
    renderer.render(scene, camera);
    needsFrame = false;
    if (!studio && now - lastHud > 120) {
      const n = nearest();
      let marker = null;
      if (n && n.distance < 4) {
        const screen = new T.Vector3(
          n.x,
          n.kind === "npc" ? 2.6 : 1.5,
          n.z,
        ).project(camera);
        if (screen.z < 1 && Math.abs(screen.x) < 1 && Math.abs(screen.y) < 1)
          marker = {
            x: (screen.x + 1) * 50,
            y: (1 - screen.y) * 50,
            id: n.id,
            name: n.name,
          };
      }
      onFrame({
        position: { ...position },
        nearest: n?.distance < 1.8 ? n : null,
        marker,
        traveling: path.length > 0,
        target,
        yaw,
      });
      lastHud = now;
    }
  };
  renderer.setAnimationLoop(frame);
  return {
    setConfig(next) {
      const changed =
        JSON.stringify(config.look) !== JSON.stringify(next.look) ||
        config.field.wearingBrooch !== next.field.wearingBrooch ||
        config.field.followingWisp !== next.field.followingWisp;
      config = next;
      paused = !!next.paused;
      if (paused) {
        reset();
        path = [];
        target = null;
      }
      if (changed) {
        scene.remove(actor.root);
        disposeCustom(actor.root);
        actor = makeTraveler(art, next.look, next.field);
        scene.add(actor.root);
      }
      needsFrame = true;
    },
    input(x, z) {
      if (!paused) {
        controls.x = x;
        controls.z = z;
      }
    },
    run(value) {
      controls.run = value;
    },
    jump: hop,
    interact,
    travel(id) {
      if (paused) return;
      const object = FIELD_OBJECTS.find((o) => o.id === id);
      if (object) {
        path = fieldPath(position, object);
        target = id;
      }
    },
    stop() {
      path = [];
      target = null;
      reset();
    },
    rotate(amount) {
      yaw += amount;
      needsFrame = true;
    },
    center() {
      yaw = 0;
      pitch = 0.39;
      needsFrame = true;
    },
    pose() {
      gestureUntil = time + 1.7;
      needsFrame = true;
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      listeners.forEach((off) => off());
      reset();
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material) materials.add(o.material);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      art.dispose();
      renderer.dispose();
    },
  };
  function disposeCustom(root) {
    root.traverse((o) => {
      if (o.geometry && !art.shared.has(o.geometry)) o.geometry.dispose();
    });
  }
}
