import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import FoodDetail from './FoodDetail';
import {food} from '../domain/food';

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
  yours: true,
  more: {kJ: 2491, satFatG: 3.84, sugarsG: 4.4, addedSugarsG: 0, saltG: 0.01, sodiumG: 0.004},
  source: {
    from: 'Open Food Facts',
    barcode: '4088600441689',
    nutriScore: 'A',
    novaGroup: 1,
    category: 'Whole almonds',
    ingredients: 'Almonds (100%)',
  },
});

/** A half-filled entry, which is most of them. */
const houmous = food({
  id: 'off-5000000000000',
  name: 'Smoked paprika houmous',
  portion: '100 g',
  portionG: 100,
  kcal: 303,
  proteinG: 7.6,
  carbsG: 11.2,
  fatG: 24.8,
  source: {from: 'Open Food Facts', barcode: '5000000000000'},
});

describe('the food detail screen', () => {
  it('shows the food, its energy and every macro', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('Almonds')).toBeTruthy();
    expect(screen.getByText('597')).toBeTruthy();
    expect(screen.getByText('21.2 g')).toBeTruthy();
    expect(screen.getByText('9.1 g')).toBeTruthy();
    expect(screen.getByText('49.9 g')).toBeTruthy();
    expect(screen.getByText('12.5 g')).toBeTruthy();
  });

  /**
   * The rest of the panel. Four chips showed the four figures the day counts;
   * the entry states more than that, and a food's own screen is where they go.
   */
  it('shows the rest of the panel, as the pack prints it', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('of which saturates')).toBeTruthy();
    expect(screen.getByText('3.84 g')).toBeTruthy();
    expect(screen.getByText('of which sugars')).toBeTruthy();
    expect(screen.getByText('4.4 g')).toBeTruthy();
    expect(screen.getByText('Salt')).toBeTruthy();
    expect(screen.getByText('0.01 g')).toBeTruthy();
  });

  it('states the energy in both units the pack does', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('2,491 kJ')).toBeTruthy();
  });

  it('dashes every row the entry is silent about, rather than calling it zero', async () => {
    await render(<FoodDetail food={houmous} meal="Lunch" />);

    // Fibre, saturates, sugars and salt are all blank on this entry.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4);
    // And what it does state is still there.
    expect(screen.getByText('24.8 g')).toBeTruthy();
  });

  it('shows the scores the entry carries, and what the number means', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('A')).toBeTruthy();
    // The entry says 1; the badge says what 1 is.
    expect(screen.getByText('NOVA 1 · UNPROCESSED')).toBeTruthy();
    // Short on the badge, because the row at the foot says it in full.
    expect(screen.getByText('OFF')).toBeTruthy();
  });

  it('names the entry it came from, last on the screen', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(
      screen.getByText('Entry 4088600441689 on Open Food Facts'),
    ).toBeTruthy();
  });

  it('opens that entry, where a wrong figure can be fixed at source', async () => {
    const onSource = jest.fn();
    await render(<FoodDetail food={almonds} meal="Snack" onSource={onSource} />);

    await fireEvent.press(screen.getByText('Entry 4088600441689 on Open Food Facts'));

    expect(onSource).toHaveBeenCalledWith(almonds);
  });

  it('offers the hand beside the guide, the same one the sheet is drawn with', async () => {
    const view = await render(
      <FoodDetail food={almonds} meal="Snack" onGuide={jest.fn()} />,
    );

    // The link is a glyph and a line of text, not text alone.
    expect(JSON.stringify(view.toJSON())).toContain('M8.5 11V5.8');
  });

  it('leaves the badges off an entry that has none, rather than showing empty ones', async () => {
    await render(<FoodDetail food={houmous} meal="Lunch" />);

    expect(screen.queryByText('NOVA 1')).toBeNull();
  });

  it('names the category beside the brand, where the entry gives one', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('The Foodie Market · Whole almonds')).toBeTruthy();
  });

  it('lists the ingredients when the entry has them', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('Almonds (100%)')).toBeTruthy();
  });
});

/**
 * The amount is a row you can change, which is the whole reason a food needs a
 * screen rather than a row. It is only offered where the weight is knowable —
 * see domain/portion.ts.
 */
describe('the amount', () => {
  it('shows what the food is stated for, and opens to be changed', async () => {
    const onAmount = jest.fn();
    await render(<FoodDetail food={almonds} meal="Snack" onAmount={onAmount} />);

    await fireEvent.press(screen.getByLabelText('Change how much, currently 100 g'));

    expect(onAmount).toHaveBeenCalledWith(almonds);
  });

  it('offers no change on a food whose portion weighs nothing it can name', async () => {
    const cube = food({
      id: 'stock',
      name: 'Chicken stock cube',
      portion: '1 cube',
      kcal: 20,
      proteinG: 1,
      carbsG: 2,
      fatG: 1,
    });
    const onAmount = jest.fn();
    await render(<FoodDetail food={cube} meal="Lunch" onAmount={onAmount} />);

    // The amount still reads, because it is true; there is just nothing to
    // open, because nothing can say what 50 g of a stock cube would be.
    expect(screen.getByText('1 cube')).toBeTruthy();
    expect(screen.queryByLabelText('Change how much, currently 1 cube')).toBeNull();
  });

  it('offers the serving guide, for a pack that states no serving', async () => {
    const onGuide = jest.fn();
    await render(<FoodDetail food={almonds} meal="Snack" onGuide={onGuide} />);

    await fireEvent.press(screen.getByText('See what a portion looks like'));

    expect(onGuide).toHaveBeenCalledWith(almonds);
  });
});

describe('logging it', () => {
  it('logs to the meal, which can be switched first', async () => {
    const onLog = jest.fn();
    await render(<FoodDetail food={almonds} meal="Snack" onLog={onLog} />);

    expect(screen.getByText('Add to snack')).toBeTruthy();

    await fireEvent.press(screen.getByText('Dinner'));
    await fireEvent.press(screen.getByText('Add to dinner'));

    expect(onLog).toHaveBeenCalledWith(almonds, 'Dinner');
  });

  it('carries what it is about to cost you on the button', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    // The figure alone is in the panel; the button says what it is for.
    expect(screen.getByText('597 kcal')).toBeTruthy();
  });

  it('opens the day it will be logged to', async () => {
    const onDay = jest.fn();
    await render(<FoodDetail food={almonds} meal="Snack" day="Today" onDay={onDay} />);

    await fireEvent.press(screen.getByLabelText('Change the day, currently Today'));

    expect(onDay).toHaveBeenCalled();
  });
});
