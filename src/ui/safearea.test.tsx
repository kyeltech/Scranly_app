/**
 * Today and Add food pin their action bar over the scrolling content, and an
 * absolutely positioned child is not reliably held inside its parent's
 * padding — which is how the buttons ended up under the home indicator. Those
 * two screens therefore pad for it themselves, and `Screen` must not pad again.
 */
jest.mock('react-native-safe-area-context', () => {
  const insets = {top: 47, right: 0, bottom: 34, left: 0};
  return {
    SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
    SafeAreaView: ({children}: {children: React.ReactNode}) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 390, height: 844}),
    initialWindowMetrics: {frame: {x: 0, y: 0, width: 390, height: 844}, insets},
  };
});

import React from 'react';
import {StyleSheet} from 'react-native';
import {render, screen} from '@testing-library/react-native';
import Today from '../screens/Today';
import Settings from '../screens/Settings';
import {aNormalDay} from '../fixtures/days';

/** The bar is the view the two buttons sit in. */
function barPadding(name: string) {
  const bar = screen.getByRole('button', {name}).parent;
  return StyleSheet.flatten(bar?.props.style).paddingBottom;
}

function screenPadding() {
  return StyleSheet.flatten(screen.root?.props.style).paddingBottom;
}

describe('the home indicator', () => {
  it('is cleared by the action bar Today pins over its list', async () => {
    await render(<Today day={aNormalDay} />);

    expect(barPadding('Scan')).toBe(34);
    // And not a second time by the screen, which would float the bar.
    expect(screenPadding()).toBe(0);
  });

  it('is cleared by the screen itself where the action row is in the flow', async () => {
    await render(<Settings />);
    expect(screenPadding()).toBe(34);
  });
});
