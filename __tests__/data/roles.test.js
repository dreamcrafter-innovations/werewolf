import {
  ROLES,
  getRoleAssignment,
  getRolePreview,
  getRandomProphecy,
  PROPHECIES,
  AVATARS,
} from '../../src/data/roles';

// ─── ROLES constant ───────────────────────────────────────────────────────────

describe('ROLES', () => {
  const EXPECTED_ROLES = ['VILLAIN', 'VILLAGER', 'SEER', 'HEALER', 'HUNTER', 'CHIEF'];

  test('has all 6 expected roles', () => {
    EXPECTED_ROLES.forEach((id) => {
      expect(ROLES).toHaveProperty(id);
    });
  });

  test('each role has required properties', () => {
    EXPECTED_ROLES.forEach((id) => {
      const role = ROLES[id];
      expect(role.id).toBe(id);
      expect(typeof role.name).toBe('string');
      expect(typeof role.emoji).toBe('string');
      expect(['good', 'evil']).toContain(role.team);
      expect(typeof role.color).toBe('string');
      expect(typeof role.bgColor).toBe('string');
      expect(typeof role.description).toBe('string');
    });
  });

  test('VILLAIN is on the evil team', () => {
    expect(ROLES.VILLAIN.team).toBe('evil');
  });

  test('all roles except VILLAIN are on the good team', () => {
    ['VILLAGER', 'SEER', 'HEALER', 'HUNTER', 'CHIEF'].forEach((id) => {
      expect(ROLES[id].team).toBe('good');
    });
  });

  test('VILLAIN, SEER, HEALER have nightAction: true', () => {
    expect(ROLES.VILLAIN.nightAction).toBe(true);
    expect(ROLES.SEER.nightAction).toBe(true);
    expect(ROLES.HEALER.nightAction).toBe(true);
  });

  test('VILLAGER, HUNTER, CHIEF have nightAction: false', () => {
    expect(ROLES.VILLAGER.nightAction).toBe(false);
    expect(ROLES.HUNTER.nightAction).toBe(false);
    expect(ROLES.CHIEF.nightAction).toBe(false);
  });

  test('HUNTER has REVENGE special ability', () => {
    expect(ROLES.HUNTER.specialAbility).toBe('REVENGE');
  });

  test('CHIEF has DOUBLE_VOTE special ability', () => {
    expect(ROLES.CHIEF.specialAbility).toBe('DOUBLE_VOTE');
  });
});

// ─── getRoleAssignment ────────────────────────────────────────────────────────

describe('getRoleAssignment', () => {
  test('returns null for fewer than 4 players', () => {
    expect(getRoleAssignment(3)).toBeNull();
    expect(getRoleAssignment(0)).toBeNull();
    expect(getRoleAssignment(1)).toBeNull();
  });

  test('returns array with length equal to playerCount', () => {
    [4, 5, 6, 7, 8, 9, 10, 12, 16].forEach((n) => {
      expect(getRoleAssignment(n)).toHaveLength(n);
    });
  });

  test('4–5 players get exactly 1 VILLAIN (auto)', () => {
    [4, 5].forEach((n) => {
      const roles = getRoleAssignment(n);
      expect(roles.filter((r) => r === 'VILLAIN')).toHaveLength(1);
    });
  });

  // From 8 players up, one VILLAIN is upgraded to DON — still evil, just Seer-proof —
  // so the evil headcount has to be counted across both ids, not VILLAIN alone.
  const evilCount = (roles) => roles.filter((r) => r === 'VILLAIN' || r === 'DON').length;

  test('6–9 players get exactly 2 evil (auto)', () => {
    [6, 7, 8, 9].forEach((n) => {
      expect(evilCount(getRoleAssignment(n))).toBe(2);
    });
  });

  test('10+ players get exactly 3 evil (auto)', () => {
    [10, 12, 16].forEach((n) => {
      expect(evilCount(getRoleAssignment(n))).toBe(3);
    });
  });

  test('always includes SEER', () => {
    [4, 6, 8, 10].forEach((n) => {
      const roles = getRoleAssignment(n);
      expect(roles).toContain('SEER');
    });
  });

  test('includes HEALER when playerCount >= 5', () => {
    expect(getRoleAssignment(4)).not.toContain('HEALER');
    expect(getRoleAssignment(5)).toContain('HEALER');
    expect(getRoleAssignment(6)).toContain('HEALER');
  });

  // This used to assert HUNTER/CHIEF/DON were never dealt. They have been dealt since
  // they were wired into gameplay (see specialRoles.test.js); the assertion was simply
  // never updated, so it has been failing rather than protecting anything.
  test('special roles appear only at their player-count thresholds', () => {
    expect(getRoleAssignment(4)).not.toContain('HUNTER');
    expect(getRoleAssignment(7)).toContain('HUNTER');
    expect(getRoleAssignment(8)).not.toContain('CHIEF');
    expect(getRoleAssignment(9)).toContain('CHIEF');
    expect(getRoleAssignment(7)).not.toContain('DON');
    expect(getRoleAssignment(8)).toContain('DON');
    expect(getRoleAssignment(7)).not.toContain('WITCH');
    expect(getRoleAssignment(8)).toContain('WITCH');
    expect(getRoleAssignment(10)).not.toContain('JESTER');
    expect(getRoleAssignment(11)).toContain('JESTER');
    expect(getRoleAssignment(12)).not.toContain('BODYGUARD');
    expect(getRoleAssignment(13)).toContain('BODYGUARD');
    expect(getRoleAssignment(13)).not.toContain('CUPID');
    expect(getRoleAssignment(14)).toContain('CUPID');
  });

  test('villagers never fall below a quarter of the table', () => {
    for (let n = 4; n <= 16; n++) {
      const villagers = getRoleAssignment(n).filter((r) => r === 'VILLAGER').length;
      expect(villagers).toBeGreaterThanOrEqual(Math.floor(n / 4));
    }
  });

  test('fills remaining slots with VILLAGER', () => {
    const roles = getRoleAssignment(4);
    // 1 VILLAIN + 1 SEER + 2 VILLAGER (HEALER needs 5+)
    expect(roles.filter((r) => r === 'VILLAGER')).toHaveLength(2);
  });

  test('returns shuffled array (roles vary across calls)', () => {
    // Run many times — the first element shouldn't always be the same
    const firstElements = new Set();
    for (let i = 0; i < 20; i++) {
      firstElements.add(getRoleAssignment(6)[0]);
    }
    // With 6 different roles, randomness should produce >1 unique first element
    expect(firstElements.size).toBeGreaterThan(1);
  });

  test('every element is a valid role id', () => {
    const validRoles = Object.keys(ROLES);
    const roles = getRoleAssignment(10);
    roles.forEach((r) => expect(validRoles).toContain(r));
  });
});

