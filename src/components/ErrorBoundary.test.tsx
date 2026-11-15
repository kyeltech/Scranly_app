import React from 'react';
import {Text} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import ErrorBoundary from './ErrorBoundary';

/** A child that crashes in render on demand, the way a real bug would. */
let crash = false;
function Boom() {
  if (crash) {
    throw new Error('render exploded');
  }
  return <Text>The screen</Text>;
}

describe('the error boundary', () => {
  let error: jest.SpyInstance;

  beforeEach(() => {
    crash = false;
    // React logs a caught render error to console.error; the test expects the
    // crash, so the noise is silenced rather than left to drown the output.
    error = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => error.mockRestore());

  it('shows its children when they render without throwing', async () => {
    await render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('The screen')).toBeTruthy();
  });

  it('catches a render crash and offers a way back instead of a blank screen', async () => {
    crash = true;

    await render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Scranly hit a problem')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
    expect(screen.queryByText('The screen')).toBeNull();
  });

  it('shows the screen again when Try again is tapped and it recovers', async () => {
    crash = true;
    await render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    crash = false;

    await fireEvent.press(screen.getByText('Try again'));

    expect(screen.getByText('The screen')).toBeTruthy();
    expect(screen.queryByText('Scranly hit a problem')).toBeNull();
  });
});
