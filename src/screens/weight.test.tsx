import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import WeighIn from './WeighIn';
import WeightTrend from './WeightTrend';
import Settings from './Settings';
import {fourWeeks, todaysReading, yesterdaysReading} from '../fixtures/weight';

describe('Weigh-in', () => {
  it('gives the routine that makes a trend mean anything', async () => {
    await render(
      <WeighIn startKg={todaysReading} yesterdayKg={yesterdaysReading} averageKg={79.8} />,
    );

    expect(screen.getByText('79.6')).toBeTruthy();
    // The design titles this block rather than flagging it with an info icon:
    // it is how to weigh yourself, not a caveat about a number.
    expect(screen.getByText('WHY IT MATTERS')).toBeTruthy();
    expect(screen.getByText(/same time each day/)).toBeTruthy();
    expect(screen.getByText('Yesterday 79.5 · 7-day average 79.8')).toBeTruthy();
  });

  it('steps in tenths and saves what is on screen', async () => {
    const onSave = jest.fn();
    await render(
      <WeighIn
        startKg={todaysReading}
        yesterdayKg={yesterdaysReading}
        averageKg={79.8}
        onSave={onSave}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Lower by 0.1 kg'));
    expect(screen.getByText('79.5')).toBeTruthy();

    await fireEvent.press(screen.getByText('Save 79.5 kg'));
    expect(onSave).toHaveBeenCalledWith(79.5);
  });
});

describe('Weight trend', () => {
  it('judges the goal on the average, and names both rates', async () => {
    await render(
      <WeightTrend
        readings={fourWeeks}
        goalKg={75}
        weeksRemaining={13}
        goalDate="24 November"
      />,
    );

    expect(screen.getByText('On track')).toBeTruthy();
    expect(screen.getByText(/the goal needs/)).toBeTruthy();
    expect(screen.getByText(/7-day average, so a heavy Sunday/)).toBeTruthy();
    // Every mark is named, so reading it never depends on telling colours apart.
    expect(screen.getByText('Daily')).toBeTruthy();
    expect(screen.getByText('7-day average')).toBeTruthy();
    expect(screen.getByText('On-pace line')).toBeTruthy();
  });

  it('says behind rather than flattering a pace that will miss', async () => {
    await render(
      <WeightTrend
        readings={fourWeeks}
        goalKg={75}
        weeksRemaining={4}
        goalDate="24 October"
      />,
    );

    expect(screen.getByText('Behind the pace')).toBeTruthy();
  });
});

describe('Settings', () => {
  it('defaults exercise off, and says why in plain words', async () => {
    await render(<Settings />);

    const toggle = screen.getByLabelText('Count exercise toward the budget');
    expect(toggle.props.value).toBe(false);
    expect(screen.getByText(/eating it back usually wipes out the day/)).toBeTruthy();
  });

  it('names the absence of an upgrade screen, because nobody notices an absence', async () => {
    await render(<Settings />);
    expect(screen.getByText(/That is the whole business model/)).toBeTruthy();
  });
});
