import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";

const cache = new Map();
async function acquire(url) {
  let entry = cache.get(url);
  if (!entry) {
    entry = {
      refs: 0,
      promise: new GLTFLoader().loadAsync(url).then((gltf) => {
        gltf.scene.traverse((o) => {
          if (o.isSkinnedMesh) {
            const g = o.geometry,
              p = g.attributes.position,
              n = g.attributes.normal,
              sums = new Map(),
              keys = [];
            for (let i = 0; i < p.count; i++) {
              const key = [p.getX(i), p.getY(i), p.getZ(i)]
                .map((v) => Math.round(v * 100000))
                .join(",");
              keys.push(key);
              const sum = sums.get(key) ?? new THREE.Vector3();
              sum.add(new THREE.Vector3(n.getX(i), n.getY(i), n.getZ(i)));
              sums.set(key, sum);
            }
            for (let i = 0; i < n.count; i++) {
              const normal = sums.get(keys[i]).normalize();
              n.setXYZ(i, normal.x, normal.y, normal.z);
            }
            n.needsUpdate = true;
          }
          for (const m of o.material
            ? Array.isArray(o.material)
              ? o.material
              : [o.material]
            : []) {
            m.emissiveIntensity = 0.08;
            m.metalness = 0.02;
            m.roughness = Math.max(m.roughness ?? 0.7, 0.74);
            if ("specularIntensity" in m) m.specularIntensity = 0.18;
          }
        });
        return gltf;
      }),
    };
    cache.set(url, entry);
  }
  entry.refs++;
  try {
    const gltf = await entry.promise,
      scene = clone(gltf.scene);
    let released = false;
    return {
      scene,
      animations: gltf.animations,
      release: () => {
        if (released) return;
        released = true;
        scene.traverse((o) => {
          if (o.isSkinnedMesh) o.skeleton.dispose();
        });
        release(url, entry);
      },
    };
  } catch (error) {
    release(url, entry);
    throw error;
  }
}
function release(url, entry) {
  entry.refs--;
  if (entry.refs > 0) return;
  if (cache.get(url) === entry) cache.delete(url);
  entry.promise
    .then((gltf) => {
      const geometries = new Set(),
        materials = new Set(),
        textures = new Set();
      gltf.scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        for (const m of o.material
          ? Array.isArray(o.material)
            ? o.material
            : [o.material]
          : [])
          materials.add(m);
      });
      materials.forEach((m) => {
        for (const value of Object.values(m))
          if (value?.isTexture) textures.add(value);
        m.dispose();
      });
      geometries.forEach((g) => g.dispose());
      textures.forEach((t) => {
        t.source?.data?.close?.();
        t.dispose();
      });
    })
    .catch(() => {});
}
export function createModelStage(canvas, options, onReady, onError) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: !!options.capture,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(29, 1, 0.01, 30),
    root = new THREE.Group();
  scene.add(root);
  scene.add(new THREE.HemisphereLight("#fff8eb", "#bcc9d1", 1.35));
  const key = new THREE.DirectionalLight("#fff1de", 1.6);
  key.position.set(-2, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#d5e9ff", 0.9);
  rim.position.set(3, 2, -3);
  scene.add(rim);
  let current = { ...options },
    disposed = false,
    model = null,
    mixer = null,
    elapsed = 0,
    last = 0,
    dirty = true,
    visible = !document.hidden,
    yaw = 0,
    drag = null,
    generation = 0;
  let modelHandle = null;
  const extras = new Map(),
    pending = new Map();
  let headBone,
    handBone,
    hipBone,
    armBone,
    forearmBone,
    wave = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      dirty = true;
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    dirty = true;
    last = 0;
  });
  intersection.observe(canvas);
  const listeners = [];
  const listen = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    listeners.push(() => target.removeEventListener(type, fn, opts));
  };
  listen(document, "visibilitychange", () => {
    last = 0;
    dirty = true;
  });
  listen(canvas, "webglcontextlost", (e) => {
    e.preventDefault();
    onError("角色畫面暫時無法顯示，請重新載入。");
  });
  listen(canvas, "pointerdown", (e) => {
    if (!current.interactive) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, x: e.clientX, total: 0 };
  });
  listen(canvas, "pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    drag.total += Math.abs(dx);
    yaw += dx * 0.009;
    drag.x = e.clientX;
    dirty = true;
  });
  listen(canvas, "pointerup", () => {
    if (drag?.total < 5) wave = 1.8;
    drag = null;
  });
  listen(canvas, "pointercancel", () => {
    drag = null;
  });
  const configureCamera = () => {
    const portrait = !!current.portrait,
      center = portrait ? 1.49 : 0.87,
      distance = portrait ? 1.35 : 4.0;
    camera.position.set(
      Math.sin(yaw) * distance,
      portrait ? 1.5 : 1.06,
      Math.cos(yaw) * distance,
    );
    camera.lookAt(0, center, 0);
  };
  async function loadModel(url) {
    const gen = ++generation,
      handle = await acquire(url);
    if (disposed || gen !== generation) {
      handle.release();
      return;
    }
    const previous = model;
    mixer?.stopAllAction();
    if (previous) mixer?.uncacheRoot(previous);
    for (const extra of extras.values()) {
      extra.group.removeFromParent();
      extra.handle.release();
    }
    extras.clear();
    modelHandle?.release();
    modelHandle = handle;
    model = handle.scene;
    root.add(model);
    model.updateMatrixWorld(true);
    if (previous) root.remove(previous);
    const bones = [];
    model.traverse((o) => {
      if (o.isBone) bones.push(o);
      if (o.isMesh) {
        o.frustumCulled = false;
      }
    });
    const find = (patterns) =>
      bones.find((b) => patterns.some((pattern) => pattern.test(b.name)));
    headBone = find([/^head$/i, /:head$/i, /head$/i]);
    handBone = find([/lefthand$/i, /hand_l$/i, /hand\.l$/i]);
    hipBone = find([/^hips$/i]);
    armBone = find([
      /rightarm$/i,
      /rightupperarm$/i,
      /upperarm_r$/i,
      /upper_arm\.r$/i,
    ]);
    forearmBone = find([/rightforearm$/i, /rightlowerarm$/i, /lowerarm_r$/i]);
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      if (o.isSkinnedMesh) o.computeBoundingBox();
    });
    const bounds = new THREE.Box3().setFromObject(model),
      size = bounds.getSize(new THREE.Vector3());
    const scale = 1.7 / size.y;
    model.scale.multiplyScalar(scale);
    model.position.set(
      -((bounds.min.x + bounds.max.x) / 2) * scale,
      -bounds.min.y * scale,
      -((bounds.min.z + bounds.max.z) / 2) * scale,
    );
    model.updateMatrixWorld(true);
    mixer = new THREE.AnimationMixer(model);
    if (handle.animations.length && !current.bindPose) {
      const clip = handle.animations[0].clone();
      clip.tracks = clip.tracks.filter(
        (t) =>
          !t.name.endsWith(".scale") &&
          !t.name.endsWith(".position") &&
          !/^(Hips|Left(UpLeg|Leg|Foot|ToeBase)|Right(UpLeg|Leg|Foot|ToeBase))\./.test(
            t.name,
          ),
      );
      // Keep the generated idle's arm motion, with a restrained forward-facing head.
      for (const track of clip.tracks) {
        if (
          /^(Head|neck|Spine|Spine01|Spine02)\.quaternion$/.test(track.name)
        ) {
          const rest = bones.find(
            (b) => b.name === track.name.split(".")[0],
          ).quaternion;
          for (let i = 0; i < track.values.length; i += 4) {
            const q = new THREE.Quaternion().fromArray(track.values, i);
            q.copy(rest).slerp(
              new THREE.Quaternion().fromArray(track.values, i),
              0.075,
            );
            q.toArray(track.values, i);
          }
        }
      }
      mixer.clipAction(clip).play();
      mixer.update(0.1);
    }
    await syncExtras();
    if (disposed || gen !== generation) return;
    dirty = true;
    onReady({
      bones: bones.map((b) => b.name),
      animations: handle.animations.map((a) => a.name),
    });
  }
  async function syncExtras() {
    for (const [slot, spec] of Object.entries(current.accessories ?? {})) {
      const existing = extras.get(slot);
      if (existing && existing.url === spec?.url) {
        existing.group.visible = !!spec;
        continue;
      }
      if (existing) {
        existing.group.removeFromParent();
        existing.handle.release();
        extras.delete(slot);
      }
      if (!spec?.url || !model) continue;
      const request = Symbol(slot);
      pending.set(slot, request);
      const expectedModel = model,
        handle = await acquire(spec.url);
      if (
        disposed ||
        pending.get(slot) !== request ||
        expectedModel !== model ||
        current.accessories?.[slot]?.url !== spec.url
      ) {
        handle.release();
        continue;
      }
      const object = handle.scene,
        group = new THREE.Group();
      group.add(object);
      object.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(object),
        size = bounds.getSize(new THREE.Vector3());
      object.position.sub(bounds.getCenter(new THREE.Vector3()));
      const attach =
        slot === "hat" ? headBone : spec.anchor === "hand" ? handBone : hipBone;
      group.scale.setScalar(spec.width / size.x);
      group.scale.y *= spec.scaleY ?? 1;
      group.rotation.set(...(spec.rotation ?? [0, 0, 0]));
      if (attach) {
        attach.updateWorldMatrix(true, false);
        const anchor = attach.getWorldPosition(new THREE.Vector3());
        group.position
          .copy(anchor)
          .add(new THREE.Vector3(...(spec.position ?? [0, 0, 0])));
        root.add(group);
        group.updateMatrixWorld(true);
        attach.attach(group);
      } else {
        group.position.set(...(spec.position ?? [0, 1.7, 0]));
        root.add(group);
      }
      pending.delete(slot);
      extras.set(slot, { group, handle, url: spec.url });
      dirty = true;
    }
    for (const [slot, extra] of extras)
      if (!current.accessories?.[slot]) {
        extra.group.removeFromParent();
        extra.handle.release();
        extras.delete(slot);
      }
  }
  function aim(bone, child, direction, weight) {
    bone.parent.updateWorldMatrix(true, false);
    const parent = bone.parent
      .getWorldQuaternion(new THREE.Quaternion())
      .invert();
    const target = direction.normalize().applyQuaternion(parent);
    const currentDirection = child.position
      .clone()
      .normalize()
      .applyQuaternion(bone.quaternion);
    const rotation = new THREE.Quaternion()
      .setFromUnitVectors(currentDirection, target)
      .multiply(bone.quaternion);
    bone.quaternion.slerp(rotation, weight);
    bone.updateWorldMatrix(false, true);
  }
  const api = {
    async update(next) {
      const changed = next.url !== current.url;
      if (next.reduced && !current.reduced) {
        mixer?.setTime(0.1);
        wave = 0;
      }
      current = next;
      dirty = true;
      if (next.greet !== options.greet) {
        wave = 1.8;
        options = { ...options, greet: next.greet };
      }
      if (changed) await loadModel(next.url);
      else await syncExtras();
      return !!model;
    },
    rotate(angle) {
      yaw += angle;
      dirty = true;
    },
    greet() {
      wave = 1.8;
      dirty = true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      generation++;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      intersection.disconnect();
      listeners.forEach((off) => off());
      mixer?.stopAllAction();
      mixer?.uncacheRoot(model);
      modelHandle?.release();
      for (const e of extras.values()) e.handle.release();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
  resize();
  configureCamera();
  renderer.setAnimationLoop((now) => {
    if (disposed || document.hidden || !visible) {
      last = 0;
      return;
    }
    const dt = Math.min(last ? (now - last) / 1000 : 0.016, 0.05);
    last = now;
    if (!dirty && current.reduced) return;
    elapsed += dt;
    if (!current.reduced) {
      mixer?.update(dt);
      wave = Math.max(0, wave - dt);
    }
    if (wave > 0 && !current.reduced && armBone && forearmBone) {
      const weight = Math.min(1, wave * 4, (1.8 - wave) * 4);
      aim(armBone, forearmBone, new THREE.Vector3(-0.4, -0.85, 0.1), weight);
      const wrist = forearmBone.children.find((b) => b.isBone);
      if (wrist)
        aim(
          forearmBone,
          wrist,
          new THREE.Vector3(Math.sin(elapsed * 9) * 0.13, 1, 0.12),
          weight,
        );
    }
    configureCamera();
    renderer.render(scene, camera);
    dirty = false;
  });
  api.ready = loadModel(current.url).catch((error) => {
    if (!disposed) onError(error.message);
  });
  return api;
}
