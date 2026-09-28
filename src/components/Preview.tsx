import React from 'react';
import {StyleSheet} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import type {CameraOutput} from 'react-native-vision-camera';

/**
 * The live picture, when there is one.
 *
 * Deliberately thin: it renders the camera and nothing else. The frame, the
 * hints and the sheets are the viewfinder's, and they sit over this or over the
 * drawn stand-in without knowing which.
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
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device="back"
      isActive={isActive}
      outputs={outputs}
      torchMode={torch ? 'on' : 'off'}
    />
  );
}
