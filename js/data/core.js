/*
 * IRONFORGE — shared catalog primitives.
 * Specifications are approximate, compiled for a virtual concept builder.
 * Not affiliated with any manufacturer. Verify current production specs.
 */

export const CALIBERS = {
  '5.56': { label: '5.56×45 NATO', short: '5.56', energy: 1290, refBarrel: 16, refVelocity: 2800, fpsPerInch: 26, recoilBase: 4.4 },
  '.300blk': { label: '.300 AAC BLK', short: '.300 BLK', energy: 1350, refBarrel: 16, refVelocity: 2200, fpsPerInch: 21, recoilBase: 7.8 },
  '6arc': { label: '6mm ARC', short: '6 ARC', energy: 1500, refBarrel: 18, refVelocity: 2750, fpsPerInch: 23, recoilBase: 5.8 },
  '7.62x39': { label: '7.62×39mm', short: '7.62×39', energy: 1500, refBarrel: 16.3, refVelocity: 2350, fpsPerInch: 22, recoilBase: 8.4 },
  '308': { label: '.308 Winchester', short: '.308 Win', energy: 2600, refBarrel: 24, refVelocity: 2700, fpsPerInch: 23, recoilBase: 16.8 },
  '9mm': { label: '9×19mm Parabellum', short: '9mm', energy: 420, refBarrel: 4.5, refVelocity: 1150, fpsPerInch: 28, recoilBase: 3.1 },
};

export const FINISHES = [
  { id: 'black', name: 'Armor Black', hex: '#1b1d20', metal: '#22262b', accent: '#ff5c1a' },
  { id: 'fde', name: 'Flat Dark Earth', hex: '#8a7654', metal: '#3a352d', accent: '#ff8a3d' },
  { id: 'odg', name: 'OD Green', hex: '#4c5540', metal: '#2b3028', accent: '#9dbf6a' },
  { id: 'tungsten', name: 'Tungsten Grey', hex: '#5d646b', metal: '#33383d', accent: '#9fb4c7' },
  { id: 'navy', name: 'Midnight Blue', hex: '#283548', metal: '#232b36', accent: '#5b8cff' },
  { id: 'sand', name: 'Desert Sand', hex: '#b09a74', metal: '#4a4339', accent: '#ffb36a' },
];

export const SLOT_ICONS = {
  upper: 'receiver',
  barrel: 'barrel',
  handguard: 'handguard',
  muzzle: 'muzzle',
  stock: 'stock',
  grip: 'grip',
  trigger: 'trigger',
  optic: 'optic',
  magazine: 'magazine',
  bcg: 'bcg',
  charging: 'charging',
  light: 'light',
  chassis: 'stock',
  bipod: 'bipod',
  slide: 'slide',
  sights: 'sights',
  recoil: 'spring',
};
