import { PLATFORMS, PLATFORM_LIST, PRESETS, FINISHES, CALIBERS, SLOT_ICONS } from './data/index.js';
import { evaluateBuild, compatibilityFor, defaultSelection, randomSelection } from './engine.js';
import { GunViewer } from './gun3d.js';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PLATFORM_CODE = { ar15: 'AR-15', akm: 'AKM', bolt: 'R700', pistol: 'G17' };
const PLATFORM_GHOST = { ar15: '01', akm: '02', bolt: '03', pistol: '04' };
const GRADE_COPY = {
  S: ['MASTER BUILT', '#ffd479'],
  A: ['COMBAT READY', '#73d99a'],
  B: ['FIELD CAPABLE', '#ffb054'],
  C: ['FUNCTIONAL', '#f5b544'],
  D: ['NEEDS WORK', '#ff5f5f'],
};

const ICONS = {
  receiver: '<path d="M2 10h13l3-2 4 2v4l-4 2-3-2H2z"/><path d="M5 7v10M9 8v5"/>',
  barrel: '<path d="M2 10h17l3 2-3 2H2z"/><path d="M5 8v8M11 8v8"/>',
  handguard: '<path d="M3 9h18v6H3z"/><path d="M6 11h2M10 11h2M14 11h2M18 11h1"/>',
  muzzle: '<path d="M3 9h12v6H3zM15 10h4v4h-4z"/><path d="M5 7v10M8 7v10"/>',
  stock: '<path d="M3 9h18v6H3z"/><path d="M6 9v6M18 9v6M21 7v10"/>',
  grip: '<path d="M8 3h8v12l-3 6h-5l-2-6V3z"/><path d="M9 7h6M9 10h6"/>',
  trigger: '<path d="M4 8h16v4H4z"/><path d="M7 12v5h4v-3M14 12v8h5M14 15h5"/>',
  optic: '<path d="M2 9h20v6H2z"/><path d="M7 6v12M17 6v12M9 9v6M15 9v6"/>',
  magazine: '<path d="M6 3h12v10l-3 9H9l-3-9V3z"/><path d="M6 7h12M8 12h8"/>',
  bcg: '<path d="M2 9h18v6H2z"/><path d="M18 10l4 2-4 2M6 9V7M10 9V7M14 9V7"/>',
  charging: '<path d="M3 11h13v3H3z"/><path d="M16 8l4-3M16 17l4 3M13 8v9"/>',
  light: '<path d="M3 9h11v6H3z"/><path d="M14 10l6-2v8l-6-2zM5 15v4M9 15v4"/>',
  bipod: '<path d="M4 4l6 16M20 4l-6 16M12 8v6M6 20h-2M20 20h-2"/>',
  slide: '<path d="M2 9h20v7H2z"/><path d="M6 9v7M9 9v7M12 9v7M16 9v7M19 9v7"/>',
  sights: '<path d="M4 18V8h4v10M16 18V8h4v10M11 18V5h2v13"/>',
  spring: '<path d="M6 4c8 0 8 4 0 4s-8 4 0 4 8 4 0 4 8 4 0 4"/>',
};

const icon = (slot) => `<svg viewBox="0 0 24 24">${ICONS[SLOT_ICONS[slot] || 'receiver']}</svg>`;
const $ = (id) => document.getElementById(id);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

const LAST_KEY = 'ironforge.v1.last';
const SAVED_KEY = 'ironforge.v1.saved';

const state = {
  platform: 'ar15',
  selection: defaultSelection('ar15'),
  finish: 'black',
  name: 'M4A1 // CUSTOM',
};

let summary = evaluateBuild(state.platform, state.selection);
let viewer = null;
let pickerSlot = null;
let pickerSearch = '';
let pickerSort = 'recommended';
let pickerCompatOnly = true;
let toastTimer = null;
let selectionRevision = 0;

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
const fmtCost = (n) => n >= 1000 ? `$${(n / 1000).toFixed(2).replace(/\.00$/, '')}K` : `$${n}`;
const fmtCostExact = (n) => `$${fmtInt(n)}`;
const fmtWeight = (n) => `${(n / 1000).toFixed(2)} kg`;
const fmtWeightLb = (n) => `${((n / 1000) * 2.20462).toFixed(2)} lb`;
const fmtOal = (n) => `${n.toFixed(1)} in`;
const fmtMm = (n) => `${Math.round(n * 25.4)} mm`;
const fmtFps = (n) => `${fmtInt(n)} fps`;

