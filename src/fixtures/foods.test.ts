import {food, recentFoods} from './foods';

/**
 * `meta` is the line under a food's name. It used to be typed out by hand with
 * the macros written into the string, which meant the numbers existed only as
 * display text — nothing could add them up, and the diary needs to.
 *
 * So the fields are the truth and `meta` is built from them. These hold that.
 */
describe('how a food describes itself', () => {
  it('names the brand, the portion and the macros', () => {
    const oats = food({
      id: 'oats',
      name: 'Porridge oats',
      brand: 'Quaker',
      portion: '40 g',
      kcal: 152,
      proteinG: 5,
      carbsG: 27,
      fatG: 3,
    });

    expect(oats.meta).toBe('Quaker · 40 g · P 5 C 27 F 3');
  });

  it('leaves the brand out when the food has none', () => {
    const avocado = food({
      id: 'avocado',
      name: 'Avocado',
      portion: '70 g',
      kcal: 114,
      proteinG: 1,
      carbsG: 6,
      fatG: 10,
    });

    expect(avocado.meta).toBe('70 g · P 1 C 6 F 10');
  });

  it('keeps the macros on every food, so a logged one can be added up', () => {
    for (const f of recentFoods) {
      expect(typeof f.proteinG).toBe('number');
      expect(typeof f.carbsG).toBe('number');
      expect(typeof f.fatG).toBe('number');
      expect(f.portion).toBeTruthy();
    }
  });
});
