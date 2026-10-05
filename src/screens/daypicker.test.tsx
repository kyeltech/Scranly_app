import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import DayPicker from './DayPicker';
import Today from './Today';
import {aFreshDay, anOverBudgetDay, aPastDay, dayMarks} from '../fixtures/days';

describe('Picking a day', () => {
  // A fixed Saturday, so the grid does not drift with the wall clock.
  const today = new Date(2026, 8, 26);
  const marks = dayMarks(today);

  const picker = (onSelect?: (iso: string) => void) => (
    <DayPicker today={today} marks={marks} onSelect={onSelect} />
  );

  it('works the month out rather than drawing one', async () => {
    await render(picker());

    expect(screen.getByText('September 2026')).toBeTruthy();
    // 30 days, and no 31st invented.
    expect(screen.getByLabelText('30 September 2026')).toBeTruthy();
    expect(screen.queryByLabelText('31 September 2026')).toBeNull();
  });

  it('names every dot, so reading the month never depends on telling colours apart', async () => {
    await render(picker());

    expect(screen.getByText('Under')).toBeTruthy();
    expect(screen.getByText('Over')).toBeTruthy();
    expect(screen.getByText('Nothing logged')).toBeTruthy();
  });

  it('hands back the ISO date tapped, not a bare day number', async () => {
    const onSelect = jest.fn();
    await render(picker(onSelect));

    await fireEvent.press(screen.getByLabelText('12 September 2026'));
    expect(onSelect).toHaveBeenCalledWith('2026-09-12');
  });

  it('will not open a day that has not happened', async () => {
    const onSelect = jest.fn();
    await render(picker(onSelect));

    await fireEvent.press(screen.getByLabelText('29 September 2026'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('goes back a month, and finds that month’s own length and shape', async () => {
    await render(picker());

    await fireEvent.press(screen.getByLabelText('Previous month'));
    expect(screen.getByText('August 2026')).toBeTruthy();
    expect(screen.getByLabelText('31 August 2026')).toBeTruthy();

    // February is the one that catches a hardcoded grid out.
    for (let i = 0; i < 6; i++) {
      await fireEvent.press(screen.getByLabelText('Previous month'));
    }
    expect(screen.getByText('February 2026')).toBeTruthy();
    expect(screen.getByLabelText('28 February 2026')).toBeTruthy();
    expect(screen.queryByLabelText('29 February 2026')).toBeNull();
  });

  it('rolls the year over going back past January', async () => {
    await render(picker());

    for (let i = 0; i < 9; i++) {
      await fireEvent.press(screen.getByLabelText('Previous month'));
    }
    expect(screen.getByText('December 2025')).toBeTruthy();
  });

  it('comes forward again, but not past the month it is in', async () => {
    await render(picker());

    await fireEvent.press(screen.getByLabelText('Previous month'));
    await fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByText('September 2026')).toBeTruthy();

    // A diary has no future, so forward stops here.
    await fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByText('September 2026')).toBeTruthy();
  });
});

describe('Today, on the days that are not normal', () => {
  it('offers a way out of an empty day instead of an empty list', async () => {
    const onStarter = jest.fn();
    await render(<Today day={aFreshDay} onStarter={onStarter} />);

    expect(screen.getByText('1,830')).toBeTruthy();
    expect(screen.getByText('kcal to spend')).toBeTruthy();
    expect(screen.getByText('Start with what you usually have')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Log Porridge oats'));
    expect(onStarter).toHaveBeenCalledWith('oats');
  });

  it('puts a day over budget in the context of its week', async () => {
    await render(<Today day={anOverBudgetDay} />);

    expect(screen.getByText('−142')).toBeTruthy();
    expect(screen.getByText('kcal over')).toBeTruthy();
    // One red day inside a week under budget is not a week over.
    expect(screen.getByText(/This week you are/)).toBeTruthy();
    expect(screen.getByText('320 under')).toBeTruthy();
  });

  it('dates a past day, steps to its neighbours, and offers the way back', async () => {
    const onToday = jest.fn();
    const onPrevDay = jest.fn();
    await render(<Today day={aPastDay} onToday={onToday} onPrevDay={onPrevDay} />);

    expect(screen.getByText('Sunday')).toBeTruthy();
    expect(screen.getByText('20 September')).toBeTruthy();
    expect(screen.getByText('Logged that day')).toBeTruthy();

    await fireEvent.press(screen.getByText('‹ Sat 19'));
    expect(onPrevDay).toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Today'));
    expect(onToday).toHaveBeenCalled();
  });

  it('opens the month from the day name, since there is no tab bar to hold it', async () => {
    const onDay = jest.fn();
    await render(<Today day={aPastDay} onDay={onDay} />);

    await fireEvent.press(screen.getByLabelText('Pick a day'));
    expect(onDay).toHaveBeenCalled();
  });
});
