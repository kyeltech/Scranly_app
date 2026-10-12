import {isSetup} from './setup';
import type {Setup, SetupStore} from './setup';
import type {DiaryStore} from './diary';
import type {DiaryEntry} from '../domain/diary';
import type {FoodStore} from './foods';
import type {FoodItem} from '../domain/food';

/**
 * Setup held in memory for the lifetime of the process.
 *
 * The dynamic mock the rest of the app is built on until Kyel picks a real
 * store (ADR-0007). It honours the whole contract, so everything above it —
 * the gate, the write on finishing setup — is finished work; swapping in
 * AsyncStorage or MMKV is this one file, not a change to the app.
 *
 * What it does not do is survive a launch. That is the half waiting on the
 * decision, not a gap in the seam.
 */
export function memoryStore(initial?: Setup): SetupStore {
  let held: Setup | null = isSetup(initial) ? copy(initial) : null;

  return {
    read: async () => (held === null ? null : copy(held)),
    write: async setup => {
      held = copy(setup);
    },
    clear: async () => {
      held = null;
    },
  };
}

/**
 * A real store serialises, so a caller cannot reach back in and change what was
 * saved. The mock copies to behave the same way — otherwise code that only
 * works because it is sharing an object passes here and breaks on the real one.
 */
function copy(setup: Setup): Setup {
  return {profile: {...setup.profile}, goal: {...setup.goal}};
}

/**
 * The diary, held in memory for the lifetime of the process.
 *
 * The same standing as `memoryStore`: a complete implementation of the
 * contract, and the one a screen walked on its own gets so that opening a
 * board cannot write to the real diary.
 */
export function memoryDiary(initial: DiaryEntry[] = []): DiaryStore {
  let held: DiaryEntry[] = initial.map(copyEntry);

  return {
    read: async () => held.map(copyEntry),
    peek: () => held.map(copyEntry),
    add: async entry => {
      held = [...held, copyEntry(entry)];
    },
    remove: async id => {
      held = held.filter(e => e.id !== id);
    },
  };
}

/**
 * Copied on the way in and on the way out. A real store serialises, so neither
 * the caller nor the reader can reach back and change what was logged — and
 * code that only works because it is sharing an object would pass here and
 * break on the real one.
 */
function copyEntry(entry: DiaryEntry): DiaryEntry {
  return {...entry};
}

/** The foods this person created, held in memory. Same standing as the others. */
export function memoryFoods(initial: FoodItem[] = []): FoodStore {
  let held: FoodItem[] = initial.map(f => ({...f}));

  return {
    read: async () => held.map(f => ({...f})),
    peek: () => held.map(f => ({...f})),
    add: async item => {
      held = [...held, {...item}];
    },
  };
}
