import {isUsable, parseLabel, toLabelRows} from './label';

/**
 * The cases are real UK label wordings, not invented ones. Every awkward line
 * here is on something in a British kitchen.
 */

/** The label drawn on the design board: Cathedral City mature cheddar. */
const CHEDDAR = [
  'NUTRITION',
  'Typical values          per 100g      per 30g',
  'Energy                  1728kJ / 416kcal    125kcal',
  'Fat                     34.9g         10.4g',
  'of which saturates      21.7g         6.5g',
  'Carbohydrate            0.1g          0.1g',
  'of which sugars         0.1g          0.1g',
  'Protein                 25.4g         7.7g',
  'Salt                    1.8g          0.5g',
];

describe('reading the board label', () => {
  const reading = parseLabel(CHEDDAR);

  it('takes the first column as per 100 g and the second as the serving', () => {
    expect(reading.per100.fat).toBe(34.9);
    expect(reading.perServing.fat).toBe(10.4);
    expect(reading.per100.protein).toBe(25.4);
    expect(reading.perServing.protein).toBe(7.7);
  });

  it('prefers kcal over kJ, since kcal is what the app counts', () => {
    expect(reading.per100.energyKcal).toBe(416);
    expect(reading.perServing.energyKcal).toBe(125);
  });

  it('keeps a sub-row out of its parent row', () => {
    // 'of which saturates' must not become the fat figure.
    expect(reading.per100.saturates).toBe(21.7);
    expect(reading.per100.fat).toBe(34.9);
    expect(reading.per100.sugars).toBe(0.1);
  });

  it('finds the serving the second column is stated for', () => {
    expect(reading.servingG).toBe(30);
  });

  it('reads the whole label, with nothing left over', () => {
    expect(reading.unread).toEqual([]);
  });
});

describe('the awkward lines real packaging has', () => {
  it('converts kJ when a label gives no kcal at all', () => {
    const reading = parseLabel(['Energy 1728kJ']);
    // 1728 / 4.184 = 413. Rounded, because a label's own kcal is rounded too.
    expect(reading.per100.energyKcal).toBe(413);
  });

  it('reads a threshold as the number it is capped at', () => {
    const reading = parseLabel(['Salt <0.5g']);
    expect(reading.per100.salt).toBe(0.5);
  });

  it('reads a decimal comma, which imported packaging uses', () => {
    const reading = parseLabel(['Fat 12,5g']);
    expect(reading.per100.fat).toBe(12.5);
  });

  it('handles the unit being in the header rather than the value', () => {
    const reading = parseLabel(['Energy (kcal) 416', 'Protein (g) 25.4']);
    expect(reading.per100.energyKcal).toBe(416);
    expect(reading.per100.protein).toBe(25.4);
  });

  it('takes the kcal figure when both units share a header', () => {
    // 'Energy (kJ/kcal)' with kJ first in each column, which is common.
    const reading = parseLabel(['Energy (kJ/kcal)  1728/416   518/125']);
    expect(reading.per100.energyKcal).toBe(416);
    expect(reading.perServing.energyKcal).toBe(125);
  });

  it('reads fibre, which the board label happens not to carry', () => {
    const reading = parseLabel(['Fibre 2.3g 0.7g']);
    expect(reading.per100.fibre).toBe(2.3);
    expect(reading.perServing.fibre).toBe(0.7);
  });

  /**
   * Sodium is not salt. Salt is sodium chloride and weighs 2.5 times what the
   * sodium in it does, which is the factor the regulation itself uses to state
   * one as the other.
   *
   * This read sodium as salt one for one, so an imported can stating 0.72 g of
   * sodium went into the diary as 0.72 g of salt instead of 1.8 — a bit under
   * a third of what was really there, on the one number a reading is most
   * likely to be checked against the pack.
   */
  it('converts sodium to salt, rather than reading one as the other', () => {
    expect(parseLabel(['Sodium 0.72g']).per100.salt).toBe(1.8);
  });

  it('reads sodium stated in milligrams, which is how US packaging states it', () => {
    expect(parseLabel(['Sodium 280mg']).per100.salt).toBe(0.7);
  });

  it('converts both columns, not just the first', () => {
    const reading = parseLabel(['Sodium 0.5g 0.15g']);
    expect(reading.per100.salt).toBe(1.25);
    expect(reading.perServing.salt).toBe(0.38);
  });

  it('leaves a salt row alone, since that is already what is counted', () => {
    expect(parseLabel(['Salt 1.8g']).per100.salt).toBe(1.8);
  });

  it('believes the salt figure on a label that prints both', () => {
    // 'Salt 1.8g (sodium 0.72g)' states the answer and then explains it. The
    // explanation is not a second reading to convert.
    expect(parseLabel(['Salt 1.8g (sodium 0.72g)']).per100.salt).toBe(1.8);
  });

  it('converts a sodium threshold too', () => {
    expect(parseLabel(['Sodium <0.1g']).per100.salt).toBe(0.25);
  });

  it('finds a serving stated in words rather than a column header', () => {
    expect(parseLabel(['Each slice (30g) contains']).servingG).toBe(30);
    expect(parseLabel(['per serving (250 g)']).servingG).toBe(250);
  });

  it('does not mistake the 100 in per 100g for a serving size', () => {
    expect(parseLabel(['Typical values per 100g']).servingG).toBeUndefined();
  });
});