function serial() {
  let h = 2166136261;
  const s = `${state.platform}|${state.finish}|${Object.values(state.selection).join('|')}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `IF-${PLATFORM_CODE[state.platform].replace('-', '')}-${(h >>> 0).toString(16).toUpperCase().slice(0, 4)}`;
}

/* ------------------------------------------------------------------ */
/*  Persistence                                                        */
/* ------------------------------------------------------------------ */

function snapshot() {
  return { p: state.platform, s: { ...state.selection }, f: state.finish, n: state.name };
}

function validSnapshot(data) {
  if (!data || !PLATFORMS[data.p] || !data.s) return false;
  const platform = PLATFORMS[data.p];
  return platform.slotOrder.every((slot) => platform.parts[slot].some((part) => part.id === data.s[slot]));
}

function encodeSnapshot(data) {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeSnapshot(str) {
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function saveLast() {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(snapshot())); } catch {}
}

function restore() {
  const hash = location.hash.replace(/^#/, '');
  if (hash.startsWith('b=')) {
    const data = decodeSnapshot(hash.slice(2));
    if (validSnapshot(data)) return data;
  }
  try {
    const data = JSON.parse(localStorage.getItem(LAST_KEY) || 'null');
    if (validSnapshot(data)) return data;
  } catch {}
  return null;
}

/* ------------------------------------------------------------------ */
/*  Render: platform tabs                                              */
/* ------------------------------------------------------------------ */

function renderPlatformTabs() {
  const host = $('platformTabs');
  host.innerHTML = PLATFORM_LIST.map((p) => `
    <button class="platform-tab ${p.id === state.platform ? 'active' : ''}" data-platform="${p.id}" type="button">
      <span class="tab-index">0${PLATFORM_LIST.indexOf(p) + 1}</span>
      <span class="tab-name">${p.name}</span>
      <span class="tab-cal">${CALIBERS[p.caliberKey].short}</span>
    </button>
  `).join('');
}

/* ------------------------------------------------------------------ */
/*  Render: build panel                                                */
/* ------------------------------------------------------------------ */

function renderBuildPanel() {
  const platform = summary.platform;

  $('buildName').value = state.name;
  $('buildSerial').textContent = serial();
  $('slotProgress').textContent = `${platform.slotOrder.length} / ${platform.slotOrder.length}`;

  const arc = $('scoreArc');
  const circumference = 219.9;
  arc.style.strokeDashoffset = `${circumference * (1 - summary.score / 100)}`;
  const gradeColor = GRADE_COPY[summary.grade]?.[1] || '#ff5c1a';
  arc.style.stroke = gradeColor;
  arc.style.filter = `drop-shadow(0 0 6px ${gradeColor}66)`;
  $('scoreGrade').textContent = summary.grade;
  $('scoreGrade').style.color = gradeColor;
  $('scoreValue').textContent = summary.score;
  $('scoreLabel').textContent = GRADE_COPY[summary.grade]?.[0] || 'CUSTOM BUILD';
  $('scoreLabel').style.color = gradeColor;
  $('costChip').textContent = fmtCost(summary.cost);
  $('weightChip').textContent = fmtWeight(summary.weight);
  $('metaChip').textContent = summary.caliber.short;

  const list = $('slotList');
  list.innerHTML = platform.slotOrder.map((slot, i) => {
    const part = summary.parts[slot];
    const meta = platform.slots[slot];
    if (!part) return '';
    const error = summary.errors.some((issue) => issue.slots.includes(slot));
    const warn = summary.warnings.some((issue) => issue.slots.includes(slot));
    return `
      <button class="slot-row ${error ? 'has-error' : ''}" data-slot="${slot}" type="button" style="animation-delay:${i * 22}ms">
        <span class="slot-index">${String(i + 1).padStart(2, '0')}</span>
        <span class="slot-icon">${icon(slot)}</span>
        <span class="slot-text">
          <span class="slot-brand">${escapeHtml(part.brand)}${warn ? ' · <span style="color:#f5b544">FIT NOTE</span>' : ''}</span>
          <span class="slot-name">${escapeHtml(part.name)}</span>
        </span>
        <span class="slot-meta"><b>${part.weight ? `${part.weight} g` : '—'}</b>${part.price ? fmtCostExact(part.price) : 'INCL.'}</span>
        <span class="slot-chev"><svg viewBox="0 0 12 12"><path d="M4 2l4 4-4 4"/></svg></span>
      </button>
    `;
  }).join('');

  renderPresets();
}

function renderPresets() {
  const host = $('presetGrid');
  const list = PRESETS.filter((p) => p.platform === state.platform);
  host.innerHTML = list.map((preset) => {
    const active = presetMatches(preset);
    return `
      <button class="preset-btn ${active ? 'active' : ''}" data-preset="${preset.id}" type="button">
        <span>${escapeHtml(preset.name)}</span>
        <em>${escapeHtml(preset.blurb)}</em>
      </button>
    `;
  }).join('');
}

function presetMatches(preset) {
  return preset.finish === state.finish && Object.entries(preset.parts).every(([slot, id]) => state.selection[slot] === id);
}

/* ------------------------------------------------------------------ */
/*  Render: telemetry                                                  */
/* ------------------------------------------------------------------ */

function renderTelemetry() {
  const platform = summary.platform;
  const m = summary.metrics;

  $('telemetryPlatform').textContent = `${PLATFORM_CODE[platform.id]} PLATFORM`;
  $('metricRecoil').textContent = Math.round(m.recoil);
  $('barRecoil').style.width = `${clamp(m.recoil, 2, 100)}%`;
  $('metricReliability').textContent = Math.round(m.reliability);
  $('barReliability').style.width = `${clamp(m.reliability, 2, 100)}%`;
  $('metricErgo').textContent = Math.round(m.ergo);
  $('barErgo').style.width = `${clamp(m.ergo, 2, 100)}%`;
  $('metricBalance').textContent = Math.round(m.balance);
  $('barBalance').style.width = `${clamp(m.balance, 2, 100)}%`;

  $('dataWeight').textContent = fmtWeight(summary.weight);
  $('dataWeightLb').textContent = fmtWeightLb(summary.weight);
  $('dataOal').textContent = fmtOal(summary.oal);
  $('dataOalMm').textContent = fmtMm(summary.oal);
  $('dataBarrel').textContent = `${summary.barrelLen.toFixed(1)} in`;
  $('dataCaliber').textContent = summary.caliber.label;
  $('dataVel').textContent = fmtFps(summary.velocity);
  $('dataEnergy').textContent = `${fmtInt(summary.caliber.energy)} ft-lb`;
  $('dataCap').textContent = platform.id === 'bolt' ? `${summary.capacity}` : `${summary.capacity} + 1`;
  $('dataAction').textContent = platform.id === 'bolt' ? 'BOLT ACTION' : 'SEMI AUTO';
  $('dataCost').textContent = fmtCostExact(summary.cost);
  $('dataCostNote').textContent = `${PLATFORM_CODE[platform.id]} BASE + PARTS`;

  $('balanceText').textContent = `${summary.balance}% FRONT`;
  $('balanceMarker').style.left = `${clamp(summary.balance, 2, 98)}%`;

  const issues = summary.issues;
  $('issueCount').textContent = issues.length;
  $('issueCount').style.color = issues.some((i) => i.severity === 'error') ? 'var(--bad)' : issues.some((i) => i.severity === 'warn') ? 'var(--warn)' : 'var(--muted)';
  if (!issues.length) {
    $('issueList').innerHTML = '<div class="issue-empty">ALL SYSTEMS NOMINAL — NO FIT CONFLICTS</div>';
  } else {
    $('issueList').innerHTML = issues.map((issue) => `
      <div class="issue ${issue.severity}"><i></i><span>${escapeHtml(issue.text)}</span></div>
    `).join('');
  }

  const note = summary.notes.slice(0, 3).join(' ');
  $('buildNote').textContent = note;

  $('qWeight').textContent = fmtWeight(summary.weight);
  $('qOal').textContent = fmtOal(summary.oal);
  $('qVel').textContent = fmtFps(summary.velocity);
}

/* ------------------------------------------------------------------ */
/*  Render: stage / finish                                             */
/* ------------------------------------------------------------------ */

function renderStage() {
  const platform = summary.platform;
  $('platformName').textContent = platform.name;
  $('platformCode').textContent = PLATFORM_CODE[platform.id];
  $('platformFamily').textContent = platform.family.split('/').slice(-1)[0].trim().toUpperCase();
  $('platformTagline').textContent = platform.tagline;
  $('stageGhost').textContent = PLATFORM_GHOST[platform.id];

  const finish = FINISHES.find((f) => f.id === state.finish) || FINISHES[0];
  $('finishName').textContent = finish.name;

  const host = $('finishSwatches');
  if (!host.dataset.built) {
    host.innerHTML = FINISHES.map((f) => `
      <button class="swatch" data-finish="${f.id}" type="button" title="${f.name}" aria-label="${f.name}" style="background:${f.hex}"></button>
    `).join('');
    host.dataset.built = '1';
  }
  host.querySelectorAll('.swatch').forEach((el) => {
    el.classList.toggle('active', el.dataset.finish === state.finish);
  });
}

function renderAll() {
  renderPlatformTabs();
  renderBuildPanel();
  renderTelemetry();
  renderStage();
}

/* ------------------------------------------------------------------ */
/*  Commit                                                             */
/* ------------------------------------------------------------------ */

function commit({ rebuild = true, camera = false } = {}) {
  summary = evaluateBuild(state.platform, state.selection);
  if (viewer && rebuild) viewer.update(state.platform, state.selection, state.finish);
  renderAll();
  saveLast();
  selectionRevision++;
}

function setPlatform(id) {
  if (!PLATFORMS[id] || id === state.platform) return;
  state.platform = id;
  state.selection = defaultSelection(id);
  state.name = `${PLATFORM_CODE[id]} // CUSTOM`;
  closeDrawers();
  commit();
  requestAnimationFrame(() => viewer?.setSelected(null));
  toast(`${PLATFORMS[id].name} platform loaded — ${PLATFORMS[id].slotOrder.length} configurable components.`);
}

