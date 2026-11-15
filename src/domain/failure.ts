/**
 * What the app says when a request does not work.
 *
 * One component, eight codes. A caller never chooses a title or a button: it
 * raises a `Failure` and the words come from here, so the copy stays consistent
 * and one change fixes it everywhere. A new code is a new entry in these maps
 * and a test — not a new screen. If a future failure genuinely needs its own
 * layout, that is the signal it is a feature rather than an error.
 *
 * ADR-0006 is the record of why each failure is told apart from the others, and
 * why none of them says "something went wrong".
 */

/** Every failure the app distinguishes. The order is the order of the board. */
export const CODES = [
  'offline',
  'timeout',
  'server',
  'rateLimited',
  'badResponse',
  'notFound',
  'cameraRefused',
  'unknown',
] as const;

export type FailureCode = (typeof CODES)[number];

/** What a caller passes. Everything but the code is optional context. */
export type Failure = {
  code: FailureCode;
  /** The barcode, the file, whatever the copy names. */
  subject?: string;
  /** A correlation id, when the service gives one. Shown, never spoken. */
  reference?: string;
  /** The raw error. Kept for the log and for __DEV__; it never reaches a user. */
  detail?: unknown;
  /** Seconds, for rateLimited. */
  retryAfter?: number;
};

/**
 * The ways out of a failure. A caller offers the ones it can honour and the
 * component drops the rest, which is how the same code reads correctly on the
 * scanner and in a list.
 */
export type Way = 'retry' | 'fromLabel' | 'typeItIn' | 'allow' | 'settings' | 'close';

/** A button: what it says, and which of the caller's handlers it runs. */
export type Act = {label: string; way: Way};

export type Words = {
  title: string;
  body: string;
  /** The likeliest way out. Not always a retry — see RETRY_IS_A_LIE below. */
  primary: Act;
  /** At least one, always: a sheet whose only button is "Try again" is a trap. */
  ghosts: Act[];
};

/**
 * How long a lookup may take before it counts as a timeout. The board's figure.
 * Long enough for a slow connection, short enough that nobody holding a tin in
 * a shop thinks the app has died.
 */
export const TIMEOUT_MS = 10000;

/**
 * An HTTP status, read as what it means to the person scanning.
 *
 * 404 is a verdict on the barcode; 429 and the 5xx range are failures to reach
 * the data and say nothing about it. Everything else is `unknown` on purpose: a
 * 403 from a proxy is not a thing this app can explain, and guessing at it in
 * the copy would be worse than admitting it.
 */
export function codeForStatus(status: number): FailureCode {
  if (status === 404) {
    return 'notFound';
  }
  if (status === 429) {
    return 'rateLimited';
  }
  // 500, 502 and 503 are the board's examples; a 504 is the gateway giving up
  // on Open Food Facts, which is the same event from the outside.
  if (status >= 500) {
    return 'server';
  }
  return 'unknown';
}

/** A thrown error, read the same way. The deadline throws an AbortError. */
export function codeForError(error: unknown): FailureCode {
  const name = (error as {name?: string})?.name;
  if (name === 'AbortError') {
    return 'timeout';
  }
  const message = (error as {message?: string})?.message ?? '';
  if (/network request failed|network error|failed to fetch/i.test(message)) {
    return 'offline';
  }
  return 'unknown';
}

/** Seconds from a Retry-After header, when it carries a plain number. */
export function retryAfterFrom(header: string | null | undefined): number | undefined {
  if (!header) {
    return undefined;
  }
  const seconds = Number(header.trim());
  return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : undefined;
}

const RETRY = 'Try again';
const AGAIN = 'Scan something else';
const LABEL = 'Add it from the label';
const TYPE = 'Type the food in instead';

/**
 * The words, per code.
 *
 * Title: four words or fewer, in the user's terms rather than the system's. Body:
 * two sentences at most, the second naming what is unaffected — the fear behind
 * any error in a tracker is "have I lost my day?". Never an apology, never a
 * stack trace, never "please".
 */
