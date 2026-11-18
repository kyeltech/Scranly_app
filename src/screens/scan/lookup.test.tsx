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

  // Every code the lookup can raise has its own words, and the scanner shows
  // whichever one it was given rather than one sentence covering all of them.
  // The point of the codes is that "you are offline" and "that entry has no
  // nutrition in it" are different problems with different ways out.
  it('says there is no connection when the phone is offline', async () => {
    const offline = {code: 'offline' as const, subject: '5449000000996'};
    await render(<Scan lookup={answers({status: 'error', failure: offline})} />);

    await scanBarcode('5449000000996');

    expect(await screen.findByText('No connection')).toBeTruthy();
    expect(screen.getByText('5449000000996')).toBeTruthy();
  });

  it('says the database is down when it answers 500, which is not your scan', async () => {
    const down = {code: 'server' as const, subject: '5449000000996'};
    await render(<Scan lookup={answers({status: 'error', failure: down})} />);

    await scanBarcode('5449000000996');

    expect(await screen.findByText('The database is down')).toBeTruthy();
  });

  it('sends you to the label on a rate limit, since trying again will fail too', async () => {
    const limited = {code: 'rateLimited' as const, subject: '5449000000996', retryAfter: 30};
    await render(<Scan lookup={answers({status: 'error', failure: limited})} />);

    await scanBarcode('5449000000996');

    expect(await screen.findByText('Too many lookups')).toBeTruthy();
    expect(screen.getByText('Add it from the label')).toBeTruthy();
    expect(screen.getByText('Try again in 30 seconds')).toBeTruthy();
  });

  it('says there is nothing to count when the entry carries no nutrition', async () => {
    const empty = {code: 'badResponse' as const, subject: '5000000000000'};
    await render(<Scan lookup={answers({status: 'error', failure: empty})} />);

    await scanBarcode('5000000000000');

    expect(await screen.findByText('Nothing to count')).toBeTruthy();
  });

  it('still answers when the failure arrives with no code it knows', async () => {
    // The fallback is a fallback, not a shrug: it names what still works and
    // leaves three ways on.
    const odd = {code: 'unknown' as const, subject: '5449000000996'};
    await render(
      <Scan lookup={answers({status: 'error', failure: odd})} onTypeItIn={jest.fn()} />,
    );

    await scanBarcode('5449000000996');

    expect(await screen.findByText('That did not work')).toBeTruthy();
    expect(screen.getByText('Type the food in instead')).toBeTruthy();
  });

  it('goes back to aiming to try again after a failure', async () => {
    const offline = {code: 'offline' as const, subject: '5449000000996'};
    await render(<Scan lookup={answers({status: 'error', failure: offline})} />);
    await scanBarcode('5449000000996');
    await screen.findByText('No connection');

    await fireEvent.press(screen.getByText('Try again'));

    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
  });

  it('reads the same tin again after a retry, which is what Try again means', async () => {
    // The reader holds the last code it saw so one barcode in frame is one
    // read. It used to hold it for as long as the mode did not change, so
    // "Try again" put the scanner back on the same tin and nothing happened:
    // the only way out of a failure was a different barcode.
    const lookup = jest
      .fn()
      .mockResolvedValueOnce({status: 'error', failure: {code: 'offline' as const}})
      .mockResolvedValueOnce({status: 'found', product: coke});
    await render(<Scan lookup={lookup} />);

    await scanBarcode('5449000000996');
    await screen.findByText('No connection');
    await fireEvent.press(screen.getByText('Try again'));
    await scanBarcode('5449000000996');

    expect(await screen.findByText('Coca-Cola Original')).toBeTruthy();
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it('takes the label route out of a failure, which is the local way on', async () => {
    const offline = {code: 'offline' as const, subject: '5449000000996'};
    await render(<Scan lookup={answers({status: 'error', failure: offline})} />);
    await scanBarcode('5449000000996');
    await screen.findByText('No connection');

    await fireEvent.press(screen.getByText('Add it from the label'));

    expect(screen.getByText(/Fit the whole nutrition table/)).toBeTruthy();
  });

  it('types the food in instead, from a failure', async () => {
    const onTypeItIn = jest.fn();
    const offline = {code: 'offline' as const, subject: '5449000000996'};
    await render(
      <Scan lookup={answers({status: 'error', failure: offline})} onTypeItIn={onTypeItIn} />,
    );
    await scanBarcode('5449000000996');
    await screen.findByText('No connection');

    await fireEvent.press(screen.getByText('Type the food in instead'));

    expect(onTypeItIn).toHaveBeenCalled();
  });
});