function setFinish(id) {
  if (!FINISHES.some((f) => f.id === id)) return;
  state.finish = id;
  commit();
  const name = FINISHES.find((f) => f.id === id).name;
  toast(`Cerakote finish applied — ${name}.`);
  document.querySelector('.finish-dock')?.classList.remove('mobile-open');
}

function resetBuild() {
  state.selection = defaultSelection(state.platform);
  state.finish = 'black';
  state.name = `${PLATFORM_CODE[state.platform]} // CUSTOM`;
  commit();
  toast('Build reset to platform default.');
}

function randomize() {
  state.selection = randomSelection(state.platform, state.selection);
  state.finish = FINISHES[Math.floor(Math.random() * FINISHES.length)].id;
  state.name = `${PLATFORM_CODE[state.platform]} // RANDOM`;
  commit();
  const errors = summary.errors.length;
  toast(errors ? `Randomized build generated with ${errors} fit warning${errors > 1 ? 's' : ''}.` : 'Randomized build generated — all components fit.');
}

/* ------------------------------------------------------------------ */
/*  Picker                                                             */
/* ------------------------------------------------------------------ */

function openPicker(slot) {
  if (!PLATFORMS[state.platform].parts[slot]) return;
  pickerSlot = slot;
  pickerSearch = '';
  pickerSort = 'recommended';
  $('pickerSearch').value = '';
  $('pickerSort').value = 'recommended';
  $('pickerCompat').checked = pickerCompatOnly;
  const platform = PLATFORMS[state.platform];
  $('pickerSlotCode').textContent = (platform.slots[slot].short || slot).toUpperCase();
  $('pickerTitle').textContent = platform.slots[slot].label;
  $('pickerSub').textContent = `${platform.slots[slot].hint}. Choose a real-world component — fit conflicts are flagged before you commit.`;
  $('picker').hidden = false;
  document.body.classList.add('picker-open');
  closeDrawers();
  viewer?.setSelected(slot);
  renderPicker();
  if (window.matchMedia('(pointer: fine)').matches) {
    setTimeout(() => $('pickerSearch').focus({ preventScroll: true }), 120);
  }
}

