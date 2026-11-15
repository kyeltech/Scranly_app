/**
 * The barcode lookup, on a working camera.
 *
 * Every other scan test runs on the drawn stand-in (the simulator's situation),
 * which walks the states on a timer. This is the only place the real path is
 * exercised: a scan reaches the reader, the barcode goes to a lookup, and the
 * sheet that rises depends on what came back. The lookup is injected, so no
 * test touches the network — see `readers/product.ts`.
 */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
const camera = require('react-native-vision-camera');
import Scan from '../Scan';
import type {LookupResult} from '../../readers/product';

const coke = {
  barcode: '5449000000996',
  name: 'Coca-Cola Original',
  brand: 'Coca-Cola',
  kcal: 42.4,
  proteinG: 0,
  carbsG: 10.6,
  fatG: 0,
};

const snickers = {
  barcode: '5000159461122',
  name: 'Snickers',
  brand: 'Mars',
  kcal: 481,
  proteinG: 8.6,
  carbsG: 60.5,
  fatG: 22.5,
  serving: {grams: 50, kcal: 240},
};

/** A lookup that always answers the same way, without a network. */
const answers = (result: LookupResult) => () => Promise.resolve(result);

/** Drive a real scan: the reader's own callback, which the guard lives behind. */
const scanBarcode = async (value: string) => {
  await act(async () => {
    camera.__objectOptions().onObjectsScanned([{value, type: 'ean-13'}]);
  });
};

describe('With a working camera, a scanned barcode', () => {
  beforeEach(() => {
    camera.__resetCamera();
    camera.__setCamera({
      device: {id: 'back-wide'},
      objectOutput: {kind: 'objects'},
    });
  });

  afterAll(() => camera.__resetCamera());

  it('shows the product the lookup found, with its per-100 g serving', async () => {
    await render(<Scan lookup={answers({status: 'found', product: coke})} />);

    await scanBarcode('5449000000996');

    expect(await screen.findByText('Coca-Cola Original')).toBeTruthy();
    expect(screen.getByText('100 g · Per 100 g')).toBeTruthy();
    expect(screen.getByText('Add to lunch')).toBeTruthy();
  });

  it('logs the scanned product at its serving and meal when added', async () => {
    const onLog = jest.fn();
    await render(
      <Scan lookup={answers({status: 'found', product: coke})} onLog={onLog} />,
    );
    await scanBarcode('5449000000996');
    await screen.findByText('Coca-Cola Original');

    await fireEvent.press(screen.getByText('Add to lunch'));

    expect(onLog).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Coca-Cola Original',
        portion: '100 g',
        kcal: 42.4,
      }),
      'Lunch',
    );
  });

  it('offers the pack serving as a second row when the product has one', async () => {
    await render(<Scan lookup={answers({status: 'found', product: snickers})} />);
    await scanBarcode('5000159461122');
    await screen.findByText('Snickers');

    await fireEvent.press(screen.getByLabelText('Change the serving'));

    expect(screen.getByText('Per 100 g')).toBeTruthy();
    expect(screen.getByText('Per serving (50 g)')).toBeTruthy();
  });

  it('says "not in the database" when the barcode is a miss', async () => {
    await render(<Scan lookup={answers({status: 'not-found'})} />);

    await scanBarcode('0000000000000');

    expect(await screen.findByText('Not in the database')).toBeTruthy();
  });

  it('says it cannot reach the database when the lookup fails', async () => {
    await render(<Scan lookup={answers({status: 'error'})} />);

    await scanBarcode('5449000000996');

    expect(await screen.findByText(/Can.t reach the food database/)).toBeTruthy();
  });

  it('goes back to aiming to try again after a failure', async () => {
    await render(<Scan lookup={answers({status: 'error'})} />);
    await scanBarcode('5449000000996');
    await screen.findByText(/Can.t reach the food database/);

    await fireEvent.press(screen.getByText('Try again'));

    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
  });
});
