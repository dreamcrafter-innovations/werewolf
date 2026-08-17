import {
  getRoleAssignment,
  getRolePreview,
  countCustomRoles,
  isCustomLoadoutValid,
  ASSIGNABLE_ROLES,
  ROLES,
} from '../src/data/roles';
import {
  applyDeaths, resolveNight, getNightSteps, checkWinCondition,
  getLoverPair, isCrossTeamPair, getTeam,
} from '../src/utils/gameLogic';
import { reducer, initialState } from '../src/context/GameContext';

// Coverage for the Jester / Witch / Cupid / Bodyguard additions and the hand-dealt
// custom loadout. These four roles each break an assumption the original three-role
// game could take for granted:
//   Jester    — a winner who is on neither team
//   Witch     — a second killer, and a save that is not the Healer's
//   Cupid     — a death that triggers another death, on every elimination path
//   Bodyguard — a protection that redirects the kill instead of cancelling it

const player = (id, role, isAlive = true, extra = {}) => ({
  id, role, isAlive, name: `P${id}`, avatar: '🧑', ...extra,
});

// ─── role data ────────────────────────────────────────────────────────────────

describe('new role definitions', () => {
  test.each(['JESTER', 'WITCH', 'CUPID', 'BODYGUARD'])('%s is fully defined', (id) => {
    const r = ROLES[id];
    expect(r).toBeDefined();
    expect(r.id).toBe(id);
    expect(r.name).toBeTruthy();
    expect(r.emoji).toBeTruthy();
    expect(r.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(r.description.length).toBeGreaterThan(20);
  });

  test('the Jester belongs to neither team', () => {
    expect(ROLES.JESTER.team).toBe('neutral');
    expect(['good', 'evil']).not.toContain(ROLES.JESTER.team);
  });

  test('every assignable role has a definition', () => {
    ASSIGNABLE_ROLES.forEach((id) => expect(ROLES[id]).toBeDefined());
  });
});

// ─── custom loadout ───────────────────────────────────────────────────────────

describe('custom loadout', () => {
  test('deals exactly the roles asked for and fills the rest with villagers', () => {
    const roles = getRoleAssignment(8, 0, { VILLAIN: 2, SEER: 1, JESTER: 1 });
    expect(roles).toHaveLength(8);
    expect(roles.filter((r) => r === 'VILLAIN')).toHaveLength(2);
    expect(roles.filter((r) => r === 'JESTER')).toHaveLength(1);
    expect(roles.filter((r) => r === 'VILLAGER')).toHaveLength(4);
  });

  test('a custom loadout overrides the auto thresholds entirely', () => {
    // CUPID normally needs 14 players; hand-dealing it at 5 must still work.
    const roles = getRoleAssignment(5, 0, { VILLAIN: 1, CUPID: 1 });
    expect(roles).toContain('CUPID');
    expect(roles).not.toContain('SEER');
  });

  test('never deals more roles than there are players', () => {
    const roles = getRoleAssignment(4, 0, Object.fromEntries(ASSIGNABLE_ROLES.map((id) => [id, 3])));
    expect(roles).toHaveLength(4);
  });

  test('an all-good loadout is forced to field one evil, so the game is winnable', () => {
    const roles = getRoleAssignment(6, 0, { SEER: 1, HEALER: 1 });
    expect(roles.filter((r) => r === 'VILLAIN' || r === 'DON').length).toBeGreaterThanOrEqual(1);
    expect(checkWinCondition(roles.map((r, i) => player(String(i), r)))).toBeNull();
  });

  test('validity: over-filled or evil-less loadouts are rejected', () => {
    expect(isCustomLoadoutValid(6, { VILLAIN: 1, SEER: 1 })).toBe(true);
    expect(isCustomLoadoutValid(6, { VILLAIN: 1, SEER: 1, HEALER: 1, HUNTER: 1, CHIEF: 1, WITCH: 1, CUPID: 1 })).toBe(false);
    expect(isCustomLoadoutValid(6, { SEER: 1, HEALER: 1 })).toBe(false);
    expect(isCustomLoadoutValid(6, null)).toBe(true); // null = auto
  });

  test('countCustomRoles ignores unknown keys and negatives', () => {
    expect(countCustomRoles({ VILLAIN: 2, SEER: 1, NONSENSE: 9, HEALER: -3 })).toBe(3);
    expect(countCustomRoles(null)).toBe(0);
  });

  test('getRolePreview reflects the custom loadout, not the auto table', () => {
    const preview = getRolePreview(8, 0, { VILLAIN: 3, JESTER: 1 });
    expect(preview.find((r) => r.id === 'VILLAIN').count).toBe(3);
    expect(preview.find((r) => r.id === 'JESTER').count).toBe(1);
    expect(preview.find((r) => r.id === 'SEER')).toBeUndefined();
  });
});

// ─── night ordering ───────────────────────────────────────────────────────────

describe('getNightSteps with the new roles', () => {
  const table = [
    player('1', 'VILLAIN'), player('2', 'BODYGUARD'), player('3', 'HEALER'),
    player('4', 'SEER'), player('5', 'WITCH'), player('6', 'CUPID'),
  ];

  test('Cupid wakes first and the Witch wakes last', () => {
    const steps = getNightSteps(table, { round: 1 });
    expect(steps).toEqual(['INTRO', 'CUPID', 'LOVERS', 'VILLAIN', 'BODYGUARD', 'HEALER', 'SEER', 'WITCH', 'DAWN']);
  });

  test('Cupid only wakes on the first night', () => {
    expect(getNightSteps(table, { round: 2 })).not.toContain('CUPID');
    expect(getNightSteps(table, { round: 1, cupidDone: true })).not.toContain('CUPID');
  });

  test('the LOVERS reveal always immediately follows CUPID', () => {
    const steps = getNightSteps(table, { round: 1 });
    expect(steps[steps.indexOf('CUPID') + 1]).toBe('LOVERS');
    // and never appears without it, or the screen would show an empty couple
    expect(getNightSteps(table, { round: 2 })).not.toContain('LOVERS');
  });

  test('a Witch with both potions spent is not woken — waking her would leak that', () => {
    expect(getNightSteps(table, { round: 2, witchHealUsed: true })).toContain('WITCH');
    expect(getNightSteps(table, { round: 2, witchHealUsed: true, witchPoisonUsed: true })).not.toContain('WITCH');
  });

  // Why NightScreen freezes its step list for the night: binding the lovers flips
  // cupidDone mid-night, which shortens the list by two. A screen holding an index into
  // a live-recomputed array would jump past the villains' turn entirely.
  test('binding the lovers shortens the step list mid-night', () => {
    const before = getNightSteps(table, { round: 1, cupidDone: false });
    const after  = getNightSteps(table, { round: 1, cupidDone: true });
    expect(before).toHaveLength(after.length + 2);
    expect(before[3]).toBe('VILLAIN');
    expect(after[3]).not.toBe('VILLAIN');
  });

  test('dead role-holders are skipped', () => {
    const dead = table.map((p) => ({ ...p, isAlive: p.role === 'VILLAIN' }));
    expect(getNightSteps(dead, { round: 1 })).toEqual(['INTRO', 'VILLAIN', 'DAWN']);
  });
});

// ─── resolveNight ─────────────────────────────────────────────────────────────

describe('resolveNight — bodyguard and witch', () => {
  const players = [
    player('1', 'VILLAIN'), player('2', 'VILLAGER'),
    player('3', 'BODYGUARD'), player('4', 'WITCH'), player('5', 'HEALER'),
  ];

  test('the bodyguard dies in the guarded player\'s place', () => {
    const r = resolveNight({ players, villainTarget: '2', bodyguardProtect: '2' });
    expect(r.killedId).toBe('3');
    expect(r.guardedById).toBe('2');
  });

  test('a bodyguard guarding themselves has nobody to shield — the attack lands', () => {
    const r = resolveNight({ players, villainTarget: '3', bodyguardProtect: '3' });
    expect(r.killedId).toBe('3');
    expect(r.guardedById).toBeNull();
  });

  test('guarding someone who was not attacked changes nothing', () => {
    const r = resolveNight({ players, villainTarget: '2', bodyguardProtect: '5' });
    expect(r.killedId).toBe('2');
    expect(r.guardedById).toBeNull();
  });

  test('the life potion saves outright — nobody dies, not even the bodyguard', () => {
    const r = resolveNight({ players, villainTarget: '2', bodyguardProtect: '2', witchSave: true });
    expect(r.killedId).toBeNull();
    expect(r.savedById).toBe('2');
  });

  test('the healer still beats the bodyguard redirect', () => {
    const r = resolveNight({ players, villainTarget: '2', healerProtect: '2', bodyguardProtect: '2' });
    expect(r.killedId).toBeNull();
    expect(r.savedById).toBe('2');
  });

  test('the death potion kills on top of the villain kill', () => {
    const r = resolveNight({ players, villainTarget: '2', witchPoison: '5' });
    expect(r.killedId).toBe('2');
    expect(r.poisonedId).toBe('5');
  });

  test('poison aimed at tonight\'s victim is wasted, not doubled', () => {
    const r = resolveNight({ players, villainTarget: '2', witchPoison: '2' });
    expect(r.killedId).toBe('2');
    expect(r.poisonedId).toBeNull();
  });
});

// ─── lovers ───────────────────────────────────────────────────────────────────

describe('applyDeaths — Cupid grief cascade', () => {
  const lovers = [
    player('1', 'VILLAGER', true, { loverId: '2' }),
    player('2', 'VILLAIN',  true, { loverId: '1' }),
    player('3', 'SEER'),
  ];

  test('killing one lover kills the other', () => {
    const { players, deaths } = applyDeaths(lovers, [{ id: '1', reason: 'VILLAIN' }], 2);
    expect(players.find((p) => p.id === '2').isAlive).toBe(false);
    expect(deaths).toContainEqual({ id: '2', reason: 'LOVER' });
    expect(players.find((p) => p.id === '2').deathRound).toBe(2);
  });

  test('the cascade works in both directions', () => {
    const { players } = applyDeaths(lovers, [{ id: '2', reason: 'VOTE' }], 1);
    expect(players.find((p) => p.id === '1').isAlive).toBe(false);
  });

  test('a lover already dying is not double-reported', () => {
    const { deaths } = applyDeaths(lovers, [{ id: '1', reason: 'VILLAIN' }, { id: '2', reason: 'POISON' }], 1);
    expect(deaths).toHaveLength(2);
    expect(deaths.find((d) => d.id === '2').reason).toBe('POISON');
  });

  test('already-dead players are ignored', () => {
    const dead = [player('1', 'VILLAGER', false), player('2', 'SEER')];
    const { deaths } = applyDeaths(dead, [{ id: '1', reason: 'VOTE' }], 1);
    expect(deaths).toHaveLength(0);
  });

  test('null ids are skipped, so callers can pass optional kills straight through', () => {
    const { deaths } = applyDeaths(lovers, [{ id: null, reason: 'VILLAIN' }, { id: undefined, reason: 'POISON' }], 1);
    expect(deaths).toHaveLength(0);
  });
});

// ─── lovers win condition ─────────────────────────────────────────────────────

describe('cross-faction lovers win as their own team', () => {
  const bind = (a, b) => [{ ...a, loverId: b.id }, { ...b, loverId: a.id }];

  test('getTeam separates good, evil and the Jester', () => {
    expect(getTeam('VILLAGER')).toBe('good');
    expect(getTeam('SEER')).toBe('good');
    expect(getTeam('VILLAIN')).toBe('evil');
    expect(getTeam('DON')).toBe('evil');
    expect(getTeam('JESTER')).toBe('neutral');
  });

  test('a villager bound to a villain, last two alive, beats the parity rule', () => {
    // Without the lovers check this is 1 evil vs 1 village — a normal evil win.
    const pair = bind(player('1', 'VILLAGER'), player('2', 'VILLAIN'));
    expect(checkWinCondition(pair)).toBe('LOVERS');
  });

  test('a same-team couple does NOT hijack the ending', () => {
    const pair = bind(player('1', 'VILLAGER'), player('2', 'SEER'));
    expect(checkWinCondition(pair)).toBe('VILLAGE');
    const evilPair = bind(player('1', 'VILLAIN'), player('2', 'DON'));
    expect(checkWinCondition(evilPair)).toBe('VILLAIN');
  });

  test('the couple must be the ONLY survivors', () => {
    const [a, b] = bind(player('1', 'VILLAGER'), player('2', 'VILLAIN'));
    // A third player still breathing — no lovers win; 1 evil vs 2 village just continues.
    expect(checkWinCondition([a, b, player('3', 'SEER')])).toBeNull();
    // A second villain gives evil parity — the couple still does not win.
    expect(checkWinCondition([a, b, player('3', 'VILLAIN')])).toBe('VILLAIN');
    // Dead bodies do not count as survivors.
    expect(checkWinCondition([a, b, player('3', 'SEER', false)])).toBe('LOVERS');
  });

  test('a Jester bound to a villager is cross-faction too', () => {
    const pair = bind(player('1', 'JESTER'), player('2', 'VILLAGER'));
    expect(isCrossTeamPair(pair)).toBe(true);
    expect(checkWinCondition(pair)).toBe('LOVERS');
  });

  test('a one-sided link is not a couple', () => {
    const half = [player('1', 'VILLAGER', true, { loverId: '2' }), player('2', 'VILLAIN')];
    expect(getLoverPair(half)).toBeNull();
    expect(checkWinCondition(half)).toBe('VILLAIN');
  });

  test('getLoverPair returns null when Cupid never acted', () => {
    expect(getLoverPair([player('1', 'VILLAGER'), player('2', 'VILLAIN')])).toBeNull();
  });

  test('grief can hand the win to nobody but the survivors — the pair dies together', () => {
    // Killing one lover kills both, so a couple can never be the "last two" by accident.
    const table = [...bind(player('1', 'VILLAGER'), player('2', 'VILLAIN')), player('3', 'SEER'), player('4', 'HEALER')];
    const { players } = applyDeaths(table, [{ id: '2', reason: 'VOTE' }], 1);
    expect(players.filter((p) => p.isAlive).map((p) => p.id)).toEqual(['3', '4']);
    expect(checkWinCondition(players)).toBe('VILLAGE');
  });

  test('the lovers ending flows through the reducer and is recorded in the recap', () => {
    // 3 alive: the couple plus one villager. The villain kills the villager at night,
    // leaving only the cross-faction pair.
    const players = [
      ...bind(player('1', 'VILLAGER'), player('2', 'VILLAIN')),
      player('3', 'SEER'),
    ];
    const next = reducer(
      { ...initialState, players, round: 2, phase: 'NIGHT',
        nightActions: { ...initialState.nightActions, villainTarget: '3' } },
      { type: 'RESOLVE_NIGHT' }
    );
    expect(next.winner).toBe('LOVERS');
    expect(next.phase).toBe('GAME_OVER');
    expect(next.log.some((e) => /lovers/i.test(e.text))).toBe(true);
  });
});

// ─── jester ───────────────────────────────────────────────────────────────────

describe('Jester win condition', () => {
  const table = [
    player('1', 'JESTER'), player('2', 'VILLAIN'),
    player('3', 'VILLAGER'), player('4', 'SEER'), player('5', 'HEALER'),
  ];

  const voteOut = (targetId, players = table) =>
    reducer(
      { ...initialState, players, round: 1, phase: 'DAY',
        votes: players.filter((p) => p.id !== targetId).map((p) => ({ voterId: p.id, targetId })) },
      { type: 'RESOLVE_VOTE' }
    );

  test('voting out the Jester ends the game with the Jester winning', () => {
    const next = voteOut('1');
    expect(next.winner).toBe('JESTER');
    expect(next.phase).toBe('GAME_OVER');
  });

  test('the Jester killed at night does NOT win — it must be a vote', () => {
    const state = {
      ...initialState, players: table, round: 1, phase: 'NIGHT',
      nightActions: { ...initialState.nightActions, villainTarget: '1' },
    };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.winner).not.toBe('JESTER');
    expect(next.players.find((p) => p.id === '1').isAlive).toBe(false);
  });

  test('a living Jester counts as a body on the village side, not a stalemate', () => {
    // 1 evil vs Jester + 1 villager — evil does not have parity yet.
    expect(checkWinCondition([player('1', 'VILLAIN'), player('2', 'JESTER'), player('3', 'VILLAGER')])).toBeNull();
    // 1 evil vs Jester alone — parity, evil wins.
    expect(checkWinCondition([player('1', 'VILLAIN'), player('2', 'JESTER')])).toBe('VILLAIN');
  });

  test('voting out anyone else does not trigger a Jester win', () => {
    expect(voteOut('3').winner).not.toBe('JESTER');
  });
});

