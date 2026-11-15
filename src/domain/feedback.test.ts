/**
 * The draft, which is the only thing that ever leaves the phone.
 *
 * Which is why it is tested here rather than through the screen: what goes in
 * it is a promise About you makes, so it is worth asserting exactly — the
 * version and nothing else about the phone, their words kept whole, and no
 * section invented to fill a gap.
 */
import {WANTS, bodyFor, isEmpty, payloadFor, subjectFor} from './feedback';

const nothing = {wants: [], confusing: '', anything: ''};

describe('whether there is anything to send', () => {
  it('is empty with nothing picked and nothing written', () => {
    expect(isEmpty(nothing)).toBe(true);
  });

  it('is empty when the fields hold nothing but spaces', () => {
    expect(isEmpty({wants: [], confusing: '   ', anything: '\n'})).toBe(true);
  });

  it('is not empty on one tap alone', () => {
    expect(isEmpty({...nothing, wants: ['Saved meals']})).toBe(false);
  });

  it('is not empty on one sentence alone', () => {
    expect(isEmpty({...nothing, anything: 'the chart confused me'})).toBe(false);
  });
});

describe('the subject', () => {
  it('names the build, so a reply can be about the right one', () => {
    expect(subjectFor('1.0 (4)')).toBe('Scranly 1.0 (4) — feedback');
  });

  it('says nothing it does not know', () => {
    expect(subjectFor(undefined)).toBe('Scranly — feedback');
  });
});

// Still built, for the one way out that needs no network: the clipboard.
describe('the body', () => {
  it('lists the picks, because a list is what makes them countable', () => {
    const body = bodyFor({...nothing, wants: ['Saved meals', 'Water']}, '1.0 (4)');

    expect(body).toContain('Would love to see\n  Saved meals\n  Water');
  });

  it('keeps their words whole, under the question they answer', () => {
    const body = bodyFor({...nothing, confusing: 'The weight chart'}, '1.0 (4)');

    expect(body).toContain('What’s confusing\n  The weight chart');
  });

  it('indents every line of a long answer, not just the first', () => {
    const body = bodyFor({...nothing, anything: 'one\ntwo'}, '1.0 (4)');

    expect(body).toContain('Anything else\n  one\n  two');
  });

  it('leaves a section out rather than sending it empty', () => {
    const body = bodyFor({wants: ['Water'], confusing: '', anything: ''}, '1.0 (4)');

    expect(body).toContain('Would love to see');
    expect(body).not.toContain('What’s confusing');
    expect(body).not.toContain('Anything else');
  });

  it('signs off with the build and nothing else about the phone', () => {
    const body = bodyFor({...nothing, wants: ['Water']}, '1.0 (4)');

    expect(body.trimEnd().endsWith('—\nScranly 1.0 (4)')).toBe(true);
    // No model, no iOS version, no identifier, no diary. None of it is needed
    // to read a sentence, and About you promises it does not leave.
    expect(body).not.toMatch(/iPhone|iOS|iPad|device|uuid|identifier/i);
  });

  it('admits when it does not know its own build', () => {
    const body = bodyFor({...nothing, wants: ['Water']}, undefined);

    expect(body).toContain('Scranly (version unknown)');
  });
});

describe('the payload', () => {
  it('carries the three answers and the build, and nothing else at all', () => {
    const payload = payloadFor(
      {wants: ['Water'], confusing: 'the chart', anything: ''},
      '1.0 (4)',
    );

    expect(payload).toEqual({
      subject: 'Scranly 1.0 (4) — feedback',
      wants: ['Water'],
      confusing: 'the chart',
      anything: '',
      release: '1.0 (4)',
    });
  });

  it('holds no address, because the app should not carry one', () => {
    const payload = payloadFor({...nothing, anything: 'hello'}, '1.0 (4)');

    expect(JSON.stringify(payload)).not.toMatch(/@/);
  });

  it('trims what they wrote rather than sending the whitespace', () => {
    const payload = payloadFor({...nothing, anything: '  late at night\n'}, '1.0 (4)');

    expect(payload.anything).toBe('late at night');
  });

  it('says the build is unknown rather than leaving it out', () => {
    expect(payloadFor({...nothing, wants: ['Water']}, undefined).release).toBe('unknown');
  });
});

describe('the things to pick from', () => {
  it('offers the unbuilt things, so the taps mean something', () => {
    expect(WANTS).toContain('Saved meals');
    expect(WANTS).toContain('Export everything');
  });

  it('keeps the list short enough to read in one go', () => {
    expect(WANTS.length).toBeLessThanOrEqual(8);
    expect(new Set(WANTS).size).toBe(WANTS.length);
  });
});
