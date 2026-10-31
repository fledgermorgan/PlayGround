import * as THREE from 'three';
import { IN } from './kit.js';

export function buildBolt(kit, parts, finish) {
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

  /* ---------------- action (static) ---------------- */
  rbox(base, 0.17, 0.052, 0.044, 0.006, M.metal, -0.005, 0.04, 0);
  cyl(base, 0.021, 0.021, 0.11, M.metal, 0.055, 0.04, 0, { axis: 'x', seg: 26 });
  cyl(base, 0.023, 0.023, 0.016, M.steel, 0.112, 0.04, 0, { axis: 'x', seg: 26 });
  // bolt handle
  const bolt = new THREE.Group();
  bolt.position.set(-0.045, 0.058, 0.022);
  bolt.rotation.set(-0.3, 0, 0.95);
  base.add(bolt);
  cyl(bolt, 0.0055, 0.0055, 0.07, M.steel, 0, 0.035, 0, { axis: 'y', seg: 12 });
  sphere(bolt, 0.014, M.metalDark, 0, 0.077, 0, { seg: 18, seg2: 12 });
  // picatinny rail
  rail(base, -0.085, 0.071, 0, 0.17, M.metal);
  // action screws
  cyl(base, 0.0045, 0.0045, 0.05, M.steel, -0.06, 0.028, 0, { axis: 'z', seg: 10 });
  cyl(base, 0.0045, 0.0045, 0.05, M.steel, 0.06, 0.028, 0, { axis: 'z', seg: 10 });
  // bolt release
  box(base, 0.018, 0.008, 0.008, M.metalDark, 0.055, 0.028, 0.026);
  microText(base, 'R700  .308 WIN', 0.06, 0.005, -0.01, 0.032, 0.0225, { opacity: 0.45 });
  microText(base, 'SN 700-8842', 0.045, 0.004, 0.06, 0.02, 0.0225, { opacity: 0.35 });

  /* ---------------- chassis ---------------- */
  const chassis = slot('chassis', [0, -0.05, 0]);
  const ch = parts.chassis || {};
  const isPrecision = /ACC|PRS|XRS|Bravo/.test(ch.name || '');
  // buttstock
  rbox(chassis, 0.2, 0.078, 0.052, 0.012, M.furniture, -0.285, 0.003, 0);
  rbox(chassis, 0.11, 0.026, 0.048, 0.008, M.furnitureDark, -0.275, 0.052, 0);
  rbox(chassis, 0.016, 0.095, 0.056, 0.005, M.rubber, -0.39, -0.002, 0);
  // top bridge + thumbhole
  rbox(chassis, 0.12, 0.03, 0.05, 0.008, M.furniture, -0.16, 0.03, 0);
  // vertical grip
  const grip = new THREE.Group();
  grip.position.set(-0.125, -0.03, 0);
  grip.rotation.z = -0.08;
  chassis.add(grip);
  rbox(grip, 0.045, 0.12, 0.046, 0.012, M.furniture, 0, -0.05, 0);
  rbox(grip, 0.05, 0.014, 0.05, 0.004, M.furnitureDark, 0, -0.11, 0);
  for (let i = 0; i < 3; i++) cyl(grip, 0.0035, 0.0035, 0.044, M.furnitureDark, 0.024, -0.035 - i * 0.023, 0, { axis: 'z', seg: 10 });
  // cheek riser adjustment
  cyl(chassis, 0.007, 0.007, 0.05, M.metalDark, -0.3, 0.036, 0, { axis: 'z', seg: 14 });
  cyl(chassis, 0.005, 0.005, 0.012, M.steel, -0.26, 0.036, 0.028, { axis: 'z', seg: 10 });
  // fore-end
  rbox(chassis, 0.24, 0.05, 0.06, 0.01, M.furniture, 0.12, 0.0, 0);
  rbox(chassis, 0.2, 0.012, 0.062, 0.004, M.furnitureDark, 0.13, 0.029, 0);
  // fore-end M-LOK
  for (let i = 0; i < 4; i++) {
    mlok(chassis, 0.055 + i * 0.048, 0.0, 0.0305, { side: true });
    mlok(chassis, 0.055 + i * 0.048, 0.0, -0.0305, { side: true, ry: Math.PI });
    mlok(chassis, 0.055 + i * 0.048, -0.023, 0, { ry: Math.PI / 2 });
  }
  rail(chassis, 0.0, 0.032, 0, 0.13, M.metal);
  // magwell + trigger guard
  rbox(chassis, 0.085, 0.055, 0.05, 0.006, M.furniture, -0.025, -0.028, 0);
  box(chassis, 0.055, 0.008, 0.027, M.furnitureDark, -0.035, -0.075, 0);
  box(chassis, 0.009, 0.025, 0.027, M.furnitureDark, -0.005, -0.062, 0);
  box(chassis, 0.009, 0.025, 0.027, M.furnitureDark, -0.065, -0.062, 0);
  // chassis accent marks
  microText(chassis, 'IRONFORGE PRECISION', 0.08, 0.006, 0.12, -0.015, 0.031, { opacity: 0.4 });
  microText(chassis, 'IRONFORGE PRECISION', 0.08, 0.006, 0.12, -0.015, -0.031, { opacity: 0.4, ry: Math.PI });

  /* ---------------- barrel ---------------- */
  const barrel = slot('barrel', [0.06, 0.03, 0]);
  const bLen = (parts.barrel?.length || 24) * IN;
  const bStart = 0.06;
  const bEnd = bStart + bLen;
  const carb = /Carbon/i.test(parts.barrel?.material || '');
  const heavy = /MTU|Heavy|Varmint/i.test(parts.barrel?.contour || '');
  cyl(barrel, 0.017, 0.017, 0.05, M.metalDark, bStart + 0.025, 0.04, 0, { axis: 'x', seg: 22 });
  const r1 = heavy ? 0.0165 : carb ? 0.0145 : 0.015;
  cyl(barrel, r1 * 0.86, r1, bLen - 0.05, carb ? M.carbon : M.barrelSteel, bStart + 0.05 + (bLen - 0.05) / 2, 0.04, 0, { axis: 'x', seg: 28 });
  // muzzle threads
  cyl(barrel, 0.0105, 0.0105, 0.022, M.metalDark, bEnd + 0.006, 0.04, 0, { axis: 'x', seg: 18 });
  cyl(barrel, 0.009, 0.009, 0.01, M.steel, bEnd + 0.02, 0.04, 0, { axis: 'x', seg: 16 });
  // flutes
  if (heavy && !carb) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(barrel, bLen * 0.4, 0.0028, 0.005, M.metalDark, bStart + bLen * 0.42, 0.04 + Math.sin(a) * r1, Math.cos(a) * r1, { rx: a, cast: false });
    }
  }
  microText(barrel, 'PROOF  .308 1:10', 0.055, 0.005, bStart + 0.16, 0.029, -0.012, { opacity: 0.4, ry: Math.PI });

  /* ---------------- muzzle ---------------- */
  const muzzle = slot('muzzle', [0.17, 0, 0]);
  const mzLen = (parts.muzzle?.length || 2) * IN;
  const mzStart = bEnd + 0.026;
  const mzMid = mzStart + mzLen / 2;
  const mz = parts.muzzle || {};
  if (mz.suppression) {
    cyl(muzzle, 0.022, 0.024, mzLen * 0.9, M.metalDark, mzMid, 0.04, 0, { axis: 'x', seg: 30 });
    cyl(muzzle, 0.026, 0.022, 0.02, M.metalDark, mzStart + 0.01, 0.04, 0, { axis: 'x', seg: 30 });
    cyl(muzzle, 0.023, 0.023, 0.01, M.metal, mzStart + 0.035, 0.04, 0, { axis: 'x', seg: 30 });
    for (let i = 0; i < 4; i++) cyl(muzzle, 0.0238, 0.0238, 0.002, M.metalDark, mzMid - mzLen * 0.22 + i * mzLen * 0.15, 0.04, 0, { axis: 'x', seg: 30 });
    marking(muzzle, 'THUNDER BEAST', 'ULTRA 9  .30 CAL  NFA', 0.09, 0.012, mzMid, 0.061, 0.0244, { opacity: 0.55 });
  } else if (mz.recoil > 20) {
    cyl(muzzle, 0.015, 0.014, mzLen * 0.72, M.metalDark, mzMid, 0.04, 0, { axis: 'x', seg: 22 });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) box(muzzle, 0.009, 0.01, 0.002, M.rubber, mzStart + mzLen * 0.2 + i * mzLen * 0.18, 0.04, s * 0.0125, { cast: false });
    }
    box(muzzle, 0.012, 0.002, 0.014, M.rubber, mzStart + mzLen * 0.3, 0.054, 0, { cast: false });
    cyl(muzzle, 0.017, 0.016, 0.01, M.metal, mzStart + mzLen * 0.9, 0.04, 0, { axis: 'x', seg: 22 });
  } else {
    cyl(muzzle, 0.011, 0.011, mzLen * 0.9, M.metalDark, mzMid, 0.04, 0, { axis: 'x', seg: 18 });
    for (let i = 0; i < 4; i++) cyl(muzzle, 0.012, 0.012, 0.0015, M.steel, mzStart + 0.005 + i * 0.006, 0.04, 0, { axis: 'x', seg: 16 });
  }

  /* ---------------- optic ---------------- */
  const optic = slot('optic', [0, 0.26, 0]);
  const op = parts.optic || {};
  if (op.type && op.type !== 'None') {
    const scopeY = 0.112;
    const big = /Precision|6-36|7-35|5-25|5-30/.test(op.name || '') || op.type === 'Precision scope';
    const tubeR = big ? 0.0185 : 0.016;
    // mount bases and rings
    for (const x of [-0.065, 0.055]) {
      rbox(optic, 0.032, 0.016, 0.036, 0.004, M.metalDark, x, 0.083, 0);
      box(optic, 0.012, 0.03, 0.014, M.metalDark, x, 0.098, 0);
      cyl(optic, tubeR + 0.006, tubeR + 0.006, 0.014, M.metal, x, scopeY, 0, { axis: 'x', seg: 24 });
      for (let i = 0; i < 3; i++) box(optic, 0.003, 0.005, 0.003, M.metalDark, x, scopeY + tubeR + 0.005, -0.008 + i * 0.008, { cast: false });
    }
    cyl(optic, tubeR, tubeR, 0.31, M.metalDark, -0.005, scopeY, 0, { axis: 'x', seg: 32 });
    cyl(optic, 0.031, tubeR + 0.002, 0.06, M.metalDark, 0.175, scopeY, 0, { axis: 'x', seg: 32 });
    cyl(optic, 0.026, tubeR + 0.002, 0.052, M.metalDark, -0.17, scopeY, 0, { axis: 'x', seg: 32 });
    cyl(optic, 0.029, 0.029, 0.002, M.lens, 0.205, scopeY, 0, { axis: 'x', seg: 32, cast: false });
    cyl(optic, 0.023, 0.023, 0.002, M.glass, -0.196, scopeY, 0, { axis: 'x', seg: 32, cast: false });
    // turrets
    cyl(optic, 0.013, 0.013, 0.02, M.metalDark, -0.005, scopeY + tubeR + 0.009, 0, { axis: 'y', seg: 20 });
    cyl(optic, 0.012, 0.012, 0.018, M.metalDark, -0.005, scopeY, tubeR + 0.009, { axis: 'z', seg: 20 });
    cyl(optic, 0.011, 0.011, 0.012, M.metalDark, -0.005, scopeY - tubeR - 0.006, 0, { axis: 'y', seg: 16 });
    // magnification ring + throw lever
    cyl(optic, tubeR + 0.007, tubeR + 0.007, 0.018, M.metal, -0.11, scopeY, 0, { axis: 'x', seg: 28 });
    box(optic, 0.007, 0.026, 0.005, M.furnitureDark, -0.11, scopeY + tubeR + 0.016, 0);
    // parallax knob
    cyl(optic, 0.012, 0.012, 0.014, M.metalDark, 0.02, scopeY, -tubeR - 0.007, { axis: 'z', seg: 18 });
    microText(optic, 'RAZOR HD 6-36X56', 0.045, 0.005, 0.005, scopeY - tubeR - 0.001, 0.0155, { opacity: 0.5 });
  }

  /* ---------------- bipod ---------------- */
  const bipod = slot('bipod', [0, -0.1, 0]);
  if (parts.bipod && parts.bipod.id !== 'no-bipod') {
    const bx = 0.205;
    rbox(bipod, 0.038, 0.016, 0.03, 0.004, M.metalDark, bx, -0.026, 0);
    rbox(bipod, 0.056, 0.012, 0.018, 0.003, M.metal, bx, -0.037, 0);
    for (const s of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(bx, -0.043, s * 0.014);
      leg.rotation.set(s * 0.5, 0, 0.26);
      bipod.add(leg);
      cyl(leg, 0.005, 0.005, 0.086, M.metalDark, 0, -0.043, 0, { axis: 'y', seg: 10 });
      cyl(leg, 0.004, 0.004, 0.04, M.steel, 0, -0.106, 0, { axis: 'y', seg: 10 });
      sphere(leg, 0.01, M.rubber, 0, -0.13, 0, { seg: 12, seg2: 8 });
      cyl(leg, 0.007, 0.007, 0.014, M.metalDark, 0, -0.005, 0, { axis: 'z', seg: 12 });
    }
    box(bipod, 0.018, 0.008, 0.05, M.metalDark, bx, -0.046, 0);
  }

  /* ---------------- trigger ---------------- */
  const trigger = slot('trigger', [0, -0.08, 0]);
  rbox(trigger, 0.007, 0.032, 0.011, 0.002, M.metalDark, -0.035, -0.065, 0, { rz: 0.15 });
  rbox(trigger, 0.013, 0.006, 0.012, 0.002, M.metalDark, -0.028, -0.082, 0, { rz: 0.45 });
  cyl(trigger, 0.0032, 0.0032, 0.014, M.steel, -0.035, -0.05, 0, { axis: 'z', seg: 10 });
  microText(trigger, 'TT', 0.01, 0.003, -0.035, -0.07, 0.0065, { opacity: 0.4 });

  /* ---------------- magazine ---------------- */
  const magazine = slot('magazine', [0, -0.13, 0]);
  const cap = parts.magazine?.capacity || 10;
  const magLen = cap >= 12 ? 0.13 : cap >= 10 ? 0.115 : 0.08;
  const shape = new THREE.Shape();
  shape.moveTo(-0.038, 0);
  shape.lineTo(0.038, 0);
  shape.lineTo(0.048, -magLen);
  shape.lineTo(-0.025, -magLen);
  shape.lineTo(-0.038, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.048, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 });
  geo.center();
  const mag = new THREE.Mesh(geo, M.metalDark);
  mag.position.set(-0.015, -0.028 - magLen / 2, 0);
  mag.castShadow = true; mag.receiveShadow = true;
  magazine.add(mag);
  rbox(magazine, 0.078, 0.012, 0.054, 0.003, M.metal, -0.012, -0.028 - magLen, 0);
  for (let i = 0; i < 2; i++) box(magazine, 0.006, magLen * 0.6, 0.05, M.metal, -0.03 + i * 0.04, -0.028 - magLen * 0.5, 0, { cast: false });
  microText(magazine, 'AICS 10', 0.026, 0.004, -0.012, -0.06, 0.0255, { opacity: 0.4 });

  return { root, groups };
}
