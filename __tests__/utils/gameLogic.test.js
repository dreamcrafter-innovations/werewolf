import {
  checkWinCondition,
  resolveNight,
  tallyVotes,
  getVoteTally,
  getVoteWeight,
  getAliveVillains,
  getNightSteps,
  getRoleData,
} from '../../src/utils/gameLogic';

// Helpers to build player objects
const player = (id, role, isAlive = true) => ({ id, role, isAlive });

// ─── checkWinCondition ────────────────────────────────────────────────────────

describe('checkWinCondition', () => {
  test('returns VILLAGE when no VILLAIN are alive', () => {
    const players = [
      player('1', 'VILLAGER'),
      player('2', 'VILLAGER'),
      player('3', 'VILLAIN', false),
    ];
    expect(checkWinCondition(players)).toBe('VILLAGE');
  });

  test('returns VILLAIN when pisach count >= village count', () => {
    const players = [
      player('1', 'VILLAIN'),
      player('2', 'VILLAGER'),
    ];
    expect(checkWinCondition(players)).toBe('VILLAIN');
  });

  test('returns VILLAIN when pisach outnumber village', () => {
    const players = [
      player('1', 'VILLAIN'),
      player('2', 'VILLAIN'),
      player('3', 'VILLAGER'),
    ];
    expect(checkWinCondition(players)).toBe('VILLAIN');
  });

  test('returns null when game continues (village outnumber pisach)', () => {
    const players = [
      player('1', 'VILLAIN'),
      player('2', 'VILLAGER'),
      player('3', 'VILLAGER'),
      player('4', 'VILLAGER'),
    ];
    expect(checkWinCondition(players)).toBeNull();
  });

  test('ignores dead players in win calculation', () => {
    const players = [
      player('1', 'VILLAIN'),
      player('2', 'VILLAGER'),
      player('3', 'VILLAGER', false), // dead
    ];
    // alive: 1 VILLAIN, 1 village → VILLAIN wins (equal)
    expect(checkWinCondition(players)).toBe('VILLAIN');
  });

  test('returns VILLAGE when all alive players are villagers', () => {
    const players = [
      player('1', 'VILLAGER'),
      player('2', 'SEER'),
      player('3', 'VILLAIN', false),
      player('4', 'VILLAIN', false),
    ];
    expect(checkWinCondition(players)).toBe('VILLAGE');
  });
});

// ─── resolveNight ─────────────────────────────────────────────────────────────

describe('resolveNight', () => {
  test('kills pisach target when no protection', () => {
    const result = resolveNight({
      players: [player('1', 'VILLAGER')],
      villainTarget: '1',
      healerProtect: null,
    });
    expect(result.killedId).toBe('1');
    expect(result.savedById).toBeNull();
  });

  test('saves player when vaidya protects the target', () => {
    const result = resolveNight({
      players: [player('1', 'VILLAGER')],
      villainTarget: '1',
      healerProtect: '1',
    });
    expect(result.killedId).toBeNull();
    expect(result.savedById).toBe('1');
  });

  test('kills target when vaidya protects a different player', () => {
    const result = resolveNight({
      players: [player('1', 'VILLAGER'), player('2', 'VILLAGER')],
      villainTarget: '1',
      healerProtect: '2',
    });
    expect(result.killedId).toBe('1');
    expect(result.savedById).toBeNull();
  });

  test('no kill when villainTarget is null', () => {
    const result = resolveNight({
      players: [player('1', 'VILLAGER')],
      villainTarget: null,
      healerProtect: null,
    });
    expect(result.killedId).toBeNull();
    expect(result.savedById).toBeNull();
  });

  test('no kill when villainTarget is null even with vaidya protect', () => {
    const result = resolveNight({
      players: [player('1', 'VILLAGER')],
      villainTarget: null,
      healerProtect: '1',
    });
    expect(result.killedId).toBeNull();
    expect(result.savedById).toBeNull();
  });
});

// ─── tallyVotes ───────────────────────────────────────────────────────────────

