import { PLATFORMS, CALIBERS } from './data/index.js';

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

export function getPart(platformId, slot, partId) {
  const platform = PLATFORMS[platformId];
  if (!platform) return null;
  return (platform.parts[slot] || []).find((p) => p.id === partId) || null;
}

export function partFor(platform, slot, selection) {
  return getPart(platform.id, slot, selection[slot]);
}

function activeCaliber(platform, parts) {
  if (platform.id === 'ar15' && parts.barrel?.caliber) return parts.barrel.caliber;
  return platform.caliberKey;
}

function barrelLength(platform, parts) {
  if (platform.id === 'ar15') return parts.barrel?.length || 16;
  if (platform.id === 'bolt') return parts.barrel?.length || 24;
  if (platform.id === 'pistol') return 4.49;
  return 16.3;
}

function addIssue(issues, severity, text, slots = [], code = '') {
  issues.push({ severity, text, slots, code });
}

function currentInch(value) {
  return `${round(value, 1)}"`;
}

export function evaluateBuild(platformId, selection) {
  const platform = PLATFORMS[platformId];
  const parts = {};
  for (const slot of platform.slotOrder) parts[slot] = getPart(platformId, slot, selection[slot]);
  const caliberKey = activeCaliber(platform, parts);
  const caliber = CALIBERS[caliberKey] || CALIBERS[platform.caliberKey];
  const issues = [];

  /* ---------------- compatibility ---------------- */
  if (platform.id === 'ar15') {
    const { barrel, handguard, muzzle, magazine, bcg, light, stock } = parts;
    if (barrel && muzzle) {
      if (muzzle.thread !== barrel.thread) {
        addIssue(issues, 'error', `${muzzle.name} is threaded ${muzzle.thread}; the ${barrel.brand} barrel needs ${barrel.thread}.`, ['barrel', 'muzzle'], 'thread');
      }
      if (!muzzle.calibers.includes(caliberKey)) {
        addIssue(issues, 'error', `${muzzle.name} is not rated for ${caliber.short}.`, ['barrel', 'muzzle'], 'caliber');
      }
    }
    if (barrel && handguard && handguard.length > barrel.length - 1.0) {
      addIssue(issues, 'error', `${handguard.name} (${currentInch(handguard.length)}) overruns the ${currentInch(barrel.length)} barrel. Use a rail of ${round(barrel.length - 1, 1)}" or shorter.`, ['barrel', 'handguard'], 'handguard');
    }
    if (barrel && bcg && !bcg.calibers.includes(caliberKey)) {
      addIssue(issues, 'error', `${caliber.short} needs a matching bolt face. ${bcg.name} will not headspace.`, ['barrel', 'bcg'], 'bolt');
    }
    if (barrel && magazine && !magazine.calibers.includes(caliberKey)) {
      addIssue(issues, 'error', `${magazine.name} does not feed ${caliber.short}.`, ['barrel', 'magazine'], 'mag');
    }
    if (barrel && barrel.length < 16) {
      addIssue(issues, 'warn', `Barrel is ${currentInch(barrel.length)}. In the US this is a short-barreled rifle under the NFA and requires registration.`, ['barrel'], 'nfa-sbr');
    }
    if (muzzle?.nfa) {
      addIssue(issues, 'info', `${muzzle.name} is an NFA-regulated suppressor. Tax stamp and wait time apply in the US.`, ['muzzle'], 'nfa-suppressor');
    }
    if (muzzle?.suppression && barrel && barrel.length < 12) {
      addIssue(issues, 'warn', 'Very short barrel plus a suppressor can over-gas the action. Consider an adjustable gas block or restricted gas tube.', ['barrel', 'muzzle'], 'backpressure');
    }
    if (muzzle?.nfa && bcg && bcg.weight < 280) {
      addIssue(issues, 'warn', 'A lightweight carrier and a suppressor are a demanding gas combination. Buffer and spring tuning will be needed.', ['muzzle', 'bcg'], 'lmos');
    }
    if (magazine?.capacity >= 60) {
      addIssue(issues, 'warn', `${magazine.capacity}-round ${magazine.material === 'Polymer' ? 'drum' : 'magazine'} adds bulk and shifts the balance forward.`, ['magazine'], 'bulk');
    }
    if (light && light.id !== 'no-light' && handguard && handguard.mount === 'None') {
      addIssue(issues, 'error', `${handguard.name} has no accessory interface for the light.`, ['handguard', 'light'], 'mount');
    }
    if (magazine?.capacity > 10) {
      addIssue(issues, 'info', `${magazine.capacity}-round capacity may be restricted by state law where you live.`, ['magazine'], 'capacity');
    }
    if (stock && stock.type === 'Precision' && barrel && barrel.length < 14) {
      addIssue(issues, 'warn', 'A heavy precision stock on a short barrel makes an awkward, rear-heavy carbine.', ['stock', 'barrel'], 'balance');
    }
  }

  if (platform.id === 'akm') {
    const { muzzle, handguard, stock, magazine } = parts;
    if (muzzle && muzzle.thread !== '14x1LH') {
      addIssue(issues, 'error', `${muzzle.name} uses ${muzzle.thread}; the AKM front sight block is 14×1 LH.`, ['muzzle'], 'thread');
    }
    if (muzzle && !muzzle.calibers.includes('7.62x39')) {
      addIssue(issues, 'error', `${muzzle.name} is not rated for 7.62×39.`, ['muzzle'], 'caliber');
    }
    if (muzzle?.nfa) {
      addIssue(issues, 'info', `${muzzle.name} is an NFA-regulated suppressor. The AK will likely need an adjustable gas piston.`, ['muzzle'], 'nfa-suppressor');
    }
    if (muzzle?.suppression) {
      addIssue(issues, 'warn', 'Suppressed AKs are typically over-gassed. Budget for an adjustable gas piston or KNS piston.', ['muzzle'], 'backpressure');
    }
    if (magazine?.capacity >= 75) {
      addIssue(issues, 'warn', 'A 75-round drum is a range toy first and a fighting magazine second. It weighs over a kilogram loaded.', ['magazine'], 'bulk');
    }
    if (handguard?.mount === 'None') {
      addIssue(issues, 'info', 'The laminate handguard has no accessory interface. Add a railed handguard for a light or handstop.', ['handguard'], 'mount');
    }
    if (stock?.type === 'Folding' && caliberKey === '7.62x39') {
      addIssue(issues, 'info', 'Folding stock selected. Confirm the folded length clears any mounted optic.', ['stock', 'optic'], 'fold');
    }
    if (magazine?.capacity > 10) {
      addIssue(issues, 'info', `${magazine.capacity}-round capacity may be restricted by state law where you live.`, ['magazine'], 'capacity');
    }
  }

  if (platform.id === 'bolt') {
    const { chassis, barrel, muzzle, bipod, magazine } = parts;
    if (muzzle && muzzle.thread !== barrel?.thread) {
      addIssue(issues, 'error', `${muzzle.name} (${muzzle.thread}) will not thread onto the ${barrel.thread} barrel.`, ['barrel', 'muzzle'], 'thread');
    }
    if (muzzle && !muzzle.calibers.includes('308')) {
      addIssue(issues, 'error', `${muzzle.name} is not rated for .308 Winchester.`, ['muzzle'], 'caliber');
    }
    if (bipod && bipod.id !== 'no-bipod' && chassis && !chassis.bipodReady) {
      addIssue(issues, 'error', `${chassis.name} has no support interface for a bipod without additional hardware.`, ['chassis', 'bipod'], 'mount');
    }
    if (muzzle?.nfa) {
      addIssue(issues, 'info', `${muzzle.name} is an NFA-regulated suppressor. Verify the barrel's thread pitch and shoulder before mounting.`, ['muzzle'], 'nfa-suppressor');
    }
    if (barrel?.length >= 26 && muzzle?.nfa) {
      addIssue(issues, 'warn', 'A 26-inch barrel with a 9-inch suppressor makes a very long package. Check case dimensions and balance.', ['barrel', 'muzzle'], 'length');
    }
    if (magazine?.capacity > 10) {
      addIssue(issues, 'info', `${magazine.capacity}-round capacity may be restricted by state law where you live.`, ['magazine'], 'capacity');
    }
  }

  if (platform.id === 'pistol') {
    const { slide, barrel, muzzle, optic, sights, magazine } = parts;
    if (muzzle && muzzle.requiresThread && barrel && !barrel.threaded) {
      addIssue(issues, 'error', `${muzzle.name} needs a threaded barrel. The ${barrel.name} is not threaded.`, ['barrel', 'muzzle'], 'thread');
    }
    if (muzzle && muzzle.id !== 'g17-no-muzzle' && muzzle.thread !== barrel?.thread) {
      addIssue(issues, 'error', `${muzzle.name} is threaded ${muzzle.thread}; the barrel is ${barrel.thread}.`, ['barrel', 'muzzle'], 'thread');
    }
    if (optic && optic.id !== 'g17-no-optic' && slide && !slide.opticReady) {
      addIssue(issues, 'error', `${slide.name} is not cut for an optic. Choose an optic-ready slide.`, ['slide', 'optic'], 'cut');
    }
    if (optic && optic.id !== 'g17-no-optic' && slide?.opticReady && optic.footprint !== slide.cut) {
      addIssue(issues, 'warn', `${optic.footprint} footprint on a ${slide.cut} slide cut requires an adapter plate.`, ['slide', 'optic'], 'footprint');
    }
    if (muzzle?.nfa) {
      addIssue(issues, 'info', `${muzzle.name} is an NFA-regulated suppressor. A threaded barrel and piston/booster are required.`, ['muzzle'], 'nfa-suppressor');
    }
    if (muzzle?.suppression && barrel && !barrel.threaded) {
      addIssue(issues, 'error', 'A suppressor needs a threaded muzzle.', ['barrel', 'muzzle'], 'thread');
    }
    if (optic && optic.id !== 'g17-no-optic' && sights && sights.id !== 'g17-oem-sights') {
      addIssue(issues, 'info', 'Aftermarket sights may not co-witness with the chosen optic. Verify deck height before zeroing.', ['optic', 'sights'], 'cowitness');
    }
    if (magazine?.capacity > 17) {
      addIssue(issues, 'info', `${magazine.capacity}-round magazine extends past the grip and may be restricted by state law.`, ['magazine'], 'capacity');
    }
  }

  /* ---------------- weights & physical ---------------- */
  let weight = platform.baseWeight;
  let cost = platform.baseCost;
  for (const slot of platform.slotOrder) {
    const part = parts[slot];
    if (!part) continue;
    weight += part.weight || 0;
    cost += part.price || 0;
  }
  const weightKg = weight / 1000;

  let oal = platform.baseOAL;
  if (platform.id === 'ar15') {
    oal += barrelLength(platform, parts) + (parts.muzzle?.length || 0) + (parts.stock?.lengthAdd || 0);
  } else if (platform.id === 'akm') {
    oal += (parts.muzzle?.length || 0) + (parts.stock?.lengthAdd || 0);
  } else if (platform.id === 'bolt') {
    oal += barrelLength(platform, parts) + (parts.muzzle?.length || 0) + 2.0;
  } else {
    oal += (parts.muzzle?.length || 0) + (parts.magazine?.capacity > 17 ? 0.35 : 0);
  }

  if (oal < 26 && platform.id !== 'pistol' && platform.id !== 'akm' && platform.id !== 'bolt') {
    addIssue(issues, 'warn', `Overall length is ${round(oal, 1)}". A rifle under 26" can be an NFA firearm even with a 16" barrel.`, ['stock', 'barrel'], 'nfa-oal');
  }

  const velocity = Math.round((caliber.refVelocity + (barrelLength(platform, parts) - caliber.refBarrel) * caliber.fpsPerInch) / 5) * 5;
  const barrelLen = barrelLength(platform, parts);

  /* ---------------- performance ---------------- */
  let reliability = platform.baseReliability;
  for (const slot of platform.slotOrder) {
    const p = parts[slot];
    if (!p) continue;
    if (typeof p.reliability === 'number') reliability += p.reliability;
    if (p.scores?.reliability) reliability += p.scores.reliability;
  }
  if (parts.muzzle?.suppression) reliability -= 1.5;
  if (parts.magazine?.capacity >= 60) reliability -= 1;
  reliability = clamp(Math.round(reliability), 52, 97);

  let ergo = platform.id === 'pistol' ? 56 : 54;
  if (parts.grip) ergo += parts.grip.ergo || 0;
  if (parts.stock) ergo += (parts.stock.ergo || 0) * 0.8;
  if (parts.chassis) ergo += (parts.chassis.ergo || 0) * 0.8;
  if (parts.trigger) ergo += (parts.trigger.ergo || 0) * 0.7;
  if (parts.optic) ergo += (parts.optic.ergo || 0) * 0.5;
  if (parts.charging) ergo += (parts.charging.ergo || 0) * 0.6;
  if (parts.handguard) ergo += (parts.handguard.ergo || 0) * 0.35;
  if (parts.slide) ergo += parts.slide.ergo || 0;
  if (parts.sights) ergo += (parts.sights.ergo || 0) * 0.8;
  if (parts.light) ergo += (parts.light.ergo || 0) * 0.4;
  if (parts.bipod) ergo += 2;
  const weightPenalty = Math.max(0, weightKg - (platform.id === 'pistol' ? 0.75 : platform.id === 'bolt' ? 4.8 : 3.0)) * (platform.id === 'pistol' ? 12 : 4);
  ergo = clamp(Math.round(ergo - weightPenalty), 32, 99);

  const muzzleReduction = (parts.muzzle?.recoil || 0) / 100;
  const stockReduction = (parts.stock?.recoil || parts.chassis?.recoil || 0) / 100;
  const massFactor = Math.pow((platform.id === 'pistol' ? 0.8 : 3.2) / Math.max(weightKg, 0.4), 0.55);
  const feltRecoil = caliber.recoilBase * massFactor * (1 - muzzleReduction * 0.75) * (1 - stockReduction * 0.35);
  const recoilScore = clamp(Math.round(100 - feltRecoil * (platform.id === 'pistol' ? 7 : 5.2)), 4, 99);

  let front = 0;
  let rear = 0;
  if (platform.id === 'ar15') {
    front = (parts.barrel?.weight || 0) * 0.78 + (parts.handguard?.weight || 0) + (parts.muzzle?.weight || 0) + (parts.optic?.weight || 0) * 0.32 + (parts.light?.weight || 0) + (parts.bcg?.weight || 0) * 0.18;
    rear = platform.baseWeight + (parts.stock?.weight || 0) + (parts.grip?.weight || 0) + (parts.trigger?.weight || 0) + (parts.magazine?.weight || 0) * 0.85 + (parts.charging?.weight || 0);
  } else if (platform.id === 'akm') {
    front = platform.baseWeight * 0.52 + (parts.handguard?.weight || 0) + (parts.muzzle?.weight || 0) + (parts.optic?.weight || 0) * 0.3 + (parts.magazine?.weight || 0) * 0.4;
    rear = platform.baseWeight * 0.48 + (parts.stock?.weight || 0) + (parts.grip?.weight || 0) + (parts.trigger?.weight || 0) + (parts.magazine?.weight || 0) * 0.6;
  } else if (platform.id === 'bolt') {
    front = (parts.barrel?.weight || 0) * 0.8 + (parts.chassis?.weight || 0) * 0.45 + (parts.muzzle?.weight || 0) + (parts.optic?.weight || 0) * 0.3 + (parts.bipod?.weight || 0);
    rear = platform.baseWeight + (parts.chassis?.weight || 0) * 0.55 + (parts.magazine?.weight || 0) * 0.8 + (parts.trigger?.weight || 0);
  } else {
    front = (parts.barrel?.weight || 0) + (parts.slide?.weight || 0) * 0.62 + (parts.muzzle?.weight || 0) + (parts.optic?.weight || 0) + (parts.light?.weight || 0) * 0.7;
    rear = platform.baseWeight + (parts.slide?.weight || 0) * 0.38 + (parts.magazine?.weight || 0) + (parts.trigger?.weight || 0) + (parts.sights?.weight || 0);
  }
  const frontPct = clamp(Math.round((front / Math.max(front + rear, 1)) * 100), 20, 80);
  const balanceScore = clamp(Math.round(100 - Math.abs(frontPct - 52) * 2.2), 20, 100);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warn');
  const compatScore = clamp(100 - errors.length * 26 - warnings.length * 7 - issues.filter((i) => i.severity === 'info').length * 1, 0, 100);

  const score = clamp(Math.round(reliability * 0.3 + ergo * 0.27 + recoilScore * 0.22 + balanceScore * 0.11 + compatScore * 0.1), 0, 100);
  const grade = score >= 94 ? 'S' : score >= 87 ? 'A' : score >= 78 ? 'B' : score >= 68 ? 'C' : 'D';

  const capacity = parts.magazine?.capacity || 0;
  const notes = [];
  notes.push(`${round(weightKg, 2)} kg ${platform.name.toLowerCase()} in ${caliber.label}, built around ${parts.barrel ? `${parts.barrel.brand} ${parts.barrel.name}` : 'a factory assembly'}.`);
  notes.push(`Felt recoil is roughly ${round(feltRecoil, 1)} ft-lb at the shoulder with ${parts.muzzle?.name || 'the standard muzzle'} and ${parts.stock?.name || parts.chassis?.name || 'the factory stock'}.`);
  if (frontPct > 57) notes.push(`Balance sits ${frontPct}% forward — nose-heavy, but stable on a rest.`);
  else if (frontPct < 46) notes.push(`Balance sits ${frontPct}% forward — rear-heavy and quick to transition.`);
  else notes.push(`Balance sits ${frontPct}% forward — close to neutral for this class.`);
  if (parts.optic?.magnification && parts.optic.magnification !== '1×' && parts.optic.magnification !== '—') {
    notes.push(`The ${parts.optic.name} gives ${parts.optic.magnification} magnification, suited to positive identification beyond 300 m.`);
  }

  return {
    platform,
    parts,
    caliber,
    caliberKey,
    weight,
    weightKg,
    oal,
    barrelLen,
    velocity,
    feltRecoil,
    recoilScore,
    reliability,
    ergo,
    balance: frontPct,
    balanceScore,
    capacity,
    cost,
    score,
    grade,
    issues,
    errors,
    warnings,
    notes,
    compatScore,
    metrics: {
      recoil: recoilScore,
      reliability,
      ergo,
      balance: balanceScore,
    },
  };
}

export function compatibilityFor(platformId, slot, candidateId, selection) {
  const platform = PLATFORMS[platformId];
  const next = { ...selection, [slot]: candidateId };
  const result = evaluateBuild(platformId, next);
  const err = result.errors.find((i) => i.slots.includes(slot));
  if (err) return { ok: false, reason: err.text };
  const warn = result.warnings.find((i) => i.slots.includes(slot));
  if (warn) return { ok: true, warning: warn.text };
  return { ok: true };
}

export function defaultSelection(platformId) {
  return { ...PLATFORMS[platformId].defaultParts };
}

export function setSlot(selection, slot, id) {
  return { ...selection, [slot]: id };
}

export function randomSelection(platformId, previous) {
  const platform = PLATFORMS[platformId];
  let best = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const next = {};
    for (const slot of platform.slotOrder) {
      const options = platform.parts[slot].filter((p) => p.id !== 'no-optic' && p.id !== 'no-light' && p.id !== 'no-bipod');
      next[slot] = options[Math.floor(Math.random() * options.length)].id;
    }
    const result = evaluateBuild(platformId, next);
    if (!best || result.errors.length < best.errors.length) best = { selection: next, errors: result.errors };
    if (result.errors.length === 0) break;
  }
  return best?.selection || previous;
}
