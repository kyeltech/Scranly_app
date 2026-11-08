import {toWeight} from './scale';

describe('a weight read off the scale', () => {
  it('reads a plain reading', () => {
    expect(toWeight('83.1')).toBe(83.1);
  });

  it('keeps one decimal, which is all a scale shows', () => {
    expect(toWeight('83.15')).toBe(83.2);
  });

  it('ignores anything around the number — a stray unit or symbol', () => {
    expect(toWeight(' 83.1 kg ')).toBe(83.1);
  });

  // A misread is not a weight. Better to send the person to type it than to log
  // a number the scale never showed.
  it('turns down a reading too light to be a person', () => {
    expect(toWeight('5')).toBeUndefined();
  });

  it('turns down a reading too heavy to be a person', () => {
    expect(toWeight('810')).toBeUndefined();
  });

  it('turns down nothing, and digit-soup', () => {
    expect(toWeight('')).toBeUndefined();
    expect(toWeight('--')).toBeUndefined();
  });
});
