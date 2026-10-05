/**
 * A build with the camera but no OCR — vision-camera's pod installed and the
 * text recogniser's not.
 *
 * This is not a hypothetical. It is the exact shape of a half-finished
 * `pod install`, and it used to pass every check: the recogniser package's
 * `recognize` is an ordinary JS function that only reaches for the native
 * module when called, so the app believed it could read a label right up until
 * the shutter — the worst moment to find out.
 *
 * `hasLabelReader` is the flag the scan screen reads to decide between the live
 * camera and the drawn stand-in, so it is the flag worth pinning. What it does
 * with each answer is covered in scan/live.test.tsx and native.test.tsx.
 */
import {NativeModules} from 'react-native';

// Requiring the OCR stand-in registers its native module, so that has to have
// happened before this build takes it away again.
require('@react-native-ml-kit/text-recognition');

let withPod: {hasNativeReaders: boolean; hasLabelReader: boolean};
let withoutPod: {hasNativeReaders: boolean; hasLabelReader: boolean};

const readFlags = () => {
  let flags = {hasNativeReaders: false, hasLabelReader: false};
  // native.ts decides this once, at module scope, so each build needs a fresh
  // registry rather than the copy the rest of the suite already loaded.
  jest.isolateModules(() => {
    flags = {
      hasNativeReaders: require('./native').hasNativeReaders,
      hasLabelReader: require('./useReaders').hasLabelReader,
    };
  });
  return flags;
};

beforeAll(() => {
  withPod = readFlags();
  delete (NativeModules as Record<string, unknown>).TextRecognition;
  withoutPod = readFlags();
  require('@react-native-ml-kit/text-recognition').__setOcrNative(true);
});

describe('A build with the camera but no OCR', () => {
  it('still has the camera', () => {
    expect(withoutPod.hasNativeReaders).toBe(true);
  });

  it('knows it cannot read a label, rather than finding out at the shutter', () => {
    expect(withoutPod.hasLabelReader).toBe(false);
  });

  it('is the missing pod that decides it, and nothing else', () => {
    expect(withPod).toEqual({hasNativeReaders: true, hasLabelReader: true});
  });
});
