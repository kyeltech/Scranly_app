import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Today from './Today';
import {aNormalDay, anOverBudgetDay, aFreshDay} from '../fixtures/days';

// render() returns a promise in @testing-library/react-native 14 — without the
// await, `screen` is still empty when the assertions run.

describe('Today', () => {
  it('leads with what is left, not what has been eaten', async () => {
    await render(<Today day={aNormalDay} />);

    expect(screen.getByText('642')).toBeTruthy();
    expect(screen.getByText('kcal left')).toBeTruthy();
    // The eaten figure is there, but as context under the headline.
    expect(screen.getByText('1,188 of 1,830')).toBeTruthy();
  });

  it('goes negative past the budget rather than stopping at zero', async () => {
    await render(<Today day={anOverBudgetDay} />);

    expect(screen.getByText('−142')).toBeTruthy();
    expect(screen.getByText('kcal over')).toBeTruthy();
    expect(screen.queryByText('kcal left')).toBeNull();
  });

  it('offers the whole budget, not a zero, on a day with nothing logged', async () => {
    await render(<Today day={aFreshDay} />);

    expect(screen.getByText('1,830')).toBeTruthy();
    expect(screen.getByText('kcal to spend')).toBeTruthy();
    expect(screen.getByText('Nothing logged yet')).toBeTruthy();
  });

  it('reaches Weight and Settings from the header, since there is no tab bar', async () => {
    const onWeek = jest.fn();
    const onSettings = jest.fn();
    await render(
      <Today day={aNormalDay} onWeek={onWeek} onSettings={onSettings} />,
    );

    await fireEvent.press(screen.getByText('Week'));
    await fireEvent.press(screen.getByLabelText('Settings'));

    expect(onWeek).toHaveBeenCalled();
    expect(onSettings).toHaveBeenCalled();
  });

  it('always offers both ways to log', async () => {
    await render(<Today day={aNormalDay} />);

    expect(screen.getByText('Scan')).toBeTruthy();
    expect(screen.getByText('Log food')).toBeTruthy();
    // The design puts a glyph on each: at arm's length the shapes are what
    // you aim at, not the words.
    expect(screen.getByTestId('icon-scan')).toBeTruthy();
    expect(screen.getByTestId('icon-log-food')).toBeTruthy();
  });
});
