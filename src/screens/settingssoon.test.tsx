import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react-native';
import Settings from './Settings';

/**
 * Six rows in Settings looked live and did nothing: Units, Count exercise,
 * Week starts, Theme, Export everything, Invite a friend. A chip where the
 * value goes, and the row stops being tappable — honest at a glance rather
 * than after a tap, and nothing has to open to explain itself.
 */
describe('what is not built, in Settings', () => {
  const soon = ['Units', 'Count exercise toward the budget', 'Week starts', 'Theme', 'Export everything', 'Invite a friend'];

  it('marks every row that does nothing yet', async () => {
    await render(<Settings />);

    expect(screen.getAllByText('SOON')).toHaveLength(soon.length);
  });

  it.each(soon)('marks %s', async label => {
    await render(<Settings />);

    const row = screen.getByLabelText(label);
    expect(within(row).getByText('SOON')).toBeTruthy();
  });

  it('leaves the rows that work alone', async () => {
    await render(<Settings targetsKcal={1815} goalKg={75} goalDate="24 November" foodsAdded={6} />);

    expect(within(screen.getByLabelText('Targets')).queryByText('SOON')).toBeNull();
    expect(screen.getByText('1,815 kcal')).toBeTruthy();
    expect(within(screen.getByLabelText('Goal')).queryByText('SOON')).toBeNull();
  });

  it('does not open anything, because there is nowhere to go', async () => {
    const onGoal = jest.fn();
    await render(<Settings onGoal={onGoal} />);

    await fireEvent.press(screen.getByLabelText('Theme'));

    // Nothing navigates, and the row that does work still does.
    await fireEvent.press(screen.getByLabelText('Goal'));
    expect(onGoal).toHaveBeenCalledTimes(1);
  });

  it('says so to a screen reader as well as on the screen', async () => {
    await render(<Settings />);

    expect(screen.getByLabelText('Theme').props.accessibilityState).toEqual(
      expect.objectContaining({disabled: true}),
    );
  });

  it('shows no switch on the exercise row, since there is nothing to switch', async () => {
    await render(<Settings />);

    expect(screen.queryByRole('switch')).toBeNull();
  });
});
