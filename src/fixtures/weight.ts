import type {Reading} from '../domain/weight';

/** Four weeks of daily readings: noisy day to day, down over the month. */
const KG = [
  82.4, 82.1, 82.5, 82.0, 82.2, 81.8, 82.0, 81.7, 81.9, 81.5, 81.7, 81.3, 81.5,
  81.1, 81.3, 80.9, 81.1, 80.7, 80.9, 80.4, 80.6, 80.1, 79.9, 80.0, 79.7, 79.8,
  79.5, 79.6,
];

export const fourWeeks: Reading[] = KG.map((kg, i) => ({dayIndex: i, kg}));

export const todaysReading = KG[KG.length - 1];
export const yesterdaysReading = KG[KG.length - 2];