// ─── getRolePreview ───────────────────────────────────────────────────────────

describe('getRolePreview', () => {
  test('returns empty array for fewer than 4 players', () => {
    expect(getRolePreview(3)).toEqual([]);
    expect(getRolePreview(0)).toEqual([]);
  });

  test('returns array of role count objects for 4 players', () => {
    const preview = getRolePreview(4);
    expect(Array.isArray(preview)).toBe(true);
    expect(preview.length).toBeGreaterThan(0);
    preview.forEach((item) => {
      expect(typeof item.id).toBe('string');
      expect(typeof item.count).toBe('number');
      expect(item.count).toBeGreaterThan(0);
    });
  });

  test('total count equals player count', () => {
    [4, 6, 8, 10].forEach((n) => {
      const preview = getRolePreview(n);
      const total = preview.reduce((sum, item) => sum + item.count, 0);
      expect(total).toBe(n);
    });
  });

  test('each preview item has role properties merged in', () => {
    const preview = getRolePreview(4);
    preview.forEach((item) => {
      expect(typeof item.name).toBe('string');
      expect(typeof item.emoji).toBe('string');
    });
  });
});

// ─── getRandomProphecy ────────────────────────────────────────────────────────

describe('getRandomProphecy', () => {
  test('returns a non-empty string', () => {
    const prophecy = getRandomProphecy();
    expect(typeof prophecy).toBe('string');
    expect(prophecy.length).toBeGreaterThan(0);
  });

  test('returns a value from the PROPHECIES array', () => {
    for (let i = 0; i < 20; i++) {
      expect(PROPHECIES).toContain(getRandomProphecy());
    }
  });
});

// ─── PROPHECIES ───────────────────────────────────────────────────────────────

describe('PROPHECIES', () => {
  test('is a non-empty array of strings', () => {
    expect(Array.isArray(PROPHECIES)).toBe(true);
    expect(PROPHECIES.length).toBeGreaterThan(0);
    PROPHECIES.forEach((p) => expect(typeof p).toBe('string'));
  });
});

// ─── AVATARS ──────────────────────────────────────────────────────────────────

describe('AVATARS', () => {
  test('is a non-empty array of strings', () => {
    expect(Array.isArray(AVATARS)).toBe(true);
    expect(AVATARS.length).toBeGreaterThan(0);
    AVATARS.forEach((a) => expect(typeof a).toBe('string'));
  });

  test('has at least 20 entries', () => {
    expect(AVATARS.length).toBeGreaterThanOrEqual(20);
  });
});
