import * as THREE from 'three';
import { IN } from './kit.js';

export function buildAR(kit, parts, finish) {
  const { materials: M, box, rbox, cyl, sphere, torus, plane, rail, mlok, marking, microText, screw } = kit;
  const root = new THREE.Group();
  const groups = {};

  const slot = (name, explode) => {
    const g = new THREE.Group();
    g.userData.slot = name;
    g.userData.explode = new THREE.Vector3(...explode);
    root.add(g);
    groups[name] = g;
    return g;
  };

  const base = new THREE.Group();
  root.add(base);

  /* ---------------- lower receiver (static platform) ---------------- */
  rbox(base, 0.185, 0.07, 0.04, 0.007, M.metal, -0.015, -0.005, 0);
  rbox(base, 0.105, 0.095, 0.044, 0.008, M.metal, -0.055, -0.048, 0, { rz: 0.02 });
  // magwell (forward of the trigger guard)
  rbox(base, 0.086, 0.072, 0.048, 0.006, M.metal, 0.022, -0.058, 0);
  // magwell flare
  rbox(base, 0.096, 0.014, 0.052, 0.005, M.metalDark, 0.022, -0.098, 0);
  // trigger guard
  rbox(base, 0.014, 0.034, 0.026, 0.003, M.metal, -0.018, -0.056, 0);
  rbox(base, 0.062, 0.009, 0.026, 0.003, M.metal, -0.047, -0.075, 0);
  rbox(base, 0.014, 0.03, 0.026, 0.003, M.metal, -0.076, -0.058, 0);
  // upper/lower seam and receiver pins
  for (const s of [-1, 1]) box(base, 0.18, 0.0022, 0.001, M.metalDark, -0.018, 0.028, s * 0.0206, { cast: false });
  for (const x of [-0.078, 0.052]) cyl(base, 0.0048, 0.0048, 0.044, M.steel, x, -0.004, 0, { axis: 'z', seg: 12 });
  // magwell ribs
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) rbox(base, 0.066, 0.004, 0.002, 0.001, M.metalDark, 0.022, -0.064 - i * 0.012, s * 0.0255);
  }
  // QD sling socket on the receiver
  cyl(base, 0.007, 0.007, 0.01, M.metalDark, -0.098, -0.03, 0.021, { axis: 'z', seg: 14 });
  // rear receiver ring / castle nut
  cyl(base, 0.018, 0.018, 0.012, M.metalDark, -0.105, 0.04, 0, { axis: 'x', seg: 20 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    box(base, 0.012, 0.003, 0.003, M.steel, -0.105, 0.04 + Math.sin(a) * 0.018, Math.cos(a) * 0.018, { rx: a });
  }
  // mag release & bolt catch
  cyl(base, 0.007, 0.007, 0.01, M.metalDark, -0.006, -0.028, 0.026, { axis: 'z' });
  rbox(base, 0.02, 0.012, 0.008, 0.003, M.metalDark, 0.018, -0.023, -0.026);
  box(base, 0.004, 0.02, 0.004, M.metalDark, 0.04, -0.005, -0.03);
  // takedown pins
  cyl(base, 0.0065, 0.0065, 0.046, M.steel, -0.082, -0.008, 0, { axis: 'z', seg: 14 });
  cyl(base, 0.0065, 0.0065, 0.046, M.steel, 0.058, -0.008, 0, { axis: 'z', seg: 14 });
  microText(base, 'IRONFORGE  CAL 5.56', 0.055, 0.007, -0.03, 0.007, 0.0206, { opacity: 0.55 });
  microText(base, 'SER 0247-88  SEMI AUTO', 0.058, 0.006, -0.075, -0.028, 0.0206, { opacity: 0.4 });

  /* ---------------- upper receiver ---------------- */
  const upper = slot('upper', [0, 0.13, 0]);
  rbox(upper, 0.235, 0.062, 0.042, 0.009, M.metal, 0.004, 0.058, 0);
  // continuous top rail
  rail(upper, -0.112, 0.093, 0, 0.236, M.metal);
  // ejection port + brass deflector
  box(upper, 0.06, 0.032, 0.002, M.metalDark, 0.043, 0.061, 0.0212, { cast: false });
  rbox(upper, 0.058, 0.028, 0.0035, 0.002, M.metal, 0.043, 0.061, 0.0222);
  cyl(upper, 0.003, 0.003, 0.052, M.steel, -0.018, 0.047, 0.0235, { axis: 'x', seg: 10 });
  box(upper, 0.058, 0.0022, 0.0025, M.steel, 0.043, 0.075, 0.0232);
  rbox(upper, 0.014, 0.02, 0.014, 0.004, M.metal, 0.076, 0.062, 0.025, { rz: 0.4 });
  // forward assist
  cyl(upper, 0.009, 0.009, 0.026, M.metalDark, -0.018, 0.055, 0.024, { axis: 'z', seg: 16 });
  cyl(upper, 0.008, 0.008, 0.004, M.steel, -0.018, 0.055, 0.038, { axis: 'z', seg: 16 });
  // dust cover hinge
  cyl(upper, 0.004, 0.004, 0.05, M.metalDark, -0.016, 0.043, 0.022, { axis: 'x', seg: 10 });
  // shell deflector detail + forward assist serrations
  for (let i = 0; i < 4; i++) box(upper, 0.001, 0.001, 0.001, M.steel, -0.018, 0.05 + i * 0.0025, 0.0375, { cast: false });
  marking(upper, 'IRONFORGE', 'CAL. 5.56 NATO', 0.05, 0.009, -0.065, 0.05, 0.0214, { opacity: 0.65 });
  microText(upper, 'M4E1  SN 88-4021', 0.045, 0.005, 0.055, 0.045, -0.0214, { opacity: 0.4, ry: Math.PI });

  /* ---------------- grip ---------------- */
  const grip = slot('grip', [0, -0.1, 0]);
  const gripPivot = new THREE.Group();
  gripPivot.position.set(-0.118, -0.083, 0);
  gripPivot.rotation.z = -0.24;
  grip.add(gripPivot);
  rbox(gripPivot, 0.036, 0.1, 0.038, 0.011, M.furniture, 0, -0.045, 0);
  rbox(gripPivot, 0.038, 0.016, 0.04, 0.005, M.furnitureDark, 0, -0.1, 0);
  rbox(gripPivot, 0.032, 0.02, 0.034, 0.007, M.furniture, 0.001, 0.002, 0);
  // finger grooves
  for (let i = 0; i < 3; i++) {
    cyl(gripPivot, 0.0032, 0.0032, 0.033, M.furnitureDark, 0.0185, -0.035 - i * 0.019, 0, { axis: 'z', seg: 10 });
  }
  // stipple dots
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    sphere(gripPivot, 0.0014, M.furnitureDark, side * 0.019, -0.02 - (i % 7) * 0.011, 0.006, { seg: 6, seg2: 4 });
  }

  /* ---------------- trigger ---------------- */
  const trigger = slot('trigger', [0, -0.075, 0]);
  rbox(trigger, 0.007, 0.036, 0.011, 0.002, M.metalDark, 0.012, -0.062, 0, { rz: 0.12 });
  rbox(trigger, 0.012, 0.008, 0.012, 0.003, M.metalDark, 0.019, -0.08, 0, { rz: 0.3 });
  cyl(trigger, 0.003, 0.003, 0.012, M.steel, 0.012, -0.046, 0, { axis: 'z', seg: 10 });
  // ambi safety selector
  cyl(trigger, 0.0065, 0.0065, 0.054, M.steel, -0.038, -0.02, 0, { axis: 'z', seg: 16 });
  for (const s of [-1, 1]) {
    box(trigger, 0.022, 0.007, 0.004, M.metalDark, -0.048, -0.022, s * 0.029, { rz: 0.35 });
    cyl(trigger, 0.007, 0.007, 0.003, M.metalDark, -0.038, -0.02, s * 0.029, { axis: 'z', seg: 12 });
  }
  microText(trigger, 'FIRE', 0.012, 0.003, -0.054, -0.012, 0.0315, { opacity: 0.7 });
  // anti-walk pins
  cyl(trigger, 0.004, 0.004, 0.045, M.steel, -0.02, -0.04, 0, { axis: 'z', seg: 10 });
  cyl(trigger, 0.004, 0.004, 0.045, M.steel, 0.055, -0.04, 0, { axis: 'z', seg: 10 });

  /* ---------------- stock ---------------- */
  const stock = slot('stock', [-0.14, 0, 0]);
  const stockType = parts.stock?.type || 'Collapsible';
  cyl(stock, 0.0155, 0.0155, 0.16, M.metal, -0.19, 0.04, 0, { axis: 'x', seg: 20 });
  cyl(stock, 0.018, 0.018, 0.012, M.metalDark, -0.108, 0.04, 0, { axis: 'x', seg: 20 });
  for (let i = 0; i < 4; i++) cyl(stock, 0.017, 0.017, 0.004, M.metalDark, -0.118 - i * 0.008, 0.04, 0, { axis: 'x', seg: 16 });
  if (stockType === 'Precision') {
    rbox(stock, 0.15, 0.075, 0.046, 0.012, M.furniture, -0.297, 0.028, 0);
    rbox(stock, 0.105, 0.022, 0.04, 0.008, M.furnitureDark, -0.288, 0.077, 0);
    cyl(stock, 0.009, 0.009, 0.05, M.metalDark, -0.238, 0.06, 0, { axis: 'z', seg: 14 });
    box(stock, 0.03, 0.02, 0.028, M.furnitureDark, -0.362, 0.025, 0);
    rbox(stock, 0.012, 0.1, 0.05, 0.004, M.rubber, -0.379, 0.018, 0);
    box(stock, 0.02, 0.012, 0.032, M.metalDark, -0.248, 0.052, 0);
    cyl(stock, 0.002, 0.002, 0.09, M.steel, -0.327, 0.084, 0, { axis: 'x', seg: 8 });
    torus(stock, 0.008, 0.002, M.steel, -0.382, 0.02, 0.026, { ry: Math.PI / 2 });
  } else {
    // collapsible stock with a tapered polymer body
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0.062, 0.038);
    bodyShape.lineTo(-0.052, 0.047);
    bodyShape.lineTo(-0.066, 0.034);
    bodyShape.lineTo(-0.061, -0.008);
    bodyShape.lineTo(0.018, -0.016);
    bodyShape.lineTo(0.062, 0.006);
    bodyShape.closePath();
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: 0.042, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 4 });
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, M.furniture);
    bodyMesh.position.set(-0.2, 0.028, 0);
    bodyMesh.castShadow = true; bodyMesh.receiveShadow = true;
    stock.add(bodyMesh);
    rbox(stock, 0.014, 0.072, 0.046, 0.005, M.rubber, -0.266, 0.022, 0);
    rbox(stock, 0.062, 0.013, 0.032, 0.005, M.furnitureDark, -0.19, 0.063, 0);
    box(stock, 0.022, 0.016, 0.032, M.furnitureDark, -0.151, 0.002, 0);
    cyl(stock, 0.005, 0.005, 0.045, M.metalDark, -0.218, 0.048, 0, { axis: 'z', seg: 12 });
    torus(stock, 0.007, 0.0018, M.steel, -0.255, 0.012, 0.026, { ry: Math.PI / 2 });
    // adjustment lever + sling slot
    box(stock, 0.03, 0.008, 0.02, M.metalDark, -0.19, -0.006, 0, { rz: -0.25 });
    for (const s of [-1, 1]) rbox(stock, 0.048, 0.009, 0.004, 0.002, M.rubber, -0.232, 0.021, s * 0.0215);
  }
  microText(stock, 'IRONFORGE', 0.04, 0.006, -0.215, 0.04, 0.0215, { opacity: 0.5 });
  microText(stock, 'IRONFORGE', 0.04, 0.006, -0.215, 0.04, -0.0215, { opacity: 0.5, ry: Math.PI });

  /* ---------------- handguard ---------------- */
  const handguard = slot('handguard', [0, 0.07, 0]);
  const hgLen = (parts.handguard?.length || 13) * IN;
  const hgStart = 0.118;
  const hgCenter = 0.045;
  const hg = cyl(handguard, 0.034, 0.034, hgLen, M.furniture, hgStart + hgLen / 2, hgCenter, 0, { axis: 'x', seg: 8, open: true });
  // inner barrel nut
  cyl(handguard, 0.023, 0.023, 0.028, M.metalDark, hgStart + 0.014, hgCenter, 0, { axis: 'x', seg: 18 });
  cyl(handguard, 0.019, 0.019, 0.02, M.metal, hgStart + hgLen - 0.01, hgCenter, 0, { axis: 'x', seg: 16 });
  // front end cap + crown
  cyl(handguard, 0.0365, 0.0365, 0.012, M.furnitureDark, hgStart + hgLen - 0.006, hgCenter, 0, { axis: 'x', seg: 8 });
  cyl(handguard, 0.0295, 0.0295, 0.004, M.metalDark, hgStart + hgLen - 0.001, hgCenter, 0, { axis: 'x', seg: 16 });
  // QD socket at the front
  cyl(handguard, 0.006, 0.006, 0.014, M.metalDark, hgStart + hgLen - 0.02, 0.015, 0.031, { axis: 'z', seg: 14 });
  // top rail
  rail(handguard, hgStart + 0.001, 0.079, 0, hgLen - 0.002, M.metal);
  // bottom short rail
  rail(handguard, hgStart + hgLen - 0.09, 0.009, 0, 0.07, M.metal);
  // M-LOK slots both sides
  const slotCount = Math.max(4, Math.round(hgLen / 0.045));
  for (let i = 0; i < slotCount; i++) {
    const x = hgStart + 0.03 + i * ((hgLen - 0.06) / slotCount);
    mlok(handguard, x, 0.042, 0.0335, { side: true });
    mlok(handguard, x, 0.042, -0.0335, { side: true, ry: Math.PI });
    if (i % 2 === 0) mlok(handguard, x, 0.011, 0, { ry: Math.PI / 2 });
  }
  // QD socket
  cyl(handguard, 0.006, 0.006, 0.012, M.metalDark, hgStart + 0.02, 0.025, 0.029, { axis: 'z', seg: 14 });
  // heat shield slots / texture rings
  for (let i = 0; i < 3; i++) cyl(handguard, 0.0345, 0.0345, 0.002, M.furnitureDark, hgStart + 0.04 + i * (hgLen - 0.08) / 3, hgCenter, 0, { axis: 'x', seg: 8 });

  /* ---------------- barrel ---------------- */
  const barrel = slot('barrel', [0.06, 0.02, 0]);
  const bLen = (parts.barrel?.length || 16) * IN;
  const bStart = 0.112;
  const bEnd = bStart + bLen;
  const isCarbon = parts.barrel?.material?.includes('Carbon');
  const isHeavy = /Heavy|MTU|Government|CHF/.test(parts.barrel?.name || '');
  cyl(barrel, 0.019, 0.019, 0.03, M.metalDark, bStart + 0.005, 0.045, 0, { axis: 'x', seg: 20 });
  cyl(barrel, 0.0155, 0.0155, 0.075, M.barrelSteel, bStart + 0.035, 0.045, 0, { axis: 'x', seg: 24 });
  const mainR = isHeavy ? 0.0125 : 0.0105;
  const main = cyl(barrel, mainR * 0.92, mainR, bLen - 0.09, isCarbon ? M.carbon : M.barrelSteel, bStart + 0.09 + (bLen - 0.09) / 2, 0.045, 0, { axis: 'x', seg: 24 });
  // gas block & tube
  const gasOff = { Carbine: 0.19, 'Mid-length': 0.245, Rifle: 0.31, Pistol: 0.145 }[parts.barrel?.gas] || 0.24;
  const gx = Math.min(bStart + gasOff, bEnd - 0.075);
  rbox(barrel, 0.032, 0.033, 0.028, 0.003, M.metalDark, gx, 0.05, 0);
  box(barrel, 0.02, 0.008, 0.021, M.metal, gx, 0.069, 0);
  cyl(barrel, 0.0035, 0.0035, gx - 0.09, M.metalDark, (gx + 0.09) / 2, 0.062, 0, { axis: 'x', seg: 10 });
  // muzzle shoulder + threads
  cyl(barrel, 0.009, 0.009, 0.018, M.metalDark, bEnd + 0.004, 0.045, 0, { axis: 'x', seg: 18 });
  cyl(barrel, 0.0085, 0.0085, 0.008, M.steel, bEnd + 0.016, 0.045, 0, { axis: 'x', seg: 14 });
  // flutes
  if (isHeavy && !parts.barrel?.name?.includes('Carbon')) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box(barrel, bLen * 0.42, 0.003, 0.006, M.metalDark, bStart + 0.42, 0.045 + Math.sin(a) * mainR, Math.cos(a) * mainR, { rx: a, cast: false });
    }
  }
  microText(barrel, '5.56 X 45  NATO  1:7', 0.06, 0.005, bStart + 0.16, 0.034, -0.0108, { opacity: 0.4, ry: Math.PI });

  /* ---------------- muzzle ---------------- */
  const muzzle = slot('muzzle', [0.16, 0, 0]);
  const mzLen = (parts.muzzle?.length || 2) * IN;
  const mzStart = bEnd + 0.02;
  const mzMid = mzStart + mzLen / 2;
  const mz = parts.muzzle || {};
  const isSuppressor = !!mz.suppression;
  const isBrake = (mz.tags || []).some((t) => /Brake/i.test(t));
  if (isSuppressor) {
    cyl(muzzle, 0.019, 0.019, mzLen * 0.88, M.metalDark, mzMid, 0.045, 0, { axis: 'x', seg: 28 });
    cyl(muzzle, 0.021, 0.019, 0.014, M.metalDark, mzStart + 0.007, 0.045, 0, { axis: 'x', seg: 28 });
    cyl(muzzle, 0.0195, 0.0195, 0.008, M.metal, mzMid + mzLen * 0.36, 0.045, 0, { axis: 'x', seg: 28 });
    for (let i = 0; i < 5; i++) cyl(muzzle, 0.0194, 0.0194, 0.0015, M.metalDark, mzMid - mzLen * 0.24 + i * mzLen * 0.13, 0.045, 0, { axis: 'x', seg: 28 });
    marking(muzzle, 'IRONFORGE SUPPRESSOR', 'SN 556-041  NFA', 0.075, 0.011, mzMid, 0.064, 0.0193, { opacity: 0.6 });
  } else if (isBrake) {
    cyl(muzzle, 0.0125, 0.0115, mzLen * 0.72, M.metalDark, mzMid, 0.045, 0, { axis: 'x', seg: 18 });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        box(muzzle, 0.009, 0.009, 0.003, M.rubber, mzStart + mzLen * 0.2 + i * mzLen * 0.18, 0.045, s * 0.0112, { cast: false });
      }
    }
    for (let i = 0; i < 2; i++) box(muzzle, 0.008, 0.003, 0.012, M.rubber, mzStart + mzLen * 0.25 + i * mzLen * 0.2, 0.056, 0, { cast: false });
    cyl(muzzle, 0.014, 0.013, 0.01, M.metal, mzStart + mzLen * 0.92, 0.045, 0, { axis: 'x', seg: 18 });
    cyl(muzzle, 0.0075, 0.0075, 0.003, M.rubber, mzStart + mzLen * 0.97, 0.045, 0, { axis: 'x', seg: 14 });
  } else {
    // birdcage / flash hider
    cyl(muzzle, 0.0115, 0.0115, mzLen * 0.48, M.metalDark, mzStart + mzLen * 0.24, 0.045, 0, { axis: 'x', seg: 18 });
    const prongLen = mzLen * 0.58;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const py = 0.045 + Math.sin(a) * 0.0075;
      const pz = Math.cos(a) * 0.0075;
      const m = box(muzzle, prongLen, 0.0042, 0.0042, M.metalDark, mzStart + mzLen * 0.45 + prongLen / 2, py, pz, { rx: a });
      m.rotation.x = a;
    }
    cyl(muzzle, 0.0115, 0.0115, 0.006, M.metal, mzStart + mzLen * 0.97, 0.045, 0, { axis: 'x', seg: 18 });
    for (let i = 0; i < 4; i++) box(muzzle, 0.004, 0.002, 0.003, M.steel, mzStart + 0.006 + i * 0.006, 0.055, 0, { cast: false });
  }
  cyl(muzzle, 0.0095, 0.0095, 0.005, M.steel, mzStart - 0.002, 0.045, 0, { axis: 'x', seg: 16 });

  /* ---------------- optic ---------------- */
  const optic = slot('optic', [0, 0.24, 0]);
  const op = parts.optic || {};
  const opType = op.type || 'None';
  const ox = -0.012;
  const railTop = 0.098;
  if (opType === 'Holographic') {
    rbox(optic, 0.075, 0.016, 0.034, 0.004, M.metalDark, ox, railTop + 0.008, 0);
    box(optic, 0.026, 0.01, 0.024, M.metal, ox - 0.02, railTop + 0.019, 0);
    box(optic, 0.07, 0.044, 0.042, M.metalDark, ox, railTop + 0.05, 0);
    box(optic, 0.07, 0.008, 0.044, M.metal, ox, railTop + 0.073, 0);
    box(optic, 0.006, 0.044, 0.043, M.metal, ox - 0.034, railTop + 0.05, 0);
    box(optic, 0.006, 0.044, 0.043, M.metal, ox + 0.034, railTop + 0.05, 0);
    plane(optic, 0.033, 0.031, M.glass, ox - 0.031, railTop + 0.05, 0.0205, { ry: Math.PI / 2 });
    plane(optic, 0.033, 0.031, M.glass, ox - 0.031, railTop + 0.05, -0.0205, { ry: -Math.PI / 2 });
    plane(optic, 0.03, 0.028, M.lens, ox + 0.037, railTop + 0.05, 0.021, { ry: Math.PI / 2 });
    for (let i = 0; i < 2; i++) cyl(optic, 0.004, 0.004, 0.006, M.rubber, ox - 0.043, railTop + 0.032, (i ? 1 : -1) * 0.014, { axis: 'x', seg: 10 });
    box(optic, 0.016, 0.01, 0.012, M.metalDark, ox + 0.018, railTop + 0.081, 0);
    microText(optic, 'EOTECH', 0.02, 0.0035, ox, railTop + 0.022, 0.0175, { opacity: 0.6 });
  } else if (opType === 'Red dot' || opType === 'Enclosed red dot' || opType === 'Micro red dot') {
    const big = /510/.test(op.name);
    const tubeR = big ? 0.019 : 0.016;
    const tubeY = railTop + 0.035;
    rbox(optic, 0.05, 0.022, 0.03, 0.004, M.metalDark, ox, railTop + 0.011, 0);
    box(optic, 0.03, 0.02, 0.026, M.metalDark, ox, railTop + 0.025, 0);
    cyl(optic, tubeR, tubeR, 0.078, M.metalDark, ox, tubeY, 0, { axis: 'x', seg: 28 });
    cyl(optic, tubeR + 0.003, tubeR + 0.003, 0.008, M.metal, ox + 0.038, tubeY, 0, { axis: 'x', seg: 28 });
    cyl(optic, tubeR + 0.0015, tubeR + 0.0015, 0.005, M.metal, ox - 0.038, tubeY, 0, { axis: 'x', seg: 28 });
    const lensMat = big ? M.glass : M.lens;
    cyl(optic, tubeR - 0.0015, tubeR - 0.0015, 0.002, lensMat, ox + 0.041, tubeY, 0, { axis: 'x', seg: 28, cast: false });
    cyl(optic, tubeR - 0.0015, tubeR - 0.0015, 0.002, lensMat, ox - 0.041, tubeY, 0, { axis: 'x', seg: 28, cast: false });
    if (!big) {
      cyl(optic, 0.0075, 0.0075, 0.012, M.metal, ox - 0.008, tubeY + tubeR + 0.004, 0, { axis: 'y', seg: 14 });
      cyl(optic, 0.0065, 0.0065, 0.008, M.metal, ox - 0.008, tubeY, tubeR + 0.002, { axis: 'z', seg: 14 });
    }
    box(optic, 0.018, 0.005, 0.021, M.metalDark, ox - 0.028, tubeY + tubeR * 0.8, 0);
    microText(optic, 'T-2', 0.012, 0.0028, ox, tubeY - tubeR - 0.0015, 0.015, { opacity: 0.6 });
  } else if (opType === 'LPVO' || opType === 'Precision scope') {
    const scopeY = railTop + 0.052;
    const big = opType === 'Precision scope';
    const tubeR = big ? 0.019 : 0.017;
    const len = big ? 0.31 : 0.22;
    rbox(optic, 0.055, 0.014, 0.04, 0.004, M.metalDark, ox, railTop + 0.007, 0);
    for (const s of [-1, 1]) {
      rbox(optic, 0.035, 0.012, 0.04, 0.004, M.metalDark, ox + s * 0.056, railTop + 0.007, 0);
      cyl(optic, tubeR + 0.005, tubeR + 0.005, 0.012, M.metal, ox + s * 0.056, scopeY - 0.005, 0, { axis: 'x', seg: 22 });
      box(optic, 0.012, 0.045, 0.012, M.metalDark, ox + s * 0.056, railTop + 0.025, 0);
    }
    cyl(optic, tubeR, tubeR, len, M.metalDark, ox, scopeY, 0, { axis: 'x', seg: 30 });
    cyl(optic, big ? 0.03 : 0.025, tubeR + 0.002, 0.052, M.metalDark, ox + len / 2 + 0.016, scopeY, 0, { axis: 'x', seg: 30 });
    cyl(optic, big ? 0.024 : 0.022, tubeR + 0.002, 0.045, M.metalDark, ox - len / 2 - 0.012, scopeY, 0, { axis: 'x', seg: 30 });
    cyl(optic, big ? 0.028 : 0.023, big ? 0.028 : 0.023, 0.002, M.lens, ox + len / 2 + 0.04, scopeY, 0, { axis: 'x', seg: 30, cast: false });
    cyl(optic, 0.021, 0.021, 0.002, M.glass, ox - len / 2 - 0.033, scopeY, 0, { axis: 'x', seg: 30, cast: false });
    // turrets
    cyl(optic, 0.012, 0.012, 0.018, M.metalDark, ox, scopeY + tubeR + 0.008, 0, { axis: 'y', seg: 18 });
    cyl(optic, 0.0105, 0.0105, 0.016, M.metalDark, ox, scopeY, tubeR + 0.008, { axis: 'z', seg: 18 });
    cyl(optic, 0.012, 0.012, 0.014, M.metalDark, ox, scopeY - tubeR - 0.007, 0, { axis: 'y', seg: 18 });
    // magnification ring
    cyl(optic, tubeR + 0.006, tubeR + 0.006, 0.018, M.metal, ox - 0.045, scopeY, 0, { axis: 'x', seg: 26 });
    box(optic, 0.006, 0.022, 0.005, M.metalDark, ox - 0.045, scopeY + tubeR + 0.013, 0);
    microText(optic, 'RAZOR 1-6X24', 0.035, 0.004, ox + 0.02, scopeY - tubeR - 0.001, 0.0145, { opacity: 0.5 });
  } else if (opType === 'Prism') {
    const scopeY = railTop + 0.045;
    rbox(optic, 0.07, 0.014, 0.036, 0.004, M.metalDark, ox, railTop + 0.008, 0);
    cyl(optic, 0.017, 0.019, 0.08, M.metalDark, ox, scopeY, 0, { axis: 'x', seg: 24 });
    cyl(optic, 0.019, 0.019, 0.035, M.metalDark, ox + 0.05, scopeY, 0, { axis: 'x', seg: 24 });
    cyl(optic, 0.02, 0.02, 0.002, M.lens, ox + 0.068, scopeY, 0, { axis: 'x', seg: 24, cast: false });
    cyl(optic, 0.014, 0.014, 0.002, M.glass, ox - 0.046, scopeY, 0, { axis: 'x', seg: 20, cast: false });
    cyl(optic, 0.008, 0.008, 0.014, M.metalDark, ox, scopeY + 0.02, 0, { axis: 'y', seg: 14 });
    box(optic, 0.045, 0.003, 0.01, M.accent, ox + 0.01, scopeY + 0.024, 0);
    cyl(optic, 0.005, 0.005, 0.012, M.metalDark, ox + 0.005, scopeY - 0.024, 0, { axis: 'y', seg: 12 });
    microText(optic, 'ACOG 4X32', 0.028, 0.004, ox, scopeY - 0.019, 0.016, { opacity: 0.55 });
  } else if (opType === 'Iron sights') {
    // rear
    rbox(optic, 0.035, 0.01, 0.028, 0.003, M.metalDark, ox - 0.04, railTop + 0.006, 0);
    box(optic, 0.006, 0.026, 0.026, M.metalDark, ox - 0.04, railTop + 0.022, 0);
    box(optic, 0.002, 0.012, 0.006, M.metalDark, ox - 0.04, railTop + 0.03, 0);
    box(optic, 0.006, 0.026, 0.006, M.metalDark, ox - 0.04, railTop + 0.022, 0.012);
    box(optic, 0.006, 0.026, 0.006, M.metalDark, ox - 0.04, railTop + 0.022, -0.012);
    // front
    const fx = 0.093;
    rbox(optic, 0.028, 0.009, 0.026, 0.003, M.metalDark, fx, railTop + 0.006, 0);
    for (const s of [-1, 1]) box(optic, 0.006, 0.03, 0.004, M.metalDark, fx, railTop + 0.026, s * 0.011);
    box(optic, 0.002, 0.026, 0.002, M.metalDark, fx, railTop + 0.024, 0);
    cyl(optic, 0.0015, 0.0015, 0.006, M.accent, fx, railTop + 0.036, 0, { axis: 'y', seg: 8 });
  } else if (opType === 'None') {
    // nothing
  } else {
    rbox(optic, 0.06, 0.016, 0.032, 0.004, M.metalDark, ox, railTop + 0.008, 0);
    cyl(optic, 0.016, 0.016, 0.07, M.metalDark, ox, railTop + 0.035, 0, { axis: 'x', seg: 24 });
  }

  /* ---------------- charging handle ---------------- */
  const charging = slot('charging', [-0.08, 0.02, 0]);
  cyl(charging, 0.005, 0.005, 0.07, M.metalDark, -0.108, 0.068, 0, { axis: 'x', seg: 12 });
  rbox(charging, 0.014, 0.012, 0.05, 0.004, M.metalDark, -0.145, 0.068, 0);
  for (const s of [-1, 1]) {
    rbox(charging, 0.025, 0.011, 0.014, 0.004, M.metal, -0.152, 0.067, s * 0.028, { ry: s * 0.18 });
    box(charging, 0.02, 0.003, 0.006, M.metalDark, -0.158, 0.067, s * 0.033, { cast: false });
  }
  microText(charging, 'RAPTOR', 0.02, 0.003, -0.151, 0.074, 0.012, { opacity: 0.4 });

  /* ---------------- bolt carrier group ---------------- */
  const bcg = slot('bcg', [-0.16, 0.02, 0]);
  const bcgMat = /NiB/i.test(parts.bcg?.finish || '') ? M.brass : /Stainless/i.test(parts.bcg?.finish || '') ? M.steel : M.metalDark;
  cyl(bcg, 0.0115, 0.0115, 0.17, bcgMat, -0.006, 0.054, 0, { axis: 'x', seg: 20 });
  cyl(bcg, 0.009, 0.009, 0.03, bcgMat, 0.09, 0.054, 0, { axis: 'x', seg: 18 });
  cyl(bcg, 0.0125, 0.0125, 0.018, M.metal, -0.09, 0.054, 0, { axis: 'x', seg: 18 });
  box(bcg, 0.026, 0.01, 0.014, bcgMat, 0.03, 0.067, 0);
  box(bcg, 0.028, 0.008, 0.01, M.metalDark, -0.03, 0.066, 0.014);
  cyl(bcg, 0.0025, 0.0025, 0.024, M.steel, 0.058, 0.054, 0.012, { axis: 'z', seg: 8 });
  box(bcg, 0.025, 0.003, 0.006, M.steel, -0.06, 0.054, 0.009);

  /* ---------------- magazine ---------------- */
  const magazine = slot('magazine', [0, -0.12, 0]);
  const cap = parts.magazine?.capacity || 30;
  if (cap >= 50) {
    cyl(magazine, 0.055, 0.055, 0.055, M.furnitureDark, -0.035, -0.13, 0, { axis: 'z', seg: 36 });
    cyl(magazine, 0.05, 0.05, 0.058, M.furniture, -0.035, -0.13, 0, { axis: 'z', seg: 36 });
    cyl(magazine, 0.02, 0.02, 0.062, M.metalDark, -0.035, -0.13, 0, { axis: 'z', seg: 20 });
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      box(magazine, 0.012, 0.05, 0.004, M.metalDark, -0.035 + Math.cos(a) * 0.045, -0.13 + Math.sin(a) * 0.045, 0.03, { rz: a, cast: false });
    }
    microText(magazine, 'D-60', 0.024, 0.004, -0.035, -0.13, 0.059, { opacity: 0.5 });
  } else {
    const magLen = cap <= 10 ? 0.13 : 0.19;
    const shape = new THREE.Shape();
    shape.moveTo(-0.031, 0);
    shape.lineTo(0.027, 0);
    shape.bezierCurveTo(0.03, -magLen * 0.35, 0.04, -magLen * 0.72, 0.052, -magLen);
    shape.lineTo(-0.004, -magLen);
    shape.bezierCurveTo(-0.012, -magLen * 0.72, -0.022, -magLen * 0.35, -0.031, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.026, bevelEnabled: true, bevelSize: 0.0025, bevelThickness: 0.002, bevelSegments: 2, curveSegments: 6 });
    geo.center();
    const mag = new THREE.Mesh(geo, M.furniture);
    mag.position.set(-0.048, -0.077 - magLen / 2 + 0.006, 0);
    mag.castShadow = true; mag.receiveShadow = true;
    magazine.add(mag);
    // floor plate
    rbox(magazine, 0.062, 0.012, 0.033, 0.003, M.furnitureDark, -0.064, -0.077 - magLen + 0.004, 0, { rz: -0.035 });
    // stamped side ribs (kept inside the magazine body)
    for (let i = 0; i < 4; i++) {
      box(magazine, 0.004, magLen * 0.46, 0.03, M.furnitureDark, -0.079 + i * 0.014, -0.077 - magLen * 0.5, 0, { rz: 0.02, cast: false });
    }
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        cyl(magazine, 0.0022, 0.0022, 0.001, M.metalDark, -0.045, -0.10 - i * 0.032, s * 0.0165, { axis: 'z', seg: 10, cast: false });
      }
    }
    microText(magazine, 'PMAG 30', 0.02, 0.004, -0.064, -0.155, 0.0165, { opacity: 0.5 });
  }

  /* ---------------- light ---------------- */
  const light = slot('light', [0, 0.04, 0.12]);
  if (parts.light && parts.light.id !== 'no-light') {
    const lx = hgStart + Math.min(hgLen * 0.55, 0.22);
    rbox(light, 0.025, 0.016, 0.022, 0.003, M.metalDark, lx, 0.043, 0.038);
    cyl(light, 0.012, 0.012, 0.075, M.metalDark, lx + 0.02, 0.045, 0.055, { axis: 'x', seg: 20 });
    cyl(light, 0.016, 0.014, 0.032, M.metalDark, lx + 0.073, 0.045, 0.055, { axis: 'x', seg: 24 });
    cyl(light, 0.0145, 0.0145, 0.002, M.lens, lx + 0.09, 0.045, 0.055, { axis: 'x', seg: 24, cast: false });
    cyl(light, 0.0115, 0.0115, 0.012, M.rubber, lx - 0.02, 0.045, 0.055, { axis: 'x', seg: 18 });
    box(light, 0.02, 0.004, 0.006, M.metal, lx + 0.02, 0.058, 0.055);
    microText(light, '1000 LM', 0.016, 0.003, lx + 0.02, 0.036, 0.067, { opacity: 0.5 });
  }

  return { root, groups };
}
