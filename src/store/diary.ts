import type {DiaryEntry} from '../domain/diary';

/**
 * Where the diary is kept.
 *
 * Separate from `SetupStore` rather than folded into it, because the two have
 * nothing in common but the word "store": setup is one small record written
 * once, a diary is an append-only log that grows for as long as the app is
 * used. Sharing a storage strategy would suit one of them and not the other.
 *
 * `read` hands back everything rather than one day's worth. Today needs one
 * day, but the starter rows look across all history and the week note across
 * seven days — so the whole log is what the domain actually asks for.
 */
export type DiaryStore = {
  read: () => Promise<DiaryEntry[]>;
  add: (entry: DiaryEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /**
   * The same answer as `read`, without the wait, for a store that can give one.
   * `undefined` means *cannot answer*, not *nothing logged* — see `SetupStore`.
   */
  peek?: () => DiaryEntry[] | undefined;
};

/**
 * Whether a value read back out is an entry we can count.
 *
 * A record that parses is not yet one worth adding to a day's total: a missing
 * `kcal` would silently read as a day under budget, which is a worse failure
 * than dropping the row.
 */
export function isEntry(value: unknown): value is DiaryEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const e = value as Partial<DiaryEntry>;
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    typeof e.name === 'string' &&
    typeof e.portion === 'string' &&
    typeof e.kcal === 'number' &&
    typeof e.proteinG === 'number' &&
    typeof e.carbsG === 'number' &&
    typeof e.fatG === 'number' &&
    typeof e.meal === 'string'
  );
}