function closePicker() {
  $('picker').hidden = true;
  document.body.classList.remove('picker-open');
  pickerSlot = null;
  viewer?.setSelected(null);
}

function partSpecs(slot, part) {
  const specs = [];
  const push = (label, value) => { if (value !== undefined && value !== null && value !== '' && value !== '—') specs.push([label, value]); };
  switch (slot) {
    case 'upper':
      push('MATERIAL', part.material); push('FINISH', part.finish); push('MASS', `${part.weight} g`); break;
    case 'barrel':
      push('LENGTH', part.length ? `${part.length}"` : null);
      push('CALIBER', part.caliber ? CALIBERS[part.caliber]?.short : null);
      push('THREAD', part.thread); push('GAS', part.gas); push('CONTOUR', part.contour); break;
    case 'handguard':
      push('LENGTH', `${part.length}"`); push('MOUNT', part.mount); push('MATERIAL', part.material); break;
    case 'muzzle':
      push('THREAD', part.thread); push('RECOIL', part.recoil ? `−${part.recoil}%` : '—');
      if (part.suppression) push('SUPPRESSION', `${part.suppression} dB`); else push('FLASH', part.flash ? `−${part.flash}%` : '—'); break;
    case 'stock':
      push('TYPE', part.type); push('LOP', part.lengthAdd ? `+${part.lengthAdd}"` : '—'); push('RECOIL', part.recoil ? `−${part.recoil}%` : '—'); break;
    case 'grip':
      push('ANGLE', part.angle); push('MASS', `${part.weight} g`); push('ERGO', `+${part.ergo}`); break;
    case 'trigger':
      push('PULL', `${part.pull.toFixed(1)} lb`); push('STAGES', part.tags?.find((t) => /stage/i.test(t)) || '—'); push('MASS', `${part.weight} g`); break;
    case 'optic':
      push('TYPE', part.type); push('MAG', part.magnification); push('FOOTPRINT', part.footprint); break;
    case 'magazine':
      push('CAPACITY', `${part.capacity}`); push('CALIBER', part.calibers?.map((c) => CALIBERS[c]?.short).join(' / ')); push('MATERIAL', part.material); break;
    case 'bcg':
      push('BOLT FACE', part.calibers?.map((c) => CALIBERS[c]?.short).join(' / ')); push('FINISH', part.finish); push('MASS', `${part.weight} g`); break;
    case 'charging':
      push('TYPE', part.tags?.[0] || 'Standard'); push('MASS', `${part.weight} g`); break;
    case 'light':
      push('OUTPUT', part.lumens ? `${fmtInt(part.lumens)} lm` : '—'); push('MASS', `${part.weight} g`); break;
    case 'chassis':
      push('MATERIAL', part.material); push('FINISH', part.finish); push('MASS', `${part.weight} g`); break;
    case 'bipod':
      push('HEIGHT', part.height); push('CANT', part.cant ? 'YES' : 'NO'); push('MASS', `${part.weight} g`); break;
    case 'slide':
      push('CUT', part.cut === 'none' ? 'NONE' : part.cut); push('OPTIC READY', part.opticReady ? 'YES' : 'NO'); push('FINISH', part.finish); break;
    case 'sights':
      push('MATERIAL', part.material); push('TYPE', part.tags?.find((t) => /night|fiber|factory/i.test(t)) || '—'); push('MASS', `${part.weight} g`); break;
    case 'barrel':
      push('THREADED', part.threaded ? 'YES' : 'NO'); break;
    default:
      push('MASS', `${part.weight} g`);
  }
  if (slot === 'barrel' && part.threaded !== undefined) push('THREADED', part.threaded ? 'YES' : 'NO');
  return specs.slice(0, 3);
}

