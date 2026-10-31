import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../vendor/RoundedBoxGeometry.js';

/* ------------------------------------------------------------------ */
/*  Materials                                                          */
/* ------------------------------------------------------------------ */

function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
  return tex;
}

function woodTexture() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c2a077';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(${70 + Math.random() * 30},${45 + Math.random() * 25},${20 + Math.random() * 20},${0.08 + Math.random() * 0.18})`;
      ctx.lineWidth = 0.5 + Math.random() * 2.2;
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * (2 + Math.random() * 4));
      }
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      ctx.beginPath();
      ctx.ellipse(x, y, 6 + Math.random() * 12, 2 + Math.random() * 4, Math.random(), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(60,35,15,.3)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }, true);
}

function carbonTexture() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#1b1d1f';
    ctx.fillRect(0, 0, w, h);
    const s = 8;
    for (let y = 0; y < h; y += s) {
      for (let x = 0; x < w; x += s) {
        ctx.fillStyle = ((x / s + y / s) % 2 === 0) ? '#26292c' : '#17191b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = 'rgba(255,255,255,.035)';
        ctx.fillRect(x, y, s, 1);
      }
    }
  }, true);
}

export function createMaterials(finish) {
  const f = finish.hex;
  const tint = new THREE.Color(f).offsetHSL(0, 0, 0.032);
  const tintDark = tint.clone().multiplyScalar(0.78);
  const wood = woodTexture();
  wood.repeat.set(2, 1);
  const carbon = carbonTexture();
  carbon.repeat.set(5, 1);

  return {
    metal: new THREE.MeshStandardMaterial({ color: new THREE.Color(finish.metal), metalness: 0.78, roughness: 0.38, envMapIntensity: 0.72 }),
    metalDark: new THREE.MeshStandardMaterial({ color: 0x14171b, metalness: 0.68, roughness: 0.48, envMapIntensity: 0.56 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x878f98, metalness: 0.96, roughness: 0.28, envMapIntensity: 0.95 }),
    barrelSteel: new THREE.MeshStandardMaterial({ color: 0x393e44, metalness: 0.9, roughness: 0.3, envMapIntensity: 0.8 }),
    furniture: new THREE.MeshStandardMaterial({ color: tint, metalness: 0.03, roughness: 0.82, envMapIntensity: 0.32 }),
    furnitureDark: new THREE.MeshStandardMaterial({ color: tintDark, metalness: 0.03, roughness: 0.88, envMapIntensity: 0.26 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x101215, metalness: 0.02, roughness: 0.96 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xc6a37c, map: wood, metalness: 0.02, roughness: 0.58, envMapIntensity: 0.3 }),
    bakelite: new THREE.MeshStandardMaterial({ color: 0x8a4620, metalness: 0.04, roughness: 0.34, envMapIntensity: 0.62 }),
    carbon: new THREE.MeshStandardMaterial({ color: 0x6f7173, map: carbon, metalness: 0.4, roughness: 0.36, envMapIntensity: 0.72 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9ccfff, metalness: 0.1, roughness: 0.04, transmission: 0.4, transparent: true, opacity: 0.28, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide }),
    lens: new THREE.MeshStandardMaterial({ color: 0x2a5c7a, metalness: 0.7, roughness: 0.08, envMapIntensity: 2.4, transparent: true, opacity: 0.72 }),
    accent: new THREE.MeshStandardMaterial({ color: finish.accent, metalness: 0.45, roughness: 0.38, emissive: finish.accent, emissiveIntensity: 0.28 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.95, roughness: 0.28 }),
    white: new THREE.MeshStandardMaterial({ color: 0xd6d2c8, metalness: 0.2, roughness: 0.6 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc53a2e, metalness: 0.4, roughness: 0.4 }),
  };
}

/* ------------------------------------------------------------------ */
/*  Geometry kit                                                       */
/* ------------------------------------------------------------------ */

