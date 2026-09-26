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

    expect(screen.getByText('September 2026')).toBeTruthy();
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
