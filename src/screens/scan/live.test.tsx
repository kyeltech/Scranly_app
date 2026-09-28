/**
 * A build with the camera actually working.
 *
 * Every other test file runs without one — the simulator's situation — so this
 * is the only place the live path is exercised at all. It configures the shared
 * camera mock rather than re-mocking the module, because a jest.mock in the
 * setup file takes precedence over one in a test file and re-mocking here would
 * silently do nothing.
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
const camera = require('react-native-vision-camera');
import Scan from '../Scan';

const latestCamera = () => camera.__cameraProps[camera.__cameraProps.length - 1];

describe('With a working camera', () => {
  beforeEach(() => {
    camera.__resetCamera();
    camera.__setCamera({
      device: {id: 'back-wide'},
      objectOutput: {kind: 'objects'},
      photoOutput: {kind: 'photo', capturePhoto: jest.fn()},
    });
  });

  afterAll(() => camera.__resetCamera());

  it('shows the designed hint, not an explanation of why there is none', async () => {
    await render(<Scan />);

    expect(screen.getByText('No barcode? Switch to Plate')).toBeTruthy();
    expect(screen.queryByText(/showing an example/)).toBeNull();
  });

  it('renders the live picture instead of the drawn stand-in', async () => {
    await render(<Scan />);

    expect(camera.__cameraProps.length).toBeGreaterThan(0);
    expect(screen.queryByTestId('subject-barcode')).toBeNull();
  });

  it('gives the barcode mode its scanner and the label mode its shutter', async () => {
    await render(<Scan />);
    expect(latestCamera().outputs).toEqual([{kind: 'objects'}]);

    camera.__resetCamera();
    camera.__setCamera({
      device: {id: 'back-wide'},
      photoOutput: {kind: 'photo', capturePhoto: jest.fn()},
    });
    await render(<Scan mode="label" />);
    expect(latestCamera().outputs[0].kind).toBe('photo');
  });

  it('toggles the torch, which was a dead button before there was a camera', async () => {
    await render(<Scan />);
    expect(latestCamera().torchMode).toBe('off');

    await fireEvent.press(screen.getByLabelText('Torch'));
    expect(latestCamera().torchMode).toBe('on');
  });

  it('waits to be read rather than walking the states on a timer', async () => {
    await render(<Scan />);

    // The stand-in advances itself; a real reader supplies the transition.
    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
    expect(screen.queryByText('LOOKING UP')).toBeNull();
  });
});
