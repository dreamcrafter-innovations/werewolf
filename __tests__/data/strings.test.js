import { STRINGS } from '../../src/data/strings';

describe('STRINGS', () => {
  test('has EN key', () => {
    expect(STRINGS).toHaveProperty('EN');
  });

  test('EN strings map is an object', () => {
    expect(typeof STRINGS.EN).toBe('object');
    expect(STRINGS.EN).not.toBeNull();
  });

  test('EN strings are all non-empty strings', () => {
    Object.entries(STRINGS.EN).forEach(([key, value]) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  test('EN has key home_title', () => {
    expect(STRINGS.EN).toHaveProperty('home_title');
  });

  test('EN has key vote_title', () => {
    expect(STRINGS.EN).toHaveProperty('vote_title');
  });

  test('EN has key over_village_title', () => {
    expect(STRINGS.EN).toHaveProperty('over_village_title');
  });

  test('EN has at least 50 string keys', () => {
    expect(Object.keys(STRINGS.EN).length).toBeGreaterThanOrEqual(50);
  });
});

