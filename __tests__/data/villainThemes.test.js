import { VILLAIN_THEMES, VILLAIN_THEME_LIST, getTheme } from '../../src/data/villainThemes';

const EXPECTED_THEME_IDS = ['VILLAIN', 'BHEDIYA', 'VAMPIR', 'SHER', 'ZOMBIE', 'FREDDY', 'JASON', 'DAYAN', 'HINDI', 'TAMIL', 'TELUGU', 'JIANGSHI', 'GUMIHO', 'BANSHEE', 'LLORONA', 'MAFIA', 'YAKSHI', 'VETALA', 'ONI', 'IFRIT'];

// ─── VILLAIN_THEMES ───────────────────────────────────────────────────────────

describe('VILLAIN_THEMES', () => {
  test('has all expected themes including international and Mafia', () => {
    EXPECTED_THEME_IDS.forEach((id) => {
      expect(VILLAIN_THEMES).toHaveProperty(id);
    });
  });

  test('each theme has required properties', () => {
    EXPECTED_THEME_IDS.forEach((id) => {
      const theme = VILLAIN_THEMES[id];
      expect(theme.id).toBe(id);
      expect(typeof theme.label).toBe('string');
      expect(typeof theme.emoji).toBe('string');
      expect(typeof theme.color).toBe('string');
      expect(typeof theme.bgColor).toBe('string');
      expect(Array.isArray(theme.gradientBg)).toBe(true);
      expect(theme.gradientBg.length).toBe(3);
      expect(typeof theme.nightWake).toBe('string');
      expect(typeof theme.nightInstruction).toBe('string');
      expect(typeof theme.winText).toBe('string');
      expect(typeof theme.loseText).toBe('string');
      expect(typeof theme.paletteKey).toBe('string');
      expect(typeof theme.roleSetKey).toBe('string');
    });
  });

  test('BHEDIYA theme has knowsAlliesDefault: true', () => {
    expect(VILLAIN_THEMES.BHEDIYA.knowsAlliesDefault).toBe(true);
  });

  test('FREDDY and JASON have knowsAlliesDefault: false (solo villains)', () => {
    expect(VILLAIN_THEMES.FREDDY.knowsAlliesDefault).toBe(false);
    expect(VILLAIN_THEMES.JASON.knowsAlliesDefault).toBe(false);
  });

  test('new international themes are present with correct ids', () => {
    expect(VILLAIN_THEMES.YAKSHI.id).toBe('YAKSHI');
    expect(VILLAIN_THEMES.VETALA.id).toBe('VETALA');
    expect(VILLAIN_THEMES.ONI.id).toBe('ONI');
    expect(VILLAIN_THEMES.IFRIT.id).toBe('IFRIT');
  });

  test('new themes have international flag', () => {
    expect(VILLAIN_THEMES.YAKSHI.international).toBe(true);
    expect(VILLAIN_THEMES.VETALA.international).toBe(true);
    expect(VILLAIN_THEMES.ONI.international).toBe(true);
    expect(VILLAIN_THEMES.IFRIT.international).toBe(true);
  });
});

// ─── VILLAIN_THEME_LIST ───────────────────────────────────────────────────────

describe('VILLAIN_THEME_LIST', () => {
  test('contains 20 themes', () => {
    expect(VILLAIN_THEME_LIST).toHaveLength(20);
  });

  test('all entries are theme objects with id', () => {
    VILLAIN_THEME_LIST.forEach((theme) => {
      expect(typeof theme.id).toBe('string');
      expect(EXPECTED_THEME_IDS).toContain(theme.id);
    });
  });
});

// ─── getTheme ─────────────────────────────────────────────────────────────────

describe('getTheme', () => {
  test('returns theme with palette and roles for a known id', () => {
    const theme = getTheme('BHEDIYA');
    expect(theme.id).toBe('BHEDIYA');
    expect(typeof theme.palette).toBe('object');
    expect(typeof theme.roles).toBe('object');
  });

  test('palette has expected color keys', () => {
    const { palette } = getTheme('VILLAIN');
    expect(typeof palette.bg).toBe('string');
    expect(typeof palette.primary).toBe('string');
    expect(typeof palette.text).toBe('string');
    expect(typeof palette.evil).toBe('string');
  });

  test('roles has all 4 role overrides', () => {
    const { roles } = getTheme('BHEDIYA');
    ['VILLAIN', 'VILLAGER', 'SEER', 'HEALER'].forEach((role) => {
      expect(roles).toHaveProperty(role);
      expect(typeof roles[role].name).toBe('string');
      expect(typeof roles[role].emoji).toBe('string');
    });
  });

  test('falls back to BHEDIYA for unknown id', () => {
    const theme = getTheme('UNKNOWN_THEME');
    expect(theme.id).toBe('BHEDIYA');
  });

  test('falls back to BHEDIYA for undefined id', () => {
    const theme = getTheme(undefined);
    expect(theme.id).toBe('BHEDIYA');
  });

  test('WOLF theme has Shepherd VILLAGER and Wolf Hunter SEER', () => {
    const { roles } = getTheme('BHEDIYA');
    expect(roles.VILLAIN.name).toBe('Werewolf');
    expect(roles.VILLAIN.emoji).toBe('🐺');
    expect(roles.VILLAGER.name).toBe('Shepherd');
    expect(roles.SEER.name).toBe('Wolf Hunter');
    expect(roles.HEALER.name).toBe('Apothecary');
  });

  test('VAMP theme has Vampire VILLAIN name and Priest HEALER', () => {
    const { roles } = getTheme('VAMPIR');
    expect(roles.VILLAIN.name).toBe('Vampire');
    expect(roles.HEALER.name).toBe('Priest');
  });

  test('getTheme merges killAction and killFlavor from THEME_FLAVOR', () => {
    const theme = getTheme('BHEDIYA');
    expect(typeof theme.killAction).toBe('string');
    expect(typeof theme.killFlavor).toBe('string');
    expect(typeof theme.quietFlavor).toBe('string');
  });

  test('all themes have kill flavor fields', () => {
    EXPECTED_THEME_IDS.forEach((id) => {
      const theme = getTheme(id);
      expect(typeof theme.killAction).toBe('string');
      expect(typeof theme.killFlavor).toBe('string');
      expect(typeof theme.quietFlavor).toBe('string');
    });
  });

  test('each known theme id returns that exact theme', () => {
    EXPECTED_THEME_IDS.forEach((id) => {
      const theme = getTheme(id);
      expect(theme.id).toBe(id);
      expect(typeof theme.palette).toBe('object');
    });
  });
});
