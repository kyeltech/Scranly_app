import {useCallback, useEffect, useMemo, useState} from 'react';
import type {
  CameraOutput,
  ScannedObject,
  ScannedObjectType,
} from 'react-native-vision-camera';
import {ocr, visionCamera} from './native';
import {parseLabel} from './label';
import {asImageUrl, rowsFromMlKit} from './mlkit';
import type {CameraState, LabelRead, ScannedBarcode} from './index';

/**
 * The real readers, on the real camera — when this build has one.
 *
 * Every export here has two forms, chosen once at startup: the native one, and
 * a stub for a build without the native modules. The choice is made at module
 * scope rather than inside a component, so the hooks a component calls never
 * change between renders.
 *
 * Nothing here decides what a screen shows. It reports what the camera can do
 * and hands back what it read; the screen draws the stand-in when the answer is
 * 'unavailable', which is what the simulator and a half-built app both get.
 */

/**
 * The symbologies on British food packaging. EAN-13 is retail, EAN-8 is small
 * packs, UPC-E covers imports, Code 128 the occasional own-brand. Deliberately
 * not everything the library offers: every extra format is another chance to
 * match the wrong thing — a Data Matrix on a delivery sticker, say.
 *
 * No UPC-A: a 12-digit US code arrives as EAN-13 with a leading zero, which the
 * lookup has to allow for.
 */
const FOOD_CODES: ScannedObjectType[] = ['ean-13', 'ean-8', 'upc-e', 'code-128'];

/* ------------------------------------------------------------------ *
 * With the native modules                                            *
 * ------------------------------------------------------------------ */

function useNativeCameraState(): CameraState {
  const {hasPermission, canRequestPermission, requestPermission} =
    visionCamera!.useCameraPermission();
  const device = visionCamera!.useCameraDevice('back');

  // Ask once, on the way in. A refusal is a designed state, not an error.
  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  if (!hasPermission) {
    return canRequestPermission ? 'no-permission' : 'refused';
  }
  return device ? 'ready' : 'unavailable';
}

function useNativeBarcodeReader(
  onRead: (code: ScannedBarcode) => void,
  enabled: boolean,
) {
  /**
   * The same code stays in frame for as long as you hold the phone there, so the
   * reader fires again and again. One read per scanner, and the screen moves on.
   */
  const [seen, setSeen] = useState<string | undefined>();

  const handle = useCallback(
    (objects: ScannedObject[]) => {
      if (!enabled) {
        return;
      }
      for (const object of objects) {
        if (visionCamera!.isScannedCode(object) && object.value) {
          if (object.value === seen) {
            return;
          }
          setSeen(object.value);
          onRead({value: object.value, format: object.type});
          return;
        }
      }
    },
    [onRead, enabled, seen],
  );

  // A new aiming pass is a new chance at the same barcode.
  useEffect(() => {
    if (!enabled) {
      setSeen(undefined);
    }
  }, [enabled]);

  return visionCamera!.useObjectOutput({types: FOOD_CODES, onObjectsScanned: handle});
}

function useNativeLabelReader() {
  const photoOutput = visionCamera!.usePhotoOutput({qualityPrioritization: 'quality'});
  const [reading, setReading] = useState(false);

  const capture = useCallback(async (): Promise<LabelRead> => {
    setReading(true);
    const photo = await photoOutput.capturePhoto({}, {});
    try {
      // A temporary file, so no filesystem library is needed. The photo is read
      // on this device and never sent anywhere.
      const path = await photo.saveToTemporaryFileAsync();
      // A temporary file read on this device. Nothing is uploaded.
      const result = await ocr!.recognize(asImageUrl(path));
      const rows = rowsFromMlKit(result);
      return {reading: parseLabel(rows), rows};
    } finally {
      photo.dispose();
      setReading(false);
    }
  }, [photoOutput]);

  return useMemo(() => ({photoOutput, capture, reading}), [photoOutput, capture, reading]);
}

/* ------------------------------------------------------------------ *
 * Without them                                                       *
 * ------------------------------------------------------------------ */

/** No native module at all: a different problem from no camera, and says so. */
const NO_CAMERA = () => 'no-reader' as CameraState;
const NO_OUTPUT = () => undefined;
const NO_LABEL_READER = () => ({
  photoOutput: undefined,
  capture: () => Promise.reject(new Error('No camera in this build')),
  reading: false,
});

/* ------------------------------------------------------------------ *
 * Whichever this build has                                           *
 * ------------------------------------------------------------------ */

export const useCameraState = visionCamera ? useNativeCameraState : NO_CAMERA;

/**
 * Whether this build can read a label at all. Separate from the camera, because
 * they fail separately: with no OCR library the barcode reader is still live and
 * only the label mode falls back to its drawn stand-in. Saying 'no camera' there
 * would be a lie — the camera is fine, the reader is missing.
 */
export const hasLabelReader = visionCamera !== undefined && ocr !== undefined;

export const useBarcodeReader: (
  onRead: (code: ScannedBarcode) => void,
  enabled: boolean,
) => CameraOutput | undefined = visionCamera ? useNativeBarcodeReader : NO_OUTPUT;

export const useLabelReader: () => {
  photoOutput: CameraOutput | undefined;
  capture: () => Promise<LabelRead>;
  reading: boolean;
} = visionCamera && ocr ? useNativeLabelReader : NO_LABEL_READER;

/**
 * The outputs a mode needs, minus any the build does not have. Only ever called
 * where the camera is ready, so in practice nothing is dropped — but the types
 * stay honest about a build without the native modules.
 */
export function outputsOf(
  ...outputs: (CameraOutput | undefined)[]
): CameraOutput[] {
  return outputs.filter((output): output is CameraOutput => output !== undefined);
}
