import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Root from './Root';

describe('the app', () => {
  it('walks from the welcome through onboarding to Today', async () => {
    await render(<Root />);

    expect(screen.getByText('Scranly')).toBeTruthy();
    await fireEvent.press(screen.getByText('Set up my targets'));

    expect(screen.getByText('About you')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('Where are you heading?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('How should the targets be worked out?')).toBeTruthy();
    await fireEvent.press(screen.getByText('See my targets'));

    expect(screen.getByText('Your daily targets')).toBeTruthy();
    expect(screen.getByText('1,815')).toBeTruthy();
    await fireEvent.press(screen.getByText('Start logging'));

    // Landed on Today, with the ring reading what is left.
    expect(screen.getByText('642')).toBeTruthy();
    expect(screen.getByText('kcal left')).toBeTruthy();
  });

  it('reaches Weight and Settings from Today, and Add food from the button', async () => {
    await render(<Root initialRoute="Today" />);

    await fireEvent.press(screen.getByText('Week'));
    expect(screen.getByText('On track')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Back'));
    await fireEvent.press(screen.getByLabelText('Settings'));
    expect(screen.getByText(/That is the whole business model/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Back'));
    await fireEvent.press(screen.getByText('Log food'));
    expect(screen.getByText('EATEN THIS WEEK')).toBeTruthy();
  });

  it('carries the activity level chosen in onboarding into the targets', async () => {
    await render(<Root />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Very'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));

    // A more active person burns more, so the target is higher than the 1,815
    // the lightly-active profile produces.
    expect(screen.queryByText('1,815')).toBeNull();
    expect(screen.getByText('2,450')).toBeTruthy();
  });
});

/**
 * Every tappable control has a designed screen behind it — that is the rule the
 * boards were drawn to. These walks are what stops a control quietly pointing at
 * the wrong one, which is how the weigh-in camera ended up opening a cheddar
 * barcode result.
 */
describe('every control lands where it was designed to', () => {
  it('opens the barcode reader aiming from Today, not on a result', async () => {
    await render(<Root initialRoute="Today" />);

    await fireEvent.press(screen.getByText('Scan'));

    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
    expect(screen.getByText('Plate')).toBeTruthy();
    expect(screen.getByText('Label')).toBeTruthy();
  });

  it('opens the month from the day name on Today', async () => {
    await render(<Root initialRoute="Today" />);

    await fireEvent.press(screen.getByLabelText('Pick a day'));

    // The month is worked out from the clock, so assert the shape, not a month.
    const now = new Date();
    const label = now.toLocaleString('en-GB', {month: 'long', year: 'numeric'});
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByLabelText(`${now.getDate()} ${label}`)).toBeTruthy();
    expect(screen.getByText('Back to today')).toBeTruthy();
  });

  it('opens the scale reader from the weigh-in, not the food scanner', async () => {
    await render(<Root initialRoute="WeighIn" />);

    await fireEvent.press(screen.getByText('Photograph the scale instead'));

    expect(screen.getByText(/Hold the phone flat over the display/)).toBeTruthy();
    // And emphatically not the barcode result it used to open.
    expect(screen.queryByText('Mature Cheddar')).toBeNull();
  });

  it('opens the label reader from Create a food, not a dead barcode', async () => {
    await render(<Root initialRoute="CreateFood" />);

    await fireEvent.press(screen.getByText('Scan the label instead'));

    expect(screen.getByText(/Fit the whole nutrition table/)).toBeTruthy();
  });
});

/**
 * The loop, not just the screen. The first version of these walks asserted the
 * day picker opened and stopped there — so a picker whose dates were wired to
 * `goBack` and changed nothing passed every test while being useless on a phone.
 */
describe('picking a day changes the day', () => {
  const openPicker = async () => {
    await render(<Root initialRoute="Today" />);
    await fireEvent.press(screen.getByLabelText('Pick a day'));
  };

  /** The label the picker gives a date in the month it is showing. */
  const dateLabel = (date: number) => {
    const now = new Date();
    const month = now.toLocaleString('en-GB', {month: 'long', year: 'numeric'});
    return `${date} ${month}`;
  };

  it('shows the day that was tapped, not the day it opened on', async () => {
    await openPicker();

    // The 2nd is safely in the past whatever today is.
    await fireEvent.press(screen.getByLabelText(dateLabel(2)));

    // The picker has closed and Today is showing that date.
    expect(screen.queryByText('Back to today')).toBeNull();
    expect(screen.getByText(/^2 \w+$/)).toBeTruthy();
    expect(screen.getByText('Logged that day')).toBeTruthy();
  });

  it('steps to the day either side from a past day', async () => {
    await openPicker();
    await fireEvent.press(screen.getByLabelText(dateLabel(10)));

    expect(screen.getByText(/^10 \w+$/)).toBeTruthy();

    await fireEvent.press(screen.getByText(/^‹ /));
    expect(screen.getByText(/^9 \w+$/)).toBeTruthy();

    await fireEvent.press(screen.getByText(/›$/));
    expect(screen.getByText(/^10 \w+$/)).toBeTruthy();
  });

  it('comes back to today from a past day', async () => {
    await openPicker();
    await fireEvent.press(screen.getByLabelText(dateLabel(5)));
    expect(screen.getByText('Logged that day')).toBeTruthy();

    await fireEvent.press(screen.getByText('Today'));

    // Today carries no date line and offers the week, not a way back.
    expect(screen.getByText('Logged today')).toBeTruthy();
    expect(screen.getByText('Week')).toBeTruthy();
  });

  it('agrees with its own dots: a day the month shows as over opens as over', async () => {
    await openPicker();
    // The marks put an over day three days back from today.
    const over = new Date();
    over.setDate(over.getDate() - 3);

    await fireEvent.press(screen.getByLabelText(dateLabel(over.getDate())));
    expect(screen.getByText('kcal over')).toBeTruthy();
  });
});
