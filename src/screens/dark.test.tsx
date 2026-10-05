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
import {processColor, StyleSheet} from 'react-native';
import {render, screen} from '@testing-library/react-native';
import Today from './Today';
import {aFreshDay, aNormalDay, anOverBudgetDay} from '../fixtures/days';
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

/**
 * The two Today variants, in the dark. Both were built from the light boards
 * and their dark colours never checked — which is how the Scan button came to
 * be a white slab. Every value below is read off the dark board.
 */
function textColour(text: string) {
  return StyleSheet.flatten(screen.getByText(text).props.style).color;
}

/** react-native-svg normalises a colour prop to a processed int, so match that. */
function strokeOf(node: {props: {stroke?: {payload?: number} | string}}) {
  const stroke = node.props.stroke;
  return typeof stroke === 'object' ? stroke?.payload : stroke;
}

describe('A day over budget, in the dark', () => {
  it('turns the figure and its caption red, not the plain body colour', async () => {
    await render(<Today day={anOverBudgetDay} />);

    expect(textColour('\u2212142')).toBe(dark.status.over);
    expect(textColour('kcal over')).toBe(dark.status.over);
  });

  it('draws the overflow over a pale full lap, so being past has a size', async () => {
    await render(<Today day={anOverBudgetDay} />);

    // A colour alone cannot say how far past; the second arc's length does.
    const arcs = screen.getAllByTestId('ring-arc');
    expect(arcs).toHaveLength(2);
    expect(strokeOf(arcs[0])).toBe(processColor(dark.status.overSoft));
    expect(strokeOf(arcs[1])).toBe(processColor(dark.status.over));
  });

  it('colours the week figure, because that word is the whole point of the pill', async () => {
    await render(<Today day={anOverBudgetDay} />);

    // Green inside a red day: the week is still under, and the pill says so.
    expect(textColour('320 under')).toBe(dark.status.under);
  });
});

describe('A day with nothing logged, in the dark', () => {
  it('keeps the caption muted — a full budget is not an achievement yet', async () => {
    await render(<Today day={aFreshDay} />);

    expect(textColour('kcal to spend')).toBe(dark.textMuted);
    expect(textColour('Nothing logged yet')).toBe(dark.textMuted);
  });

  it('draws the track and no arc at all', async () => {
    await render(<Today day={aFreshDay} />);
    expect(screen.queryAllByTestId('ring-arc')).toHaveLength(0);
  });

  it('offers the starters rather than an empty list', async () => {
    await render(<Today day={aFreshDay} />);
    expect(screen.getByText('Start with what you usually have')).toBeTruthy();
    expect(screen.getByLabelText('Log Porridge oats')).toBeTruthy();
  });
});
