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
