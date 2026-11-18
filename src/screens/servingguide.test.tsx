import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import ServingGuide from './ServingGuide';
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
  source: {from: 'Open Food Facts', category: 'Whole almonds'},
});

/**
 * What a portion looks like, for a pack that states no serving.
 *
 * Lose It has one of these and it is a poster: a photograph of strawberries
 * beside a tennis ball. This one measures in hands, because UK guidance does,
 * and every card knows its weight — so it does not only answer the question,
 * it fills the answer in.
 */
describe('the serving guide', () => {
  it('opens on the food’s own group rather than on card one of sixteen', async () => {
    await render(<ServingGuide food={almonds} />);

    expect(screen.getByText('Nuts and seeds — the group this food is in')).toBeTruthy();
    expect(screen.getByText('What fits in your palm')).toBeTruthy();
    // The weight is set big and its unit small, as the board draws it — two
    // texts, not one, which is why 'g' is in the sheet sixteen times over.
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getAllByText('g').length).toBe(13);
  });

  it('carries the published energy for that portion', async () => {
    await render(<ServingGuide food={almonds} />);

    expect(screen.getByText('113–137 kcal')).toBeTruthy();
  });

  it('holds the rest of the groups too, to swipe through', async () => {
    await render(<ServingGuide food={almonds} />);

    // The group heads the sheet rather than the card, so a card is known by
    // its measure.
    expect(screen.getByText('The size of two thumbs')).toBeTruthy();
    expect(screen.getByText('The size of your fist')).toBeTruthy();
    expect(screen.getByText('A bunch the width of a £1 coin')).toBeTruthy();
  });

  it('sets the amount from the card, which is the point of it', async () => {
    const onUse = jest.fn();
    await render(<ServingGuide food={almonds} onUse={onUse} />);

    await fireEvent.press(screen.getByText('Use 20 g'));

    expect(onUse).toHaveBeenCalledWith(20);
  });

  it('says where the measures come from, and that hands are meant to differ', async () => {
    await render(<ServingGuide food={almonds} />);

    expect(screen.getByText(/British Nutrition Foundation/)).toBeTruthy();
  });

  it('opens on the first card when the entry names no category it knows', async () => {
    const mystery = food({
      id: 'x',
      name: 'Christmas pudding',
      portion: '100 g',
      kcal: 329,
      proteinG: 3,
      carbsG: 56,
      fatG: 11,
    });

    await render(<ServingGuide food={mystery} />);

    expect(screen.getByText('Breakfast cereal')).toBeTruthy();
    expect(screen.getByText('3 handfuls')).toBeTruthy();
  });
});

describe('a card the app cannot set an amount from', () => {
  const milk = food({
    id: 'off-milk',
    name: 'Semi-skimmed milk',
    portion: '200 ml',
    kcal: 92,
    proteinG: 7,
    carbsG: 10,
    fatG: 3,
    source: {from: 'Open Food Facts', category: 'Milk'},
  });

  it('offers no button, because 200 ml is not 200 g', async () => {
    await render(<ServingGuide food={milk} onUse={jest.fn()} />);

    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('ml')).toBeTruthy();
    expect(screen.queryByText(/^Use /)).toBeNull();
  });

  it('says why, rather than leaving a gap where the button was', async () => {
    await render(<ServingGuide food={milk} onUse={jest.fn()} />);

    expect(screen.getByText(/not grams/)).toBeTruthy();
  });
});

describe('the pointer between the two pasta cards', () => {
  const pasta = food({
    id: 'off-pasta',
    name: 'Fusilli',
    portion: '100 g',
    portionG: 100,
    kcal: 352,
    proteinG: 12,
    carbsG: 71,
    fatG: 1.5,
    source: {from: 'Open Food Facts', category: 'Fusilli pasta'},
  });

  it('shows the coin tip on the cooked pasta card, as the board does', async () => {
    await render(<ServingGuide food={pasta} />);

    expect(screen.getByText(/£1 coin is about 75 g dried/)).toBeTruthy();
  });

  it('still says where the card’s numbers come from', async () => {
    await render(<ServingGuide food={pasta} />);

    expect(screen.getByText(/British Nutrition Foundation/)).toBeTruthy();
  });
});

/**
 * How it closes. The app shuts a camera with the disc in the corner and a
 * sheet by acting on it or tapping away — the word "Close" was a one-off this
 * screen invented and nothing else used.
 */
describe('getting out of it', () => {
  it('closes from the disc in the corner, the one the camera uses', async () => {
    const onClose = jest.fn();
    await render(<ServingGuide food={almonds} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('closes by tapping the screen it is sitting over', async () => {
    const onClose = jest.fn();
    await render(<ServingGuide food={almonds} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Close the serving guide'));

    expect(onClose).toHaveBeenCalled();
  });

  it('spells it with a glyph rather than the word', async () => {
    await render(<ServingGuide food={almonds} onClose={jest.fn()} />);

    expect(screen.queryByText('Close')).toBeNull();
  });
});