export function createKit(materials) {
  const cache = new Map();

  function shell(geometry, material, parent, x, y, z, o = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (o.rx) mesh.rotation.x = o.rx;
    if (o.ry) mesh.rotation.y = o.ry;
    if (o.rz) mesh.rotation.z = o.rz;
    if (o.sx) mesh.scale.x = o.sx;
    if (o.sy) mesh.scale.y = o.sy;
    if (o.sz) mesh.scale.z = o.sz;
    mesh.castShadow = o.cast !== false;
    mesh.receiveShadow = true;
    parent.add(mesh);
    if (o.slot) mesh.userData.slot = o.slot;
    return mesh;
  }

  function box(parent, w, h, d, mat, x = 0, y = 0, z = 0, o = {}) {
    return shell(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z, o);
  }

  function rbox(parent, w, h, d, r, mat, x = 0, y = 0, z = 0, o = {}) {
    const key = `rb${w}|${h}|${d}|${r}`;
    let geo = cache.get(key);
    if (!geo) {
      geo = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, Math.min(w, h, d) / 2 - 0.0002));
      cache.set(key, geo);
    }
    return shell(geo, mat, parent, x, y, z, o);
  }

  function cyl(parent, rt, rb, h, mat, x = 0, y = 0, z = 0, o = {}) {
    const seg = o.seg || 24;
    const geo = new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!o.open);
    let mesh;
    if (o.axis === 'x') mesh = shell(geo, mat, parent, x, y, z, { ...o, rz: (o.rz || 0) - Math.PI / 2 });
    else if (o.axis === 'z') mesh = shell(geo, mat, parent, x, y, z, { ...o, rx: (o.rx || 0) + Math.PI / 2 });
    else mesh = shell(geo, mat, parent, x, y, z, o);
    mesh.castShadow = true;
    return mesh;
  }

  function sphere(parent, r, mat, x, y, z, o = {}) {
    return shell(new THREE.SphereGeometry(r, o.seg || 20, o.seg2 || 14), mat, parent, x, y, z, o);
  }

  function torus(parent, r, tube, mat, x, y, z, o = {}) {
    return shell(new THREE.TorusGeometry(r, tube, o.rs || 10, o.ts || 28, o.arc || Math.PI * 2), mat, parent, x, y, z, o);
  }

  function plane(parent, w, h, mat, x, y, z, o = {}) {
    return shell(new THREE.PlaneGeometry(w, h), mat, parent, x, y, z, { ...o, cast: false });
  }

  /* Picatinny rail: base strip + evenly spaced teeth. */
  function rail(parent, x, y, z, length, mat = materials.metal) {
    box(parent, length, 0.006, 0.021, mat, x + length / 2, y, z);
    const teeth = Math.max(3, Math.floor(length / 0.012));
    for (let i = 0; i < teeth; i++) {
      const tx = x + 0.006 + i * (length / teeth);
      box(parent, length / teeth * 0.62, 0.0055, 0.024, materialOr(mat), tx, y + 0.005, z);
    }
  }

  function materialOr(m) { return m || materials.metal; }

  /* M-LOK slot (dark inset with a chamfer suggestion). */
  function mlok(parent, x, y, z, o = {}) {
    const r = o.r || 0.0022;
    box(parent, 0.018, 0.0065, 0.0016, materials.metalDark, x, y, z, { ry: o.ry || 0, cast: false });
    box(parent, 0.0155, 0.0042, 0.0019, materials.rubber, x, y, z, { ry: o.ry || 0, cast: false });
    if (o.side) {
      for (const s of [-1, 1]) box(parent, 0.002, 0.007, 0.001, materials.metalDark, x + s * 0.0087, y, z, { cast: false });
    }
  }

  /* Text / engraving decal. */
  function marking(parent, text, sub, w, h, x, y, z, o = {}) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = Math.max(64, Math.round(512 * h / w));
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = o.color || '#cfd2d6';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.round(c.height * 0.34)}px "Arial Narrow", Arial, sans-serif`;
    ctx.fillText(text, 8, c.height * (sub ? 0.38 : 0.5));
    if (sub) {
      ctx.fillStyle = o.subColor || 'rgba(180,185,190,.55)';
      ctx.font = `500 ${Math.round(c.height * 0.2)}px monospace`;
      ctx.fillText(sub, 8, c.height * 0.74);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: o.opacity ?? 0.9, depthWrite: false, toneMapped: false });
    const mesh = plane(parent, w, h, mat, x, y, z, { ry: o.ry || 0, cast: false });
    mesh.renderOrder = 3;
    return mesh;
  }

  function microText(parent, text, w, h, x, y, z, o = {}) {
    return marking(parent, text, null, w, h, x, y, z, { ...o, opacity: 0.55 });
  }

  function screw(parent, r, h, x, y, z, axis = 'z', mat = materials.steel) {
    const m = cyl(parent, r, r, h, mat, x, y, z, { axis, seg: 12 });
    if (axis === 'z') {
      box(parent, r * 1.5, r * 0.28, 0.0008, materials.metalDark, x, y, z + h / 2 + 0.0004, { cast: false });
    }
    return m;
  }

  return { materials, box, rbox, cyl, sphere, torus, plane, rail, mlok, marking, microText, screw, shell };
}

/* Fit helpers used by each platform builder. */
export const IN = 0.0254;
