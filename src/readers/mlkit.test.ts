import {asImageUrl, rowsFromMlKit} from './mlkit';
import {parseLabel} from './label';

/** A recognised line as ML Kit reports it: {left, top}, not {x, y}. */
const at = (text: string, left: number, top: number, height = 10) => ({
  text,
  frame: {left, top, width: text.length * 6, height},
});

describe('reading an ML Kit result', () => {
  it('rejoins a row split across boxes, despite the different frame keys', () => {
    const rows = rowsFromMlKit({
      blocks: [{lines: [at('34.9g', 160, 100), at('Fat', 20, 100), at('10.4g', 260, 101)]}],
    });

    expect(rows).toEqual(['Fat  34.9g  10.4g']);
  });

  it('collects lines from every block, in reading order', () => {
    const rows = rowsFromMlKit({
      blocks: [
        {lines: [at('Salt', 20, 200), at('1.8g', 160, 200)]},
        {lines: [at('Fat', 20, 100), at('34.9g', 160, 100)]},
      ],
    });

    expect(rows).toEqual(['Fat  34.9g', 'Salt  1.8g']);
  });

  it('keeps a line ML Kit could not place, rather than dropping its numbers', () => {
    const rows = rowsFromMlKit({
      blocks: [{lines: [at('Fat', 20, 100), {text: 'Salt 1.8g'}]}],
    });

    // Its columns are lost, but the figures survive for the parser to find.
    expect(rows).toContain('Salt 1.8g');
    expect(parseLabel(rows).per100.salt).toBe(1.8);
  });

  it('ignores empty boxes', () => {
    expect(rowsFromMlKit({blocks: [{lines: [at('', 20, 100), {text: '   '}]}]})).toEqual([]);
  });

  it('survives a result with nothing in it', () => {
    expect(rowsFromMlKit({})).toEqual([]);
    expect(rowsFromMlKit({blocks: [{}]})).toEqual([]);
  });

  it('feeds the parser a whole label end to end', () => {
    const reading = parseLabel(
      rowsFromMlKit({
        blocks: [
          {
            lines: [
              at('Typical values', 20, 60),
              at('per 100g', 160, 60),
              at('per 30g', 260, 61),
              at('Energy', 20, 90),
              at('1728kJ / 416kcal', 150, 90),
              at('125kcal', 260, 91),
              at('Fat', 20, 120),
              at('34.9g', 160, 120),
              at('10.4g', 260, 121),
            ],
          },
        ],
      }),
    );

    expect(reading.per100.energyKcal).toBe(416);
    expect(reading.perServing.fat).toBe(10.4);
    expect(reading.servingG).toBe(30);
  });
});

describe('the image path', () => {
  it('gives a bare filesystem path the scheme iOS needs', () => {
    // ML Kit's iOS side uses NSURL URLWithString:, which returns nothing
    // useful without one — and the camera hands back a bare path.
    expect(asImageUrl('/private/var/tmp/photo.jpg')).toBe('file:///private/var/tmp/photo.jpg');
  });

  it('leaves a URL that already has one alone', () => {
    expect(asImageUrl('file:///tmp/a.jpg')).toBe('file:///tmp/a.jpg');
    expect(asImageUrl('content://media/1')).toBe('content://media/1');
  });
});
