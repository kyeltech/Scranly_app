import {linesOf, toRows} from './rows';
import type {RecognisedLine} from './rows';
import {parseLabel} from './label';

/** A recognised line at a position, as OCR would report it. */
const at = (text: string, x: number, y: number, height = 10): RecognisedLine => ({
  text,
  boundingBox: {x, y, width: text.length * 6, height},
});

describe('grouping what OCR saw into rows', () => {
  it('rejoins a name and its columns that came back as separate boxes', () => {
    // The failure this exists for: three boxes on one printed row.
    const rows = toRows([at('34.9g', 160, 100), at('Fat', 20, 100), at('10.4g', 260, 101)]);

    expect(rows).toEqual(['Fat  34.9g  10.4g']);
  });

  it('keeps separate printed rows separate', () => {
    const rows = toRows([
      at('Fat', 20, 100),
      at('34.9g', 160, 100),
      at('Protein', 20, 140),
      at('25.4g', 160, 140),
    ]);

    expect(rows).toEqual(['Fat  34.9g', 'Protein  25.4g']);
  });

  it('reads rows top to bottom whatever order they arrived in', () => {
    const rows = toRows([at('Salt', 20, 200), at('NUTRITION', 20, 20), at('Fat', 20, 100)]);
    expect(rows).toEqual(['NUTRITION', 'Fat', 'Salt']);
  });

  it('holds a row together when the label is photographed at a slight angle', () => {
    // The right-hand column sits a few pixels lower, as it does on a tilted pack.
    const rows = toRows([at('Fat', 20, 100), at('34.9g', 160, 104), at('10.4g', 260, 108)]);
    expect(rows).toEqual(['Fat  34.9g  10.4g']);
  });

  it('does not merge two rows just because they are close', () => {
    // 10 high, 9 apart: they touch but overlap by less than half.
    const rows = toRows([at('Fat', 20, 100), at('of which saturates', 20, 109)]);
    expect(rows).toHaveLength(2);
  });

  it('drops empty boxes rather than emitting blank rows', () => {
    expect(toRows([at('', 20, 100), at('  ', 20, 140), at('Fat', 20, 180)])).toEqual(['Fat']);
  });

  it('survives nothing at all', () => {
    expect(toRows([])).toEqual([]);
  });
});

describe('reading an OCR result end to end', () => {
  /**
   * A cheddar label as OCR would actually report it: each cell its own box,
   * arriving in no useful order. This is the case the parser could not handle
   * on its own.
   */
  const scattered = {
    blocks: [
      {
        lines: [
          at('per 100g', 160, 60),
          at('Typical values', 20, 60),
          at('per 30g', 260, 61),
          at('Fat', 20, 120),
          at('34.9g', 160, 120),
          at('10.4g', 260, 121),
        ],
      },
      {
        lines: [
          at('Energy', 20, 90),
          at('1728kJ / 416kcal', 150, 90),
          at('125kcal', 260, 91),
          at('Protein', 20, 150),
          at('25.4g', 160, 150),
          at('7.7g', 260, 150),
        ],
      },
    ],
  };

  it('collects lines from every block, not just the first', () => {
    expect(linesOf(scattered)).toHaveLength(12);
  });

  it('feeds the parser rows it can actually read', () => {
    const reading = parseLabel(toRows(linesOf(scattered)));

    expect(reading.per100.energyKcal).toBe(416);
    expect(reading.perServing.energyKcal).toBe(125);
    expect(reading.per100.fat).toBe(34.9);
    expect(reading.perServing.fat).toBe(10.4);
    expect(reading.per100.protein).toBe(25.4);
    expect(reading.servingG).toBe(30);
  });

  it('would have lost every number without the grouping', () => {
    // The bug this guards: one box per cell, parsed as one line each.
    const ungrouped = linesOf(scattered).map(line => line.text);
    const reading = parseLabel(ungrouped);

    expect(reading.per100.fat).toBeUndefined();
  });

  it('tolerates a result with no blocks at all', () => {
    expect(linesOf({})).toEqual([]);
    expect(toRows(linesOf({blocks: [{}]}))).toEqual([]);
  });
});
