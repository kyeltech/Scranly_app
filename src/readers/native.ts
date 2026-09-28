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

type VisionCamera = typeof import('react-native-vision-camera');
type NitroOcr = typeof import('react-native-nitro-ocr');

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

export const nitroOcr = load<NitroOcr>(
  () => require('react-native-nitro-ocr'),
  m => typeof m.recognize === 'function',
);

/** True when the native readers are in this build. */
export const hasNativeReaders = visionCamera !== undefined;
