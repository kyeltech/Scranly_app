/**
 * The dark theme has its own regressions, and they are invisible to every
 * other test in here: Jest renders light unless told otherwise, so a colour
 * that inverts when it should not passes everywhere else.
 */
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => 'dark',
}));

import React from 'react';
import {StyleSheet} from 'react-native';
import {render, screen} from '@testing-library/react-native';
import Today from './Today';
import {aNormalDay} from '../fixtures/days';
import {palettes} from '../theme';

const dark = palettes.dark;

function backgroundOf(name: string) {
  const node = screen.getByRole('button', {name});
  return StyleSheet.flatten(node.props.style).backgroundColor;
}

describe('Today in the dark', () => {
  it('keeps Scan a bordered surface rather than inverting it to near-white', async () => {
    await render(<Today day={aNormalDay} />);

    // The chip colours invert between themes, and a selected chip should. This
    // button must not: inverted it is a white slab beside the lime one.
    expect(backgroundOf('Scan')).toBe(dark.secondaryButton.bg);
    expect(backgroundOf('Scan')).not.toBe(dark.chipOnBg);
  });

  it('leaves Log food lime in both themes', async () => {
    await render(<Today day={aNormalDay} />);
    expect(backgroundOf('Log food')).toBe('#C2F24D');
  });
});