describe('when the read is partial', () => {
  it('fills only per 100 g from a one-column label, rather than guessing', () => {
    const reading = parseLabel(['Energy 416kcal', 'Fat 34.9g']);

    expect(reading.per100.fat).toBe(34.9);
    // No second column means no second column. Halving 100 g would be invention.
    expect(reading.perServing.fat).toBeUndefined();
    expect(reading.servingG).toBeUndefined();
  });

  it('reports a numeric line it could not place instead of dropping it', () => {
    const reading = parseLabel(['Fat 34.9g', 'Contains 12 portions']);
    expect(reading.unread).toContain('Contains 12 portions');
  });

  it('says nothing was read rather than returning zeroes', () => {
    const reading = parseLabel(['NUTRITION', 'Typical values']);
    expect(reading.per100).toEqual({});
    expect(reading.unread).toEqual([]);
  });

  it('survives the empty and the nonsense', () => {
    expect(parseLabel([]).per100).toEqual({});
    expect(parseLabel(['', '   ']).unread).toEqual([]);
  });
});

describe('showing a reading back', () => {
  it('lists only what was read, in the order a label prints it', () => {
    const rows = toLabelRows({reading: parseLabel(CHEDDAR)});

    expect(rows.map(r => r.name)).toEqual([
      'Energy',
      'Fat',
      'of which saturates',
      'Carbohydrate',
      'of which sugars',
      'Protein',
      'Salt',
    ]);
    // Fibre was not on this label, so it is absent rather than zero.
    expect(rows.find(r => r.id === 'fibre')).toBeUndefined();
  });

  /**
   * The sheet is where this would have been checked against the pack, so it is
   * worth one test of the whole way through: an imported panel stating sodium
   * comes back as a salt row, in salt's own figure.
   */
  it('shows a sodium panel back as the salt it amounts to', () => {
    const rows = toLabelRows({
      reading: parseLabel([
        'Energy 103kcal',
        'Protein 25g',
        'Fat 0.8g',
        'Sodium 280mg',
      ]),
    });
    const salt = rows.find(r => r.id === 'salt');

    expect(salt?.name).toBe('Salt');
    expect(salt?.per100).toBe('0.7 g');
  });

  it('carries the units the label uses', () => {
    const rows = toLabelRows({reading: parseLabel(CHEDDAR)});
    const energy = rows.find(r => r.id === 'energyKcal');

    expect(energy?.per100).toBe('416 kcal');
    expect(energy?.perServing).toBe('125 kcal');
    expect(rows.find(r => r.id === 'fat')?.per100).toBe('34.9 g');
  });

  it('dashes a column it could not read, rather than inventing it', () => {
    const rows = toLabelRows({reading: parseLabel(['Fat 34.9g'])});

    expect(rows[0].per100).toBe('34.9 g');
    // One column on the pack means one column here. Halving would be invention.
    expect(rows[0].perServing).toBe('—');
  });

  it('marks the sub-rows, so the indent survives', () => {
    const rows = toLabelRows({reading: parseLabel(CHEDDAR)});
    expect(rows.find(r => r.id === 'saturates')?.under).toBe(true);
    expect(rows.find(r => r.id === 'fat')?.under).toBe(false);
  });
});

