/**
 * A refused camera. The mock in jest.setup grants mockPermission, so these tests
 * override it — which is the only way to reach a state the simulator never
 * shows and a real phone shows only once.
 */
let mockPermission = {
  status: 'denied',
  hasPermission: false,
  canRequestPermission: false,
  requestPermission: jest.fn().mockResolvedValue(false),
};

jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => undefined,
  useCameraPermission: () => mockPermission,
  useObjectOutput: () => ({}),
  usePhotoOutput: () => ({capturePhoto: jest.fn()}),
  usePreviewOutput: () => ({}),
  isScannedCode: () => false,
}));

import React from 'react';
import {Linking} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Scan from '../Scan';

describe('When the camera is refused for good', () => {
  beforeEach(() => {
    mockPermission = {
      status: 'denied',
      hasPermission: false,
      canRequestPermission: false,
      requestPermission: jest.fn().mockResolvedValue(false),
    };
  });

  it('says what the camera is for, in the app’s words rather than the system’s', async () => {
    await render(<Scan />);

    expect(screen.getByText('Scranly cannot see')).toBeTruthy();
    expect(screen.getByText(/never leaves|thrown away|not uploaded|no photo/i)).toBeTruthy();
  });

  it('sends you to Settings, because the app can no longer ask', async () => {
    await render(<Scan />);

    expect(screen.getByText('Open Settings')).toBeTruthy();
    expect(screen.queryByText('Allow the camera')).toBeNull();
  });

  it('never dead-ends: the food can still be typed in', async () => {
    const onTypeItIn = jest.fn();
    await render(<Scan onTypeItIn={onTypeItIn} />);

    await fireEvent.press(screen.getByText('Type the food in instead'));
    expect(onTypeItIn).toHaveBeenCalled();
  });

  it('opens the system settings when that button is pressed', async () => {
    // The button existing is not the same as the button working: this is the
    // only way out of a permanently refused camera, and nothing was pressing it.
    const openSettings = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue(undefined);

    await render(<Scan />);
    await fireEvent.press(screen.getByText('Open Settings'));

    expect(openSettings).toHaveBeenCalledTimes(1);
    openSettings.mockRestore();
  });

  it('survives a refusal to open settings rather than crashing the sheet', async () => {
    // Some devices reject it. The sheet must stay where it is.
    const openSettings = jest
      .spyOn(Linking, 'openSettings')
      .mockRejectedValue(new Error('no settings here'));

    await render(<Scan />);
    await fireEvent.press(screen.getByText('Open Settings'));

    expect(screen.getByText('Scranly cannot see')).toBeTruthy();
    openSettings.mockRestore();
  });

  it('closes without granting anything, which is a choice too', async () => {
    const onClose = jest.fn();
    await render(<Scan onClose={onClose} />);

    await fireEvent.press(screen.getByText('Not now'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows no viewfinder chrome, since there is nothing to aim', async () => {
    await render(<Scan />);

    expect(screen.queryByText(/Point at the barcode/)).toBeNull();
    expect(screen.queryByText('Barcode')).toBeNull();
    expect(screen.queryByLabelText('Take the photo')).toBeNull();
  });
});

describe('When the camera has not been asked yet', () => {
  beforeEach(() => {
    mockPermission = {
      status: 'not-determined',
      hasPermission: false,
      canRequestPermission: true,
      requestPermission: jest.fn().mockResolvedValue(false),
    };
  });

  it('offers to ask rather than sending you to Settings', async () => {
    await render(<Scan />);

    expect(screen.getByText('Allow the camera')).toBeTruthy();
    expect(screen.queryByText('Open Settings')).toBeNull();
  });
});
