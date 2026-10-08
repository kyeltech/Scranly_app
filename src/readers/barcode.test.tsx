/**
 * The barcode reader's one piece of real logic: deciding which reads count.
 *
 * A barcode stays in frame for as long as you hold the phone there, so the
 * scanner fires over and over with the same code. Everything here is about what
 * the screen is told, and all of it lives inside a callback that only a real
 * camera ever calls — so the tests drive that callback themselves, through the
 * options the scanner was configured with.
 */
import React from 'react';
import {render, act} from '@testing-library/react-native';
const camera = require('react-native-vision-camera');
import Scan from '../screens/Scan';

const scanner = () => camera.__objectOptions();

/** What the camera hands over when it sees a code. */
const code = (value: string, type = 'ean-13') => ({value, type});

describe('Which reads reach the screen', () => {
  beforeEach(() => {
    camera.__resetCamera();
    camera.__setCamera({
      device: {id: 'back-wide'},
      objectOutput: {kind: 'objects'},
      photoOutput: {kind: 'photo', capturePhoto: jest.fn()},
    });
  });

  afterAll(() => camera.__resetCamera());

  it('only asks for the symbologies on British food packaging', async () => {
    await render(<Scan mode="barcode" />);

    // Deliberately not everything the library offers: every extra format is
    // another chance to match the Data Matrix on a delivery sticker.
    expect(scanner().types).toEqual(['ean-13', 'ean-8', 'upc-e', 'code-128']);
  });

  it('moves the screen on when it reads one', async () => {
    const {getByText} = await render(<Scan mode="barcode" />);

    await act(async () => {
      scanner().onObjectsScanned([code('5012345678900')]);
    });

    expect(getByText('5012345678900')).toBeTruthy();
  });

  it('reads the same code once, however long it stays in frame', async () => {
    const {getAllByText} = await render(<Scan mode="barcode" />);

    await act(async () => {
      scanner().onObjectsScanned([code('5012345678900')]);
      scanner().onObjectsScanned([code('5012345678900')]);
      scanner().onObjectsScanned([code('5012345678900')]);
    });

    // One lookup, not three — the screen has already moved past aiming.
    expect(getAllByText('5012345678900')).toHaveLength(1);
  });

  it('ignores anything in frame that is not a code', async () => {
    const {queryByText} = await render(<Scan mode="barcode" />);

    await act(async () => {
      // No `value`, so `isScannedCode` rejects it: a face, a rectangle, a dog.
      scanner().onObjectsScanned([{type: 'face'}]);
    });

    expect(queryByText('Looking it up')).toBeNull();
  });

  it('takes the first code when two are in frame at once', async () => {
    const {getByText, queryByText} = await render(<Scan mode="barcode" />);

    await act(async () => {
      scanner().onObjectsScanned([code('5012345678900'), code('5000000000000')]);
    });

    expect(getByText('5012345678900')).toBeTruthy();
    expect(queryByText('5000000000000')).toBeNull();
  });

  it('does not read while the barcode mode is not the one aiming', async () => {
    const {queryByText} = await render(<Scan mode="label" />);

    await act(async () => {
      scanner()?.onObjectsScanned?.([code('5012345678900')]);
    });

    expect(queryByText('5012345678900')).toBeNull();
  });
});
