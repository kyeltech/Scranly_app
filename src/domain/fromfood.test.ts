import {food, novaWord} from './food';
import {toForm} from './portion';

const almonds = food({
  id: 'off-1',
  name: 'Almonds',
  brand: 'The Foodie Market',
  portion: '100 g',
  portionG: 100,
  kcal: 597,
  proteinG: 21.2,
  carbsG: 9.1,
  fatG: 49.9,
});

/**
 * NOVA is a number on the entry and a word on the badge. One place turns it
 * into the word, rather than every screen remembering what 3 means.
 */
describe('how processed the entry reckons it is', () => {
  it('names each group the way the badge shows it', () => {
    expect(novaWord(1)).toBe('UNPROCESSED');
    expect(novaWord(2)).toBe('CULINARY INGREDIENT');
    expect(novaWord(3)).toBe('PROCESSED');
    expect(novaWord(4)).toBe('ULTRA-PROCESSED');
  });

  it('says nothing for a group that is not one of the four', () => {
    expect(novaWord(0)).toBeUndefined();
    expect(novaWord(9)).toBeUndefined();
  });
});

/**
 * 'Edit these numbers' opens the Create a food form on the food you are
 * looking at. The form is all strings, because it is all text inputs.
 */
describe('a food, back as the form', () => {
  it('fills every field the food knows', () => {
    expect(toForm(almonds)).toEqual({
      name: 'Almonds',
      brand: 'The Foodie Market',
      servingG: '100',
      kcal: '597',
      proteinG: '21.2',
      carbsG: '9.1',
      fatG: '49.9',
    });
  });

  it('takes the weight off the label when the food carries no grams', () => {
    const banana = food({
      id: 'banana',
      name: 'Banana',
      portion: '1 medium, 118 g',
      kcal: 105,
      proteinG: 1,
      carbsG: 27,
      fatG: 0,
    });

    expect(toForm(banana).servingG).toBe('118');
  });

  it('leaves the serving blank when the portion weighs nothing it can name', () => {
    const cube = food({
      id: 'stock',
      name: 'Chicken stock cube',
      portion: '1 cube',
      kcal: 20,
      proteinG: 1,
      carbsG: 2,
      fatG: 1,
    });

    // Blank, not a guess: the form then asks rather than asserting.
    expect(toForm(cube).servingG).toBe('');
  });

  it('leaves out a brand the food never had, rather than writing the word', () => {
    expect(toForm(food({...almonds, brand: undefined})).brand).toBe('');
  });
});
