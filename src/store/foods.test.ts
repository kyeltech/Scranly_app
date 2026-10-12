import {memoryFoods} from './memory';
import {fromForm} from '../domain/food';
import type {NewFood} from '../domain/food';

const form = (over: Partial<NewFood> = {}): NewFood => ({
  name: 'Skipjack tuna chunks in spring water',
  brand: 'Aldi',
  servingG: '51',
  kcal: '55',
  proteinG: '12.7',
  carbsG: '0',
  fatG: '0.5',
  ...over,
});

/**
 * Turning the Create a food form into a food.
 *
 * Every field on that screen is a string, because they are text inputs. The
 * diary needs numbers, and a half-filled form has to be caught here rather
 * than becoming a food with NaN calories that silently ruins a day's total.
 */
describe('a food from the form', () => {
  it('reads the numbers off the form', () => {
    expect(fromForm(form())).toEqual(
      expect.objectContaining({
        name: 'Skipjack tuna chunks in spring water',
        brand: 'Aldi',
        portion: '51 g',
        kcal: 55,
        proteinG: 12.7,
        carbsG: 0,
        fatG: 0.5,
        mine: true,
      }),
    );
  });

  it('describes itself the way every other food does', () => {
    expect(fromForm(form())?.meta).toBe('Aldi · 51 g · P 12.7 C 0 F 0.5');
  });

  it('leaves the brand off when the form had none', () => {
    expect(fromForm(form({brand: ''}))?.meta).toBe('51 g · P 12.7 C 0 F 0.5');
  });

  it('treats a blank macro as zero — the screen says they can wait', () => {
    const food = fromForm(form({proteinG: '', carbsG: '', fatG: ''}));

    expect(food).toEqual(
      expect.objectContaining({proteinG: 0, carbsG: 0, fatG: 0}),
    );
  });

  it('refuses a food with no name', () => {
    expect(fromForm(form({name: '   '}))).toBeUndefined();
  });

  it('refuses a food with no calories, rather than logging NaN', () => {
    expect(fromForm(form({kcal: ''}))).toBeUndefined();
    expect(fromForm(form({kcal: 'loads'}))).toBeUndefined();
  });

  it('keeps a portion even when the serving was left blank', () => {
    // The screen only requires a name and the calories.
    expect(fromForm(form({servingG: ''}))?.portion).toBe('1 serving');
  });
});

describe('the food store', () => {
  it('is empty before anything has been created', async () => {
    await expect(memoryFoods().read()).resolves.toEqual([]);
  });

  it('gives back what was created', async () => {
    const foods = memoryFoods();
    const tuna = fromForm(form())!;

    await foods.add(tuna);

    await expect(foods.read()).resolves.toEqual([tuna]);
  });

  it('keeps a copy, so editing what was passed in cannot change it', async () => {
    const foods = memoryFoods();
    const tuna = fromForm(form())!;

    await foods.add(tuna);
    tuna.kcal = 9999;

    expect((await foods.read())[0].kcal).toBe(55);
  });

  it('answers without waiting, like the other stores', async () => {
    const foods = memoryFoods();
    await foods.add(fromForm(form())!);

    expect(foods.peek?.()).toHaveLength(1);
  });
});
