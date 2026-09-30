import { cardTheme, readableOn, contrastRatio } from '../../src/theme/cardTheme';
import { PALETTES } from '../../src/theme/colors';
import { ROLES } from '../../src/data/roles';

describe('cardTheme — gold role card follows every Settings theme', () => {
  const roleColours = Object.values(ROLES).map(r => r.color).concat(['#27AE60', '#9B59B6', '#C0392B']);

  test.each(Object.keys(PALETTES))('%s: ink, labels and every role colour stay readable on the face', (id) => {
    const p = PALETTES[id];
    const ct = cardTheme(p, p.isDark ?? true);
    expect(contrastRatio(ct.ink, ct.face)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(ct.inkMuted, ct.face)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(ct.goldInk, ct.face)).toBeGreaterThanOrEqual(4.5);
    roleColours.forEach(c => expect(contrastRatio(readableOn(c, ct.face), ct.face)).toBeGreaterThanOrEqual(4.5));
  });

  test('Moonlight (light) gets an ivory face; dark themes use their own card tone', () => {
    expect(cardTheme(PALETTES.moonlight, false).face).toBe('#FFF8E7');
    expect(cardTheme(PALETTES.monsoon, true).face).toBe(PALETTES.monsoon.card);
  });

  test('accent tracks the theme primary', () => {
    expect(cardTheme(PALETTES.shadow, true).accent).not.toBe(cardTheme(PALETTES.ancient_forest, true).accent);
  });
});
