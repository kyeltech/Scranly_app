/* eslint-env jest */

// Animations and the boot splash need stand-ins outside a real device.
jest.useFakeTimers();

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn(),
}));

// Safe-area insets come from a native provider that does not exist under Jest.
// The library ships a mock with sensible fixed insets.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

/**
 * The camera and the OCR are native. Under Jest they stand in as an absent
 * camera, which is the same path the iOS simulator takes — so every scan test
 * exercises the stand-in picture, and the real readers are only ever exercised
 * on a device.
 */
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => undefined,
  useCameraPermission: () => ({
    status: 'authorized',
    hasPermission: true,
    canRequestPermission: false,
    requestPermission: jest.fn().mockResolvedValue(true),
  }),
  useObjectOutput: () => ({}),
  usePhotoOutput: () => ({capturePhoto: jest.fn()}),
  usePreviewOutput: () => ({}),
  isScannedCode: obj => 'value' in obj,
}));

jest.mock('react-native-nitro-ocr', () => ({
  recognize: jest.fn().mockResolvedValue({blocks: []}),
  recognizeText: jest.fn().mockResolvedValue(''),
}));
