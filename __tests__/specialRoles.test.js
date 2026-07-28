import { getRoleAssignment, getRolePreview } from '../src/data/roles';
import { checkWinCondition, getAliveVillains, getNightSteps, getVoteWeight } from '../src/utils/gameLogic';
import { reducer, initialState } from '../src/context/GameContext';

// Regression coverage for wiring HUNTER, CHIEF, and DON into actual gameplay.
// Previously these roles were fully built (revenge phase, double vote, Seer-immunity,
// reveal UI) but getRoleAssignment() never dealt them to any player, so all of that
// code was dead. This also covers the follow-on fix: DON is evil-team for win-condition
// purposes even though the Seer specifically cannot detect it.

describe('getRoleAssignment — HUNTER/CHIEF/DON thresholds', () => {
  test('HUNTER appears at 7+ players, not below', () => {
    expect(getRoleAssignment(6)).not.toContain('HUNTER');
    expect(getRoleAssignment(7)).toContain('HUNTER');
  });

  test('CHIEF appears at 9+ players, not below', () => {
    expect(getRoleAssignment(8)).not.toContain('CHIEF');
    expect(getRoleAssignment(9)).toContain('CHIEF');
  });

  test('DON appears at 8+ players with 2+ evil, replacing one VILLAIN (evil headcount unchanged)', () => {
    const roles = getRoleAssignment(8); // auto evilCount = 2 at 8 players
    expect(roles).toContain('DON');
    const evilCount = roles.filter(r => r === 'VILLAIN' || r === 'DON').length;
    expect(evilCount).toBe(2);
  });

  test('DON does not appear when evilCount is 1 (would be an undetectable-only evil team)', () => {
    const roles = getRoleAssignment(8, 1);
    expect(roles).not.toContain('DON');
  });

  test('DON does not appear below the 8-player threshold, even with 2+ evil', () => {
    const roles = getRoleAssignment(7, 2);
    expect(roles).not.toContain('DON');
  });

  test('total assigned roles always equals player count, across counts and villain overrides', () => {
    for (let n = 4; n <= 16; n++) {
      for (const override of [0, 1, 2, 3]) {
        expect(getRoleAssignment(n, override).length).toBe(n);
      }
    }
  });
});

describe('getRolePreview — respects manual villain count override', () => {
  test('preview evil count matches the manual override, not just auto-scaling', () => {
    const auto = getRolePreview(9);
    const manual = getRolePreview(9, 3);
    const autoEvil = auto.filter(r => r.id === 'VILLAIN' || r.id === 'DON').reduce((s, r) => s + r.count, 0);
    const manualEvil = manual.filter(r => r.id === 'VILLAIN' || r.id === 'DON').reduce((s, r) => s + r.count, 0);
    expect(autoEvil).toBe(2);
    expect(manualEvil).toBe(3);
  });
});

describe('DON counts as evil-team for win-condition purposes', () => {
  test('DON alone vs 2 village players — evil does not yet have parity, game continues', () => {
    const players = [
      { role: 'DON', isAlive: true },
      { role: 'VILLAGER', isAlive: true },
      { role: 'VILLAGER', isAlive: true },
    ];
    expect(checkWinCondition(players)).toBeNull();
  });

  test('DON reaching parity with village triggers a VILLAIN win', () => {
    const players = [
      { role: 'DON', isAlive: true },
      { role: 'VILLAGER', isAlive: true },
    ];
    expect(checkWinCondition(players)).toBe('VILLAIN');
  });

  test('getAliveVillains includes an alive DON', () => {
    const players = [
      { role: 'DON', isAlive: true },
      { role: 'VILLAIN', isAlive: false },
      { role: 'VILLAGER', isAlive: true },
    ];
    const alive = getAliveVillains(players);
    expect(alive).toHaveLength(1);
    expect(alive[0].role).toBe('DON');
  });

  test('night VILLAIN step still runs when the only evil left alive is the Don', () => {
    const players = [
      { role: 'DON', isAlive: true },
      { role: 'VILLAGER', isAlive: true },
    ];
    expect(getNightSteps(players)).toContain('VILLAIN');
  });
});

describe('vote weight unaffected by the DON changes', () => {
  test('CHIEF still gets double vote weight', () => {
    expect(getVoteWeight({ role: 'CHIEF', isAlive: true })).toBe(2);
  });

  test('DON gets normal vote weight — only Seer-immunity is special', () => {
    expect(getVoteWeight({ role: 'DON', isAlive: true })).toBe(1);
  });
});

describe('HUNTER revenge phase — regression check, unaffected by DON changes', () => {
  test('voting out a HUNTER still triggers the revenge phase', () => {
    const state = {
      ...initialState,
      phase: 'DAY',
      players: [
        { id: '1', role: 'HUNTER', isAlive: true },
        { id: '2', role: 'VILLAGER', isAlive: true },
        { id: '3', role: 'VILLAGER', isAlive: true },
      ],
      votes: [{ voterId: '2', targetId: '1' }, { voterId: '3', targetId: '1' }],
    };
    const next = reducer(state, { type: 'RESOLVE_VOTE' });
    expect(next.phase).toBe('HUNTER_REVENGE');
  });
});
