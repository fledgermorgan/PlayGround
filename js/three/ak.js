import * as THREE from 'three';
import { IN } from './kit.js';

export function buildAK(kit, parts, finish) {
  const { materials: M, box, rbox, cyl, sphere, torus, plane, rail, mlok, marking, microText } = kit;
  const root = new THREE.Group();
  const groups = {};
  const slot = (name, explode) => {
    const g = new THREE.Group();
    g.userData.slot = name;
    g.userData.explode = new THREE.Vector3(...explode);
    root.add(g); groups[name] = g; return g;
  };
  const base = new THREE.Group();
  root.add(base);

  /* ---------------- receiver (static) ---------------- */
  rbox(base, 0.215, 0.052, 0.034, 0.005, M.metal, -0.005, 0.012, 0);
  rbox(base, 0.205, 0.021, 0.04, 0.008, M.metalDark, -0.012, 0.049, 0);
  // stamped ribs on dust cover
  for (let i = 0; i < 3; i++) box(base, 0.18, 0.003, 0.005, M.metal, -0.012, 0.059, -0.012 + i * 0.012, { cast: false });
  // rivets
  for (const [x, y] of [[-0.095, 0.0], [0.06, 0.005], [-0.09, 0.032], [0.07, 0.035]]) {
    for (const s of [-1, 1]) {
      cyl(base, 0.0035, 0.0035, 0.002, M.steel, x, y, s * 0.018, { axis: 'z', seg: 10 });
    }
  }
  // ejection port + charging handle
  box(base, 0.035, 0.018, 0.002, M.metalDark, 0.062, 0.035, 0.018, { cast: false });
  cyl(base, 0.0055, 0.0055, 0.016, M.steel, 0.082, 0.04, 0.023, { axis: 'z', seg: 12 });
  rbox(base, 0.018, 0.008, 0.01, 0.003, M.metalDark, 0.092, 0.04, 0.026);
  // selector lever (right side)
  rbox(base, 0.1, 0.012, 0.004, 0.002, M.metalDark, -0.035, 0.028, 0.02, { rz: -0.08 });
  box(base, 0.018, 0.018, 0.005, M.metalDark, -0.078, 0.021, 0.02, { rz: 0.3 });
  // trigger guard + mag release
  box(base, 0.055, 0.008, 0.026, M.metal, -0.048, -0.055, 0);
  box(base, 0.008, 0.028, 0.026, M.metal, -0.073, -0.043, 0);
  box(base, 0.008, 0.026, 0.026, M.metal, -0.022, -0.044, 0);
  rbox(base, 0.016, 0.008, 0.014, 0.003, M.metalDark, 0.004, -0.024, 0.018);
  // rear sight leaf
  rbox(base, 0.035, 0.009, 0.03, 0.003, M.metalDark, 0.093, 0.063, 0);
  box(base, 0.004, 0.012, 0.028, M.metalDark, 0.093, 0.073, 0);
  box(base, 0.009, 0.006, 0.01, M.metalDark, 0.093, 0.08, 0);
  // front sight block
  cyl(base, 0.018, 0.018, 0.035, M.metalDark, 0.455, 0.042, 0, { axis: 'x', seg: 18 });
  box(base, 0.022, 0.028, 0.026, M.metalDark, 0.455, 0.07, 0);
  for (const s of [-1, 1]) box(base, 0.006, 0.03, 0.005, M.metalDark, 0.455, 0.09, s * 0.011);
  cyl(base, 0.002, 0.002, 0.03, M.metalDark, 0.455, 0.088, 0, { axis: 'y', seg: 8 });
  // sling loop + buttplate tang
  torus(base, 0.009, 0.0015, M.steel, -0.105, 0.0, 0.024, { ry: Math.PI / 2 });
  microText(base, 'AKM 7.62X39  SN 1968', 0.065, 0.005, -0.02, 0.002, 0.0175, { opacity: 0.45 });
  microText(base, 'ИЗМАШ 1968', 0.04, 0.0045, -0.02, 0.026, 0.0215, { opacity: 0.35 });

  /* ---------------- barrel & gas system (static) ---------------- */
  const bStart = 0.10;
  const bEnd = bStart + 16.3 * IN;
  cyl(base, 0.018, 0.018, 0.03, M.metalDark, bStart + 0.01, 0.042, 0, { axis: 'x', seg: 20 });
  cyl(base, 0.015, 0.014, 0.07, M.barrelSteel, bStart + 0.04, 0.042, 0, { axis: 'x', seg: 22 });
  cyl(base, 0.0115, 0.0115, bEnd - bStart - 0.08, M.barrelSteel, bStart + 0.08 + (bEnd - bStart - 0.08) / 2, 0.042, 0, { axis: 'x', seg: 22 });
  // gas block / tube
  rbox(base, 0.032, 0.042, 0.03, 0.004, M.metalDark, 0.345, 0.05, 0);
  cyl(base, 0.005, 0.005, 0.25, M.metalDark, 0.22, 0.076, 0, { axis: 'x', seg: 10 });
  // cleaning rod
  cyl(base, 0.0035, 0.0035, 0.27, M.metal, 0.33, 0.012, 0.016, { axis: 'x', seg: 8 });
  // muzzle thread
  cyl(base, 0.0095, 0.0095, 0.02, M.steel, bEnd + 0.01, 0.042, 0, { axis: 'x', seg: 16 });

  /* ---------------- handguard ---------------- */
  const hg = slot('handguard', [0, 0.08, 0]);
  const hgWood = /wood|laminate/i.test(parts.handguard?.name || '') || /None/.test(parts.handguard?.mount || '');
  const hgMat = hgWood ? M.wood : M.furniture;
  const hgMatDark = hgWood ? M.wood : M.furnitureDark;
  // lower handguard
  const lower = cyl(hg, 0.032, 0.036, 0.19, hgMat, 0.205, 0.04, 0, { axis: 'x', seg: 8, open: true });
  // upper handguard over gas tube
  rbox(hg, 0.13, 0.028, 0.038, 0.012, hgMat, 0.225, 0.084, 0);
  rbox(hg, 0.1, 0.012, 0.042, 0.005, hgMatDark, 0.232, 0.101, 0);
  // palm swell + finger grooves
  for (let i = 0; i < 3; i++) cyl(hg, 0.003, 0.003, 0.055, hgMatDark, 0.15 + i * 0.035, 0.042, 0, { axis: 'z', seg: 10 });
  // vent holes
  for (let i = 0; i < 4; i++) {
    cyl(hg, 0.004, 0.004, 0.002, M.rubber, 0.15 + i * 0.032, 0.051, 0.029, { axis: 'z', seg: 10, cast: false });
    cyl(hg, 0.004, 0.004, 0.002, M.rubber, 0.15 + i * 0.032, 0.051, -0.029, { axis: 'z', seg: 10, cast: false });
  }
  if (!hgWood) {
    for (let i = 0; i < 4; i++) {
      mlok(hg, 0.155 + i * 0.04, 0.04, 0.034, { side: true });
      mlok(hg, 0.155 + i * 0.04, 0.04, -0.034, { side: true, ry: Math.PI });
    }
    rail(hg, 0.15, 0.096, 0, 0.12, M.metal);
    rail(hg, 0.19, 0.012, 0, 0.065, M.metal);
  }
  // front handguard retainer
  rbox(hg, 0.014, 0.07, 0.06, 0.004, M.metalDark, 0.302, 0.043, 0);
  microText(hg, 'AKM', 0.02, 0.004, 0.23, 0.045, 0.033, { opacity: 0.35 });

  /* ---------------- stock ---------------- */
  const stock = slot('stock', [-0.16, 0, 0]);
  const st = parts.stock?.type || 'Fixed';
  rbox(stock, 0.02, 0.06, 0.04, 0.004, M.metalDark, -0.12, 0.02, 0);
  if (st === 'Fixed') {
    // classic wood stock profile
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.045);
    shape.lineTo(-0.23, 0.035);
    shape.lineTo(-0.235, -0.015);
    shape.lineTo(-0.02, -0.028);
    shape.lineTo(0.02, -0.01);
    shape.lineTo(0, 0.045);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.042, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 4 });
    geo.center();
    const m = new THREE.Mesh(geo, M.wood);
    m.position.set(-0.24, 0.015, 0);
    m.castShadow = true; m.receiveShadow = true;
    stock.add(m);
    rbox(stock, 0.014, 0.075, 0.046, 0.004, M.rubber, -0.358, 0.012, 0);
    cyl(stock, 0.006, 0.006, 0.012, M.steel, -0.355, 0.018, 0.024, { axis: 'z', seg: 10 });
  } else {
    rbox(stock, 0.2, 0.055, 0.038, 0.008, M.furniture, -0.235, 0.022, 0);
    rbox(stock, 0.05, 0.022, 0.034, 0.006, M.furnitureDark, -0.29, 0.05, 0);
    rbox(stock, 0.014, 0.07, 0.044, 0.004, M.rubber, -0.345, 0.015, 0);
    box(stock, 0.02, 0.02, 0.03, M.metalDark, -0.135, 0.02, 0);
    cyl(stock, 0.006, 0.006, 0.048, M.steel, -0.31, 0.045, 0, { axis: 'z', seg: 12 });
    torus(stock, 0.008, 0.0016, M.steel, -0.35, 0.005, 0.024, { ry: Math.PI / 2 });
  }
  microText(stock, 'AKM', 0.024, 0.004, -0.25, 0.032, 0.0215, { opacity: 0.4 });
  microText(stock, 'AKM', 0.024, 0.004, -0.25, 0.032, -0.0215, { opacity: 0.4, ry: Math.PI });

  /* ---------------- grip ---------------- */
  const grip = slot('grip', [0, -0.1, 0]);
  const gripMat = /bakelite/i.test(parts.grip?.name || '') ? M.bakelite : /wood/i.test(parts.grip?.material || '') ? M.wood : M.furniture;
  const gp = new THREE.Group();
  gp.position.set(-0.092, -0.014, 0);
  gp.rotation.z = -0.3;
  grip.add(gp);
  rbox(gp, 0.036, 0.095, 0.038, 0.012, gripMat, 0, -0.045, 0);
  rbox(gp, 0.04, 0.014, 0.042, 0.004, M.furnitureDark, 0, -0.098, 0);
  rbox(gp, 0.038, 0.02, 0.04, 0.007, gripMat, 0, 0.002, 0);
  for (let i = 0; i < 3; i++) cyl(gp, 0.003, 0.003, 0.034, M.furnitureDark, 0.0185, -0.03 - i * 0.018, 0, { axis: 'z', seg: 10 });
  microText(gp, 'USSR', 0.014, 0.003, 0, -0.07, 0.0195, { opacity: 0.4 });

  /* ---------------- trigger & safety ---------------- */
  const trigger = slot('trigger', [0, -0.08, 0]);
  rbox(trigger, 0.006, 0.032, 0.01, 0.002, M.metalDark, -0.04, -0.03, 0, { rz: 0.18 });
  rbox(trigger, 0.01, 0.007, 0.011, 0.002, M.metalDark, -0.033, -0.048, 0, { rz: 0.5 });
  cyl(trigger, 0.003, 0.003, 0.012, M.steel, -0.04, -0.016, 0, { axis: 'z', seg: 8 });
  // safety lever interior
  cyl(trigger, 0.007, 0.007, 0.045, M.steel, -0.075, 0.018, 0, { axis: 'z', seg: 14 });

  /* ---------------- magazine ---------------- */
  const magazine = slot('magazine', [0, -0.13, 0]);
  const cap = parts.magazine?.capacity || 30;
  if (cap >= 60) {
    cyl(magazine, 0.072, 0.072, 0.055, M.furnitureDark, 0.015, -0.06, 0, { axis: 'z', seg: 36 });
    cyl(magazine, 0.066, 0.066, 0.058, M.furniture, 0.015, -0.06, 0, { axis: 'z', seg: 36 });
    cyl(magazine, 0.025, 0.025, 0.062, M.metalDark, 0.015, -0.06, 0, { axis: 'z', seg: 18 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.3;
      box(magazine, 0.015, 0.06, 0.004, M.metalDark, 0.015 + Math.cos(a) * 0.06, -0.06 + Math.sin(a) * 0.06, 0.03, { rz: a, cast: false });
    }
    microText(magazine, '75', 0.012, 0.006, 0.015, -0.06, 0.059, { opacity: 0.5 });
  } else {
    const magLen = cap >= 40 ? 0.23 : 0.2;
    const shape = new THREE.Shape();
    shape.moveTo(-0.026, 0);
    shape.lineTo(0.026, 0);
    shape.bezierCurveTo(0.035, -magLen * 0.35, 0.065, -magLen * 0.7, 0.09, -magLen);
    shape.lineTo(0.045, -magLen);
    shape.bezierCurveTo(0.025, -magLen * 0.7, 0.0, -magLen * 0.35, -0.026, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.0025, bevelThickness: 0.002, bevelSegments: 2, curveSegments: 6 });
    geo.center();
    const mag = new THREE.Mesh(geo, M.furniture);
    mag.position.set(0.03, -0.02 - magLen / 2, 0);
    mag.castShadow = true; mag.receiveShadow = true;
    magazine.add(mag);
    rbox(magazine, 0.03, 0.012, 0.038, 0.003, M.furnitureDark, 0.078, -0.02 - magLen + 0.004, 0, { rz: 0.18 });
    for (let i = 0; i < 4; i++) {
      box(magazine, 0.004, 0.04, 0.032, M.furnitureDark, 0.03 + i * 0.012, -0.02 - magLen * 0.55, 0, { rz: 0.12, cast: false });
    }
    for (const s of [-1, 1]) {
      for (let i = 0; i < 2; i++) cyl(magazine, 0.0025, 0.0025, 0.001, M.metalDark, 0.04, -0.045 - i * 0.05, s * 0.0165, { axis: 'z', seg: 8, cast: false });
    }
  }

  /* ---------------- muzzle ---------------- */
  const muzzle = slot('muzzle', [0.16, 0, 0]);
  const mzLen = (parts.muzzle?.length || 2) * IN;
  const mzStart = bEnd + 0.018;
  const mzMid = mzStart + mzLen / 2;
  const mz = parts.muzzle || {};
  const isSuppressor = !!mz.suppression;
  const isBrake = (mz.tags || []).some((t) => /Brake/i.test(t));
  if (isSuppressor) {
    cyl(muzzle, 0.017, 0.021, mzLen * 0.9, M.metalDark, mzMid, 0.042, 0, { axis: 'x', seg: 26 });
    cyl(muzzle, 0.023, 0.02, 0.025, M.metalDark, mzStart + 0.012, 0.042, 0, { axis: 'x', seg: 26 });
    for (let i = 0; i < 4; i++) cyl(muzzle, 0.019, 0.019, 0.002, M.metalDark, mzMid - mzLen * 0.25 + i * mzLen * 0.16, 0.042, 0, { axis: 'x', seg: 26 });
    marking(muzzle, 'WOLVERINE PBS-1', '7.62X39  NFA', 0.075, 0.011, mzMid, 0.061, 0.0205, { opacity: 0.55 });
  } else if (isBrake) {
    cyl(muzzle, 0.0135, 0.0115, mzLen * 0.8, M.metalDark, mzMid, 0.042, 0, { axis: 'x', seg: 20 });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) box(muzzle, 0.008, 0.008, 0.002, M.rubber, mzStart + mzLen * 0.25 + i * mzLen * 0.17, 0.042, s * 0.0115, { cast: false });
    }
    cyl(muzzle, 0.016, 0.014, 0.008, M.metal, mzStart + mzLen * 0.92, 0.042, 0, { axis: 'x', seg: 20 });
  } else {
    // slant brake or flash hider
    const slant = /slant/i.test(mz.name);
    cyl(muzzle, 0.0125, 0.0115, mzLen * 0.82, M.metalDark, mzMid, 0.042, 0, { axis: 'x', seg: 20 });
    if (slant) {
      box(muzzle, 0.012, 0.02, 0.026, M.metalDark, mzStart + mzLen * 0.55, 0.05, 0, { rz: 0.55 });
      box(muzzle, 0.006, 0.016, 0.022, M.rubber, mzStart + mzLen * 0.85, 0.036, 0, { rz: 0.3, cast: false });
    } else {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        box(muzzle, mzLen * 0.5, 0.0042, 0.0042, M.metalDark, mzStart + mzLen * 0.45, 0.042 + Math.sin(a) * 0.008, Math.cos(a) * 0.008, { rx: a });
      }
      cyl(muzzle, 0.011, 0.011, 0.005, M.metal, mzStart + mzLen * 0.96, 0.042, 0, { axis: 'x', seg: 18 });
    }
  }

  /* ---------------- optic & side mount ---------------- */
  const optic = slot('optic', [0, 0.25, 0]);
  const op = parts.optic || {};
  const opType = op.type || 'Iron sights';
  if (opType !== 'Iron sights') {
    // side rail plate
    rbox(optic, 0.09, 0.045, 0.012, 0.003, M.metalDark, -0.02, 0.062, -0.039);
    rbox(optic, 0.05, 0.02, 0.05, 0.004, M.metalDark, -0.02, 0.085, -0.022);
    rbox(optic, 0.03, 0.018, 0.022, 0.003, M.metal, -0.02, 0.098, -0.004);
    if (opType === 'Holographic') {
      box(optic, 0.075, 0.042, 0.04, M.metalDark, -0.02, 0.12, -0.002);
      box(optic, 0.075, 0.007, 0.042, M.metal, -0.02, 0.143, 0);
      for (const s of [-1, 1]) plane(optic, 0.032, 0.03, M.glass, -0.055, 0.12, s * 0.0205, { ry: s * Math.PI / 2 });
      cyl(optic, 0.004, 0.004, 0.006, M.rubber, -0.06, 0.104, 0.014, { axis: 'x', seg: 10 });
    } else if (opType === 'Prism') {
      cyl(optic, 0.019, 0.022, 0.16, M.metalDark, -0.02, 0.122, -0.002, { axis: 'x', seg: 26 });
      cyl(optic, 0.027, 0.02, 0.05, M.metalDark, 0.07, 0.122, 0, { axis: 'x', seg: 26 });
      cyl(optic, 0.028, 0.028, 0.002, M.lens, 0.096, 0.122, 0, { axis: 'x', seg: 26, cast: false });
      cyl(optic, 0.011, 0.011, 0.016, M.metalDark, -0.02, 0.146, 0, { axis: 'y', seg: 16 });
      cyl(optic, 0.011, 0.011, 0.016, M.metalDark, -0.02, 0.122, 0.025, { axis: 'z', seg: 16 });
      box(optic, 0.06, 0.004, 0.012, M.accent, 0.03, 0.142, 0);
      microText(optic, 'PSO-1 4X24', 0.034, 0.005, 0.02, 0.108, 0.012, { opacity: 0.45 });
    } else if (opType === 'Red dot') {
      rbox(optic, 0.045, 0.018, 0.032, 0.004, M.metalDark, -0.02, 0.112, 0);
      cyl(optic, 0.016, 0.016, 0.07, M.metalDark, -0.02, 0.135, 0, { axis: 'x', seg: 24 });
      cyl(optic, 0.0155, 0.0155, 0.002, M.lens, 0.017, 0.135, 0, { axis: 'x', seg: 24, cast: false });
      cyl(optic, 0.0155, 0.0155, 0.002, M.glass, -0.057, 0.135, 0, { axis: 'x', seg: 24, cast: false });
      cyl(optic, 0.008, 0.008, 0.014, M.metal, -0.02, 0.153, 0, { axis: 'y', seg: 14 });
      microText(optic, 'T-2', 0.014, 0.003, -0.02, 0.116, 0.0175, { opacity: 0.5 });
    }
  }

  return { root, groups };
}
