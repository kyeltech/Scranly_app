/**
 * The camera, as Jest sees it.
 *
 * The default is the iOS simulator's situation — permission granted, no device
 * — so every scan test exercises the drawn stand-in and the real reader is only
 * ever exercised on a phone.
 *
 * A test that needs a working camera calls `__setCamera({device: {...}})`
 * rather than re-mocking the module: a jest.mock in a setup file takes
 * precedence over one in a test file, so re-mocking silently does nothing.
 * `__cameraProps` records what the Camera was rendered with.
 */
const state = {
  device: undefined,
  permission: {
    status: 'authorized',
    hasPermission: true,
    canRequestPermission: false,
    requestPermission: jest.fn().mockResolvedValue(true),
  },
};

/** Every render of the Camera, newest last. Cleared by __resetCamera(). */
const cameraProps = [];

module.exports = {
  Camera: props => {
    cameraProps.push(props);
    return null;
  },
  useCameraDevice: () => state.device,
  useCameraPermission: () => state.permission,
  useObjectOutput: () => state.objectOutput ?? {},
  usePhotoOutput: () => state.photoOutput ?? {capturePhoto: jest.fn()},
  usePreviewOutput: () => ({}),
  isScannedCode: object => 'value' in object,

  /** Test helpers. Not part of the real library's surface. */
  __setCamera: next => Object.assign(state, next),
  __cameraProps: cameraProps,
  __resetCamera: () => {
    cameraProps.length = 0;
    state.device = undefined;
    state.objectOutput = undefined;
    state.photoOutput = undefined;
    state.permission = {
      status: 'authorized',
      hasPermission: true,
      canRequestPermission: false,
      requestPermission: jest.fn().mockResolvedValue(true),
    };
  },
};
