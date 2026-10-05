/**
 * The seam between the screens and whatever actually reads the world.
 *
 * The scan screens know these types and nothing else. Behind them sits either a
 * real camera (`useReaders`) or the drawn stand-in, and the screens cannot tell
 * which — which is what lets the iOS simulator, with no camera at all, still
 * show every state.
 *
 * ADR-0004 records why each reader is what it is, and that the plate is
 * deliberately still a mock.
 */

import type {LabelReading} from './label';

export type {LabelReading, Nutrient} from './label';

/** What the barcode reader hands back: digits, nothing more. */
export type ScannedBarcode = {
  /** The digits as printed. UPC-A arrives as EAN-13 with a leading zero. */
  value: string;
  /** Which symbology matched, for the kitchen test's benefit. */
  format: string;
};

export type LabelRead = {
  reading: LabelReading;
  /**
   * The rows OCR produced, in order. Kept so a label that reads badly can show
   * its own working — the photo never leaves the phone, so the text is the only
   * way to tell why a read went wrong.
   */
  rows: string[];
};

/** Why the camera is not showing a picture, when it is not. */
export type CameraState =
  | 'ready'
  | 'no-permission'
  /** Asked and refused, and the app can no longer ask — Settings only. */
  | 'refused'
  /** No camera on this device. The iOS simulator, mostly. */
  | 'unavailable'
  /**
   * The native reader is not in this build — a `pod install` or a rebuild that
   * has not happened. Told apart from 'unavailable' because the two look
   * identical on screen and are fixed completely differently.
   */
  | 'no-reader';

/** Why there is no picture, in words the person seeing it can act on. */
export const CAMERA_NOTICE: Record<CameraState, string | undefined> = {
  ready: undefined,
  'no-permission': undefined,
  refused: undefined,
  unavailable: 'No camera on this device — showing an example',
  'no-reader': 'Camera reader not in this build — showing an example',
};
