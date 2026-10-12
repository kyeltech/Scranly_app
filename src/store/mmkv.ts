import {createMMKV} from 'react-native-mmkv';
import type {MMKV} from 'react-native-mmkv';
import {isSetup} from './setup';
import type {Setup, SetupStore} from './setup';
import {isEntry} from './diary';
import type {DiaryStore} from './diary';
import type {DiaryEntry} from '../domain/diary';
import {isFood} from './foods';
import type {FoodStore} from './foods';
import type {FoodItem} from '../domain/food';

/**
 * One key, holding the whole setup as JSON.
 *
 * A field per key can be read back half-applied — a goal written and the
 * profile lost to a kill between the two writes. One key is either there and
 * complete, or it is not there.
 */
export const SETUP_KEY = 'setup';

/**
 * The whole diary under one key, as a JSON array.
 *
 * A key per day would make a day's read cheaper and keep a write to one day —
 * but the starter rows look across all history and the week note across seven,
 * so the common read is the whole log anyway. Rewriting one array on each add
 * is the honest cost of that, and at a few thousand entries MMKV does not
 * notice. A diary that outgrows this wants SQLite, not a cleverer key scheme.
 */
export const DIARY_KEY = 'diary';

/** The foods this person created, as a JSON array. Same reasoning as the diary. */
export const FOODS_KEY = 'foods';

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
/**
 * Open the storage, or record why it could not be opened.
 *
 * Called once per store rather than once per module so a store built after a
 * failed one still gets a chance — and so the reason is always the current one.
 */
function open(): MMKV | undefined {
  try {
    const storage = createMMKV({id: 'scranly'});
    failure = undefined;
    return storage;
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
    // Loud, because silent is what made this take two builds to find. The most
    // common cause by a distance is a JS reload onto a binary built before
    // `pod install` — the pod is in the lockfile and not in the app.
    console.warn(
      `[scranly] MMKV did not open, so nothing will be remembered: ${failure}`,
    );
    return undefined;
  }
}

export function mmkvStore(): SetupStore {
  const storage = open();

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


/**
 * The diary on disk.
 *
 * Shares `mmkvStore`'s storage instance and its tolerance for a missing pod —
 * see `storeFailure`. The two are separate stores over one MMKV because they
 * have separate lifetimes, not separate files.
 */
export function mmkvDiary(): DiaryStore {
  const storage = open();

  /**
   * Read, parse and vet. A single unusable row is dropped rather than failing
   * the whole diary: one bad record should cost you one meal, not the log. But
   * it is dropped rather than counted as zero, because a zero would read as a
   * day further under budget than it was.
   */
  const current = (store: MMKV): DiaryEntry[] => {
    const raw = store.getString(DIARY_KEY);
    if (raw === undefined) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
    } catch {
      return [];
    }
  };

  const write = (store: MMKV, entries: DiaryEntry[]) => {
    store.set(DIARY_KEY, JSON.stringify(entries));
  };

  return {
    read: async () => (storage === undefined ? [] : current(storage)),

    peek: () => (storage === undefined ? undefined : current(storage)),

    // Rejects rather than resolving quietly: a meal that was not saved is worth
    // knowing about at the moment it is logged.
    add: async entry => {
      if (storage === undefined) {
        throw new Error(failure ?? 'MMKV is not available');
      }
      write(storage, [...current(storage), entry]);
    },

    remove: async id => {
      if (storage === undefined) {
        throw new Error(failure ?? 'MMKV is not available');
      }
      write(storage, current(storage).filter(e => e.id !== id));
    },
  };
}


/**
 * The created foods, on disk.
 *
 * Third store over the same MMKV, for the same reason the diary is separate
 * from setup: different lifetimes, not different files.
 */
export function mmkvFoods(): FoodStore {
  const storage = open();

  const current = (store: MMKV): FoodItem[] => {
    const raw = store.getString(FOODS_KEY);
    if (raw === undefined) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isFood) : [];
    } catch {
      return [];
    }
  };

  return {
    read: async () => (storage === undefined ? [] : current(storage)),
    peek: () => (storage === undefined ? undefined : current(storage)),
    add: async item => {
      if (storage === undefined) {
        throw new Error(failure ?? 'MMKV is not available');
      }
      storage.set(FOODS_KEY, JSON.stringify([...current(storage), item]));
    },
  };
}
