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

/**
 * A fixed today, for every test.
 *
 * Several tests reach for a day of the month — 'the 10th', 'three days back' —
 * and then assume it is in the past and selectable. Against the real clock that
 * holds most of the time and fails on particular dates: one broke on the 30th
 * because the day it picked landed on a Sunday, and two more broke on the 5th
 * because the days they picked had not happened yet. All of them had passed
 * every day since they were written.
 *
 * Wednesday 16 September 2026: mid-month, mid-week, so a test can look a week
 * in either direction and stay inside the month.
 *
 * This runs in setupFilesAfterEnv rather than setupFiles. setSystemTime needs
 * the fake timers to be installed for the test file that is about to run, and
 * in setupFiles it is applied and then thrown away — the clock read as the real
 * date, silently, which is the failure it was added to prevent.
 */
beforeEach(() => {
  jest.setSystemTime(new Date(2026, 8, 16, 9, 0, 0));
});
