import React from 'react';
import {Linking} from 'react-native';
import FailureSheet from './FailureSheet';

/**
 * The camera was refused.
 *
 * Not a network failure, but the same shape as one: something did not work and
 * there is a local way on, so it is the same sheet with a different code
 * (`domain/failure.ts`). What is particular to the camera lives here — which
 * way out is honest, and the one piece of platform it needs.
 *
 * `onAsk` is the fix for a button that was drawn and wired to nothing: the
 * permission request now comes down from `useCamera`, and when there is none to
 * offer the sheet drops that button rather than showing one the system will
 * never honour.
 */
export default function CameraRefused({
  /** Ask the system again. Undefined once only Settings can grant it. */
  onAsk,
  onTypeItIn,
  onClose,
}: {
  onAsk?: () => void;
  onTypeItIn?: () => void;
  onClose?: () => void;
}) {
  return (
    <FailureSheet
      failure={{code: 'cameraRefused'}}
      on={{
        // While the app may still ask, the system prompt is the way out; after
        // that it is Settings, and offering both would be offering a button
        // that does nothing.
        ...(onAsk
          ? {allow: onAsk}
          : {
              settings: () => {
                // Some devices refuse. The sheet stays where it is.
                Linking.openSettings().catch(() => {});
              },
            }),
        typeItIn: onTypeItIn,
        close: onClose,
      }}
    />
  );
}
