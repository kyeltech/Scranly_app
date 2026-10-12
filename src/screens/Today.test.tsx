import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react-native';
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

/**
 * The four sections, per PRD F2 — "foods grouped by meal", and flow 2's "Tap +
 * on a meal". Before this the screen showed one flat list and the meal was
 * written into `Root` as Lunch, so every food logged anywhere landed at lunch.
 * The section you tap is what decides it now.
 */
describe('the day, by meal', () => {
  const section = (name: string) => within(screen.getByTestId(`meal-${name}`));

  it('shows all four meals, in the order they are eaten', async () => {
    await render(<Today day={aNormalDay} />);

    expect(screen.getByText('Breakfast')).toBeTruthy();
    expect(screen.getByText('Lunch')).toBeTruthy();
    expect(screen.getByText('Dinner')).toBeTruthy();
    expect(screen.getByText('Snack')).toBeTruthy();
  });

  it('puts each food under its own meal', async () => {
    await render(<Today day={aNormalDay} />);

    expect(section('Breakfast').getByText('Porridge oats')).toBeTruthy();
    expect(section('Lunch').getByText('Basmati rice')).toBeTruthy();
    expect(section('Breakfast').queryByText('Basmati rice')).toBeNull();
  });

  it('shows what each meal came to, so you can see where the day went', async () => {
    await render(<Today day={aNormalDay} />);

    // 287 + 286 at lunch; nothing at dinner, said as a nought rather than a
    // blank, so the sections read as a column of figures.
    expect(section('Lunch').getByText('573')).toBeTruthy();
    expect(section('Dinner').getByText('0')).toBeTruthy();
  });

  it('keeps a meal with nothing in it, because its + is how you log to it', async () => {
    await render(<Today day={aNormalDay} />);

    expect(section('Dinner').getByLabelText('Add to Dinner')).toBeTruthy();
    expect(section('Dinner').getByText('Nothing yet')).toBeTruthy();
  });

  it('tells the logger which meal you tapped', async () => {
    const onLogFood = jest.fn();
    await render(<Today day={aNormalDay} onLogFood={onLogFood} />);

    await fireEvent.press(section('Dinner').getByLabelText('Add to Dinner'));

    expect(onLogFood).toHaveBeenCalledWith('Dinner');
  });

  it('leaves the bottom Log food button meaning no meal in particular', async () => {
    const onLogFood = jest.fn();
    await render(<Today day={aNormalDay} onLogFood={onLogFood} />);

    await fireEvent.press(screen.getByText('Log food'));

    expect(onLogFood).toHaveBeenCalledWith(undefined);
  });

  it('still offers the sections on a day with nothing logged at all', async () => {
    await render(<Today day={aFreshDay} />);

    // The starters shortcut is there too, above them — one does not replace
    // the other.
    expect(screen.getByText('Start with what you usually have')).toBeTruthy();
    expect(section('Breakfast').getByLabelText('Add to Breakfast')).toBeTruthy();
  });
});

