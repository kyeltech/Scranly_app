/**
 * Loading the native readers, tolerantly.
 *
 * A native module is only there if the native build put it there. Miss a
 * `pod install` and the JS package is present while the native side is not,
 * and importing it normally takes the whole app down with a white screen —
 * which is what happened, and is a worse failure than having no camera.
 *
 * So the modules are loaded and checked at startup, once. Absent, the app
 * behaves exactly as it does on the iOS simulator: no camera, drawn stand-in,
 * every screen still reachable. A broken build should cost you the scanner, not
 * the app.
 */

import {NativeModules} from 'react-native';
import type {MlKitResult} from './mlkit';

type VisionCamera = typeof import('react-native-vision-camera');
/**
 * The OCR module's default export. Typed here rather than imported from the
 * package so a build without it stays a compile-time non-event.
 */
type TextRecogniser = {
  recognize: (imageUrl: string, script?: string) => Promise<MlKitResult>;
};
/**
 * Requires a module and satisfies itself that the native half arrived, by
 * checking for something only the real one has. A module that throws on import,
 * or comes back half-built, counts as absent.
 */
function load<T>(require_: () => unknown, has: (m: T) => boolean): T | undefined {
  try {
    const module_ = require_() as T;
    return module_ && has(module_) ? module_ : undefined;
  } catch {
    return undefined;
  }
}

export const visionCamera = load<VisionCamera>(
  () => require('react-native-vision-camera'),
  m => typeof m.useCameraPermission === 'function',
);

/**
 * The package exports the recogniser as a default, so the interop shape is
 * `{default: {recognize}}` — checked rather than assumed, because a half-built
 * module is exactly what a missing pod looks like.
 *
 * And checking the JS shape is not enough on its own. This package's `recognize`
 * is an ordinary function that reaches for `NativeModules.TextRecognition` only
 * when called, so with the pod missing it still looks like a working reader and
 * fails at the shutter instead — the worst possible moment. The native module
 * itself is the honest test, so that is what is asked for.
 */
export const textRecogniser = load<{default?: TextRecogniser} & TextRecogniser>(
  () => require('@react-native-ml-kit/text-recognition'),
  m =>
    typeof (m.default ?? m).recognize === 'function' &&
    NativeModules.TextRecognition != null,
);

/** Whichever of the two shapes the bundler handed back. */
export const ocr: TextRecogniser | undefined = textRecogniser
  ? textRecogniser.default ?? textRecogniser
  : undefined;

/** True when the camera is in this build. The OCR is separate — see `ocr`. */
export const hasNativeReaders = visionCamera !== undefined;
