import React from 'react';
import {Linking} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Settings from './Settings';

/**
 * Open Food Facts's data is ODbL: the licence must be named and the source
 * credited with a link wherever the data is used (ADR-0010). The scanned
 * numbers come from there, so Settings carries the credit.
 */
describe('the Open Food Facts attribution', () => {
  it('names Open Food Facts and the ODbL licence', async () => {
    await render(<Settings />);

    expect(screen.getByText(/Open Food Facts/)).toBeTruthy();
    expect(screen.getByText(/ODbL/)).toBeTruthy();
  });

  it('links out to Open Food Facts when tapped', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);

    await render(<Settings />);
    await fireEvent.press(screen.getByText(/Food data from/));

    expect(open).toHaveBeenCalledWith('https://openfoodfacts.org');
    open.mockRestore();
  });
});
