import { PALETTES, PALETTE_IDS, paletteForThemeId, THEME_META, RADIUS, makeShadow } from '../../src/theme/colors';

const REQUIRED_PALETTE_KEYS = [
  'bg', 'surface', 'card', 'cardBorder', 'gradientBg',
  'primary', 'primaryLight', 'evil', 'evilGlow', 'village',
  'text', 'textSecondary', 'textDim', 'white',
  'danger', 'success', 'warning',
  'tabBg', 'tabBorder', 'tabActive', 'tabInactive',
  'isDark',
];

// ─── PALETTES ─────────────────────────────────────────────────────────────────

describe('PALETTES', () => {
  test('has 6 palettes', () => {
    expect(Object.keys(PALETTES)).toHaveLength(6);
  });

  test('contains expected palette ids', () => {
    ['shadow', 'blood_moon', 'ancient_forest', 'monsoon', 'dusk', 'moonlight'].forEach((id) => {
      expect(PALETTES).toHaveProperty(id);
    });
  });

  test('each palette has required color keys', () => {
    Object.entries(PALETTES).forEach(([id, palette]) => {
      REQUIRED_PALETTE_KEYS.forEach((key) => {
        expect(palette).toHaveProperty(key);
      });
    });
  });

  test('gradientBg is an array of 3 strings in each palette', () => {
    Object.values(PALETTES).forEach((palette) => {
      expect(Array.isArray(palette.gradientBg)).toBe(true);
      expect(palette.gradientBg).toHaveLength(3);
      palette.gradientBg.forEach((c) => expect(typeof c).toBe('string'));
    });
  });

  test('all palettes have a boolean isDark property', () => {
    Object.values(PALETTES).forEach((palette) => {
      expect(typeof palette.isDark).toBe('boolean');
    });
  });

  test('shadow palette is dark', () => {
    expect(PALETTES.shadow.isDark).toBe(true);
  });

  test('moonlight palette is not dark', () => {
    expect(PALETTES.moonlight.isDark).toBe(false);
  });

  test('color values are hex strings', () => {
    const hexPattern = /^#[0-9A-Fa-f]{3,8}$/;
    Object.values(PALETTES).forEach((palette) => {
      ['bg', 'primary', 'text', 'evil'].forEach((key) => {
        expect(palette[key]).toMatch(hexPattern);
      });
    });
  });
});

// ─── PALETTE_IDS ──────────────────────────────────────────────────────────────

describe('PALETTE_IDS', () => {
  test('is an array of 6 strings', () => {
    expect(Array.isArray(PALETTE_IDS)).toBe(true);
    expect(PALETTE_IDS).toHaveLength(6);
    PALETTE_IDS.forEach((id) => expect(typeof id).toBe('string'));
  });

  test('contains shadow as the first entry', () => {
    expect(PALETTE_IDS[0]).toBe('shadow');
  });
});

// ─── paletteForThemeId ────────────────────────────────────────────────────────

describe('paletteForThemeId', () => {
  test('returns the correct palette for a valid id', () => {
    const palette = paletteForThemeId('shadow');
    expect(palette).toBe(PALETTES.shadow);
  });

  test('returns blood_moon palette for blood_moon id', () => {
    const palette = paletteForThemeId('blood_moon');
    expect(palette).toBe(PALETTES.blood_moon);
  });

  test('falls back to SHADOW palette for unknown id', () => {
    const palette = paletteForThemeId('nonexistent');
    // SHADOW is the fallback — check it matches the shadow palette
    expect(palette.tabActive).toBe(PALETTES.shadow.tabActive);
  });

  test('falls back to SHADOW for undefined id', () => {
    const palette = paletteForThemeId(undefined);
    expect(palette.bg).toBe(PALETTES.shadow.bg);
  });

  test('returns correct palette for all valid ids', () => {
    PALETTE_IDS.forEach((id) => {
      const palette = paletteForThemeId(id);
      expect(palette).toBe(PALETTES[id]);
    });
  });
});

// ─── THEME_META ───────────────────────────────────────────────────────────────

describe('THEME_META', () => {
  test('has 6 entries', () => {
    expect(THEME_META).toHaveLength(6);
  });

  test('each entry has id, label, emoji, description, swatch', () => {
    THEME_META.forEach((meta) => {
      expect(typeof meta.id).toBe('string');
      expect(typeof meta.label).toBe('string');
      expect(typeof meta.emoji).toBe('string');
      expect(typeof meta.description).toBe('string');
      expect(Array.isArray(meta.swatch)).toBe(true);
      expect(meta.swatch).toHaveLength(3);
    });
  });

  test('all ids in THEME_META correspond to valid PALETTE_IDS', () => {
    THEME_META.forEach((meta) => {
      expect(PALETTE_IDS).toContain(meta.id);
    });
  });
});

// ─── RADIUS ───────────────────────────────────────────────────────────────────

describe('RADIUS', () => {
  test('has expected shape keys', () => {
    ['sm', 'md', 'lg', 'xl', 'pill'].forEach((key) => {
      expect(RADIUS).toHaveProperty(key);
      expect(typeof RADIUS[key]).toBe('number');
    });
  });

  test('pill is the largest value', () => {
    const values = Object.values(RADIUS);
    expect(RADIUS.pill).toBe(Math.max(...values));
  });
});

// ─── makeShadow ───────────────────────────────────────────────────────────────

describe('makeShadow', () => {
  test('returns a shadow style object with required keys', () => {
    const shadow = makeShadow('#FF0000');
    expect(shadow).toHaveProperty('shadowColor', '#FF0000');
    expect(shadow).toHaveProperty('shadowOffset');
    expect(shadow).toHaveProperty('shadowOpacity');
    expect(shadow).toHaveProperty('shadowRadius');
    expect(shadow).toHaveProperty('elevation');
  });

  test('uses default radius of 10 when not provided', () => {
    const shadow = makeShadow('#000');
    expect(shadow.shadowRadius).toBe(10);
  });

  test('uses default opacity of 0.4 when not provided', () => {
    const shadow = makeShadow('#000');
    expect(shadow.shadowOpacity).toBe(0.4);
  });

  test('accepts custom radius and opacity', () => {
    const shadow = makeShadow('#FFF', 20, 0.8);
    expect(shadow.shadowRadius).toBe(20);
    expect(shadow.shadowOpacity).toBe(0.8);
    expect(shadow.elevation).toBe(Math.round(20 * 0.6));
  });

  test('elevation is calculated from radius', () => {
    const shadow = makeShadow('#ABC', 15);
    expect(shadow.elevation).toBe(Math.round(15 * 0.6));
  });

  test('shadowOffset has width and height', () => {
    const shadow = makeShadow('#000');
    expect(shadow.shadowOffset).toEqual({ width: 0, height: 0 });
  });
});
