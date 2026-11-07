import type {WeightEntry} from '../domain/weight';

/**
 * Where the weigh-ins are kept.
 *
 * Append-only, like the diary: a morning's weight is one record, and the trend
 * reads the whole run. Separate from the diary because they have nothing in
 * common but the word "store" — one is food by the day, the other a single
 * number a few times a week.
 */
export type WeightStore = {
  read: () => Promise<WeightEntry[]>;
  add: (entry: WeightEntry) => Promise<void>;
  /** The same answer as `read`, without the wait. `undefined` means cannot answer. */
  peek?: () => WeightEntry[] | undefined;
};

/**
 * Whether a value read back out is a weigh-in worth counting.
 *
 * A record with no number is dropped rather than read as zero: a zero would
 * crater the trend and read as the best week of someone's life.
 */
export function isWeightEntry(value: unknown): value is WeightEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const e = value as Partial<WeightEntry>;
  return typeof e.date === 'string' && typeof e.kg === 'number';
}
