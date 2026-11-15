import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import AddFood from './AddFood';
import type {SearchResult} from '../readers/product';

/** Two usable Open Food Facts hits for "snickers". */
const found: SearchResult = {
  status: 'ok',
  products: [
    {barcode: '1', name: 'Snickers', brand: 'Mars', kcal: 489, proteinG: 8, carbsG: 60, fatG: 24},
    {barcode: '2', name: 'Snickers Duo', brand: 'Mars', kcal: 489, proteinG: 8, carbsG: 60, fatG: 24},
  ],
};

const type = async (text: string) => {
  await fireEvent.changeText(screen.getByLabelText('Search foods and brands'), text);
};

const settle = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe('searching Open Food Facts from Add food', () => {
  it('searches after a pause in typing and shows the results', async () => {
    const search = jest.fn().mockResolvedValue(found);
    await render(<AddFood search={search} />);

    await type('snickers');
    // Nothing yet — the pause has not elapsed.
    expect(search).not.toHaveBeenCalled();

    await settle(DEBOUNCE);

    expect(search).toHaveBeenCalledWith('snickers');
    expect(await screen.findByText('Snickers')).toBeTruthy();
    expect(screen.getByText('Snickers Duo')).toBeTruthy();
  });

  it('does not fire a request per keystroke', async () => {
    const search = jest.fn().mockResolvedValue(found);
    await render(<AddFood search={search} />);

    await type('s');
    await type('sn');
    await type('sni');
    await settle(DEBOUNCE);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('sni');
  });

  it('keeps the local foods and says so when the search cannot be reached', async () => {
    const search = jest.fn().mockResolvedValue({status: 'error'} as SearchResult);
    await render(<AddFood search={search} />);

    await type('chicken'); // matches a fixture library food
    await settle(DEBOUNCE);

    expect(await screen.findByText(/Couldn.t reach Open Food Facts/)).toBeTruthy();
    // The local library match is still there.
    expect(screen.getByText('Chicken breast, grilled')).toBeTruthy();
  });

  it('does not show the unreachable note until a search has actually run', async () => {
    const search = jest.fn().mockResolvedValue({status: 'error'} as SearchResult);
    await render(<AddFood search={search} />);

    await type('snickers');
    // Mid-typing, before the debounce fires: no verdict yet, so no note.
    expect(screen.queryByText(/Couldn.t reach Open Food Facts/)).toBeNull();

    await settle(DEBOUNCE);
    expect(screen.getByText(/Couldn.t reach Open Food Facts/)).toBeTruthy();
  });

  it('clears the unreachable note the moment you type again', async () => {
    const search = jest.fn().mockResolvedValue({status: 'error'} as SearchResult);
    await render(<AddFood search={search} />);
    await type('snickers');
    await settle(DEBOUNCE);
    expect(screen.getByText(/Couldn.t reach Open Food Facts/)).toBeTruthy();

    // Keep typing: the stale failure goes at once, before the next search runs.
    await type('snickers bar');
    expect(screen.queryByText(/Couldn.t reach Open Food Facts/)).toBeNull();
  });
});

const DEBOUNCE = 500;
