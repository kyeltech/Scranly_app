/**
 * The controls that were drawn but never pressed.
 *
 * Each of these screens rendered in a test already, which proved the layout and
 * nothing else: the handlers behind the choices came back from coverage as
 * never run. A control that renders and does nothing is the defect this file
 * exists to catch, and it has caught several in this app already.
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Method from './Method';
import WeighIn from './WeighIn';
import ScalePhoto from './ScalePhoto';

describe('Method — how the targets get worked out', () => {
  it('changes the choice when another method is picked', async () => {
    await render(<Method />);

    const buttons = screen.getAllByRole('button');
    const picked = () =>
      buttons.filter(b => b.props.accessibilityState?.selected).length;

    expect(picked()).toBe(1);

    // The second method, whichever it is: pressing it must move the selection.
    const unpicked = buttons.filter(b => b.props.accessibilityState?.selected === false);
    expect(unpicked.length).toBeGreaterThan(0);
    await fireEvent.press(unpicked[0]);

    expect(picked()).toBe(1);
    expect(unpicked[0].props.accessibilityState.selected).toBe(true);
  });
});

const weighIn = {startKg: 83, yesterdayKg: 83.4, averageKg: 83.2, date: 'Wed 16 Sep'};

describe('WeighIn — the stepper', () => {
  it('raises and lowers by a tenth of a kilo', async () => {
    await render(<WeighIn {...weighIn} />);
    expect(screen.getByText('83.0')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Raise by 0.1 kg'));
    expect(screen.getByText('83.1')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Lower by 0.1 kg'));
    expect(screen.getByText('83.0')).toBeTruthy();
  });

  it('keeps one decimal place, rather than drifting into float noise', async () => {
    await render(<WeighIn {...weighIn} />);

    for (let i = 0; i < 3; i++) {
      await fireEvent.press(screen.getByLabelText('Raise by 0.1 kg'));
    }

    // 83 + 0.1 + 0.1 + 0.1 is 83.30000000000001 in binary floating point, and
    // the step rounds precisely so a run of taps cannot drift.
    expect(screen.getByText('83.3')).toBeTruthy();
    expect(screen.queryByText(/\d\.\d{2,}/)).toBeNull();
  });

  it('hands back the number on the dial, not the one it opened with', async () => {
    const onSave = jest.fn();
    await render(<WeighIn {...weighIn} onSave={onSave} />);

    await fireEvent.press(screen.getByLabelText('Raise by 0.1 kg'));
    await fireEvent.press(screen.getByText(/^Save/));

    expect(onSave).toHaveBeenCalledWith(83.1);
  });
});

describe('ScalePhoto — reading a weight off the scale display', () => {
  const scale = {reading: 83.4, yesterdayKg: 83.6, averageKg: 83.5};

  it('saves the number it read', async () => {
    const onSave = jest.fn();
    await render(<ScalePhoto {...scale} stage="read" onSave={onSave} />);

    await fireEvent.press(screen.getByText('Save 83.4 kg'));
    expect(onSave).toHaveBeenCalledWith(83.4);
  });

  it('falls back to typing it when the read was wrong', async () => {
    const onFix = jest.fn();
    await render(<ScalePhoto {...scale} stage="read" onFix={onFix} />);

    // The figure appears twice — once on the drawn scale, once as the read —
    // so go by the control's own label rather than by what it says.
    await fireEvent.press(screen.getByLabelText('Fix the reading'));
    expect(onFix).toHaveBeenCalled();
  });

  it('goes back to aiming for another go, rather than dead-ending on a bad read', async () => {
    await render(<ScalePhoto {...scale} stage="read" />);

    await fireEvent.press(screen.getByText('Take it again'));

    expect(screen.queryByText('Take it again')).toBeNull();
    expect(screen.getByLabelText('Take the photo')).toBeTruthy();
  });
});
