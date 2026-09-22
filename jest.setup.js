/* eslint-env jest */

// Animations and the boot splash need stand-ins outside a real device.
jest.useFakeTimers();

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn(),
}));