function renderPicker() {
  if (!pickerSlot) return;
  const platform = PLATFORMS[state.platform];
  const all = platform.parts[pickerSlot];
  const query = pickerSearch.trim().toLowerCase();

  let rows = all.map((part, index) => {
    const compat = compatibilityFor(state.platform, pickerSlot, part.id, state.selection);
    return { part, index, compat };
  });

  const compatibleCount = rows.filter((r) => r.compat.ok).length;

  if (pickerCompatOnly) rows = rows.filter((r) => r.compat.ok);
  if (query) {
    rows = rows.filter(({ part }) => {
      const hay = [part.brand, part.name, part.desc, part.material, part.finish, ...(part.tags || []), ...partSpecs(pickerSlot, part).flat()].join(' ').toLowerCase();
      return hay.includes(query);
    });
  }

  switch (pickerSort) {
    case 'price': rows.sort((a, b) => a.part.price - b.part.price); break;
    case 'weight': rows.sort((a, b) => a.part.weight - b.part.weight); break;
    case 'name': rows.sort((a, b) => `${a.part.brand} ${a.part.name}`.localeCompare(`${b.part.brand} ${b.part.name}`)); break;
    default:
      rows.sort((a, b) => {
        const ae = state.selection[pickerSlot] === a.part.id ? 0 : 1;
        const be = state.selection[pickerSlot] === b.part.id ? 0 : 1;
        if (ae !== be) return ae - be;
        if (a.compat.ok !== b.compat.ok) return a.compat.ok ? -1 : 1;
        return a.index - b.index;
      });
  }

  $('pickerCount').textContent = `${rows.length} OPTION${rows.length === 1 ? '' : 'S'}`;
  $('pickerSummary').textContent = `${all.length} catalog options · ${compatibleCount} fit this exact build · specs are approximate.`;

  const grid = $('pickerGrid');
  if (!rows.length) {
    grid.innerHTML = `<div class="picker-empty">NO COMPONENTS MATCH THIS FILTER.<br />TRY DISABLING “COMPATIBLE ONLY” OR CLEARING THE SEARCH.</div>`;
    return;
  }

  grid.innerHTML = rows.map(({ part, compat }, i) => {
    const equipped = state.selection[pickerSlot] === part.id;
    const specs = partSpecs(pickerSlot, part);
    const reason = compat.ok ? (compat.warning ? `<p class="part-compat warn">FIT NOTE — ${escapeHtml(compat.warning)}</p>` : '') : `<p class="part-compat">INCOMPATIBLE — ${escapeHtml(compat.reason)}</p>`;
    return `
      <article class="part-card ${equipped ? 'equipped' : ''} ${compat.ok ? '' : 'incompatible'}" style="animation-delay:${Math.min(i * 18, 180)}ms">
        <div class="part-top">
          <span class="part-icon">${icon(pickerSlot)}</span>
          <span class="part-brand">${escapeHtml(part.brand)}</span>
          <span class="part-price">${part.price ? fmtCostExact(part.price) : 'INCL.'}</span>
        </div>
        <h3>${escapeHtml(part.name)}</h3>
        <p class="part-desc">${escapeHtml(part.desc || '')}</p>
        <div class="part-specs">${specs.map(([k, v]) => `<span>${k}<b>${escapeHtml(String(v))}</b></span>`).join('')}</div>
        <div class="part-tags">${(part.tags || []).slice(0, 3).map((t) => `<span class="part-tag">${escapeHtml(t)}</span>`).join('')}</div>
        ${reason}
        <button class="equip-btn" data-part-id="${part.id}" type="button" ${compat.ok ? '' : 'disabled'}>
          ${equipped ? 'INSTALLED — CLOSE' : compat.ok ? 'EQUIP COMPONENT' : 'FIT CONFLICT'}
        </button>
      </article>
    `;
  }).join('');
}