// ─── reducer wiring ───────────────────────────────────────────────────────────

describe('reducer — new night actions', () => {
  const table = [
    player('1', 'VILLAIN'), player('2', 'VILLAGER'),
    player('3', 'CUPID'), player('4', 'WITCH'), player('5', 'BODYGUARD'),
  ];

  test('SET_CUPID_PAIR links both players symmetrically and only fires once', () => {
    const next = reducer({ ...initialState, players: table, round: 1 }, { type: 'SET_CUPID_PAIR', pair: ['1', '2'] });
    expect(next.players.find((p) => p.id === '1').loverId).toBe('2');
    expect(next.players.find((p) => p.id === '2').loverId).toBe('1');
    expect(next.cupidDone).toBe(true);
    expect(next.log).toHaveLength(1);
  });

  test('SET_CUPID_PAIR rejects a malformed or self-referential pair', () => {
    const state = { ...initialState, players: table };
    expect(reducer(state, { type: 'SET_CUPID_PAIR', pair: ['1', '1'] })).toBe(state);
    expect(reducer(state, { type: 'SET_CUPID_PAIR', pair: ['1'] })).toBe(state);
  });

  test('potions are burned on use and stay burned', () => {
    const state = {
      ...initialState, players: table, round: 1,
      nightActions: { ...initialState.nightActions, villainTarget: '2', witchSave: true, witchPoison: '5' },
    };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.witchHealUsed).toBe(true);
    expect(next.witchPoisonUsed).toBe(true);
    // A later quiet night must not un-burn them.
    const later = reducer({ ...next, nightActions: { ...initialState.nightActions } }, { type: 'RESOLVE_NIGHT' });
    expect(later.witchHealUsed).toBe(true);
    expect(later.witchPoisonUsed).toBe(true);
  });

  test('the bodyguard cannot repeat a target — last night\'s pick is remembered', () => {
    const state = {
      ...initialState, players: table, round: 1,
      nightActions: { ...initialState.nightActions, bodyguardProtect: '2' },
    };
    expect(reducer(state, { type: 'RESOLVE_NIGHT' }).lastBodyguardTarget).toBe('2');
  });

  test('a custom loadout survives START_GAME and RESET_GAME', () => {
    const customRoles = { VILLAIN: 1, JESTER: 1 };
    const players = Array.from({ length: 5 }, (_, i) => ({ id: String(i), name: `P${i}` }));
    const started = reducer({ ...initialState, customRoles }, { type: 'START_GAME', players });
    expect(started.customRoles).toEqual(customRoles);
    expect(started.players.filter((p) => p.role === 'JESTER')).toHaveLength(1);
    expect(reducer(started, { type: 'RESET_GAME' }).customRoles).toEqual(customRoles);
  });
});

