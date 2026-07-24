module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react'],
        ],
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/'],
  collectCoverageFrom: [
    'src/utils/gameLogic.js',
    'src/utils/interpolate.js',
    'src/data/**/*.js',
    'src/theme/colors.js',
    'src/storage.js',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      lines: 85,
      functions: 85,
      branches: 85,
    },
  },
};
