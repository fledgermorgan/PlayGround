import * as THREE from 'three';
import { IN } from './kit.js';

export function buildPistol(kit, parts, finish) {
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

  /* ---------------- frame (static) ---------------- */
  // dust cover / frame nose
  rbox(base, 0.13, 0.032, 0.028, 0.006, M.furniture, 0.035, -0.012, 0);
  rbox(base, 0.05, 0.018, 0.026, 0.004, M.furniture, 0.105, -0.022, 0);
  // accessory rail
  rail(base, 0.06, -0.032, 0, 0.055, M.furnitureDark);
  // grip
  const grip = new THREE.Group();
  grip.position.set(-0.045, -0.024, 0);
  grip.rotation.z = -0.17;
  base.add(grip);
  rbox(grip, 0.048, 0.115, 0.042, 0.014, M.furniture, 0, -0.055, 0);
  rbox(grip, 0.052, 0.012, 0.045, 0.005, M.furnitureDark, 0, -0.115, 0);
  // backstrap / beavertail
  rbox(grip, 0.016, 0.06, 0.038, 0.006, M.furniture, -0.025, -0.015, 0);
  box(base, 0.038, 0.014, 0.036, M.furniture, -0.062, -0.022, 0, { rz: 0.12 });
  // grip texture panels
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        box(grip, 0.0022, 0.0022, 0.001, M.furnitureDark, 0.023, -0.02 - i * 0.019, s * 0.021, { cast: false });
      }
    }
    box(grip, 0.036, 0.045, 0.003, M.furnitureDark, -0.002, -0.055, s * 0.021, { cast: false });
  }
  // trigger guard
  box(base, 0.055, 0.007, 0.026, M.furniture, 0.012, -0.06, 0);
  box(base, 0.007, 0.038, 0.026, M.furniture, 0.039, -0.043, 0);
  box(base, 0.007, 0.034, 0.026, M.furniture, -0.014, -0.045, 0);
  // controls
  rbox(base, 0.035, 0.008, 0.006, 0.002, M.metalDark, 0.0, -0.002, -0.017);
  cyl(base, 0.007, 0.007, 0.008, M.metalDark, -0.005, -0.024, 0.017, { axis: 'z', seg: 14 });
  rbox(base, 0.014, 0.008, 0.008, 0.002, M.metalDark, 0.012, -0.008, 0.018);
  // magazine well flare at the top of the grip
  rbox(base, 0.054, 0.012, 0.048, 0.004, M.furnitureDark, -0.047, -0.033, 0, { rz: -0.17 });
  microText(base, 'IRONFORGE  G17', 0.045, 0.004, 0.02, -0.02, 0.0145, { opacity: 0.4 });

  /* ---------------- slide ---------------- */
  const slide = slot('slide', [0, 0.18, 0]);
  const slideY = 0.012;
  rbox(slide, 0.205, 0.04, 0.031, 0.007, M.metal, 0.0, slideY, 0);
  rbox(slide, 0.02, 0.036, 0.029, 0.006, M.metal, 0.1, slideY, 0, { rz: -0.06 });
  // rear cocking serrations
  for (let i = 0; i < 7; i++) {
    for (const s of [-1, 1]) {
      box(slide, 0.0032, 0.03, 0.0014, M.metalDark, -0.085 + i * 0.0065, slideY, s * 0.0158, { cast: false });
    }
  }
  // front serrations
  for (let i = 0; i < 5; i++) {
    for (const s of [-1, 1]) {
      box(slide, 0.003, 0.028, 0.0014, M.metalDark, 0.065 + i * 0.006, slideY, s * 0.0158, { cast: false });
    }
  }
  // ejection port
  box(slide, 0.05, 0.022, 0.002, M.metalDark, 0.035, slideY + 0.004, 0.0158, { cast: false });
  box(slide, 0.05, 0.003, 0.0016, M.steel, 0.035, slideY + 0.018, 0.0162);
  // extractor
  rbox(slide, 0.012, 0.008, 0.006, 0.002, M.steel, 0.058, slideY + 0.009, 0.014);
  // optic cut / cover plate
  if (parts.slide?.opticReady) {
    rbox(slide, 0.045, 0.006, 0.024, 0.002, M.metalDark, 0.0, slideY + 0.022, 0);
    for (const x of [-0.014, 0.014]) cyl(slide, 0.0025, 0.0025, 0.003, M.steel, x, slideY + 0.025, 0, { axis: 'y', seg: 8 });
  }
  // channel liner / breech face block
  box(slide, 0.012, 0.03, 0.026, M.metalDark, -0.095, slideY, 0);
  // slide markings
  microText(slide, 'IRONFORGE', 0.035, 0.004, 0.02, slideY - 0.01, 0.0157, { opacity: 0.45 });
  microText(slide, '9X19', 0.02, 0.0035, -0.06, slideY - 0.008, 0.0157, { opacity: 0.35 });

  /* ---------------- barrel ---------------- */
  const barrel = slot('barrel', [0.06, 0.04, 0]);
  const threaded = parts.barrel?.threaded;
  cyl(barrel, 0.011, 0.011, 0.045, M.steel, 0.075, slideY, 0, { axis: 'x', seg: 22 });
  cyl(barrel, 0.0092, 0.0092, 0.012, threaded ? M.metalDark : M.steel, 0.102, slideY, 0, { axis: 'x', seg: 20 });
  cyl(barrel, 0.0078, 0.0078, 0.002, M.rubber, threaded ? 0.108 : 0.1075, slideY, 0, { axis: 'x', seg: 16 });
  if (threaded) {
    cyl(barrel, 0.0085, 0.0085, 0.014, M.steel, 0.111, slideY, 0, { axis: 'x', seg: 18 });
    for (let i = 0; i < 5; i++) cyl(barrel, 0.009, 0.009, 0.001, M.metalDark, 0.106 + i * 0.0024, slideY, 0, { axis: 'x', seg: 18 });
  }
  // chamber block visible through port
  rbox(barrel, 0.03, 0.018, 0.022, 0.003, M.steel, 0.025, slideY + 0.003, 0);
  // recoil spring guide under barrel
  cyl(barrel, 0.005, 0.005, 0.06, M.metalDark, 0.055, slideY - 0.014, 0, { axis: 'x', seg: 14 });

  /* ---------------- muzzle ---------------- */
  const muzzle = slot('muzzle', [0.14, 0, 0]);
  const mz = parts.muzzle || {};
  if (mz.id && mz.id !== 'g17-no-muzzle' && mz.length > 0) {
    const len = mz.length * IN;
    if (mz.suppression) {
      cyl(muzzle, 0.019, 0.021, len * 0.9, M.metalDark, 0.123 + len / 2, slideY, 0, { axis: 'x', seg: 26 });
      cyl(muzzle, 0.022, 0.019, 0.02, M.metalDark, 0.13, slideY, 0, { axis: 'x', seg: 26 });
      for (let i = 0; i < 3; i++) cyl(muzzle, 0.0205, 0.0205, 0.002, M.metalDark, 0.14 + i * 0.04, slideY, 0, { axis: 'x', seg: 26 });
      microText(muzzle, 'OBSIDIAN 9', 0.05, 0.008, 0.16, slideY + 0.018, 0.0215, { opacity: 0.45 });
    } else {
      cyl(muzzle, 0.0125, 0.0115, len * 0.8, M.metalDark, 0.118 + len / 2, slideY, 0, { axis: 'x', seg: 20 });
      for (let i = 0; i < 2; i++) box(muzzle, 0.008, 0.007, 0.002, M.rubber, 0.13 + i * 0.012, slideY, 0.0105, { cast: false });
      box(muzzle, 0.008, 0.002, 0.012, M.rubber, 0.125, slideY + 0.013, 0, { cast: false });
      cyl(muzzle, 0.0135, 0.0125, 0.006, M.metal, 0.118 + len, slideY, 0, { axis: 'x', seg: 20 });
    }
  }

  /* ---------------- optic ---------------- */
  const optic = slot('optic', [0, 0.22, 0]);
  const op = parts.optic || {};
  if (op.id && op.id !== 'g17-no-optic') {
    const oy = slideY + 0.03;
    rbox(optic, 0.044, 0.008, 0.026, 0.002, M.metalDark, 0.0, oy, 0);
    rbox(optic, 0.03, 0.024, 0.024, 0.004, M.metalDark, 0.0, oy + 0.015, 0);
    // lens housing window
    cyl(optic, 0.0105, 0.0105, 0.003, M.lens, 0.016, oy + 0.015, 0, { axis: 'x', seg: 20, cast: false });
    cyl(optic, 0.0105, 0.0105, 0.003, M.glass, -0.016, oy + 0.015, 0, { axis: 'x', seg: 20, cast: false });
    box(optic, 0.016, 0.006, 0.018, M.metalDark, -0.01, oy + 0.026, 0);
    cyl(optic, 0.003, 0.003, 0.004, M.rubber, -0.018, oy + 0.012, 0.009, { axis: 'x', seg: 8 });
    microText(optic, 'RMR', 0.016, 0.0028, 0.0, oy + 0.007, 0.0125, { opacity: 0.4 });
  }

  /* ---------------- sights ---------------- */
  const sights = slot('sights', [0, 0.11, 0]);
  const sy = slideY + 0.02;
  // rear sight
  rbox(sights, 0.016, 0.007, 0.026, 0.002, M.metalDark, -0.083, sy + 0.0035, 0);
  box(sights, 0.004, 0.009, 0.022, M.metalDark, -0.087, sy + 0.01, 0);
  for (const s of [-1, 1]) cyl(sights, 0.002, 0.002, 0.002, M.accent, -0.087, sy + 0.01, s * 0.0065, { axis: 'z', seg: 10, cast: false });
  // front sight
  rbox(sights, 0.01, 0.007, 0.012, 0.002, M.metalDark, 0.088, sy + 0.0035, 0);
  box(sights, 0.004, 0.009, 0.008, M.metalDark, 0.088, sy + 0.01, 0);
  cyl(sights, 0.002, 0.002, 0.002, M.accent, 0.088, sy + 0.014, 0, { axis: 'y', seg: 10, cast: false });

  /* ---------------- trigger ---------------- */
  const trigger = slot('trigger', [0, -0.08, 0]);
  rbox(trigger, 0.006, 0.03, 0.01, 0.002, M.metalDark, 0.006, -0.039, 0, { rz: 0.1 });
  rbox(trigger, 0.012, 0.006, 0.011, 0.002, M.metalDark, 0.012, -0.056, 0, { rz: 0.4 });
  box(trigger, 0.018, 0.006, 0.012, M.metalDark, 0.0, -0.025, 0);
  microText(trigger, 'G17', 0.01, 0.0025, 0.003, -0.045, 0.006, { opacity: 0.3 });

  /* ---------------- magazine ---------------- */
  const magazine = slot('magazine', [0, -0.12, 0]);
  const cap = parts.magazine?.capacity || 17;
  const extended = cap >= 21;
  const longExt = cap >= 33;
  const magBottom = longExt ? -0.208 : extended ? -0.163 : -0.146;
  // magazine body visible inside the grip
  box(magazine, 0.03, 0.095, 0.034, M.metalDark, -0.048, -0.092, 0, { rz: -0.17, cast: false });
  rbox(magazine, 0.042, 0.012, 0.044, 0.004, M.furnitureDark, -0.055, magBottom, 0, { rz: -0.17 });
  box(magazine, 0.034, 0.008, 0.038, M.metalDark, -0.055, magBottom - 0.008, 0, { rz: -0.17 });
  if (extended) {
    const ext = longExt ? 0.072 : 0.032;
    rbox(magazine, 0.038, ext, 0.04, 0.005, M.furniture, -0.055, magBottom + ext / 2, 0, { rz: -0.17 });
    microText(magazine, `+${cap - 17}`, 0.012, 0.004, -0.055, magBottom + ext / 2, 0.0205, { opacity: 0.5 });
  }

  /* ---------------- light ---------------- */
  const light = slot('light', [0, -0.03, 0.12]);
  if (parts.light && parts.light.id !== 'g17-no-light') {
    const lx = 0.072;
    rbox(light, 0.022, 0.012, 0.022, 0.003, M.metalDark, lx, -0.034, 0);
    rbox(light, 0.016, 0.014, 0.028, 0.003, M.metalDark, lx, -0.042, 0);
    cyl(light, 0.0115, 0.0115, 0.058, M.metalDark, lx + 0.022, -0.052, 0, { axis: 'x', seg: 20 });
    cyl(light, 0.0145, 0.0125, 0.024, M.metalDark, lx + 0.06, -0.052, 0, { axis: 'x', seg: 22 });
    cyl(light, 0.0128, 0.0128, 0.002, M.lens, lx + 0.073, -0.052, 0, { axis: 'x', seg: 22, cast: false });
    box(light, 0.014, 0.005, 0.008, M.metal, lx - 0.004, -0.038, 0.014);
    microText(light, '1000', 0.012, 0.003, lx + 0.018, -0.062, 0.0115, { opacity: 0.4 });
  }

  return { root, groups };
}
