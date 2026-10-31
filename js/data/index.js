import { AR15 } from './ar.js';
import { AKM } from './ak.js';
import { BOLT } from './bolt.js';
import { PISTOL } from './pistol.js';

export { CALIBERS, FINISHES, SLOT_ICONS } from './core.js';

export const PLATFORMS = { ar15: AR15, akm: AKM, bolt: BOLT, pistol: PISTOL };
export const PLATFORM_LIST = [AR15, AKM, BOLT, PISTOL];

export const PRESETS = [
  {
    id: 'block-ii', platform: 'ar15', name: 'M4A1 BLOCK II', finish: 'fde',
    blurb: 'The modern SOPMOD workhorse: 14.5" CHF, RIS III, suppressor-ready.',
    parts: {
      upper: 'dd-m4a1', barrel: 'dd-145-chf', handguard: 'dd-ris3-125', muzzle: 'sf-warcomp',
      stock: 'b5-bravo', grip: 'b5-p23', trigger: 'geissele-ssae', optic: 'eotech-exps3',
      magazine: 'magpul-pmag30', bcg: 'bcm-bcg', charging: 'radian-raptor', light: 'surefire-m640',
    },
  },
  {
    id: 'urgi', platform: 'ar15', name: 'URGI 14.5', finish: 'black',
    blurb: 'Geissele rail, Aimpoint micro, and a flat-shooting 14.5" upper.',
    parts: {
      upper: 'bcm-mk2', barrel: 'dd-145-chf', handguard: 'geissele-mk16', muzzle: 'sf-warcomp',
      stock: 'magpul-ctr', grip: 'bcm-mod3', trigger: 'larue-mbt2s', optic: 'aimpoint-t2',
      magazine: 'lancer-l5awm', bcg: 'toolcraft-nitride', charging: 'geissele-airborne', light: 'modlite-okw',
    },
  },
  {
    id: 'honey-badger', platform: 'ar15', name: 'HONEY BADGER', finish: 'sand',
    blurb: 'Short .300 BLK, suppressed, and built for close, quiet work.',
    parts: {
      upper: 'radian-adac', barrel: 'aero-103-300', handguard: 'mi-925', muzzle: 'deadair-sandman',
      stock: 'magpul-ctr', grip: 'magpul-moe-plus', trigger: 'rise-rave140', optic: 'eotech-exps3',
      magazine: 'magpul-pmag30', bcg: 'sharps-xpb', charging: 'radian-raptor', light: 'streamlight-hlx',
    },
  },
  {
    id: 'recce', platform: 'ar15', name: 'RECCE 16', finish: 'odg',
    blurb: 'A general-purpose 16" rifle with an LPVO and a precision trigger.',
    parts: {
      upper: 'noveske-gen4', barrel: 'ba-16-gov', handguard: 'bcm-mcmr-13', muzzle: 'pa-m4-72',
      stock: 'magpul-prs-lite', grip: 'dac-scg', trigger: 'geissele-ssae', optic: 'vortex-razor-1-6',
      magazine: 'magpul-pmag30', bcg: 'lantac-enhanced', charging: 'bcm-gfh', light: 'no-light',
    },
  },
  {
    id: 'ak-classic', platform: 'akm', name: 'AKM CLASSIC', finish: 'fde',
    blurb: 'Laminate wood, slant brake, steel magazine. Pure 1974.',
    parts: {
      muzzle: 'ak-slant', handguard: 'ak-wood-hg', stock: 'ak-wood-stock', grip: 'ak-bakelite',
      trigger: 'ak-mil', optic: 'ak-iron', magazine: 'ak-surplus',
    },
  },
  {
    id: 'ak-modern', platform: 'akm', name: 'AK-12ish', finish: 'black',
    blurb: 'Modernized AKM: alloy rail, folding stock, red dot, tuned trigger.',
    parts: {
      muzzle: 'ak-rrd4c', handguard: 'ak-slr-115', stock: 'ak-pt1', grip: 'ak-rk3',
      trigger: 'ak-alg-akt-ul', optic: 'ak-rs-t2', magazine: 'ak-pmag30',
    },
  },
  {
    id: 'prs', platform: 'bolt', name: 'PRS RIG', finish: 'navy',
    blurb: 'Heavy 26" carbon, 6-36× glass, and a competition chassis.',
    parts: {
      chassis: 'mdt-acc', barrel: 'proof-26', muzzle: 'a419-hellfire-bolt', optic: 'vortex-razor-6-36',
      bipod: 'mdt-ckye', trigger: 'triggertech-diamond', magazine: 'mdt-12rd',
    },
  },
  {
    id: 'hunter', platform: 'bolt', name: 'LIGHT HUNTER', finish: 'odg',
    blurb: '20" carbon, suppressed, and light enough to carry all day.',
    parts: {
      chassis: 'magpul-hunter', barrel: 'proof-20', muzzle: 'deadair-nomad', optic: 'leupold-mark5',
      bipod: 'harris-sbrm', trigger: 'timney-elite', magazine: 'magpul-aics5',
    },
  },
  {
    id: 'duty-g17', platform: 'pistol', name: 'DUTY G17', finish: 'black',
    blurb: 'RMR-cut slide, night sights, and a 1000-lumen duty light.',
    parts: {
      slide: 'zev-duty', barrel: 'g17-oem-barrel', muzzle: 'g17-no-muzzle', optic: 'trijicon-rmr',
      sights: 'trijicon-hd', trigger: 'apex-action', magazine: 'g17-oem-mag', light: 'x300u',
    },
  },
  {
    id: 'comp-carry', platform: 'pistol', name: 'COMP CARRY', finish: 'tungsten',
    blurb: 'Threaded barrel, micro comp, and a compact dot for fast work.',
    parts: {
      slide: 'agency-syndicate', barrel: 'kkm-threaded', muzzle: 'herrington-hc95', optic: 'holosun-407k',
      sights: 'ameriglo-hack', trigger: 'agency-dropin', magazine: 'g17-tti-ext', light: 'tlr7a',
    },
  },
];
