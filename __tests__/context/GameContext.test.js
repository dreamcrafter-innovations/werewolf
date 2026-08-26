// GameContext.test.js
// Tests the exported reducer as a pure function — no React rendering needed.
// analytics.js gracefully handles missing Firebase via try/catch.

import { reducer, initialState } from '../../src/context/GameContext';

// ─── helpers ─────────────────────────────────────────────────────────────────

const makePlayers = (count, roles) => {
  const defaultRoles = ['VILLAIN', 'VILLAGER', 'VILLAGER', 'SEER'];
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Player${i + 1}`,
    role: roles ? roles[i] : defaultRoles[i % defaultRoles.length],
    isAlive: true,
  }));
};

// ─── initialState ─────────────────────────────────────────────────────────────

describe('initialState', () => {
  test('has correct defaults', () => {
    expect(initialState.villainThemeId).toBe('MAFIA');
    expect(initialState.players).toEqual([]);
    expect(initialState.phase).toBe('SETUP');
    expect(initialState.round).toBe(0);
    expect(initialState.winner).toBeNull();
    expect(initialState.votes).toEqual([]);
  });
});

// ─── SET_VILLAIN_THEME ────────────────────────────────────────────────────────

describe('SET_VILLAIN_THEME', () => {
  test('updates villainThemeId', () => {
    const next = reducer(initialState, { type: 'SET_VILLAIN_THEME', themeId: 'VAMPIR' });
    expect(next.villainThemeId).toBe('VAMPIR');
  });

  test('sets knowsAllies from theme default (BHEDIYA → true)', () => {
    const next = reducer(initialState, { type: 'SET_VILLAIN_THEME', themeId: 'BHEDIYA' });
    expect(next.knowsAllies).toBe(true);
  });

  test('sets knowsAllies false for solo-villain themes (FREDDY)', () => {
    const next = reducer(initialState, { type: 'SET_VILLAIN_THEME', themeId: 'FREDDY' });
    expect(next.knowsAllies).toBe(false);
  });

  test('sets knowsAllies false for JASON', () => {
    const next = reducer(initialState, { type: 'SET_VILLAIN_THEME', themeId: 'JASON' });
    expect(next.knowsAllies).toBe(false);
  });
});

// ─── SET_KNOWS_ALLIES ─────────────────────────────────────────────────────────

describe('SET_KNOWS_ALLIES', () => {
  test('sets knowsAllies to true', () => {
    const state = { ...initialState, knowsAllies: false };
    expect(reducer(state, { type: 'SET_KNOWS_ALLIES', value: true }).knowsAllies).toBe(true);
  });

  test('sets knowsAllies to false', () => {
    const state = { ...initialState, knowsAllies: true };
    expect(reducer(state, { type: 'SET_KNOWS_ALLIES', value: false }).knowsAllies).toBe(false);
  });
});

// ─── START_GAME ───────────────────────────────────────────────────────────────

describe('START_GAME', () => {
  const players = makePlayers(6).map(({ id, name }) => ({ id, name }));

  test('transitions to ROLE_REVEAL phase', () => {
    const next = reducer(initialState, { type: 'START_GAME', players });
    expect(next.phase).toBe('ROLE_REVEAL');
  });

  test('assigns roles to all players', () => {
    const next = reducer(initialState, { type: 'START_GAME', players });
    expect(next.players).toHaveLength(6);
    next.players.forEach((p) => {
      expect(typeof p.role).toBe('string');
      expect(p.isAlive).toBe(true);
    });
  });

  test('preserves villainThemeId from current state', () => {
    const state = { ...initialState, villainThemeId: 'ZOMBIE' };
    const next = reducer(state, { type: 'START_GAME', players });
    expect(next.villainThemeId).toBe('ZOMBIE');
  });

  test('resets round to 0', () => {
    const state = { ...initialState, round: 5 };
    const next = reducer(state, { type: 'START_GAME', players });
    expect(next.round).toBe(0);
  });

  test('resets winner to null', () => {
    const state = { ...initialState, winner: 'VILLAGE' };
    const next = reducer(state, { type: 'START_GAME', players });
    expect(next.winner).toBeNull();
  });
});

// ─── START_NIGHT ──────────────────────────────────────────────────────────────

describe('START_NIGHT', () => {
  test('transitions to NIGHT phase and increments round', () => {
    const state = { ...initialState, phase: 'DAY', round: 1 };
    const next = reducer(state, { type: 'START_NIGHT' });
    expect(next.phase).toBe('NIGHT');
    expect(next.round).toBe(2);
  });

  test('clears nightActions', () => {
    const state = {
      ...initialState,
      nightActions: { villainTarget: '1', healerProtect: '2', seerTarget: '3', seerResult: 'EVIL' },
    };
    const next = reducer(state, { type: 'START_NIGHT' });
    expect(next.nightActions).toEqual({
      villainTarget: null,
      healerProtect: null,
      seerTarget: null,
      seerResult: null,
      bodyguardProtect: null,
      witchSave: false,
      witchPoison: null,
      cupidPair: null,
    });
  });

  test('clears votes', () => {
    const state = { ...initialState, votes: [{ voterId: '1', targetId: '2' }] };
    const next = reducer(state, { type: 'START_NIGHT' });
    expect(next.votes).toEqual([]);
  });
});

// ─── Night action setters ─────────────────────────────────────────────────────

describe('SET_VILLAIN_TARGET', () => {
  test('sets villainTarget in nightActions', () => {
    const next = reducer(initialState, { type: 'SET_VILLAIN_TARGET', playerId: '5' });
    expect(next.nightActions.villainTarget).toBe('5');
  });
});

describe('SET_HEALER_PROTECT', () => {
  test('sets healerProtect in nightActions', () => {
    const next = reducer(initialState, { type: 'SET_HEALER_PROTECT', playerId: '3' });
    expect(next.nightActions.healerProtect).toBe('3');
  });
});

describe('SET_SEER_CHECK', () => {
  test('sets seerTarget and result EVIL for VILLAIN player', () => {
    const state = {
      ...initialState,
      players: [{ id: '2', role: 'VILLAIN', isAlive: true }],
    };
    const next = reducer(state, { type: 'SET_SEER_CHECK', playerId: '2' });
    expect(next.nightActions.seerTarget).toBe('2');
    expect(next.nightActions.seerResult).toBe('EVIL');
  });

  test('sets seerResult INNOCENT for non-VILLAIN player', () => {
    const state = {
      ...initialState,
      players: [{ id: '3', role: 'VILLAGER', isAlive: true }],
    };
    const next = reducer(state, { type: 'SET_SEER_CHECK', playerId: '3' });
    expect(next.nightActions.seerResult).toBe('INNOCENT');
  });

  test('handles player not found (result INNOCENT)', () => {
    const state = { ...initialState, players: [] };
    const next = reducer(state, { type: 'SET_SEER_CHECK', playerId: '99' });
    expect(next.nightActions.seerResult).toBe('INNOCENT');
  });
});

// ─── RESOLVE_NIGHT ────────────────────────────────────────────────────────────

describe('RESOLVE_NIGHT', () => {
  test('kills pisach target and transitions to DAY', () => {
    const state = {
      ...initialState,
      phase: 'NIGHT',
      round: 1,
      players: [
        { id: '1', role: 'VILLAIN', isAlive: true },
        { id: '2', role: 'VILLAGER', isAlive: true },
        { id: '3', role: 'VILLAGER', isAlive: true },
        { id: '4', role: 'VILLAGER', isAlive: true },
      ],
      nightActions: { villainTarget: '2', healerProtect: null, seerTarget: null, seerResult: null },
    };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.phase).toBe('DAY');
    const killed = next.players.find((p) => p.id === '2');
    expect(killed.isAlive).toBe(false);
    expect(killed.deathReason).toBe('VILLAIN');
    expect(next.lastNightResult.killedId).toBe('2');
  });

  test('saves player when vaidya protects the target', () => {
    const state = {
      ...initialState,
      phase: 'NIGHT',
      round: 1,
      players: [
        { id: '1', role: 'VILLAIN', isAlive: true },
        { id: '2', role: 'VILLAGER', isAlive: true },
        { id: '3', role: 'VILLAGER', isAlive: true },
      ],
      nightActions: { villainTarget: '2', healerProtect: '2', seerTarget: null, seerResult: null },
    };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.lastNightResult.killedId).toBeNull();
    expect(next.lastNightResult.savedById).toBe('2');
    expect(next.players.find((p) => p.id === '2').isAlive).toBe(true);
  });

  test('transitions to GAME_OVER when pisach wins after kill', () => {
    const state = {
      ...initialState,
      phase: 'NIGHT',
      round: 1,
      players: [
        { id: '1', role: 'VILLAIN', isAlive: true },
        { id: '2', role: 'VILLAGER', isAlive: true },
      ],
      nightActions: { villainTarget: '2', healerProtect: null, seerTarget: null, seerResult: null },
    };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.winner).toBe('VILLAIN');
  });
});

// ─── CAST_VOTE ────────────────────────────────────────────────────────────────

describe('CAST_VOTE', () => {
  test('adds a new vote', () => {
    const next = reducer(initialState, { type: 'CAST_VOTE', voterId: '1', targetId: '2' });
    expect(next.votes).toHaveLength(1);
    expect(next.votes[0]).toEqual({ voterId: '1', targetId: '2' });
  });

  test('updates existing vote for same voter', () => {
    const state = { ...initialState, votes: [{ voterId: '1', targetId: '2' }] };
    const next = reducer(state, { type: 'CAST_VOTE', voterId: '1', targetId: '3' });
    expect(next.votes).toHaveLength(1);
    expect(next.votes[0].targetId).toBe('3');
  });

  test('adds votes from multiple voters', () => {
    let state = initialState;
    state = reducer(state, { type: 'CAST_VOTE', voterId: '1', targetId: '3' });
    state = reducer(state, { type: 'CAST_VOTE', voterId: '2', targetId: '3' });
    expect(state.votes).toHaveLength(2);
  });
});

// ─── RESOLVE_VOTE ─────────────────────────────────────────────────────────────

describe('RESOLVE_VOTE', () => {
  const buildState = (players, votes) => ({
    ...initialState,
    phase: 'VOTE',
    round: 1,
    players,
    votes,
  });

  test('eliminates the voted-out player; GAME_OVER when last VILLAIN removed', () => {
    const players = [
      { id: '1', role: 'VILLAGER', isAlive: true },
      { id: '2', role: 'VILLAIN', isAlive: true },
      { id: '3', role: 'VILLAGER', isAlive: true },
      { id: '4', role: 'VILLAGER', isAlive: true },
    ];
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '3', targetId: '2' },
      { voterId: '4', targetId: '1' },
    ];
    const next = reducer(buildState(players, votes), { type: 'RESOLVE_VOTE' });
    expect(next.players.find((p) => p.id === '2').isAlive).toBe(false);
    expect(next.winner).toBe('VILLAGE'); // last VILLAIN eliminated
    expect(next.phase).toBe('GAME_OVER');
  });

  test('eliminates voted-out villager and transitions to DAY when game continues', () => {
    const players = [
      { id: '1', role: 'VILLAGER', isAlive: true },
      { id: '2', role: 'VILLAGER', isAlive: true },
      { id: '3', role: 'VILLAIN', isAlive: true },
      { id: '4', role: 'VILLAGER', isAlive: true },
    ];
    const votes = [
      { voterId: '3', targetId: '1' },
      { voterId: '4', targetId: '1' },
    ];
    const next = reducer(buildState(players, votes), { type: 'RESOLVE_VOTE' });
    expect(next.players.find((p) => p.id === '1').isAlive).toBe(false);
    expect(next.phase).toBe('DAY');
    expect(next.winner).toBeNull();
  });

  test('transitions to HUNTER_REVENGE when Hunter is voted out', () => {
    const players = [
      { id: '1', role: 'VILLAIN', isAlive: true },
      { id: '2', role: 'HUNTER', isAlive: true },
      { id: '3', role: 'VILLAGER', isAlive: true },
    ];
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '3', targetId: '2' },
    ];
    const next = reducer(buildState(players, votes), { type: 'RESOLVE_VOTE' });
    expect(next.phase).toBe('HUNTER_REVENGE');
    expect(next.hunterRevenge.hunterId).toBe('2');
  });

  test('no elimination on tie — stays in same phase structure', () => {
    const players = [
      { id: '1', role: 'VILLAIN', isAlive: true },
      { id: '2', role: 'VILLAGER', isAlive: true },
      { id: '3', role: 'VILLAGER', isAlive: true },
    ];
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '2', targetId: '1' },
    ];
    const next = reducer(buildState(players, votes), { type: 'RESOLVE_VOTE' });
    expect(next.eliminatedThisVote).toBeNull();
    expect(next.players.every((p) => p.isAlive)).toBe(true);
  });
});

// ─── HUNTER_REVENGE_TARGET ───────────────────────────────────────────────────

describe('HUNTER_REVENGE_TARGET', () => {
  test('kills the revenge target and transitions to DAY', () => {
    const state = {
      ...initialState,
      phase: 'HUNTER_REVENGE',
      round: 1,
      players: [
        { id: '1', role: 'VILLAIN', isAlive: true },
        { id: '2', role: 'HUNTER', isAlive: false },
        { id: '3', role: 'VILLAGER', isAlive: true },
        { id: '4', role: 'VILLAGER', isAlive: true },
      ],
      hunterRevenge: { hunterId: '2', revengeTarget: null },
    };
    const next = reducer(state, { type: 'HUNTER_REVENGE_TARGET', targetId: '1' });
    expect(next.players.find((p) => p.id === '1').isAlive).toBe(false);
    expect(next.hunterRevenge.revengeTarget).toBe('1');
    expect(next.winner).toBe('VILLAGE'); // pisach eliminated
    expect(next.phase).toBe('GAME_OVER');
  });
});

// ─── SKIP_HUNTER_REVENGE ─────────────────────────────────────────────────────

describe('SKIP_HUNTER_REVENGE', () => {
  test('transitions to DAY when game continues', () => {
    const state = {
      ...initialState,
      phase: 'HUNTER_REVENGE',
      players: [
        { id: '1', role: 'VILLAIN', isAlive: true },
        { id: '2', role: 'VILLAGER', isAlive: true },
        { id: '3', role: 'VILLAGER', isAlive: true },
      ],
    };
    const next = reducer(state, { type: 'SKIP_HUNTER_REVENGE' });
    expect(next.phase).toBe('DAY');
    expect(next.winner).toBeNull();
  });

  test('transitions to GAME_OVER when pisach already wins', () => {
    const state = {
      ...initialState,
      phase: 'HUNTER_REVENGE',
      players: [
        { id: '1', role: 'VILLAIN', isAlive: true },
        { id: '2', role: 'VILLAGER', isAlive: true },
      ],
    };
    const next = reducer(state, { type: 'SKIP_HUNTER_REVENGE' });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.winner).toBe('VILLAIN');
  });
});

// ─── RESET_GAME ───────────────────────────────────────────────────────────────

describe('RESET_GAME', () => {
  test('resets to initial state preserving villainThemeId and knowsAllies', () => {
    const state = {
      ...initialState,
      villainThemeId: 'DAYAN',
      knowsAllies: false,
      players: makePlayers(4),
      round: 3,
      phase: 'DAY',
      winner: 'VILLAGE',
    };
    const next = reducer(state, { type: 'RESET_GAME' });
    expect(next.villainThemeId).toBe('DAYAN');
    expect(next.knowsAllies).toBe(true);  // DAYAN.knowsAlliesDefault = true
    expect(next.players).toEqual([]);
    expect(next.round).toBe(0);
    expect(next.phase).toBe('SETUP');
    expect(next.winner).toBeNull();
  });
});

// ─── default (unknown action) ─────────────────────────────────────────────────

describe('reducer default case', () => {
  test('returns state unchanged for unknown action type', () => {
    const state = { ...initialState, round: 2 };
    const next = reducer(state, { type: 'UNKNOWN_ACTION' });
    expect(next).toBe(state);
  });
});

// ─── RESOLVE_NIGHT single-use / lapsing rules ────────────────────────────────

describe('RESOLVE_NIGHT protection bookkeeping', () => {
  // Healer, Villager, Villager, Bodyguard — Healer is player "1".
  const table = () => makePlayers(4, ['HEALER', 'VILLAGER', 'VILLAGER', 'BODYGUARD']);

  const nightState = (nightActions, extra = {}) => ({
    ...initialState,
    players: table(),
    phase: 'NIGHT',
    round: 1,
    nightActions: { ...initialState.nightActions, ...nightActions },
    ...extra,
  });

  test('healerSelfUsed is burned when the Healer protects themselves', () => {
    const next = reducer(nightState({ healerProtect: '1' }), { type: 'RESOLVE_NIGHT' });
    expect(next.healerSelfUsed).toBe(true);
  });

  test('healerSelfUsed stays false when the Healer protects someone else', () => {
    const next = reducer(nightState({ healerProtect: '2' }), { type: 'RESOLVE_NIGHT' });
    expect(next.healerSelfUsed).toBe(false);
  });

  test('healerSelfUsed stays false when the Healer step is skipped', () => {
    const next = reducer(nightState({}), { type: 'RESOLVE_NIGHT' });
    expect(next.healerSelfUsed).toBe(false);
  });

  test('healerSelfUsed is never un-burned by a later night', () => {
    const next = reducer(nightState({ healerProtect: '2' }, { healerSelfUsed: true }), { type: 'RESOLVE_NIGHT' });
    expect(next.healerSelfUsed).toBe(true);
  });

  test('lastBodyguardTarget records the night’s pick', () => {
    const next = reducer(nightState({ bodyguardProtect: '2' }), { type: 'RESOLVE_NIGHT' });
    expect(next.lastBodyguardTarget).toBe('2');
  });

  test('lastBodyguardTarget lapses after a night with no pick, so the ban is not permanent', () => {
    const next = reducer(nightState({}, { lastBodyguardTarget: '2' }), { type: 'RESOLVE_NIGHT' });
    expect(next.lastBodyguardTarget).toBeNull();
  });
});
