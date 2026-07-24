import * as analytics from '../../src/utils/analytics.web';

describe('analytics.web stubs', () => {
  const fns = [
    'logGameStarted',
    'logGameCompleted',
    'logThemeSelected',
    'logLanguageSelected',
    'logScreenView',
    'logSettingsChanged',
    'logThemeChanged',
    'logDailyChallengeStarted',
    'logDailyChallengeCompleted',
    'logBadgeEarned',
    'recordError',
    'log',
  ];

  fns.forEach((name) => {
    test(`${name} is an async no-op function`, async () => {
      expect(typeof analytics[name]).toBe('function');
      // Should resolve without throwing
      await expect(analytics[name]({ some: 'data' })).resolves.toBeUndefined();
    });
  });

  test('all expected exports exist', () => {
    fns.forEach((name) => {
      expect(analytics).toHaveProperty(name);
    });
  });
});
