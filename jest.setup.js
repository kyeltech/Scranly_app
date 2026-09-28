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
 * The camera is native, and its stand-in lives in __mocks__ at the project root
 * rather than here: a jest.mock in a setup file cannot be overridden by one in a
 * test file, and scan/live.test.tsx needs to.
 *
 * The OCR stand-in is there too, for the same reason.
 */
jest.mock('react-native-vision-camera');
jest.mock('@react-native-ml-kit/text-recognition');
