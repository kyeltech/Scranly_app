/**
 * What changed, and the one thing the app knows about its own mortality.
 *
 * Two jobs, both of them about the build this code is running inside. The
 * what’s-new sheet describes that build, so the list ships in the bundle beside
 * it and no request is ever made: the same copy and the same behaviour on
 * TestFlight as on the App Store, and nothing here can be wrong about a version
 * it cannot see.
 *
 * What it deliberately does not do is announce that a newer build exists. That
 * cannot be known without asking a server the app does not have — App Store
 * Connect's own API needs a signed private key, and shipping one inside an app
 * hands it to anyone who unzips it. So the row on Today points at TestFlight
 * rather than claiming someone is at the door.
 */

/** A release, as the sheet is given it. */
export type Release = {
  /** '1.0 (4)': the version a person sees, and the build they have. */
  id: string;
  version: string;
  build: string;
  /** The day it went out, ISO. Shown, and the clock on its ninety days. */
  on: string;
  /** What changed, in their terms. Three lines at most. */
  lines: string[];
};

/**
 * The releases, newest first.
 *
 * Add to the top with every build that changed something a person would notice.
 * A build with nothing worth saying gets no entry, and says nothing — which is
 * better than "improvements and bug fixes", a line that has never once told
 * anybody anything.
 */
export const RELEASES: Release[] = [
  {
    id: '1.0 (1)',
    version: '1.0',
    build: '1',
    on: '2026-11-15',
    lines: [
      'Tap a food and you get the whole panel — every number Open Food Facts holds, not the five that fit in a row.',
      'A serving guide, in hands: what 180 g of cooked pasta actually looks like.',
      'When a lookup fails it now says which failure it was, and what still works without it.',
    ],
  },
];

/** The id of a version and build. One shape, used to store and to compare. */
export function idOf(version: string, build: string): string {
  return `${version} (${build})`;
}

/**
 * The release a build belongs to, or nothing.
 *
 * Nothing, rather than the nearest entry: a sheet describing a build someone is
 * not running is worse than no sheet. `undefined` arguments are a build that
 * cannot read its own version — see `src/version.ts`.
 */
export function releaseFor(
  releases: Release[],
  version: string | undefined,
  build: string | undefined,
): Release | undefined {
  if (version === undefined || build === undefined) {
    return undefined;
  }
  const id = idOf(version, build);
  return releases.find(release => release.id === id);
}

/**
 * What this launch should show, and what it should remember.
 *
 * `remember` is only set where there is nothing to dismiss — a first install,
 * which is the one case that writes without being read. Everything else writes
 * on dismissal, because a sheet killed by a crash is a sheet nobody read.
 */
export function launch(
  releases: Release[],
  version: string | undefined,
  build: string | undefined,
  lastSeen: string | undefined,
): {sheet: Release[]; remember: string | undefined} {
  const current = releaseFor(releases, version, build);
  if (current === undefined) {
    return {sheet: [], remember: undefined};
  }
  // First launch ever. Onboarding is the welcome; this one is noted and skipped.
  if (lastSeen === undefined) {
    return {sheet: [], remember: current.id};
  }
  if (lastSeen === current.id) {
    return {sheet: [], remember: undefined};
  }
  const from = releases.indexOf(current);
  const to = releases.findIndex(release => release.id === lastSeen);
  // An id from before this list, or one that was renamed: say what just
  // changed rather than emptying the whole history over someone.
  const sheet = to === -1 ? [current] : releases.slice(from, to);
  return {sheet, remember: undefined};
}

/** How long a TestFlight build lasts. Apple's number, not ours. */
export const LIFE_DAYS = 90;

/** Three weeks: old enough that a newer build plausibly exists. */
const SIGNPOST_DAYS = 21;

/** A fortnight: close enough that the date is worth saying out loud. */
const DEADLINE_DAYS = 14;

const MS_PER_DAY = 86_400_000;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

/** The day this build stops opening, ISO. */
export function expiresOn(release: Release): string {
  const end = new Date(`${release.on}T00:00:00`);
  end.setDate(end.getDate() + LIFE_DAYS);
  const mm = String(end.getMonth() + 1).padStart(2, '0');
  const dd = String(end.getDate()).padStart(2, '0');
  return `${end.getFullYear()}-${mm}-${dd}`;
}

/** Whole days until it stops opening. Negative past the deadline. */
export function daysLeft(release: Release, today: Date): number {
  return Math.round((midnight(expiresOn(release)) - startOf(today)) / MS_PER_DAY);
}

/** Whole days since it went out. */
function age(release: Release, today: Date): number {
  return Math.round((startOf(today) - midnight(release.on)) / MS_PER_DAY);
}

const midnight = (iso: string) => new Date(`${iso}T00:00:00`).getTime();

const startOf = (day: Date) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();

/**
 * The row on Today: news, a deadline coming, or the last couple of days.
 *
 * One row and one tap, in that order of precedence, so two of these never
 * appear at once. The tone carries the urgency — see `components/UpdateNotice`.
 */
export type Notice = {
  kind: 'signpost' | 'deadline' | 'last';
  line: string;
  sub: string;
};

export function noticeFor(
  release: Release | undefined,
  today: Date,
  beta: boolean,
): Notice | undefined {
  // An App Store build has the App Store's own update machinery behind it, and
  // does not expire. Nothing to say, so nothing is said.
  if (release === undefined || !beta) {
    return undefined;
  }
  const left = daysLeft(release, today);
  if (left <= 2) {
    return {kind: 'last', line: lastLine(left), sub: lastSub(release, left)};
  }
  if (left <= DEADLINE_DAYS) {
    return {
      kind: 'deadline',
      line: `This build stops working on ${dateWords(expiresOn(release))}`,
      sub: 'Open TestFlight for the newest one',
    };
  }
  if (age(release, today) >= SIGNPOST_DAYS) {
    return {
      kind: 'signpost',
      line: 'Get the newest build',
      sub: 'New ones land in TestFlight',
    };
  }
  return undefined;
}

/** Two days, one day, the last day. Counted in words, not in a number. */
function lastLine(left: number): string {
  if (left === 2) {
    return 'Two days left on this build';
  }
  if (left === 1) {
    return 'One day left on this build';
  }
  return 'The last day on this build';
}

function lastSub(release: Release, left: number): string {
  if (left <= 0) {
    return 'Open TestFlight for the newest one';
  }
  return `After ${dayWords(expiresOn(release))} it will not open at all`;
}

/** '13 February'. A date someone can act on, where a countdown is just a number. */
function dateWords(iso: string): string {
  const day = new Date(`${iso}T00:00:00`);
  return `${day.getDate()} ${MONTHS[day.getMonth()]}`;
}

function dayWords(iso: string): string {
  return DAYS[new Date(`${iso}T00:00:00`).getDay()];
}
