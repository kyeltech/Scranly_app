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
};
