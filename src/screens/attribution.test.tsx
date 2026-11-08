import React from 'react';
import {Linking} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Settings from './Settings';

/**
 * Open Food Facts's data is ODbL: the licence must be named and the source
 * credited with a link wherever the data is used (ADR-0010). The scanned
 * numbers come from there, so Settings carries the credit.
 */
describe('the Open Food Facts attribution', () => {
  it('names Open Food Facts and the ODbL licence', async () => {
    await render(<Settings />);

    expect(screen.getByText(/Open Food Facts/)).toBeTruthy();
    expect(screen.getByText(/ODbL/)).toBeTruthy();
  });

  it('links out to Open Food Facts when tapped', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);

    await render(<Settings />);
    await fireEvent.press(screen.getByText(/Food data from/));

    expect(open).toHaveBeenCalledWith('https://openfoodfacts.org');
    open.mockRestore();
  });
});

describe('Settings shows your real numbers, not the board figures', () => {
  it('shows the budget, goal and foods count it is handed', async () => {
    await render(
      <Settings targetsKcal={1815} goalKg={75} goalDate="24 November" foodsAdded={3} />,
    );

    expect(screen.getByText('1,815 kcal')).toBeTruthy();
    expect(screen.getByText('75.0 kg by 24 November')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('opens the goal editor from the Goal row', async () => {
    const onGoal = jest.fn();
    await render(
      <Settings onGoal={onGoal} goalKg={75} goalDate="24 November" targetsKcal={1815} />,
    );

    await fireEvent.press(screen.getByText('75.0 kg by 24 November'));

    expect(onGoal).toHaveBeenCalledTimes(1);
  });
});