function equipPart(slot, id) {
  const part = PLATFORMS[state.platform].parts[slot].find((p) => p.id === id);
  if (!part) return;
  state.selection = { ...state.selection, [slot]: id };
  commit();
  closePicker();
  const result = compatibilityFor(state.platform, slot, id, { ...state.selection, [slot]: state.selection[slot] });
  toast(`${part.brand} ${part.name} installed${result.ok ? '' : ' — check fit warnings'}.`);
}

/* ------------------------------------------------------------------ */
/*  Tooltip / toast                                                    */
/* ------------------------------------------------------------------ */

function showTooltip(slot, x, y) {
  const el = $('tooltip');
  if (!slot) { el.hidden = true; return; }
  const label = PLATFORMS[state.platform].slots[slot]?.label || slot;
  el.textContent = `${label} · CLICK TO MODIFY`;
  el.hidden = false;
  const w = 230;
  const left = Math.min(x + 14, window.innerWidth - w);
  const top = Math.min(y + 14, window.innerHeight - 32);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.transform = 'none';
}

let lastToast = '';
function toast(message) {
  const el = $('toast');
  if (!el) return;
  lastToast = message;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ------------------------------------------------------------------ */
/*  Panels / responsive                                                */
/* ------------------------------------------------------------------ */

function closeDrawers() {
  $('buildPanel').classList.remove('open');
  $('telemetry').classList.remove('open');
  document.querySelector('.finish-dock')?.classList.remove('mobile-open');
}

function toggleDrawer(id) {
  const target = $(id);
  const isOpen = target.classList.contains('open');
  closeDrawers();
  if (!isOpen) target.classList.add('open');
}

/* ------------------------------------------------------------------ */
/*  Share / capture / save                                             */
/* ------------------------------------------------------------------ */

async function shareBuild() {
  const payload = snapshot();
  const hash = `#b=${encodeSnapshot(payload)}`;
  history.replaceState(null, '', hash);
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    toast('Share link copied to clipboard — the full build is encoded in the URL.');
  } catch {
    toast('Build encoded in the URL. Copy the address bar to share it.');
  }
}

