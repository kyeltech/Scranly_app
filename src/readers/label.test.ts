import {parseLabel} from './label';

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

  it('takes sodium as salt, since some labels still use it', () => {
    expect(parseLabel(['Sodium 0.7g']).per100.salt).toBe(0.7);
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