// ─── recap log ────────────────────────────────────────────────────────────────

describe('recap log', () => {
  const table = [
    player('1', 'VILLAIN'), player('2', 'VILLAGER'),
    player('3', 'SEER'), player('4', 'HEALER'), player('5', 'WITCH'),
  ];

  test('a night kill is recorded with the victim\'s name', () => {
    const state = {
      ...initialState, players: table, round: 1,
      nightActions: { ...initialState.nightActions, villainTarget: '2' },
    };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.log).toHaveLength(1);
    expect(next.log[0]).toMatchObject({ round: 1, phase: 'NIGHT' });
    expect(next.log[0].text).toContain('P2');
  });

  test('a quiet night is still recorded, so no round is missing from the recap', () => {
    const state = { ...initialState, players: table, round: 3 };
    const next = reducer(state, { type: 'RESOLVE_NIGHT' });
    expect(next.log).toHaveLength(1);
    expect(next.log[0].text).toMatch(/quiet/i);
  });

  test('a tied vote is recorded', () => {
    const state = {
      ...initialState, players: table, round: 1,
      votes: [{ voterId: '1', targetId: '2' }, { voterId: '2', targetId: '1' }],
    };
    const next = reducer(state, { type: 'RESOLVE_VOTE' });
    expect(next.log[0].text).toMatch(/tie/i);
  });

  test('the log accumulates across rounds rather than resetting each night', () => {
    let s = { ...initialState, players: table, round: 1,
              nightActions: { ...initialState.nightActions, villainTarget: '2' } };
    s = reducer(s, { type: 'RESOLVE_NIGHT' });
    s = reducer(s, { type: 'START_NIGHT' });
    s = reducer({ ...s, nightActions: { ...s.nightActions, villainTarget: '3' } }, { type: 'RESOLVE_NIGHT' });
    expect(s.log.length).toBe(2);
    expect(s.log.map((e) => e.round)).toEqual([1, 2]);
  });

  test('a fresh game starts with an empty log', () => {
    const players = Array.from({ length: 5 }, (_, i) => ({ id: String(i), name: `P${i}` }));
    expect(reducer(initialState, { type: 'START_GAME', players }).log).toEqual([]);
  });
});
