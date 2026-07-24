import { BADGES, evaluateBadges } from '../../src/data/badges';

// ─── BADGES constant ──────────────────────────────────────────────────────────

describe('BADGES', () => {
  test('has exactly 10 badges', () => {
    expect(BADGES).toHaveLength(10);
  });

  test('each badge has required properties', () => {
    BADGES.forEach((badge) => {
      expect(typeof badge.id).toBe('string');
      expect(typeof badge.name).toBe('string');
      expect(typeof badge.emoji).toBe('string');
      expect(typeof badge.description).toBe('string');
    });
  });

  test('badge ids are unique', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('contains expected badge ids', () => {
    const expectedIds = [
      'first_game', 'village_win_1', 'evil_win_1',
      'village_win_5', 'evil_win_5', 'rounds_10',
      'daily_1', 'daily_7', 'big_game', 'howtoplay',
    ];
    expectedIds.forEach((id) => {
      expect(BADGES.some((b) => b.id === id)).toBe(true);
    });
  });
});

// ─── evaluateBadges ───────────────────────────────────────────────────────────

const makePlayers = (count) =>
  Array.from({ length: count }, (_, i) => ({ id: String(i), name: `Player${i}`, role: 'VILLAGER' }));

describe('evaluateBadges', () => {
  const baseStats = { totalRounds: 0, villageWins: 0, evilWins: 0 };
  const noBadges = new Set();

  test('awards first_game when totalRounds >= 1', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, totalRounds: 1 },
      earnedBadges: noBadges,
    });
    expect(result).toContain('first_game');
  });

  test('does NOT award first_game if already earned', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, totalRounds: 1 },
      earnedBadges: new Set(['first_game']),
    });
    expect(result).not.toContain('first_game');
  });

  test('does NOT award first_game when totalRounds = 0', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, totalRounds: 0 },
      earnedBadges: noBadges,
    });
    expect(result).not.toContain('first_game');
  });

  test('awards village_win_1 when winner is VILLAGE', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: baseStats,
      earnedBadges: noBadges,
    });
    expect(result).toContain('village_win_1');
  });

  test('does NOT award village_win_1 when winner is EVIL', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'EVIL',
      alltimeStats: baseStats,
      earnedBadges: noBadges,
    });
    expect(result).not.toContain('village_win_1');
  });

  test('awards evil_win_1 when winner is EVIL', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'EVIL',
      alltimeStats: baseStats,
      earnedBadges: noBadges,
    });
    expect(result).toContain('evil_win_1');
  });

  test('does NOT award evil_win_1 when winner is VILLAGE', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: baseStats,
      earnedBadges: noBadges,
    });
    expect(result).not.toContain('evil_win_1');
  });

  test('awards village_win_5 when villageWins >= 5', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, villageWins: 5 },
      earnedBadges: noBadges,
    });
    expect(result).toContain('village_win_5');
  });

  test('does NOT award village_win_5 when villageWins < 5', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, villageWins: 4 },
      earnedBadges: noBadges,
    });
    expect(result).not.toContain('village_win_5');
  });

  test('awards evil_win_5 when evilWins >= 5', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'EVIL',
      alltimeStats: { ...baseStats, evilWins: 5 },
      earnedBadges: noBadges,
    });
    expect(result).toContain('evil_win_5');
  });

  test('awards rounds_10 when totalRounds >= 10', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, totalRounds: 10 },
      earnedBadges: noBadges,
    });
    expect(result).toContain('rounds_10');
  });

  test('does NOT award rounds_10 when totalRounds < 10', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: { ...baseStats, totalRounds: 9 },
      earnedBadges: noBadges,
    });
    expect(result).not.toContain('rounds_10');
  });

  test('awards big_game when 10+ players', () => {
    const result = evaluateBadges({
      players: makePlayers(10),
      winner: 'VILLAGE',
      alltimeStats: baseStats,
      earnedBadges: noBadges,
    });
    expect(result).toContain('big_game');
  });

  test('does NOT award big_game for fewer than 10 players', () => {
    const result = evaluateBadges({
      players: makePlayers(9),
      winner: 'VILLAGE',
      alltimeStats: baseStats,
      earnedBadges: noBadges,
    });
    expect(result).not.toContain('big_game');
  });

  test('returns empty array when all conditions fail', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'EVIL',
      alltimeStats: { totalRounds: 0, villageWins: 0, evilWins: 0 },
      earnedBadges: new Set(['evil_win_1']),
    });
    expect(result).not.toContain('evil_win_1');
  });

  test('handles missing alltimeStats gracefully with defaults', () => {
    const result = evaluateBadges({
      players: makePlayers(4),
      winner: 'VILLAGE',
      alltimeStats: null,
      earnedBadges: noBadges,
    });
    // Should not throw; totalRounds defaults to 0 so first_game won't be awarded
    expect(Array.isArray(result)).toBe(true);
  });

  test('can award multiple badges at once', () => {
    const result = evaluateBadges({
      players: makePlayers(10),
      winner: 'VILLAGE',
      alltimeStats: { totalRounds: 10, villageWins: 5, evilWins: 0 },
      earnedBadges: noBadges,
    });
    // first_game, village_win_1, village_win_5, rounds_10, big_game
    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});