function capture() {
  if (!viewer) return;
  try {
    const data = viewer.capture();
    const a = document.createElement('a');
    a.href = data;
    a.download = `ironforge-${state.platform}-${Date.now()}.png`;
    a.click();
    toast('Viewport captured — PNG exported.');
  } catch {
    toast('Capture failed in this browser.');
  }
}

function saveBuild() {
  try {
    const list = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    const snap = snapshot();
    const entry = { ...snap, id: serial(), at: Date.now() };
    const filtered = list.filter((b) => b.id !== entry.id);
    filtered.unshift(entry);
    localStorage.setItem(SAVED_KEY, JSON.stringify(filtered.slice(0, 16)));
    saveLast();
    toast(`Build ${entry.id} saved to this browser.`);
  } catch {
    toast('Unable to save locally in this browser.');
  }
}

/* ------------------------------------------------------------------ */
/*  Events                                                             */
/* ------------------------------------------------------------------ */

function bindEvents() {
  $('platformTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-platform]');
    if (btn) setPlatform(btn.dataset.platform);
  });

  $('slotList').addEventListener('click', (e) => {
    const row = e.target.closest('[data-slot]');
    if (row) openPicker(row.dataset.slot);
  });

  $('presetGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-preset]');
    if (!btn) return;
    const preset = PRESETS.find((p) => p.id === btn.dataset.preset);
    if (!preset) return;
    state.platform = preset.platform;
    state.selection = { ...preset.parts };
    state.finish = preset.finish;
    state.name = preset.name;
    commit();
    toast(`Preset loaded — ${preset.name}.`);
  });

  $('buildName').addEventListener('input', (e) => {
    state.name = e.target.value.toUpperCase().slice(0, 28) || 'CUSTOM BUILD';
    $('buildSerial').textContent = serial();
    saveLast();
  });

  $('resetBtn').addEventListener('click', resetBuild);
  $('randomBtn').addEventListener('click', randomize);
  $('saveBtn').addEventListener('click', saveBuild);
  $('shareBtn').addEventListener('click', shareBuild);

  $('presetBtn').addEventListener('click', () => {
    const grid = $('presetGrid');
    grid.animate([{ boxShadow: '0 0 0 0 rgba(255,92,26,0)' }, { boxShadow: '0 0 0 4px rgba(255,92,26,.25)' }, { boxShadow: '0 0 0 0 rgba(255,92,26,0)' }], { duration: 700, easing: 'ease-out' });
    if (window.innerWidth <= 1180) $('buildPanel').classList.add('open');
    const active = grid.querySelector('.preset-btn.active') || grid.querySelector('.preset-btn');
    active?.scrollIntoView({ block: 'nearest' });
    toast('Presets are listed in the build panel — tap one to load every component.');
  });

  $('finishSwatches').addEventListener('click', (e) => {
    const sw = e.target.closest('[data-finish]');
    if (sw) setFinish(sw.dataset.finish);
  });

  $('picker').addEventListener('click', (e) => {
    if (e.target.closest('[data-close-picker]')) { closePicker(); return; }
    const btn = e.target.closest('[data-part-id]');
    if (btn && !btn.disabled) equipPart(pickerSlot, btn.dataset.partId);
  });

  $('pickerClose').addEventListener('click', closePicker);
  $('pickerSearch').addEventListener('input', (e) => { pickerSearch = e.target.value; renderPicker(); });
  $('pickerSort').addEventListener('change', (e) => { pickerSort = e.target.value; renderPicker(); });
  $('pickerCompat').addEventListener('change', (e) => { pickerCompatOnly = e.target.checked; renderPicker(); });

  $('viewTools').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    $('viewTools').querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    viewer?.setView(btn.dataset.view);
  });

  $('explodeBtn').addEventListener('click', () => {
    const on = !$('explodeBtn').classList.contains('active');
    $('explodeBtn').classList.toggle('active', on);
    viewer?.setExplode(on);
    toast(on ? 'Exploded view — components separated along their assembly axis.' : 'Assembly view restored.');
  });

  $('spinBtn').addEventListener('click', () => {
    const on = !$('spinBtn').classList.contains('active');
    $('spinBtn').classList.toggle('active', on);
    viewer?.setAutoRotate(on);
  });

  $('captureBtn').addEventListener('click', capture);

  document.querySelectorAll('[data-close-panel]').forEach((btn) => btn.addEventListener('click', closeDrawers));

  $('mobileBar').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    switch (btn.id) {
      case 'mParts': toggleDrawer('buildPanel'); break;
      case 'mStats': toggleDrawer('telemetry'); break;
      case 'mFinish': {
        const dock = document.querySelector('.finish-dock');
        const open = dock.classList.toggle('mobile-open');
        if (open) toast('Select a Cerakote finish.');
        break;
      }
      case 'mRandom': randomize(); break;
    }
  });

  document.getElementById('scene').addEventListener('pointerdown', () => {
    if (window.innerWidth <= 1180) closeDrawers();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('picker').hidden) closePicker();
      else closeDrawers();
    }
    if (e.key === 'ArrowRight' && !$('picker').hidden) {
      // reserved for gallery navigation
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash.startsWith('b=')) return;
    const data = decodeSnapshot(hash.slice(2));
    if (validSnapshot(data)) {
      state.platform = data.p;
      state.selection = data.s;
      state.finish = data.f;
      state.name = data.n || state.name;
      commit();
      toast('Shared build loaded from link.');
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Boot                                                               */
/* ------------------------------------------------------------------ */

function boot() {
  const restored = restore();
  if (restored) {
    state.platform = restored.p;
    state.selection = restored.s;
    state.finish = FINISHES.some((f) => f.id === restored.f) ? restored.f : 'black';
    state.name = restored.n || `${PLATFORM_CODE[state.platform]} // CUSTOM`;
  }

  renderAll();
  bindEvents();

  try {
    viewer = new GunViewer($('scene'), {
      onSlotClick: openPicker,
      onHover: showTooltip,
      onAutoRotateChange: (on) => {
        $('spinBtn').classList.toggle('active', on);
      },
    });
    viewer.update(state.platform, state.selection, state.finish);
    viewer.setAutoRotate(false);
  } catch (err) {
    console.error(err);
    toast('3D viewport unavailable — check browser WebGL support.');
  }

  setTimeout(() => {
    $('loading').classList.add('done');
    document.body.classList.add('ready');
  }, 650);

  if (location.hash.startsWith('#b=')) {
    setTimeout(() => toast('Full build loaded from shared link.'), 900);
  }
}

boot();
