import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import MyFoods from './MyFoods';
import {food} from '../domain/food';

const tuna = food({
  id: 'mine-1',
  name: 'Skipjack tuna',
  brand: 'Aldi',
  portion: '51 g',
  portionG: 51,
  kcal: 55,
  proteinG: 12.7,
  carbsG: 0,
  fatG: 0.5,
  mine: true,
  logged: 6,
});

const jollof = food({
  id: 'mine-2',
  name: 'Mum’s jollof rice',
  brand: 'Mine',
  portion: '250 g',
  portionG: 250,
  kcal: 412,
  proteinG: 9,
  carbsG: 76,
  fatG: 8,
  mine: true,
});

/**
 * Settings counted the foods you had typed in and stopped there, so the only
 * way to see one again was to search for it while logging. This is the list.
 */
describe('foods you added', () => {
  it('shows each one with what it is stated for', async () => {
    await render(<MyFoods foods={[tuna, jollof]} />);

    expect(screen.getByText('Skipjack tuna')).toBeTruthy();
    expect(screen.getByText(/Aldi · 51 g/)).toBeTruthy();
    expect(screen.getByText('55')).toBeTruthy();
  });

  it('puts the newest first, because that is the one you just made', async () => {
    await render(<MyFoods foods={[tuna, jollof]} />);

    const names = screen.getAllByRole('text').map(node => node.props.children);
    expect(names.indexOf('Mum’s jollof rice')).toBeLessThan(names.indexOf('Skipjack tuna'));
  });

  it('says how often each has been logged, which is what makes one worth keeping', async () => {
    await render(<MyFoods foods={[tuna, jollof]} />);

    expect(screen.getByText('Logged 6 times')).toBeTruthy();
    expect(screen.getByText('Not logged yet')).toBeTruthy();
  });

  it('counts them, so the heading is not just a word', async () => {
    await render(<MyFoods foods={[tuna, jollof]} />);

    expect(screen.getByText('2 FOODS')).toBeTruthy();
  });

  it('says one food rather than 1 foods', async () => {
    await render(<MyFoods foods={[tuna]} />);

    expect(screen.getByText('1 FOOD')).toBeTruthy();
  });

  it('opens Create a food from the button', async () => {
    const onCreate = jest.fn();
    await render(<MyFoods foods={[tuna]} onCreate={onCreate} />);

    await fireEvent.press(screen.getByText('Create a food'));

    expect(onCreate).toHaveBeenCalled();
  });
});

/**
 * The state a new person meets. It says what the feature is for rather than
 * that there is nothing here, and points at the label scanner, which fills
 * most of the form in.
 */
describe('before you have added any', () => {
  it('explains what typing one in is for', async () => {
    await render(<MyFoods foods={[]} />);

    expect(screen.getByText('Nothing yet')).toBeTruthy();
    expect(screen.getByText(/does not have a food/)).toBeTruthy();
    expect(screen.getByText(/Scanning a label/)).toBeTruthy();
  });

  it('still offers the way to make one', async () => {
    const onCreate = jest.fn();
    await render(<MyFoods foods={[]} onCreate={onCreate} />);

    await fireEvent.press(screen.getByText('Create a food'));

    expect(onCreate).toHaveBeenCalled();
  });

  /**
   * Editing one needs `replace` and `remove` on the food store, which do not
   * exist. Until they do, a row opens nothing — and so it carries no chevron,
   * because a chevron is a promise that something is behind it.
   */
  it('does not pretend a row can be opened yet', async () => {
    await render(<MyFoods foods={[tuna]} />);

    expect(screen.queryByLabelText(/Edit Skipjack tuna/)).toBeNull();
  });
});