describe('tallyVotes', () => {
  const players = [
    player('1', 'VILLAGER'),
    player('2', 'VILLAGER'),
    player('3', 'VILLAIN'),
    player('4', 'CHIEF'),
  ];

  test('returns id of player with most votes', () => {
    const votes = [
      { voterId: '1', targetId: '3' },
      { voterId: '2', targetId: '3' },
      { voterId: '3', targetId: '1' },
    ];
    expect(tallyVotes(votes, players)).toBe('3');
  });

  test('returns null on tie', () => {
    const votes = [
      { voterId: '1', targetId: '3' },
      { voterId: '2', targetId: '1' },
    ];
    expect(tallyVotes(votes, players)).toBeNull();
  });

  test('returns null when no votes cast', () => {
    expect(tallyVotes([], players)).toBeNull();
  });

  test('ignores votes with no target', () => {
    const votes = [
      { voterId: '1', targetId: null },
      { voterId: '2', targetId: '3' },
    ];
    expect(tallyVotes(votes, players)).toBe('3');
  });

  test('returns id of player with most votes (equal weight)', () => {
    const votes = [
      { voterId: '1', targetId: '3' },
      { voterId: '2', targetId: '3' },
      { voterId: '3', targetId: '1' }, // player 3 gets 2 votes, player 1 gets 1 → player 3 wins
    ];
    expect(tallyVotes(votes, players)).toBe('3');
  });

  test('tie vote returns null when no Chief is voting', () => {
    const votes = [
      { voterId: '1', targetId: '3' },
      { voterId: '2', targetId: '1' },
    ];
    // player 4 (CHIEF) abstains, so both targets get 1 vote each → tie
    expect(tallyVotes(votes, players)).toBeNull();
  });

  test('returns null when all votes are abstentions', () => {
    const votes = [
      { voterId: '1', targetId: null },
      { voterId: '2', targetId: null },
    ];
    expect(tallyVotes(votes, players)).toBeNull();
  });

  test('Chief vote counts double and breaks what would otherwise be a tie', () => {
    const votes = [
      { voterId: '1', targetId: '3' },
      { voterId: '2', targetId: '1' },
      { voterId: '3', targetId: '3' },
      { voterId: '4', targetId: '1' }, // 4 is CHIEF: weight 2 → target '1' gets 1 + 2 = 3, target '3' gets 1 + 1 = 2
    ];
    expect(tallyVotes(votes, players)).toBe('1');
  });

  test('three votes against a Chief still outweigh the Chief\'s single double vote', () => {
    const votes = [
      { voterId: '1', targetId: '4' },
      { voterId: '2', targetId: '4' },
      { voterId: '3', targetId: '4' }, // target '4' gets 3 votes (weight 3)
      { voterId: '4', targetId: '1' }, // CHIEF's double vote (weight 2) < 3 votes against them
    ];
    expect(tallyVotes(votes, players)).toBe('4');
  });

  test('dead Chief only counts as a half ghost vote, not double', () => {
    const withDeadChief = [
      player('1', 'VILLAGER'),
      player('2', 'VILLAGER'),
      player('3', 'VILLAIN'),
      player('4', 'CHIEF', false),
    ];
    const votes = [
      { voterId: '1', targetId: '3' },
      { voterId: '4', targetId: '1' }, // dead CHIEF, ignored unless ghost votes allowed
    ];
    expect(tallyVotes(votes, withDeadChief, { allowGhostVotes: true })).toBe('3');
  });
});

// ─── getVoteWeight ────────────────────────────────────────────────────────────

describe('getVoteWeight', () => {
  test('alive non-Chief player has weight 1', () => {
    expect(getVoteWeight(player('1', 'VILLAGER'))).toBe(1);
  });

  test('alive Chief has weight 2', () => {
    expect(getVoteWeight(player('1', 'CHIEF'))).toBe(2);
  });

  test('dead player (ghost) has weight 0.5 regardless of role', () => {
    expect(getVoteWeight(player('1', 'VILLAGER', false))).toBe(0.5);
    expect(getVoteWeight(player('1', 'CHIEF', false))).toBe(0.5);
  });

  test('returns 0 for missing voter', () => {
    expect(getVoteWeight(null)).toBe(0);
    expect(getVoteWeight(undefined)).toBe(0);
  });
});

// ─── getVoteTally ─────────────────────────────────────────────────────────────

