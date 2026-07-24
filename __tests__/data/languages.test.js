import { LANGUAGES, LANGUAGE_LIST, DEFAULT_LANGUAGE } from '../../src/data/languages';

describe('LANGUAGES', () => {
  test('has EN language', () => {
    expect(LANGUAGES).toHaveProperty('EN');
  });

  test('EN has required properties', () => {
    const lang = LANGUAGES.EN;
    expect(lang.id).toBe('EN');
    expect(typeof lang.label).toBe('string');
    expect(typeof lang.nativeLabel).toBe('string');
    expect(typeof lang.emoji).toBe('string');
    expect(typeof lang.rtl).toBe('boolean');
  });

  test('EN is not rtl', () => {
    expect(LANGUAGES.EN.rtl).toBe(false);
  });

  test('EN label is English', () => {
    expect(LANGUAGES.EN.label).toBe('English');
  });
});

describe('LANGUAGE_LIST', () => {
  test('contains at least 1 language', () => {
    expect(LANGUAGE_LIST.length).toBeGreaterThanOrEqual(1);
  });

  test('EN is the first entry', () => {
    expect(LANGUAGE_LIST[0].id).toBe('EN');
  });

  test('all entries are language objects with id and label', () => {
    LANGUAGE_LIST.forEach((lang) => {
      expect(typeof lang.id).toBe('string');
      expect(typeof lang.label).toBe('string');
    });
  });
});

describe('DEFAULT_LANGUAGE', () => {
  test('is EN', () => {
    expect(DEFAULT_LANGUAGE).toBe('EN');
  });
});


describe('DEFAULT_LANGUAGE', () => {
  test('is EN', () => {
    expect(DEFAULT_LANGUAGE).toBe('EN');
  });
});
