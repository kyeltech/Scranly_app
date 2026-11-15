/**
 * The failure map, against the board's own rules.
 *
 * These are not tests of one code's wording so much as of the contract the
 * design states: a caller raises a Failure and the component owns every word,
 * so every code has to have words that hold to the same standard. A new code
 * that forgets a ghost action, or says "something went wrong", fails here
 * rather than in front of someone holding a tin.
 */
import {
  CODES,
  TIMEOUT_MS,
  actsFor,
  codeForError,
  codeForStatus,
  noteFor,
  wordsFor,
} from './failure';
import type {FailureCode, Way} from './failure';

/** Every way the barcode path can offer. The widest handler set there is. */
const BARCODE_WAYS: Way[] = ['retry', 'fromLabel', 'typeItIn'];

describe('What maps to what', () => {
  it('reads a rate limit as a rate limit, not as a server problem', () => {
    expect(codeForStatus(429)).toBe('rateLimited');
  });

  it('reads a 404 as a barcode nobody has heard of', () => {
    expect(codeForStatus(404)).toBe('notFound');
  });

  it.each([500, 502, 503])('reads %i as the database being down', status => {
    expect(codeForStatus(status)).toBe('server');
  });

  it('reads any other 5xx as the database being down too', () => {
    // A 504 is the gateway giving up on Open Food Facts, which is the same
    // event to the person scanning: nothing is wrong with their barcode.
    expect(codeForStatus(504)).toBe('server');
  });

  it('refuses to guess at a status it has no entry for', () => {
    expect(codeForStatus(418)).toBe('unknown');
    expect(codeForStatus(403)).toBe('unknown');
  });

  it('reads an abort as a timeout, because that is what the deadline throws', () => {
    const aborted = Object.assign(new Error('Aborted'), {name: 'AbortError'});
    expect(codeForError(aborted)).toBe('timeout');
  });

  it('reads a failed request as being offline', () => {
    expect(codeForError(new TypeError('Network request failed'))).toBe('offline');
  });

  it('falls back to unknown for anything it does not recognise', () => {
    expect(codeForError(new Error('who knows'))).toBe('unknown');
    expect(codeForError('a string, somehow')).toBe('unknown');
  });

  it('gives the lookup ten seconds, which is what the board says', () => {
    expect(TIMEOUT_MS).toBe(10000);
  });
});

describe("Every code's words", () => {
  it('covers every code in the type, so a new one cannot be added silently', () => {
    expect(CODES).toHaveLength(8);
    for (const code of CODES) {
      expect(wordsFor({code}).title).toBeTruthy();
    }
  });

  it('says what happened in four words or fewer', () => {
    for (const code of CODES) {
      expect(wordsFor({code}).title.split(' ').length).toBeLessThanOrEqual(4);
    }
  });

  it('says it in two sentences at most', () => {
    for (const code of CODES) {
      const sentences = wordsFor({code}).body.split(/[.!?](\s|$)/).filter(s => s.trim());
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });

  it('never says something went wrong, and never apologises', () => {
    for (const code of CODES) {
      const words = wordsFor({code});
      const all = `${words.title} ${words.body}`.toLowerCase();
      expect(all).not.toMatch(/something went wrong|sorry|oops|please|error|failed/);
    }
  });

  it('never leaves a sheet with only one button', () => {
    for (const code of CODES) {
      expect(wordsFor({code}).ghosts.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('does not offer a retry as the way out where retrying cannot help', () => {
    const cannot: FailureCode[] = ['rateLimited', 'badResponse', 'notFound'];
    for (const code of cannot) {
      expect(wordsFor({code}).primary.way).not.toBe('retry');
      // Still offered, though — just not as the lime button.
      expect(wordsFor({code}).ghosts.map(g => g.way)).toContain('retry');
    }
  });

  it('names the wait when the rate limit says how long', () => {
    const ghosts = wordsFor({code: 'rateLimited', retryAfter: 30}).ghosts;
    expect(ghosts.find(g => g.way === 'retry')?.label).toBe('Try again in 30 seconds');
  });

  it('keeps the plain label when the rate limit says nothing', () => {
    const ghosts = wordsFor({code: 'rateLimited'}).ghosts;
    expect(ghosts.find(g => g.way === 'retry')?.label).toBe('Try again');
  });

  it('ignores a wait too long to be worth saying', () => {
    // Open Food Facts has answered with a Retry-After of an hour before now.
    // "Try again in 3600 seconds" is a number, not an instruction.
    const ghosts = wordsFor({code: 'rateLimited', retryAfter: 3600}).ghosts;
    expect(ghosts.find(g => g.way === 'retry')?.label).toBe('Try again');
  });
});

describe('The actions a caller can actually offer', () => {
  it('drops a way the caller has no handler for', () => {
    const acts = actsFor({code: 'offline'}, ['retry']);
    expect(acts.primary?.way).toBe('retry');
    expect(acts.ghosts).toEqual([]);
  });

  it('promotes a ghost when the first choice cannot be offered', () => {
    // The camera refused for good: the app may no longer ask, so "Allow the
    // camera" is not a button that exists and Settings takes the lime.
    const acts = actsFor({code: 'cameraRefused'}, ['settings', 'typeItIn', 'close']);
    expect(acts.primary?.label).toBe('Open Settings');
    expect(acts.ghosts.map(g => g.way)).toEqual(['typeItIn', 'close']);
  });

  it('keeps the asking primary while the app may still ask', () => {
    const acts = actsFor({code: 'cameraRefused'}, ['allow', 'typeItIn', 'close']);
    expect(acts.primary?.label).toBe('Allow the camera');
  });

  it('gives every code a primary and a ghost on the barcode path', () => {
    for (const code of CODES) {
      if (code === 'cameraRefused') {
        continue;
      }
      const acts = actsFor({code}, BARCODE_WAYS);
      expect(acts.primary).toBeTruthy();
      expect(acts.ghosts.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('The one-line note, for a list rather than a sheet', () => {
  it('has a line for every code', () => {
    for (const code of CODES) {
      expect(noteFor({code}).length).toBeGreaterThan(10);
    }
  });

  it('says what is still being shown, not only what failed', () => {
    expect(noteFor({code: 'offline'})).toMatch(/your foods/i);
  });

  it('holds to the same standard as the sheet', () => {
    for (const code of CODES) {
      expect(noteFor({code}).toLowerCase()).not.toMatch(/something went wrong|sorry|error/);
    }
  });
});
