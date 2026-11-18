module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setupAfterEnv.js'],
  // React Navigation and react-native-screens ship untranspiled ES modules, so
  // they have to be transformed rather than passed through like the rest of
  // node_modules.
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-svg)/)',
  ],
  // Every source file counts, tested or not — otherwise deleting a file's
  // tests takes the file out of the sum and the number goes up, not down.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  // A floor, not a target: about two points under where the suite stood on
  // 15 November 2026 (95 / 88 / 92 / 95), so ordinary work does not trip it and
  // a deleted test file does. Only checked when jest runs with --coverage,
  // which CI does and a plain `npm test` does not.
  coverageThreshold: {
    global: {statements: 93, branches: 86, functions: 90, lines: 93},
  },
};
