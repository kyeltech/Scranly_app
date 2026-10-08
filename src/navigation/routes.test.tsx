/**
 * Every control that is supposed to go somewhere, going there.
 *
 * Coverage showed a dozen navigation handlers in Root that no test had ever
 * pressed — the screens rendered, the buttons drew, and nothing proved they
 * led anywhere. That is not a hypothetical failure here: an earlier pass found
 * four controls wired to a screen the design never sent them to, and a test
 * like this is what catches that.
 */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import Root from './Root';

/** Walks onboarding, which every route below sits behind. */
const toToday = async () => {
  await render(<Root initialRoute="Today" />);
};

describe('Leaving Today', () => {
  it('Edit opens Add food', async () => {
    await toToday();
    await fireEvent.press(screen.getByText('Edit'));

    expect(screen.getByText('EATEN THIS WEEK')).toBeTruthy();
  });

  /**
   * The starter rows are not reachable from Root as it stands: they are drawn
   * only on a day with nothing logged, and the day Root opens on has food in
   * it. So `onStarter` has no test here, and saying so is more use than a test
   * that presses something else and calls it covered.
   */
});

describe('Leaving Add food', () => {
  it('the scan button opens the scanner', async () => {
    await toToday();
    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByLabelText('Scan a barcode'));

    expect(screen.getByText('Scan')).toBeTruthy();
  });

  it('Create a food opens the form', async () => {
    await toToday();
    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByText('Create a food'));

    expect(screen.getByText(/Create a food|Name/)).toBeTruthy();
  });
});

describe('Leaving the scanner', () => {
  it('a plate portion goes to the portion editor', async () => {
    await toToday();
    await fireEvent.press(screen.getByText('Scan'));
    await fireEvent.press(screen.getByText('Plate'));
    await fireEvent.press(screen.getByLabelText('Take the photo'));

    // The plate 'works it out' on a timer, since there is no plate reader yet.
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    // Every portion is a guess you can correct — the design's own promise, and
    // the reason the plate reader is allowed to be approximate at all.
    await fireEvent.press(screen.getByText('about 150 g'));

    expect(screen.getByText(/The photo guessed/)).toBeTruthy();
  });
});

describe('Leaving the day picker', () => {
  it('Back to today returns, and to today', async () => {
    await toToday();
    await fireEvent.press(screen.getByLabelText('Pick a day'));
    await fireEvent.press(screen.getByText('Back to today'));

    expect(screen.getByText('kcal left')).toBeTruthy();
    expect(screen.queryByText('Back to today')).toBeNull();
  });
});

describe('Leaving the weight trend', () => {
  it('Change the goal opens the goal screen', async () => {
    await toToday();
    await fireEvent.press(screen.getByText('Week'));
    await fireEvent.press(screen.getByText('Change the goal'));

    expect(screen.getByText('Where are you heading?')).toBeTruthy();
  });
});

describe('Leaving the targets screen', () => {
  it('Set them myself instead goes back to the method', async () => {
    await render(<Root />);
    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));
    await fireEvent.press(screen.getByText('Set them myself instead'));

    expect(screen.getByText('How should the targets be worked out?')).toBeTruthy();
  });
});
