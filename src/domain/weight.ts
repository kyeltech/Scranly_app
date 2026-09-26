/** Weight readings, the trend through them, and whether the goal is on pace. */

export type Reading = {
  /** Days ago: 0 is today. */
  dayIndex: number;
  kg: number;
};

export type Trend = {
  /** The 7-day average, which is the number the app judges you on. */
  averageKg: number;
  startKg: number;
  toGoKg: number;
  /** What the trend is actually doing. */
  rateKgPerWeek: number;
  /** What the goal needs from here. */
  neededRateKgPerWeek: number;
  onTrack: boolean;
  weeksRemaining: number;
};

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** A single morning tells you nothing; seven of them tell you everything. */
export function sevenDayAverage(readings: Reading[], endIndex: number): number {
  const window = readings.filter(
    r => r.dayIndex <= endIndex && r.dayIndex > endIndex - 7,
  );
  return window.length ? mean(window.map(r => r.kg)) : NaN;
}

export function trend(
  readings: Reading[],
  goalKg: number,
  weeksRemaining: number,
): Trend {
  const sorted = [...readings].sort((a, b) => a.dayIndex - b.dayIndex);
  const last = sorted[sorted.length - 1].dayIndex;
  const first = sorted[0].dayIndex;

  const averageKg = sevenDayAverage(sorted, last);
  const startKg = sevenDayAverage(sorted, first + 6);
  const spanWeeks = (last - (first + 6)) / 7;

  const rateKgPerWeek = spanWeeks > 0 ? (startKg - averageKg) / spanWeeks : 0;
  const toGoKg = averageKg - goalKg;
  const neededRateKgPerWeek = weeksRemaining > 0 ? toGoKg / weeksRemaining : 0;

  return {
    averageKg,
    startKg,
    toGoKg,
    rateKgPerWeek,
    neededRateKgPerWeek,
    // A hair under still counts — the alternative is an app that cries wolf.
    onTrack: rateKgPerWeek >= neededRateKgPerWeek * 0.95,
    weeksRemaining,
  };
}

export type Week = {
  /** 'This week', 'Last week', '2 weeks ago'. */
  label: string;
  /** That week's 7-day average — the only weight worth comparing. */
  averageKg: number;
  /**
   * Change on the week before. Negative is loss. Undefined on the oldest week
   * shown, because there is nothing behind it to compare against — and an
   * invented zero there would read as a week of no progress.
   */
  changeKg?: number;
};

/**
 * The last few weeks, newest first. Week averages rather than week-end readings:
 * comparing two single mornings measures what you drank, not what you lost.
 */
export function weekByWeek(readings: Reading[], weeks = 4): Week[] {
  const sorted = [...readings].sort((a, b) => a.dayIndex - b.dayIndex);
  if (!sorted.length) {
    return [];
  }
  const last = sorted[sorted.length - 1].dayIndex;
  const first = sorted[0].dayIndex;

  const averages: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const end = last - i * 7;
    // Only a full week counts. A part-week average is not comparable.
    if (end - 6 < first) {
      break;
    }
    averages.push(sevenDayAverage(sorted, end));
  }

  return averages.map((averageKg, i) => ({
    label: i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i} weeks ago`,
    averageKg,
    changeKg:
      i + 1 < averages.length ? averageKg - averages[i + 1] : undefined,
  }));
}
