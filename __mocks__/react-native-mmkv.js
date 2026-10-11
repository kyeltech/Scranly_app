/**
 * MMKV, standing still.
 *
 * It lives in __mocks__ at the project root rather than in jest.setup.js for the
 * same reason the camera and the OCR do: a jest.mock in a setup file cannot be
 * overridden by one in a test file.
 *
 * The default is a working, empty store. A test that cares about a corrupt
 * record writes one with __setRaw, and __setMmkvNative(false) is the build whose
 * pod never got installed — createMMKV throws there, which is the case that
 * decides whether a missing pod takes the whole app down or just the gate.
 */
const state = {native: true, data: new Map(), writeError: undefined};

const createMMKV = jest.fn(() => {
  if (!state.native) {
    throw new Error(
      'NitroModules: HybridObject "MMKVFactory" is not registered.',
    );
  }
  return {
    set: (key, value) => {
      if (state.writeError) {
        throw state.writeError;
      }
      state.data.set(key, String(value));
    },
    getString: key => state.data.get(key),
    remove: key => state.data.delete(key),
    clearAll: () => state.data.clear(),
    contains: key => state.data.has(key),
    getAllKeys: () => [...state.data.keys()],
  };
});

module.exports = {
  __esModule: true,
  createMMKV,
  /** Put a raw string under a key, to stand in for a record we cannot parse. */
  __setRaw: (key, value) => {
    state.data.set(key, value);
  },
  __getRaw: key => state.data.get(key),
  /** A storage that refuses writes: read-only instance, full disk, empty key. */
  __setWriteError: error => {
    state.writeError = error;
  },
  /** Whether this build got its pod. */
  __setMmkvNative: present => {
    state.native = present;
  },
  __resetMmkv: () => {
    state.native = true;
    state.writeError = undefined;
    state.data.clear();
    createMMKV.mockClear();
  },
};