/**
 * The failure that a real phone found, and no fixture had.
 *
 * Pointed at a pack, the photo caught the small print under the panel and
 * little else. 'Each slice (30g) contains 75kcal' mentions kcal, so it was read
 * as the energy row — and the screen showed a finished-looking reading of one
 * row, 75 kcal per 100 g, with nothing flagged, because the line had matched.
 */
describe('Prose under the panel', () => {
  it('is not the energy row', () => {
    const read = parseLabel(['Each slice (30g) contains 75kcal']);

    expect(read.per100.energyKcal).toBeUndefined();
    expect(read.perServing.energyKcal).toBeUndefined();
  });

  it('still gives up the serving size, which it does state', () => {
    expect(parseLabel(['Each slice (30g) contains 75kcal']).servingG).toBe(30);
  });

  it('does not put a warning on a label that reads perfectly', () => {
    const read = parseLabel([
      'Typical values per 100g per 30g slice',
      'Energy 1050kJ / 249kcal 315kJ / 75kcal',
      'Fat 3.2g 1.0g',
      'Each slice (30g) contains 75kcal',
    ]);

    // The table wins, and the footnote is passed over rather than reported —
    // a warning on every ordinary footnote is worse than no warning at all.
    expect(read.per100.energyKcal).toBe(249);
    expect(read.perServing.energyKcal).toBe(75);
    expect(read.unread).toEqual([]);
  });

  it('leaves a row that names its nutrient first alone', () => {
    // The rule is positional, so check it does not swallow the ordinary shape.
    expect(parseLabel(['Energy (kJ/kcal) 1515/362 606/145']).per100.energyKcal).toBe(362);
    expect(parseLabel(['of which saturates 21.7g 6.5g']).per100.saturates).toBe(21.7);
    expect(parseLabel(['Sodium 0.5g 0.15g']).per100.salt).toBe(1.25);
  });

  it('reports a numeric line it cannot place, which is a different thing', () => {
    expect(parseLabel(['This pack contains 8 servings']).unread).toEqual([
      'This pack contains 8 servings',
    ]);
  });
});

describe('Whether a reading is a panel or a scrap of one', () => {
  const panel = [
    'Typical values per 100g per 30g',
    'Energy 1728kJ / 416kcal 518kJ / 125kcal',
    'Fat 34.9g 10.5g',
    'Protein 25.4g 7.6g',
  ];

  it('accepts a panel', () => {
    expect(isUsable(parseLabel(panel))).toBe(true);
  });

  it('rejects the footnote that started all this', () => {
    expect(isUsable(parseLabel(['Each slice (30g) contains 75kcal']))).toBe(false);
  });

  it('rejects a couple of rows, which is not a panel', () => {
    expect(isUsable(parseLabel(['Energy 1728kJ / 416kcal', 'Fat 34.9g']))).toBe(false);
  });

  it('rejects rows with no energy, because every UK panel carries it', () => {
    const noEnergy = parseLabel(['Fat 34.9g', 'Protein 25.4g', 'Salt 1.8g']);
    expect(Object.keys(noEnergy.per100)).toHaveLength(3);
    expect(isUsable(noEnergy)).toBe(false);
  });

  it('accepts the sparsest real panel: energy, fat, carbs', () => {
    expect(
      isUsable(parseLabel(['Energy 416kcal', 'Fat 34.9g', 'Carbohydrate 0.1g'])),
    ).toBe(true);
  });
});

