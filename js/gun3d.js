import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { createMaterials, createKit } from './three/kit.js';
import { buildAR } from './three/ar.js';
import { buildAK } from './three/ak.js';
import { buildBolt } from './three/bolt.js';
import { buildPistol } from './three/pistol.js';
import { FINISHES } from './data/index.js';

const BUILDERS = { ar15: buildAR, akm: buildAK, bolt: buildBolt, pistol: buildPistol };
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function radialTexture(inner, outer, stops = [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, inner, 128, 128, outer);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class GunViewer {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.selected = null;
    this.exploded = false;
    this.autoRotate = false;
    this.platformId = null;
    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(31, 1.5, 0.01, 50);
    this.camera.position.set(1.2, 0.5, 1.6);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.rotateSpeed = 0.62;
    this.controls.zoomSpeed = 0.7;
    this.controls.panSpeed = 0.5;
    this.controls.enablePan = false;
    this.controls.minDistance = 0.55;
    this.controls.maxDistance = 4.5;
    this.controls.minPolarAngle = 0.18;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.45;
    this.controls.target.set(0, 0.13, 0);
    this.controls.addEventListener('start', () => {
      if (this.autoRotate) {
        this.autoRotate = false;
        this.controls.autoRotate = false;
        this.callbacks.onAutoRotateChange?.(false);
      }
    });

    this._setupEnvironment();
    this._setupLights();
    this._setupStage();

    this.modelRoot = new THREE.Group();
    this.scene.add(this.modelRoot);
    this.buildRoot = null;
    this.groups = {};
    this.materials = null;

    this._raycaster = new THREE.Raycaster();
    this._pointer = new THREE.Vector2();
    this._down = null;
    this._bindPointer();

    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(canvas.parentElement);
    this.resize();

    this._tick = this._tick.bind(this);
    this._raf = requestAnimationFrame(this._tick);
  }

  _setupEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envScene = new RoomEnvironment();
    this.envMap = pmrem.fromScene(envScene, 0.04).texture;
    this.scene.environment = this.envMap;
    pmrem.dispose();
  }

  _setupLights() {
    const hemi = new THREE.HemisphereLight(0x9db3d4, 0x0a0c0e, 0.55);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff4e8, 3.3);
    key.position.set(1.6, 2.4, 2.0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -1.2;
    key.shadow.camera.right = 1.2;
    key.shadow.camera.top = 1.2;
    key.shadow.camera.bottom = -1.2;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 6;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.015;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x86a6ff, 1.05);
    fill.position.set(-2.2, 1.1, 1.4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xff6a30, 0.95);
    rim.position.set(-1.4, 1.2, -2.2);
    this.scene.add(rim);

    const backRim = new THREE.DirectionalLight(0x8fb6ff, 0.55);
    backRim.position.set(1.8, 1.4, -2.0);
    this.scene.add(backRim);

    const top = new THREE.SpotLight(0xffffff, 14, 4, 0.9, 0.9, 1.4);
    top.position.set(0.3, 2.2, 0.2);
    top.castShadow = false;
    this.scene.add(top);

    const warm = new THREE.PointLight(0xff6a2a, 0.16, 1.4, 2);
    warm.position.set(0.9, 0.5, -0.9);
    this.scene.add(warm);
  }

  _setupStage() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshBasicMaterial({ color: 0x0a0c10 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);

    // neutral studio pool keeps the stage readable without staining it orange
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ map: radialTexture(6, 210, [[0, 'rgba(58,66,77,0.82)'], [0.3, 'rgba(38,45,53,0.5)'], [0.62, 'rgba(17,21,26,0.24)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.001, 0);
    this.scene.add(pool);

    // low display plinth: gives the model a believable place to sit
    const plinth = new THREE.Mesh(
      new THREE.CircleGeometry(0.64, 96),
      new THREE.MeshBasicMaterial({ color: 0x101419, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    plinth.rotation.x = -Math.PI / 2;
    plinth.position.y = 0.002;
    this.scene.add(plinth);

    const plinthEdge = new THREE.Mesh(
      new THREE.RingGeometry(0.638, 0.642, 128),
      new THREE.MeshBasicMaterial({ color: 0xff6b2c, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }),
    );
    plinthEdge.rotation.x = -Math.PI / 2;
    plinthEdge.position.y = 0.003;
    this.scene.add(plinthEdge);

    // shadow-only catcher: lets the key light paint a crisp cast shadow
    const shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.22 }),
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = 0.006;
    shadowCatcher.receiveShadow = true;
    this.scene.add(shadowCatcher);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({ map: radialTexture(10, 190, [[0, 'rgba(255,92,26,0.035)'], [0.55, 'rgba(255,92,26,0.012)'], [1, 'rgba(255,92,26,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.002, 0);
    this.scene.add(glow);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: radialTexture(4, 128, [[0, 'rgba(0,0,0,0.82)'], [0.4, 'rgba(0,0,0,0.42)'], [0.72, 'rgba(0,0,0,0.12)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.009, 0);
    this.scene.add(shadow);
    this.contactShadow = shadow;

    const grid = new THREE.GridHelper(6.4, 96, 0x333a42, 0x1d2228);
    grid.position.y = 0.004;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    this.scene.add(grid);

    this.scene.fog = new THREE.Fog(0x080a0c, 3.2, 8.5);

    for (const [r, op] of [[0.66, 0.22], [0.7, 0.08], [1.08, 0.09], [1.12, 0.04]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.0025, 96), new THREE.MeshBasicMaterial({ color: 0xff6b2c, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.005;
      this.scene.add(ring);
    }

    // soft cool sweep behind the subject
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 4),
      new THREE.MeshBasicMaterial({ map: radialTexture(20, 160, [[0, 'rgba(48,62,82,0.12)'], [0.5, 'rgba(24,28,36,0.05)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }),
    );
    backdrop.position.set(0, 0.95, -2.4);
    this.scene.add(backdrop);

    const warmSweep = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 2.2),
      new THREE.MeshBasicMaterial({ map: radialTexture(20, 140, [[0, 'rgba(90,48,24,0.07)'], [0.6, 'rgba(40,24,16,0.025)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }),
    );
    warmSweep.position.set(0.35, 0.48, -2.2);
    this.scene.add(warmSweep);
  }

  _bindPointer() {
    const canvas = this.canvas;
    canvas.addEventListener('pointerdown', (e) => { this._down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    canvas.addEventListener('pointerup', (e) => {
      if (!this._down) return;
      const dx = e.clientX - this._down.x;
      const dy = e.clientY - this._down.y;
      const dist = Math.hypot(dx, dy);
      const dt = performance.now() - this._down.t;
      this._down = null;
      if (dist < 6 && dt < 500) {
        const slot = this._pick(e);
        if (slot) this.callbacks.onSlotClick?.(slot);
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const slot = this._pick(e);
      canvas.style.cursor = slot ? 'pointer' : 'grab';
      this.callbacks.onHover?.(slot, e.clientX, e.clientY);
    });
    canvas.addEventListener('pointerleave', () => this.callbacks.onHover?.(null));
    canvas.addEventListener('pointerdown', () => { canvas.style.cursor = 'grabbing'; });
    canvas.addEventListener('pointerup', () => { canvas.style.cursor = 'grab'; });
  }

  _pick(e) {
    if (!this.buildRoot) return null;
    const rect = this.canvas.getBoundingClientRect();
    this._pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this._raycaster.setFromCamera(this._pointer, this.camera);
    const hits = this._raycaster.intersectObject(this.buildRoot, true);
    for (const hit of hits) {
      let obj = hit.object;
      while (obj && !obj.userData.slot) obj = obj.parent;
      if (obj?.userData.slot) return obj.userData.slot;
    }
    return null;
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(platformId, parts, finishId) {
    const finish = FINISHES.find((f) => f.id === finishId) || FINISHES[0];
    const platformChanged = this.platformId !== platformId;
    this.platformId = platformId;

    if (this.buildRoot) {
      this.modelRoot.remove(this.buildRoot);
      this._disposeObject(this.buildRoot);
    }
    if (this.materials) {
      for (const m of Object.values(this.materials)) {
        if (m.map) m.map.dispose();
        m.dispose?.();
      }
    }
    if (this._boxHelper) { this.scene.remove(this._boxHelper); this._boxHelper.geometry.dispose(); this._boxHelper.material.dispose(); this._boxHelper = null; }

    this.materials = createMaterials(finish);
    const kit = createKit(this.materials);
    const built = BUILDERS[platformId](kit, parts, finish);
    this.buildRoot = built.root;
    this.groups = built.groups;
    for (const [slot, group] of Object.entries(this.groups)) {
      group.traverse((o) => { o.userData.slot = slot; });
    }
    this.modelRoot.add(this.buildRoot);

    const raw = new THREE.Box3().setFromObject(this.buildRoot);
    const center = raw.getCenter(new THREE.Vector3());
    this.buildRoot.position.set(-center.x, -raw.min.y + 0.008, -center.z);

    const box = new THREE.Box3().setFromObject(this.buildRoot);
    const size = box.getSize(new THREE.Vector3());
    this.modelSize = size;
    this.target = box.getCenter(new THREE.Vector3());
    this.radius = box.getBoundingSphere(new THREE.Sphere()).radius;

    // Anchor the soft contact shadow under whichever component touches the floor.
    let lowest = null;
    for (const group of Object.values(this.groups)) {
      const gb = new THREE.Box3().setFromObject(group);
      if (!gb.isEmpty() && (!lowest || gb.min.y < lowest.min.y)) lowest = gb;
    }
    if (this.contactShadow && lowest) {
      const c = lowest.getCenter(new THREE.Vector3());
      const s = lowest.getSize(new THREE.Vector3());
      this.contactShadow.position.set(c.x, 0.012, c.z);
      this.contactShadow.scale.set(clamp(s.x * 11, 0.55, 1.6), clamp(s.z * 9, 0.4, 0.95), 1);
      this.contactShadow.material.opacity = 0.92;
    }

    if (platformChanged) {
      this.controls.target.copy(this.target);
      this._fitCamera(this._dir('iso'), true);
      this.modelRoot.position.y = -0.16;
    }
    if (this.selected) this._makeHelper(this.selected);
    this._updateExplodeTargets();
  }

  _dir(name) {
    const dirs = {
      iso: new THREE.Vector3(0.26, 0.3, 1),
      side: new THREE.Vector3(0.015, 0.08, 1),
      top: new THREE.Vector3(0.015, 1, 0.14),
      front: new THREE.Vector3(1, 0.16, 0.16),
      reverse: new THREE.Vector3(-0.7, 0.3, 0.9),
    };
    return (dirs[name] || dirs.iso).clone().normalize();
  }

  _fitDistance(dirName = 'iso') {
    // Use the bounding sphere so the subject stays framed at any orbit angle.
    const radius = this.radius || 0.5;
    const fov = (this.camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(fov / 2) * Math.max(this.camera.aspect, 0.35));
    const halfMin = Math.min(fov, hFov) / 2;
    return clamp((radius / Math.sin(halfMin)) * 1.12, 0.9, 4.2);
  }

  _fitCamera(dirName, immediate = false) {
    const dir = this._dir(dirName);
    const dist = this._fitDistance(dirName);
    const to = this.target.clone().add(dir.multiplyScalar(dist));
    this.controls.minDistance = dist * 0.45;
    this.controls.maxDistance = dist * 2.4;
    if (immediate) {
      this.camera.position.copy(to);
      this.controls.target.copy(this.target);
      this.controls.update();
    } else {
      this.camTween = { from: this.camera.position.clone(), to, target: this.target.clone(), t: 0 };
    }
  }

  setView(name) {
    this.autoRotate = false;
    this.controls.autoRotate = false;
    this.callbacks.onAutoRotateChange?.(false);
    this._fitCamera(name);
  }

  setAutoRotate(on) {
    this.autoRotate = on;
    this.controls.autoRotate = on;
  }

  setExplode(on) {
    this.exploded = on;
    this._updateExplodeTargets();
  }

  _updateExplodeTargets() {
    for (const [slot, group] of Object.entries(this.groups)) {
      group.userData.targetPos = this.exploded ? group.userData.explode.clone() : new THREE.Vector3();
    }
  }

  setSelected(slot) {
    this.selected = slot;
    this._makeHelper(slot);
  }

  _makeHelper(slot) {
    if (this._boxHelper) {
      this.scene.remove(this._boxHelper);
      this._boxHelper.geometry.dispose();
      this._boxHelper.material.dispose();
      this._boxHelper = null;
    }
    const group = this.groups[slot];
    if (!group) return;
    const helper = new THREE.BoxHelper(group, 0xff6b2c);
    helper.material.transparent = true;
    helper.material.opacity = 0.85;
    helper.material.depthTest = false;
    helper.material.toneMapped = false;
    helper.renderOrder = 12;
    helper.update();
    this.scene.add(helper);
    this._boxHelper = helper;
  }

  capture() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  _disposeObject(obj) {
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of mats) {
          if (m.map) m.map.dispose();
          m.dispose?.();
        }
      }
    });
  }

  _tick() {
    this._raf = requestAnimationFrame(this._tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    if (this.modelRoot.position.y < 0) {
      this.modelRoot.position.y = Math.min(0, this.modelRoot.position.y + dt * 0.9);
    }

    for (const group of Object.values(this.groups)) {
      const target = group.userData.targetPos;
      if (target) group.position.lerp(target, Math.min(1, dt * 9));
    }

    if (this._boxHelper) {
      this._boxHelper.update();
      this._boxHelper.material.opacity = 0.55 + Math.sin(t * 3.4) * 0.25;
    }

    if (this.camTween) {
      const tw = this.camTween;
      tw.t = Math.min(1, tw.t + dt * 2.8);
      const e = 1 - Math.pow(1 - tw.t, 3);
      this.camera.position.lerpVectors(tw.from, tw.to, e);
      this.controls.target.lerpVectors(tw.target, this.target, e);
      if (tw.t >= 1) this.camTween = null;
    }

    if (this.contactShadow) {
      this.contactShadow.material.opacity = 0.9;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._resizeObserver.disconnect();
    this.controls.dispose();
    this._disposeObject(this.scene);
    this.renderer.dispose();
    this.envMap?.dispose();
  }
}
