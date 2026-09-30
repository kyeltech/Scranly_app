import React from 'react';
import {StyleSheet} from 'react-native';
import type {CameraOutput} from 'react-native-vision-camera';
import {visionCamera} from '../readers/native';

/**
 * The live picture, when there is one.
 *
 * The camera comes from `readers/native` rather than a direct import: a static
 * import of a package whose native half is missing takes the app down, and that
 * was the hole a forgotten `pod install` fell through. Here an absent module
 * simply renders nothing and the caller's stand-in shows instead.
 *
 * Deliberately thin — the frame, the hints and the sheets are the viewfinder's,
 * and they sit over this or over the drawn stand-in without knowing which.
 *
 * Tap-to-focus is the library's native gesture rather than a ref and a
 * coordinate conversion of our own: it focuses where the finger lands, in the
 * view's own coordinate system, which is the part that is easy to get subtly
 * wrong. The first real label photo came back too blurred to read, and the
 * shutter had no way of knowing.
 */
export default function Preview({
  outputs,
  torch = false,
  isActive = true,
}: {
  /** The barcode or photo outputs this mode needs. */
  outputs: CameraOutput[];
  torch?: boolean;
  /** False while a sheet covers the picture — a camera nobody sees is battery. */
  isActive?: boolean;
}) {
  const Camera = visionCamera?.Camera;
  if (!Camera) {
    return null;
  }
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device="back"
      isActive={isActive}
      outputs={outputs}
      torchMode={torch ? 'on' : 'off'}
      enableNativeTapToFocusGesture
    />
  );
}
