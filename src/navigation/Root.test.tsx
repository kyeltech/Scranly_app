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
