/**
 * The loading screen, which until now had one line of it ever run.
 *
 * It is the screen the app will show while a lookup is in flight, so it matters
 * that it starts its animations, stops them when it goes away, and can be
 * pointed at any of the three launch schemes.
 */
import React from 'react';
import {Animated} from 'react-native';
import {act, render, screen} from '@testing-library/react-native';
import LoadingScreen from './LoadingScreen';
import {schemes} from '../theme';

describe('LoadingScreen', () => {
  it('names itself for a screen reader with the line it is showing', async () => {
    await render(<LoadingScreen />);

    // The art carries no meaning on its own, so the message is the label.
    expect(screen.getByLabelText('Getting your day ready')).toBeTruthy();
  });

  it('shows the message it is given', async () => {
    await render(<LoadingScreen message="Looking up that barcode" />);

    expect(screen.getByText('Looking up that barcode')).toBeTruthy();
    expect(screen.getByLabelText('Looking up that barcode')).toBeTruthy();
  });

  it('starts the loop, rather than drawing one still frame', async () => {
    const loop = jest.spyOn(Animated, 'loop');
    await render(<LoadingScreen />);

    // One for the bar, one per tine.
    expect(loop).toHaveBeenCalledTimes(4);
    loop.mockRestore();
  });

  it('stops everything it started when it goes away', async () => {
    const stops: jest.Mock[] = [];
    const loop = jest.spyOn(Animated, 'loop').mockImplementation(() => {
      const stop = jest.fn();
      stops.push(stop);
      return {start: jest.fn(), stop, reset: jest.fn()} as never;
    });

    const view = await render(<LoadingScreen />);
    await act(async () => {
      view.unmount();
    });

    // A loop left running behind a dismissed screen is a battery leak.
    expect(stops).toHaveLength(4);
    stops.forEach(stop => expect(stop).toHaveBeenCalled());
    loop.mockRestore();
  });

  it('takes a scheme override, so the three launch looks can sit side by side', async () => {
    await render(<LoadingScreen schemeName="black" />);

    const label = screen.getByLabelText('Getting your day ready');
    expect(label.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: schemes.black.loading.background}),
      ]),
    );
  });

  it('defaults to the scheme the app actually ships with', async () => {
    await render(<LoadingScreen />);

    const label = screen.getByLabelText('Getting your day ready');
    expect(label.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: schemes.lime.loading.background}),
      ]),
    );
  });
});
