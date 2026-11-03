module.exports = {
  root: true,
  extends: '@react-native',
  // Jest's HTML coverage report is generated JavaScript, and linting it puts
  // warnings about someone else's bundled code in the way of our own.
  ignorePatterns: ['coverage/'],
};
