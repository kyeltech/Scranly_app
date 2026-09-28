/**
 * A build where the native readers are missing — a forgotten `pod install`,
 * which is exactly what happened.
 *
 * The JS packages are in node_modules either way, so the import succeeds and
 * the native half is simply absent. Before this, that took the whole app down
 * with a white screen on startup, because Root imports the scan screen. A
 * broken native build should cost the scanner, not the app.
 */
jest.mock('react-native-vision-camera', () => {
  throw new Error('Native module VisionCamera not found');
});
jest.mock('react-native-nitro-ocr', () => {
  throw new Error('Native module NitroOcr not found');
});

import React from 'react';
import {render, screen} from '@testing-library/react-native';
import Scan from '../screens/Scan';
import Root from '../navigation/Root';
import {hasNativeReaders} from './native';

describe('A build with no native readers', () => {
  it('notices they are missing rather than trusting the import', () => {
    expect(hasNativeReaders).toBe(false);
  });

  it('opens the app instead of white-screening on startup', async () => {
    await render(<Root initialRoute="Today" />);
    expect(screen.getByText('Log food')).toBeTruthy();
  });

  it('falls back to the stand-in, so every scan state is still reachable', async () => {
    await render(<Scan />);

    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
    expect(screen.getByTestId('subject-barcode')).toBeTruthy();
    // And the modes still switch, because none of this needed a camera.
    expect(screen.getByText('Plate')).toBeTruthy();
  });

  it('does not claim the camera was refused — nothing was asked', async () => {
    await render(<Scan />);
    expect(screen.queryByText('Scranly cannot see')).toBeNull();
  });

  it('still reaches the label result, which needs no camera to render', async () => {
    await render(<Scan mode="label" stage="result" />);
    expect(screen.getByText('READ FROM THE LABEL')).toBeTruthy();
  });
});
