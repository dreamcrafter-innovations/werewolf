import { reducer, initialState } from '../../src/context/GameContext';
import { getActiveVillainTheme } from '../../src/data/villainThemes';

// Regression coverage for mixed-villain theme propagation:
// - HomeScreen theme cards now toggle-select (multiple themes can be active at once)
// - START_GAME draws each VILLAIN player their own theme from selectedThemeIds
// - getActiveVillainTheme combines multiple distinct villain themes for shared flavor text
//   (Night wake narration, Day kill flavor, Game Over recap)

test('START_GAME assigns per-villain theme overrides from selectedThemeIds', () => {
  const state = { ...initialState, selectedThemeIds: ['MAFIA', 'BHEDIYA', 'VAMPIR'], villainCount: 3 };
  const players = Array.from({ length: 9 }, (_, i) => ({ id: String(i), name: 'P' + i }));
  const next = reducer(state, { type: 'START_GAME', players });
  const villains = next.players.filter(p => p.role === 'VILLAIN');
  // 3 evil at 9 players, but one is upgraded to DON (8+ players, 2+ evil) — the DON is
  // Seer-proof and carries no theme override, so only the plain VILLAINs draw a theme.
  expect(next.players.filter(p => p.role === 'VILLAIN' || p.role === 'DON').length).toBe(3);
  expect(villains.length).toBe(2);
  villains.forEach(v => expect(['MAFIA', 'BHEDIYA', 'VAMPIR']).toContain(v.villainThemeOverride));
  const nonVillains = next.players.filter(p => p.role !== 'VILLAIN');
  nonVillains.forEach(p => expect(p.villainThemeOverride).toBeNull());
});

test('START_GAME falls back to the single selected theme when only one is chosen', () => {
  const state = { ...initialState, selectedThemeIds: ['ZOMBIE'], villainThemeId: 'ZOMBIE', villainCount: 1 };
  const players = Array.from({ length: 5 }, (_, i) => ({ id: String(i), name: 'P' + i }));
  const next = reducer(state, { type: 'START_GAME', players });
  const villains = next.players.filter(p => p.role === 'VILLAIN');
  villains.forEach(v => expect(v.villainThemeOverride).toBe('ZOMBIE'));
});

test('getActiveVillainTheme combines multiple distinct themes into shared flavor text', () => {
  const villains = [
    { role: 'VILLAIN', villainThemeOverride: 'MAFIA' },
    { role: 'VILLAIN', villainThemeOverride: 'BHEDIYA' },
  ];
  const combined = getActiveVillainTheme(villains, 'MAFIA');
  expect(combined.label).toBe('Mafia & Werewolf');
  expect(combined.nightWake).toContain('Mafia & Werewolf');
});

test('getActiveVillainTheme returns the theme untouched when all villains share it', () => {
  const villains = [
    { role: 'VILLAIN', villainThemeOverride: 'ZOMBIE' },
    { role: 'VILLAIN', villainThemeOverride: 'ZOMBIE' },
  ];
  const theme = getActiveVillainTheme(villains, 'MAFIA');
  expect(theme.label).toBe('Zombie');
  expect(theme.nightWake).toBe('Zombies, wake up! 🧟');
});

test('getActiveVillainTheme falls back to fallbackThemeId when no villains are present', () => {
  const theme = getActiveVillainTheme([], 'JASON');
  expect(theme.label).toBe('Jason');
});

test('TOGGLE_THEME_SELECT (now wired to HomeScreen tap) adds and removes themes', () => {
  let s = { ...initialState, selectedThemeIds: ['MAFIA'], villainThemeId: 'MAFIA' };
  s = reducer(s, { type: 'TOGGLE_THEME_SELECT', themeId: 'BHEDIYA' });
  expect(s.selectedThemeIds.sort()).toEqual(['BHEDIYA', 'MAFIA'].sort());
  s = reducer(s, { type: 'TOGGLE_THEME_SELECT', themeId: 'MAFIA' });
  expect(s.selectedThemeIds).toEqual(['BHEDIYA']);
});

test('SET_VILLAIN_THEME (used by the Home screen Random card) still collapses to one theme', () => {
  const s = reducer(initialState, { type: 'SET_VILLAIN_THEME', themeId: 'JASON' });
  expect(s.villainThemeId).toBe('JASON');
  expect(s.selectedThemeIds).toEqual(['JASON']);
});