/**
 * A panel printed as a run of text rather than a table.
 *
 * Small tins, pouches and bottles have no room for a grid, so the figures run
 * along one line: "Typical values per 100g: Energy 440kJ/103kcal, Protein
 * 25.0g, …". Kyel photographed a tuna can and got nothing at all back.
 *
 * The parser had a rule that a nutrient named *after* the first number on its
 * line is prose — a footnote rather than a row — and that rule is right, and
 * it swallowed these whole: the line opens with "per 100g", so every nutrient
 * on it sits after a digit and the lot was discarded in silence.
 *
 * So a line carrying several nutrients, each with figures of its own, is a
 * panel laid out sideways: it gets cut up at the nutrient names and each piece
 * read as its own row. A line carrying one is still a footnote.
 */
describe('A panel printed as a run of text', () => {
  const RUN =
    'Typical values per 100g: Energy 440kJ/103kcal, Protein 25.0g, ' +
    'Carbohydrate 0.5g, of which sugars 0.5g, Fat 0.8g, ' +
    'of which saturates 0.2g, Salt 1.0g';

  it('reads a whole panel off one line', () => {
    const reading = parseLabel([RUN]);

    expect(reading.per100.energyKcal).toBe(103);
    expect(reading.per100.protein).toBe(25);
    expect(reading.per100.carbs).toBe(0.5);
    expect(reading.per100.fat).toBe(0.8);
    expect(reading.per100.salt).toBe(1);
  });

  it('keeps the sub-rows apart from the rows they sit under', () => {
    const reading = parseLabel([RUN]);

    expect(reading.per100.sugars).toBe(0.5);
    expect(reading.per100.saturates).toBe(0.2);
    // The parent rows are not overwritten by the 'of which' that follows them.
    expect(reading.per100.carbs).toBe(0.5);
    expect(reading.per100.fat).toBe(0.8);
  });

  it('counts as a panel rather than a scrap, so the sheet offers it', () => {
    expect(isUsable(parseLabel([RUN]))).toBe(true);
  });

  it('reads a run that OCR wrapped across lines', () => {
    const reading = parseLabel([
      'Nutrition per 100g: Energy 440kJ/103kcal, Protein 25.0g,',
      'Fat 0.8g, Salt 1.0g',
    ]);

    expect(reading.per100.protein).toBe(25);
    expect(reading.per100.salt).toBe(1);
  });

  it('does not take the per 100g at the front of a run as a serving size', () => {
    expect(parseLabel([RUN]).servingG).toBeUndefined();
  });

  it('converts a run that states sodium, the same as a table would', () => {
    const reading = parseLabel([
      'Per 100g: Energy 103kcal, Protein 25g, Fat 0.8g, Sodium 280mg',
    ]);

    expect(reading.per100.salt).toBe(0.7);
  });

  it('reports nothing unread, because the whole line was placed', () => {
    expect(parseLabel([RUN]).unread).toEqual([]);
  });

  /**
   * The footnote rule stays. One nutrient on a line that mentions it after the
   * numbers is still the small print under a panel, and reading it as a row is
   * how a photo of the small print alone came back looking like a finished
   * panel.
   */
  it('still passes over a footnote, which names one nutrient and no more', () => {
    const reading = parseLabel(['Each slice (30g) contains 75kcal']);

    expect(reading.per100.energyKcal).toBeUndefined();
    expect(reading.unread).toEqual([]);
  });

  it('still lets the table win where a label has both', () => {
    const reading = parseLabel([
      'Energy 1041kJ/249kcal 312kJ/75kcal',
      'Each slice (30g) contains 75kcal',
    ]);

    expect(reading.per100.energyKcal).toBe(249);
    expect(reading.perServing.energyKcal).toBe(75);
  });
});
