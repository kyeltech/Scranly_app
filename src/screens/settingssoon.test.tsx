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

/**
 * The YOU section had three rows and all of them were results: a budget, the
 * method that computes it, and the goal it aims at. The facts those come from
 * — height, age, sex, how active you are — had no way in at all once setup was
 * done, so a birthday or a new job meant a budget that was quietly wrong.
 */
describe('About you, from Settings', () => {
  it('offers the row the other three are computed from', async () => {
    await render(<Settings activity="moderate" />);

    expect(screen.getByLabelText('About you')).toBeTruthy();
  });

  it('shows how active you said you were, which is the answer that moves', async () => {
    await render(<Settings activity="moderate" />);

    // Height, age and sex barely change; this is the one people revisit.
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('names each level the way the step that sets it does', async () => {
    await render(<Settings activity="very" />);
    expect(screen.getByText('Very')).toBeTruthy();
  });

  it('opens the step those answers came from', async () => {
    const onProfile = jest.fn();
    await render(<Settings onProfile={onProfile} />);

    await fireEvent.press(screen.getByLabelText('About you'));

    expect(onProfile).toHaveBeenCalled();
  });

  it('reads cause before effect: the facts, then what is made of them', async () => {
    await render(<Settings />);

    const order = screen.getAllByRole('button').map(n => n.props.accessibilityLabel);
    const you = order.filter(label =>
      ['About you', 'Method', 'Goal', 'Targets'].includes(label),
    );
    expect(you).toEqual(['About you', 'Method', 'Goal', 'Targets']);
  });
});
