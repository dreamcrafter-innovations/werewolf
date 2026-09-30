// cardTheme.js — colour tokens for the gold "playing card" role reveal.
//
// The frame is always gold (that is the card's identity), but everything
// inside it follows the player's Settings theme:
//   • dark themes  → card face is the theme's own deep background tone,
//                    ink is the theme's text colour, bright gold frame
//   • light themes → ivory face, dark ink, deeper antique-gold frame
//   • pips / inner hairline / card-back lattice use the theme accent when the
//     theme has one (Shadow diya-orange, Monsoon teal, Forest green …), gold otherwise.
// Role colours are run through readableOn() so they keep AA contrast on
// whichever face colour the theme produces.

const GOLD_ON_DARK = {
  metal:       '#D4A437',
  metalBright: '#FFD978',
  metalDeep:   '#6E4A0C',
};
const GOLD_ON_LIGHT = {
  metal:       '#C9962A',
  metalBright: '#F2CF72',
  metalDeep:   '#7A5410',
};

function parseHex(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6 && h.length !== 8) return null;
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const ra = parseHex(a); const rb = parseHex(b);
  if (!ra || !rb) return 1;
  const la = luminance(ra); const lb = luminance(rb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Nudge `color` toward white (dark face) or black (light face) until it reaches `min` contrast. */
export function readableOn(color, face, min = 4.5) {
  const c = parseHex(color); const f = parseHex(face);
  if (!c || !f) return color;
  const target = luminance(f) < 0.4 ? [255, 255, 255] : [0, 0, 0];
  for (let step = 0; step <= 10; step++) {
    const t = step / 10;
    const mixed = toHex(c.map((v, i) => v + (target[i] - v) * t));
    if (contrastRatio(mixed, face) >= min) return mixed;
  }
  return toHex(target);
}

/** Append an alpha channel to a #RRGGBB colour. */
export function withAlpha(hex, alpha) {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

/**
 * @param {object} palette  Nightfall Settings palette (useTheme().palette)
 * @param {boolean} isDark  palette.isDark
 */
export function cardTheme(palette = {}, isDark = true) {
  const metalSet = isDark ? GOLD_ON_DARK : GOLD_ON_LIGHT;
  const face = isDark
    ? (parseHex(palette.card) ? palette.card : '#1A1A32')
    : '#FFF8E7';
  const ink = readableOn(isDark ? (palette.text ?? '#EEE8F0') : '#2B1D05', face, 7);
  const accent = readableOn(palette.primary ?? metalSet.metalBright, face, 3);
  return {
    ...metalSet,
    face,
    ink,
    inkMuted: readableOn(isDark ? (palette.textSecondary ?? '#9090B0') : '#6B5530', face, 4.5),
    accent,
    goldInk: readableOn(isDark ? metalSet.metalBright : metalSet.metalDeep, face, 4.5),
    plaqueBg: isDark ? 'rgba(255,217,120,0.08)' : 'rgba(201,150,42,0.10)',
    plaqueBorder: isDark ? 'rgba(255,217,120,0.45)' : 'rgba(122,84,16,0.45)',
    pattern: withAlpha(accent, isDark ? 0.32 : 0.30),
    isDark,
  };
}
