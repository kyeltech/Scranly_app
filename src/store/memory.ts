import {isSetup} from './setup';
import type {Setup, SetupStore} from './setup';

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
