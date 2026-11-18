/**
 * The last release whose what's-new sheet was read.
 *
 * One string, and it has to survive a relaunch or the sheet appears every time
 * the app opens — which is the same reason the setup gate is on disk (ADR-0007).
 * Separate from setup because it has a different lifetime: setup is written once
 * and read forever, this is written once a release.
 */
export type SeenStore = {
  /** The id, or undefined when nothing has been seen — which means a first install. */
  read: () => Promise<string | undefined>;
  write: (id: string) => Promise<void>;
  /**
   * The same answer without the wait. `undefined` from a store that cannot
   * answer is indistinguishable from nothing stored, and deliberately so: both
   * mean "do not show a sheet", which is the safe way to be wrong.
   */
  peek?: () => string | undefined;
};
