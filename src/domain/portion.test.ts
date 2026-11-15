import {food} from './food';
import {gramsOf, scaleTo} from './portion';

const almonds = food({
  id: 'off-4088600441689',
  name: 'Almonds',
  brand: 'The Foodie Market',
  portion: '100 g',
  portionG: 100,
  kcal: 597,
  proteinG: 21.2,
  carbsG: 9.1,
  fatG: 49.9,
  fibreG: 12.5,
});

/**
 * What a portion weighs.
 *
 * `portion` is a label — '40 g', '1 medium, 118 g', '1 cube' — so nothing could
 * rescale a food: the detail screen could show what the database said and no
 * other amount. A food carries its grams now, and where it does not, the label
 * is read for them rather than the food being refused outright.
 */
describe('the grams behind a portion', () => {
  it('takes the stated weight when the food has one', () => {
    expect(gramsOf({portion: '1 medium', portionG: 118})).toBe(118);
  });

  it('reads them off a plain label', () => {
    expect(gramsOf({portion: '40 g'})).toBe(40);
    expect(gramsOf({portion: '220g'})).toBe(220);
  });

  it('takes the weight from a label that names a thing first', () => {
    // '1 medium, 118 g' — the 1 is how many, the 118 is what it weighs.
    expect(gramsOf({portion: '1 medium, 118 g'})).toBe(118);
  });

  it('does not read millilitres as grams', () => {
    // 200 ml of milk is about 206 g. Close is not the same, and the app logs
    // grams, so this is left unknown rather than quietly wrong.
    expect(gramsOf({portion: '200 ml'})).toBeUndefined();
  });

  it('says nothing for a portion that names no weight at all', () => {
    expect(gramsOf({portion: '1 cube'})).toBeUndefined();
    expect(gramsOf({portion: '1 serving'})).toBeUndefined();
  });
});

describe('the same food at another weight', () => {
  it('scales the energy and every macro', () => {
    const half = scaleTo(almonds, 50);

    // Half of 100 g: 597 / 2, and each macro with it.
    expect(half?.kcal).toBe(299);
    expect(half?.proteinG).toBe(10.6);
    expect(half?.carbsG).toBe(4.6);
    expect(half?.fatG).toBe(25);
    expect(half?.fibreG).toBe(6.3);
  });

  it('says what it now weighs, in the portion and in grams', () => {
    const scaled = scaleTo(almonds, 30);

    expect(scaled?.portion).toBe('30 g');
    expect(scaled?.portionG).toBe(30);
  });

  it('rebuilds the row description, so it cannot disagree with the numbers', () => {
    expect(scaleTo(almonds, 50)?.meta).toBe(
      'The Foodie Market · 50 g · P 10.6 C 4.6 F 25',
    );
  });

  it('keeps a nutrient the food never had as unknown, rather than scaling a zero into one', () => {
    const noFibre = food({...almonds, fibreG: undefined});

    expect(scaleTo(noFibre, 50)?.fibreG).toBeUndefined();
  });

  it('keeps the food it is, not a new one', () => {
    const scaled = scaleTo(almonds, 30);

    expect(scaled?.id).toBe(almonds.id);
    expect(scaled?.name).toBe('Almonds');
  });

  it('refuses a food whose portion weighs nothing it can name', () => {
    const cube = food({
      id: 'stock',
      name: 'Chicken stock cube',
      portion: '1 cube',
      kcal: 20,
      proteinG: 1,
      carbsG: 2,
      fatG: 1,
    });

    // Not a guess, and not a crash: the screen offers no amount row for this
    // food until somebody weighs one.
    expect(scaleTo(cube, 50)).toBeUndefined();
  });

  it('refuses an amount that is not an amount', () => {
    expect(scaleTo(almonds, 0)).toBeUndefined();
    expect(scaleTo(almonds, -20)).toBeUndefined();
    expect(scaleTo(almonds, Number.NaN)).toBeUndefined();
  });
});

describe('the rest of the panel, at another weight', () => {
  const full = food({
    ...almonds,
    more: {kJ: 2491, satFatG: 3.84, sugarsG: 4.4, addedSugarsG: 0, saltG: 0.01, sodiumG: 0.004},
    source: {from: 'Open Food Facts', nutriScore: 'A', category: 'Whole almonds'},
  });

  it('scales every figure the entry gave, not only the ones the day counts', () => {
    const half = scaleTo(full, 50);

    expect(half?.more).toEqual({
      kJ: 1246,
      satFatG: 1.92,
      sugarsG: 2.2,
      addedSugarsG: 0,
      // Three places on purpose: half of 0.01 g of salt is 0.005, and rounding
      // it the way a macro is rounded would read as a food with none.
      saltG: 0.005,
      sodiumG: 0.002,
    });
  });

  it('leaves where the food came from alone — half an almond is the same almond', () => {
    expect(scaleTo(full, 50)?.source).toEqual(full.source);
  });

  it('has nothing to scale on a food that came with nothing', () => {
    expect(scaleTo(almonds, 50)?.more).toBeUndefined();
  });
});
