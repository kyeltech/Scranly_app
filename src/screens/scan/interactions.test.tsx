/**
 * The scanner's own controls, on the stand-in build.
 *
 * Coverage showed the torch, the cancel on the plate overlay, the no-match
 * retry and the shutter's no-reader path all drawn and never pressed. These
 * are the ways out of a scan that went nowhere, which makes them exactly the
 * controls worth proving.
 */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import Scan from '../Scan';

describe('Getting out of a scan that found nothing', () => {
  it('a no-match offers another go, and takes it', async () => {
    await render(<Scan missing />);

    // Aiming -> looking up -> no match, each on its own timer.
    await act(async () => {
      jest.advanceTimersByTime(1400);
    });
    await act(async () => {
      jest.advanceTimersByTime(1400);
    });
    expect(screen.getByText('Not in the database')).toBeTruthy();

    await fireEvent.press(screen.getByText('Scan something else'));

    // Back to aiming, not back to the sheet it just failed in.
    expect(screen.queryByText('Not in the database')).toBeNull();
    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
  });

  it('a plate being worked out can be called off', async () => {
    await render(<Scan mode="plate" />);

    await fireEvent.press(screen.getByLabelText('Take the photo'));
    expect(screen.getByText(/Working out what/)).toBeTruthy();

    await fireEvent.press(screen.getByText(/Cancel/));

    expect(screen.queryByText(/Working out what/)).toBeNull();
    expect(screen.getByLabelText('Take the photo')).toBeTruthy();
  });
});

describe('The torch', () => {
  it('toggles in the barcode mode', async () => {
    await render(<Scan mode="barcode" />);

    // No camera in this build, so the proof is that pressing it is harmless
    // and the viewfinder survives — it was a dead button before there was one.
    await fireEvent.press(screen.getByLabelText('Torch'));
    await fireEvent.press(screen.getByLabelText('Torch'));

    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
  });

  it('toggles in the label mode', async () => {
    await render(<Scan mode="label" />);

    await fireEvent.press(screen.getByLabelText('Torch'));

    expect(screen.getByText(/Fit the whole nutrition table/)).toBeTruthy();
  });
});

describe('The shutter without a reader behind it', () => {
  it('goes straight to the example result, and says it is an example', async () => {
    await render(<Scan mode="label" />);

    // This build has the OCR library but no camera device, so the viewfinder
    // says which part is missing rather than leaving a blank frame.
    expect(screen.getByText('No camera on this device — showing an example')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Take the photo'));

    // The designed result, from the fixture: the screen stays reachable even
    // on a build with no OCR at all.
    expect(screen.getByText('READ FROM THE LABEL')).toBeTruthy();
  });
});
