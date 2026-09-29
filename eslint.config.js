// ESLint flat config — Expo defaults + dreamcrafters portfolio overrides.
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const ro = (names) => Object.fromEntries(names.map((n) => [n, 'readonly']));
const NODE = ro(['require', 'module', 'exports', 'process', '__dirname', '__filename', 'Buffer', 'global', 'console']);
const JEST = ro(['describe', 'it', 'test', 'expect', 'jest', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll', 'fail']);

// React Compiler advisories (eslint-plugin-react-hooks v6+) are useful but are refactors, not
// bugs — report them as warnings so make build is not blocked. rules-of-hooks stays an error.
let compilerRules = {};
try {
  const hooks = require('eslint-plugin-react-hooks');
  compilerRules = Object.fromEntries(
    ['set-state-in-effect', 'refs', 'immutability', 'purity', 'static-components', 'use-memo',
      'preserve-manual-memoization', 'incompatible-library', 'globals', 'error-boundaries', 'unsupported-syntax']
      .filter((r) => hooks.rules && hooks.rules[r])
      .map((r) => ['react-hooks/' + r, 'warn']),
  );
} catch {}

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'dist-test/*', '.build/*', 'coverage/*', 'android/*', 'ios/*', '.expo/*', 'node_modules/*'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off', // RN <Text> renders quotes/apostrophes as-is
      ...compilerRules,
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', '**/jest.setup*', '**/jest-*/**', '**/__mocks__/**', '**/test/**'],
    languageOptions: { globals: { ...JEST, ...NODE } },
    rules: { 'import/namespace': 'off' }, // tests index modules dynamically (mod[name])
  },
  {
    files: ['scripts/**', '**/*.config.js', '**/*.config.cjs', '**/*.config.mjs', 'jest*.js', '**/*.check.*', '**/selftest*'],
    languageOptions: { globals: NODE },
    rules: { 'expo/no-dynamic-env-var': 'off' },
  },
]);