const WORDS: Record<FailureCode, Words> = {
  offline: {
    title: 'No connection',
    body:
      'Scranly needs the internet to look up a barcode. Logging, your targets ' +
      'and the diary all work offline.',
    primary: {label: RETRY, way: 'retry'},
    ghosts: [
      {label: LABEL, way: 'fromLabel'},
      {label: TYPE, way: 'typeItIn'},
    ],
  },
  timeout: {
    title: 'No answer in time',
    body:
      'Open Food Facts did not answer within ten seconds. Nothing is lost — the ' +
      'day you have logged is on this phone, not there.',
    primary: {label: RETRY, way: 'retry'},
    ghosts: [
      {label: LABEL, way: 'fromLabel'},
      {label: TYPE, way: 'typeItIn'},
    ],
  },
  server: {
    title: 'The database is down',
    body:
      'Open Food Facts is not answering right now, which has nothing to do with ' +
      'your scan. Everything already in Scranly keeps working.',
    primary: {label: RETRY, way: 'retry'},
    ghosts: [
      {label: LABEL, way: 'fromLabel'},
      {label: TYPE, way: 'typeItIn'},
    ],
  },
  /**
   * The free database limits how often an app may ask, and a retry inside the
   * window fails again — so the label takes the lime button and the retry drops
   * to a ghost that says how long, when the answer says how long.
   */
  rateLimited: {
    title: 'Too many lookups',
    body:
      'Open Food Facts limits how often an app may ask, and Scranly has just hit ' +
      'that limit. It clears on its own; the label on the pack works now.',
    primary: {label: LABEL, way: 'fromLabel'},
    ghosts: [
      {label: RETRY, way: 'retry'},
      {label: TYPE, way: 'typeItIn'},
    ],
  },
  badResponse: {
    title: 'Nothing to count',
    body:
      'Open Food Facts has this barcode but no nutrition on it, so there is ' +
      'nothing to count. The label on the pack has everything Scranly needs.',
    primary: {label: LABEL, way: 'fromLabel'},
    ghosts: [
      {label: TYPE, way: 'typeItIn'},
      {label: AGAIN, way: 'retry'},
    ],
  },
  notFound: {
    title: 'Not in the database',
    body:
      'Open Food Facts has most UK branded food, but not all of it. Add this one ' +
      'from the label and it is yours from now on — and everyone else’s.',
    primary: {label: LABEL, way: 'fromLabel'},
    ghosts: [
      {label: AGAIN, way: 'retry'},
      {label: TYPE, way: 'typeItIn'},
    ],
  },
  /**
   * The camera was said no to. Not a network failure at all, but the same shape:
   * something did not work, and there is a local way on. The asking button only
   * exists while the app may still ask — after that only Settings can grant it,
   * and the caller offers that way instead.
   */
  cameraRefused: {
    title: 'Scranly cannot see',
    body:
      'The camera is how scanning works — a barcode, a label, a plate. Nothing it ' +
      'sees leaves your phone, and the day can still be logged by hand.',
    primary: {label: 'Allow the camera', way: 'allow'},
    ghosts: [
      {label: 'Open Settings', way: 'settings'},
      {label: TYPE, way: 'typeItIn'},
      {label: 'Not now', way: 'close'},
    ],
  },
  /**
   * The only variant allowed to be vague, and it earns that by being the one
   * case where the app genuinely does not know. It still names what it will do
   * next and still offers a way on: a fallback, not a shrug.
   */
  unknown: {
    title: 'That did not work',
    body:
      'Scranly asked Open Food Facts and got back something it cannot read. The ' +
      'lookup is the only part affected — your foods and your day are on this phone.',
    primary: {label: RETRY, way: 'retry'},
    ghosts: [
      {label: LABEL, way: 'fromLabel'},
      {label: TYPE, way: 'typeItIn'},
    ],
  },
};

/**
 * A wait worth saying out loud. Open Food Facts has answered with a Retry-After
 * of an hour; "try again in 3600 seconds" is a number, not an instruction.
 */
const SAYABLE_WAIT = 300;

/** The words for a failure, with whatever its context adds. */
export function wordsFor(failure: Failure): Words {
  const words = WORDS[failure.code];
  const wait = failure.retryAfter;
  if (wait === undefined || wait > SAYABLE_WAIT) {
    return words;
  }
  return {
    ...words,
    ghosts: words.ghosts.map(ghost =>
      ghost.way === 'retry' ? {...ghost, label: `Try again in ${wait} seconds`} : ghost,
    ),
  };
}

/**
 * The buttons a caller can actually show: its own ways, in the order the words
 * put them. When the first choice is not one of them the next way takes the
 * lime button — which is what keeps a refused camera from showing a button the
 * system will never honour, without the copy having to know about permissions.
 */
export function actsFor(
  failure: Failure,
  ways: Way[],
): {primary: Act | undefined; ghosts: Act[]} {
  const words = wordsFor(failure);
  const offered = [words.primary, ...words.ghosts].filter(act => ways.includes(act.way));
  return {primary: offered[0], ghosts: offered.slice(1)};
}

/**
 * The same failure in one line, for a place that cannot give up the screen to a
 * sheet — the search list, where results are still worth showing. Says what is
 * still there, not only what did not work.
 */
const NOTES: Record<FailureCode, string> = {
  offline: 'No connection — showing your foods only.',
  timeout: 'Open Food Facts did not answer in time — showing your foods only.',
  server: 'Open Food Facts is down — showing your foods only.',
  rateLimited: 'Too many searches for Open Food Facts just now — showing your foods only.',
  badResponse: 'Open Food Facts sent back something unreadable — showing your foods only.',
  notFound: 'Nothing in Open Food Facts matches — showing your foods only.',
  cameraRefused: 'The camera is off, so there is nothing to scan — search or type it in.',
  unknown: 'Could not reach Open Food Facts — showing your foods only.',
};

export function noteFor(failure: Failure): string {
  return NOTES[failure.code];
}
