/**
 * What a release says, and when.
 *
 * Every rule here came off the What’s new board, and they are rules about dates
 * and a stored string — nothing to do with how the sheet looks. Which is why
 * they are here: the awkward ones (a first install, a tester who skipped two
 * builds, a build eleven weeks old) are all reachable without rendering
 * anything.
 */
import {
  LIFE_DAYS,
  RELEASES,
  type Release,
  daysLeft,
  expiresOn,
  idOf,
  launch,
  noticeFor,
  releaseFor,
} from './releases';

/** A made-up run of releases, so the tests do not move every time one ships. */
const list: Release[] = [
  {id: '1.0 (5)', version: '1.0', build: '5', on: '2026-11-15', lines: ['The fifth']},
  {id: '1.0 (4)', version: '1.0', build: '4', on: '2026-11-08', lines: ['The fourth']},
  {id: '1.0 (3)', version: '1.0', build: '3', on: '2026-10-30', lines: ['The third']},
];

const on = (iso: string) => new Date(`${iso}T09:00:00`);

describe('which release this build is', () => {
  it('names a release by its version and its build, because TestFlight repeats the version', () => {
    expect(idOf('1.0', '4')).toBe('1.0 (4)');
  });

  it('finds the release the running build belongs to', () => {
    expect(releaseFor(list, '1.0', '4')?.lines).toEqual(['The fourth']);
  });

  it('finds nothing for a build with no entry, rather than the nearest one', () => {
    expect(releaseFor(list, '1.0', '9')).toBeUndefined();
  });

  it('finds nothing when the app cannot read its own version', () => {
    expect(releaseFor(list, undefined, undefined)).toBeUndefined();
  });
});

describe('what a launch should show', () => {
  it('shows nothing on a first install, and remembers where we came in', () => {
    // Onboarding is the welcome. A changelog for an app you have not used is noise.
    const {sheet, remember} = launch(list, '1.0', '5', undefined);

    expect(sheet).toEqual([]);
    expect(remember).toBe('1.0 (5)');
  });

  it('shows nothing again once this release has been seen', () => {
    const {sheet, remember} = launch(list, '1.0', '5', '1.0 (5)');

    expect(sheet).toEqual([]);
    expect(remember).toBeUndefined();
  });

  it('shows the one release when exactly one was missed', () => {
    const {sheet} = launch(list, '1.0', '5', '1.0 (4)');

    expect(sheet.map(r => r.id)).toEqual(['1.0 (5)']);
  });

  it('shows every release missed, newest first, in one sheet', () => {
    // The TestFlight case: a friend who opened 1.0 (3) and then went on holiday.
    const {sheet} = launch(list, '1.0', '5', '1.0 (3)');

    expect(sheet.map(r => r.id)).toEqual(['1.0 (5)', '1.0 (4)']);
  });

  it('remembers nothing yet when there is a sheet to dismiss', () => {
    // Written on dismissal, not on display: a sheet killed by a crash is a
    // sheet nobody read.
    expect(launch(list, '1.0', '5', '1.0 (3)').remember).toBeUndefined();
  });

  it('shows only this release when the stored id is one it has never heard of', () => {
    // A renamed id, or a build older than anything still in the list. Dumping
    // the whole history on someone is worse than saying what just changed.
    const {sheet} = launch(list, '1.0', '5', '0.9 (1)');

    expect(sheet.map(r => r.id)).toEqual(['1.0 (5)']);
  });

  it('says nothing at all when this build has no entry', () => {
    // A build with nothing worth saying stays quiet rather than inventing a line.
    const {sheet, remember} = launch(list, '1.0', '9', '1.0 (4)');

    expect(sheet).toEqual([]);
    expect(remember).toBeUndefined();
  });

  it('says nothing when the app cannot read its own version', () => {
    expect(launch(list, undefined, undefined, '1.0 (4)').sheet).toEqual([]);
  });
});

describe('the ninety days a TestFlight build gets', () => {
  it('counts ninety days from the day it went out', () => {
    expect(LIFE_DAYS).toBe(90);
    expect(expiresOn(list[0])).toBe('2027-02-13');
  });

  it('counts the days left as whole days', () => {
    expect(daysLeft(list[0], on('2026-11-15'))).toBe(90);
    expect(daysLeft(list[0], on('2027-02-11'))).toBe(2);
    expect(daysLeft(list[0], on('2027-02-13'))).toBe(0);
  });

  it('goes negative past the deadline rather than pretending', () => {
    expect(daysLeft(list[0], on('2027-02-20'))).toBe(-7);
  });
});

describe('the one row on Today', () => {
  const release = list[0]; // out on 15 November, dead on 13 February

  it('says nothing in the first three weeks — a row on day one is wallpaper', () => {
    expect(noticeFor(release, on('2026-11-16'), true)).toBeUndefined();
    expect(noticeFor(release, on('2026-12-05'), true)).toBeUndefined();
  });

  it('points at TestFlight once the build is three weeks old', () => {
    const notice = noticeFor(release, on('2026-12-06'), true);

    expect(notice?.kind).toBe('signpost');
    expect(notice?.line).toBe('Get the newest build');
  });

  it('claims only that TestFlight has them, never that one is waiting', () => {
    // The app cannot see TestFlight. It points at the door rather than
    // claiming someone is at it.
    const notice = noticeFor(release, on('2026-12-06'), true);

    expect(`${notice?.line} ${notice?.sub}`).not.toMatch(/available|waiting|ready/i);
  });

  it('names the date, not a countdown, with a fortnight to go', () => {
    const notice = noticeFor(release, on('2027-01-31'), true);

    expect(notice?.kind).toBe('deadline');
    expect(notice?.line).toBe('This build stops working on 13 February');
  });

  it('spells out the consequence in the last two days', () => {
    const notice = noticeFor(release, on('2027-02-11'), true);

    expect(notice?.kind).toBe('last');
    expect(notice?.line).toBe('Two days left on this build');
    expect(notice?.sub).toBe('After Saturday it will not open at all');
  });

  it('counts the last day down to one, in words', () => {
    expect(noticeFor(release, on('2027-02-12'), true)?.line).toBe('One day left on this build');
    expect(noticeFor(release, on('2027-02-13'), true)?.line).toBe('The last day on this build');
  });

  it('still says something past the deadline, in case it ever opens', () => {
    // It should not — Apple stops it opening — but a silent row is worse than
    // a row that is slightly beside the point.
    expect(noticeFor(release, on('2027-02-20'), true)?.kind).toBe('last');
  });

  it('says nothing on an App Store build, which has its own update machinery', () => {
    expect(noticeFor(release, on('2027-01-31'), false)).toBeUndefined();
  });

  it('says nothing when there is no release to date', () => {
    expect(noticeFor(undefined, on('2027-01-31'), true)).toBeUndefined();
  });
});

describe('the release list that ships', () => {
  it('is newest first, so the sheet can slice it', () => {
    const dates = RELEASES.map(r => r.on);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('gives every release an id matching its own version and build', () => {
    for (const release of RELEASES) {
      expect(release.id).toBe(idOf(release.version, release.build));
    }
  });

  it('keeps every release to three lines at most, in the user’s terms', () => {
    for (const release of RELEASES) {
      expect(release.lines.length).toBeGreaterThan(0);
      expect(release.lines.length).toBeLessThanOrEqual(3);
      for (const line of release.lines) {
        expect(line.toLowerCase()).not.toMatch(/bug ?fix|refactor|improvements|performance/);
      }
    }
  });
});
