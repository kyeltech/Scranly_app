import {createMMKV} from 'react-native-mmkv';
import {mmkvStore, SETUP_KEY, storeFailure} from './mmkv';
import {kyel, kyelsGoal} from '../fixtures/profile';

/**
 * The mock's own controls, reached by require the way the OCR tests do: they
 * are not on the real module, and importing them would not type-check once the
 * package is installed.
 */
const mmkvMock = require('react-native-mmkv') as {
  __resetMmkv: () => void;
  __setMmkvNative: (present: boolean) => void;
  __setRaw: (key: string, value: string) => void;
  __getRaw: (key: string) => string;
  __setWriteError: (error: Error) => void;
};

jest.mock('react-native-mmkv');

beforeEach(() => {
  mmkvMock.__resetMmkv();
});

const setup = {profile: kyel, goal: kyelsGoal};

describe('the MMKV store', () => {
  it('has nothing to say on a fresh install', async () => {
    await expect(mmkvStore().read()).resolves.toBeNull();
  });

  it('gives back the setup it was handed', async () => {
    const store = mmkvStore();

    await store.write(setup);

    await expect(store.read()).resolves.toEqual(setup);
  });

  it('survives the process, which is the whole point', async () => {
    await mmkvStore().write(setup);

    // A second store over the same storage: a relaunch, as far as this seam
    // can model one.
    await expect(mmkvStore().read()).resolves.toEqual(setup);
  });

  it('starts over when it is cleared', async () => {
    const store = mmkvStore();
    await store.write(setup);

    await store.clear();

    await expect(store.read()).resolves.toBeNull();
  });

  it('reads as not set up when the record will not parse', async () => {
    mmkvMock.__setRaw(SETUP_KEY, '{"profile":{"weightKg":83,');

    await expect(mmkvStore().read()).resolves.toBeNull();
  });

  it('reads as not set up when the record parses but is not a setup', async () => {
    // An older shape, or a half-written one. Opening Today on this would show
    // targets worked out from nothing.
    mmkvMock.__setRaw(SETUP_KEY, JSON.stringify({profile: {weightKg: 83}}));

    await expect(mmkvStore().read()).resolves.toBeNull();
  });

  it('stores one record, not a field per key', async () => {
    // A setup written field by field can be read back half-applied. One key
    // is either there or it is not.
    await mmkvStore().write(setup);

    expect(JSON.parse(mmkvMock.__getRaw(SETUP_KEY))).toEqual(setup);
  });

  describe('answering without waiting', () => {
    // The reason MMKV was chosen over AsyncStorage: the gate can know which
    // screen to open before anything is drawn, so there is no loading frame
    // and no state that starts out unknown.
    it('gives the saved setup straight back, no promise', async () => {
      await mmkvStore().write(setup);

      expect(mmkvStore().peek?.()).toEqual(setup);
    });

    it('says so, rather than guessing, on a fresh install', () => {
      expect(mmkvStore().peek?.()).toBeNull();
    });

    it('applies the same suspicion as the slow read', () => {
      mmkvMock.__setRaw(SETUP_KEY, 'not json at all');

      expect(mmkvStore().peek?.()).toBeNull();
    });

    it('declines to answer at all when there is no pod, rather than saying empty', () => {
      // Nothing can be told apart here: a missing pod is not the same fact as
      // an empty store, and claiming `null` would send a returning user back
      // through setup on the strength of a build problem.
      mmkvMock.__setMmkvNative(false);

      expect(mmkvStore().peek?.()).toBeUndefined();
    });
  });

  /**
   * The silence that cost a round trip: a build with no pod asked for setup on
   * every launch and said nothing about why. Both ways the store can fail now
   * leave a reason behind.
   */
  describe('saying why it failed', () => {
    it('has no complaint when the storage opened', () => {
      mmkvStore();

      expect(storeFailure()).toBeUndefined();
    });

    it('keeps the native error when the storage will not open', () => {
      mmkvMock.__setMmkvNative(false);

      mmkvStore();

      expect(storeFailure()).toMatch(/not registered/);
    });

    it('names the key it could not write', async () => {
      const store = mmkvStore();
      mmkvMock.__setWriteError(new Error('mmkv: instance is read-only'));

      await expect(store.write(setup)).rejects.toThrow(/read-only/);
    });

    it('forgets the last failure when a later store opens cleanly', () => {
      mmkvMock.__setMmkvNative(false);
      mmkvStore();
      expect(storeFailure()).toBeDefined();

      mmkvMock.__setMmkvNative(true);
      mmkvStore();

      expect(storeFailure()).toBeUndefined();
    });
  });

  describe('when the pod never got installed', () => {
    // The JS half of a nitro module looks perfectly healthy without its pod,
    // and createMMKV throws only when it is called. The app has to boot.
    beforeEach(() => {
      mmkvMock.__setMmkvNative(false);
    });

    it('still builds a store rather than throwing on the way up', () => {
      expect(() => mmkvStore()).not.toThrow();
    });

    it('reads as not set up, so setup is asked rather than nothing shown', async () => {
      await expect(mmkvStore().read()).resolves.toBeNull();
    });

    it('does not crash the app on a write it cannot make', async () => {
      // Losing setup beats taking the app down on the last tap of setup, but
      // it must be a rejection a caller can see and not a silent success.
      await expect(mmkvStore().write(setup)).rejects.toThrow(/not registered/);
    });

    it('does not retry the native module on every call', async () => {
      const store = mmkvStore();
      await store.read();
      await store.read();
      await store.write(setup).catch(() => {});

      // Asked once, on construction. A throwing native call per read is a
      // cost paid on the path that draws the first screen.
      expect(createMMKV).toHaveBeenCalledTimes(1);
    });
  });
});
