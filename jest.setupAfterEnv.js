/* eslint-env jest */

// @testing-library/react-native 14 renders asynchronously, and its automatic
// cleanup is not awaited — without this, an unmounted tree leaks into the next
// test and every query after the first one in a file comes back empty.
//
// This runs in setupFilesAfterEnv, not setupFiles: the library extends `expect`
// on import, and `expect` does not exist yet during setupFiles.
const {cleanup} = require('@testing-library/react-native');

afterEach(async () => {
  await cleanup();
});
