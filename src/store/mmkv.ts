import {createMMKV} from 'react-native-mmkv';
import type {MMKV} from 'react-native-mmkv';
import {isSetup} from './setup';
import type {Setup, SetupStore} from './setup';

/**
 * One key, holding the whole setup as JSON.
 *
 * A field per key can be read back half-applied — a goal written and the
 * profile lost to a kill between the two writes. One key is either there and
 * complete, or it is not there.
 */
export const SETUP_KEY = 'setup';

/**
 * Why the last `mmkvStore()` could not open its storage, or `undefined` if it
 * could.
 *
 * A nitro module's JS half looks perfectly healthy in a build whose pod never
 * got installed, and the first version of this store swallowed that: setup ran
 * on every launch and the app said nothing about why. The reason is kept here
 * so a dev build can show it.
 *
 * Process-level on purpose. Whether the native module is there is a fact about
 * the build, not about one store instance.
 */
let failure: string | undefined;

export function storeFailure(): string | undefined {
  return failure;
}

/**
 * Setup kept on disk by MMKV, which is what makes the gate survive a relaunch
 * (ADR-0007).
 *
 * MMKV is a nitro module, and the JS half of one looks perfectly healthy in a
 * build whose pod never got installed — `createMMKV` throws when it is called,
 * not when it is imported. So it is called once, here, behind a try: a missing
 * pod costs the app its memory of setup, not its ability to start.
 */
export function mmkvStore(): SetupStore {
  let storage: MMKV | undefined;
  try {
    storage = createMMKV({id: 'scranly'});
    failure = undefined;
  } catch (error) {
    storage = undefined;
    failure = error instanceof Error ? error.message : String(error);
    // Loud, because silent is what made this take two builds to find. The most
    // common cause by a distance is a JS reload onto a binary built before
    // `pod install` — the pod is in the lockfile and not in the app.
    console.warn(
      `[scranly] MMKV did not open, so setup will be asked on every launch: ${failure}`,
    );
  }

  /**
   * Read and vet the record. A record that parses is not yet a setup it is safe
   * to open Today on: it may be an older shape, or one written by a release
   * that was half way through a rename.
   */
  const current = (store: MMKV): Setup | null => {
    const raw = store.getString(SETUP_KEY);
    if (raw === undefined) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return isSetup(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  return {
    read: async () => (storage === undefined ? null : current(storage)),

    // Synchronous, which is the whole reason for MMKV over AsyncStorage. With
    // no pod there is nothing to read, and `undefined` says so — a store that
    // cannot answer is not a store that is empty.
    peek: () => (storage === undefined ? undefined : current(storage)),

    // Rejects rather than resolving quietly. Losing setup beats taking the app
    // down on the last tap of setup, so the caller still decides what to do —
    // but it has to be told, or this is the same silence again.
    write: async setup => {
      if (storage === undefined) {
        throw new Error(failure ?? 'MMKV is not available');
      }
      storage.set(SETUP_KEY, JSON.stringify(setup));
    },

    clear: async () => {
      storage?.remove(SETUP_KEY);
    },
  };
}
