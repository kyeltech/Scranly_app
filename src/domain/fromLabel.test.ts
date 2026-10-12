import {fromReading} from './food';
import type {LabelReading} from '../readers/label';

/**
 * The tuna can that started this: Aldi skipjack in spring water, stating both
 * per 100 g and per ½ can (51 g drained).
 */
const tuna: LabelReading = {
  servingG: 51,
  per100: {energyKcal: 109, fat: 1, saturates: 0.3, carbs: 0, sugars: 0, fibre: 0, protein: 24.9, salt: 0.73},
  perServing: {energyKcal: 55, fat: 0.5, saturates: 0.2, carbs: 0, sugars: 0, fibre: 0, protein: 12.7, salt: 0.37},
  unread: [],
};

describe('a label, as the Create a food form', () => {
  it('fills the form from the serving column, which is what you ate', () => {
    expect(fromReading(tuna)).toEqual(
      expect.objectContaining({
        servingG: '51',
        kcal: '55',
        proteinG: '12.7',
        carbsG: '0',
        fatG: '0.5',
      }),
    );
  });

  it('falls back to per 100 g when the label states only that', () => {
    const per100Only: LabelReading = {...tuna, servingG: undefined, perServing: {}};

    expect(fromReading(per100Only)).toEqual(
      expect.objectContaining({
        servingG: '100',
        kcal: '109',
        proteinG: '24.9',
        fatG: '1',
      }),
    );
  });

  it('leaves the name and brand empty — a nutrition panel has neither', () => {
    const form = fromReading(tuna);

    expect(form.name).toBe('');
    expect(form.brand).toBe('');
  });

  it('leaves a nutrient the parser could not find blank, rather than guessing zero', () => {
    // A zero would read as a food with no fat in it. Blank reads as unknown,
    // and the form treats blank macros as zero only once a human has seen it.
    const noFat: LabelReading = {
      ...tuna,
      perServing: {...tuna.perServing, fat: undefined},
    };

    expect(fromReading(noFat).fatG).toBe('');
  });

  it('gives back an empty form when the label had no calories on it', () => {
    const useless: LabelReading = {servingG: undefined, per100: {}, perServing: {}, unread: ['???']};

    expect(fromReading(useless).kcal).toBe('');
  });
});
