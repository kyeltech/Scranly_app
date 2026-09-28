import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  isScannedCode,
  useCameraDevice,
  useCameraPermission,
  useObjectOutput,
  usePhotoOutput,
} from 'react-native-vision-camera';
import type {ScannedObject, ScannedObjectType} from 'react-native-vision-camera';
import {recognize} from 'react-native-nitro-ocr';
import {parseLabel} from './label';
import {linesOf, toRows} from './rows';
import type {CameraState, LabelRead, ScannedBarcode} from './index';

/**
 * The real readers, on the real camera.
 *
 * Nothing in here decides what a screen shows — it reports what the camera can
 * do and hands back what it read. A screen with no camera gets
 * `state: 'unavailable'` and draws the stand-in instead, which is the whole
 * arrangement that keeps the simulator useful.
 */

/**
 * The symbologies on British food packaging. EAN-13 is retail; EAN-8 is small
 * packs; UPC-E covers imports. Deliberately not everything the library offers:
 * every extra format is another chance to match the wrong thing.
 *
 * Note there is no UPC-A — a 12-digit US code comes back as EAN-13 with a
 * leading zero, which the lookup has to allow for.
 */
const FOOD_CODES: ScannedObjectType[] = ['ean-13', 'ean-8', 'upc-e', 'code-128'];

export function useCameraState(): CameraState {
  const {hasPermission, canRequestPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

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

/** The live barcode reader. Reads on its own, as the design promises. */
export function useBarcodeReader(
  onRead: (code: ScannedBarcode) => void,
  enabled: boolean,
) {
  const handle = useCallback(
    (objects: ScannedObject[]) => {
      if (!enabled) {
        return;
      }
      for (const object of objects) {
        if (isScannedCode(object) && object.value) {
          onRead({value: object.value, format: object.type});
          return;
        }
      }
    },
    [onRead, enabled],
  );

  return useObjectOutput({types: FOOD_CODES, onObjectsScanned: handle});
}

/**
 * The label reader: shutter, then read. Not a live frame processor — the design
 * has a shutter button, and a nutrition panel wants one steady frame rather
 * than thirty hurried ones.
 */
export function useLabelReader() {
  const photoOutput = usePhotoOutput({qualityPrioritization: 'quality'});
  const [reading, setReading] = useState(false);

  const capture = useCallback(async (): Promise<LabelRead> => {
    setReading(true);
    const photo = await photoOutput.capturePhoto({}, {});
    try {
      // A temporary file, so no filesystem library is needed. The photo is read
      // on this device and never sent anywhere.
      const path = await photo.saveToTemporaryFileAsync();
      const result = await recognize(path, {
        recognitionLevel: 'accurate',
        languageCorrection: false, // Correction mangles '34.9g' into words.
      });
      const rows = toRows(linesOf(result));
      return {reading: parseLabel(rows), rows};
    } finally {
      photo.dispose();
      setReading(false);
    }
  }, [photoOutput]);

  return useMemo(() => ({photoOutput, capture, reading}), [photoOutput, capture, reading]);
}