describe('getVoteTally', () => {
  const players = [
    player('1', 'VILLAGER'),
    player('2', 'VILLAGER'),
  ];

  test('returns tally object with correct counts', () => {
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '2', targetId: '1' },
    ];
    const tally = getVoteTally(votes, players);
    expect(tally['2']).toBe(1);
    expect(tally['1']).toBe(1);
  });

  test('returns empty object for no votes', () => {
    expect(getVoteTally([], players)).toEqual({});
  });

  test('skips null targetIds', () => {
    const votes = [{ voterId: '1', targetId: null }];
    expect(getVoteTally(votes, players)).toEqual({});
  });

  test('Chief vote is counted as weight 2 in the tally', () => {
    const withChief = [...players, player('3', 'CHIEF')];
    const votes = [{ voterId: '3', targetId: '1' }];
    expect(getVoteTally(votes, withChief)['1']).toBe(2);
  });
});

// ─── getAliveVillains ───────────────────────────────────────────────────────────

describe('getAliveVillains', () => {
  test('returns alive VILLAIN players', () => {
    const players = [
      player('1', 'VILLAIN', true),
      player('2', 'VILLAIN', false),
      player('3', 'VILLAGER', true),
    ];
    const result = getAliveVillains(players);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('returns empty array when no pisach alive', () => {
    const players = [
      player('1', 'VILLAGER'),
      player('2', 'SEER'),
    ];
    expect(getAliveVillains(players)).toEqual([]);
  });
});

// ─── getNightSteps ────────────────────────────────────────────────────────────

describe('getNightSteps', () => {
  test('always starts with INTRO and ends with DAWN', () => {
    const steps = getNightSteps([player('1', 'VILLAGER')]);
    expect(steps[0]).toBe('INTRO');
    expect(steps[steps.length - 1]).toBe('DAWN');
  });

  test('includes VILLAIN step when VILLAIN is alive', () => {
    const steps = getNightSteps([player('1', 'VILLAIN'), player('2', 'VILLAGER')]);
    expect(steps).toContain('VILLAIN');
  });

  test('includes HEALER step when HEALER is alive', () => {
    const steps = getNightSteps([player('1', 'HEALER'), player('2', 'VILLAGER')]);
    expect(steps).toContain('HEALER');
  });

  test('includes SEER step when SEER is alive', () => {
    const steps = getNightSteps([player('1', 'SEER'), player('2', 'VILLAGER')]);
    expect(steps).toContain('SEER');
  });

  test('omits VILLAIN step when VILLAIN is dead', () => {
    const steps = getNightSteps([player('1', 'VILLAIN', false), player('2', 'VILLAGER')]);
    expect(steps).not.toContain('VILLAIN');
  });

  test('omits HEALER and SEER when only villagers alive', () => {
    const steps = getNightSteps([player('1', 'VILLAGER'), player('2', 'VILLAGER')]);
    expect(steps).not.toContain('HEALER');
    expect(steps).not.toContain('SEER');
    expect(steps).toEqual(['INTRO', 'DAWN']);
  });

  test('includes all special roles when all are alive', () => {
    const players = [
      player('1', 'VILLAIN'),
      player('2', 'HEALER'),
      player('3', 'SEER'),
      player('4', 'VILLAGER'),
    ];
    const steps = getNightSteps(players);
    expect(steps).toContain('VILLAIN');
    expect(steps).toContain('HEALER');
    expect(steps).toContain('SEER');
  });
});

// ─── getRoleData ──────────────────────────────────────────────────────────────

describe('getRoleData', () => {
  test('returns ROLES data for a known role', () => {
    const role = getRoleData('VILLAIN');
    expect(role.id).toBe('VILLAIN');
    expect(role.team).toBe('evil');
  });

  test('returns VILLAGER for unknown role', () => {
    const role = getRoleData('UNKNOWN_ROLE');
    expect(role.id).toBe('VILLAGER');
  });

  test('returns VILLAGER for undefined', () => {
    const role = getRoleData(undefined);
    expect(role.id).toBe('VILLAGER');
  });

  test('returns all 6 known roles correctly', () => {
    const roleIds = ['VILLAIN', 'VILLAGER', 'SEER', 'HEALER', 'HUNTER', 'CHIEF'];
    roleIds.forEach((id) => {
      expect(getRoleData(id).id).toBe(id);
    });
  });
});
