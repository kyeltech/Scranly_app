import {readingsFrom, sevenDayAverage, trend, weekByWeek} from './weight';
import {fourWeeks} from '../fixtures/weight';

describe('readings from stored weigh-ins', () => {
  it('indexes days from the earliest, so the newest sits highest', () => {
    const entries = [
      {date: '2026-09-01', kg: 82},
      {date: '2026-09-08', kg: 81},
      {date: '2026-09-02', kg: 81.5},
    ];

    // A week and a day apart, counted from 1 September.
    expect(readingsFrom(entries)).toEqual([
      {dayIndex: 0, kg: 82},
      {dayIndex: 7, kg: 81},
      {dayIndex: 1, kg: 81.5},
    ]);
  });

  it('is empty when nothing has been logged', () => {
    expect(readingsFrom([])).toEqual([]);
  });
});

describe('sevenDayAverage', () => {
  it('averages the last seven readings, not the last one', () => {
    // The last seven of the fixture are 80.0, 79.7, 79.8, 79.5, 79.6 and the
    // two before them — 79.8, worked out independently of the code.
    expect(sevenDayAverage(fourWeeks, 27)).toBeCloseTo(79.8, 1);
    // Today's actual reading is lower than the average it sits inside.
    expect(fourWeeks[27].kg).toBe(79.6);
  });
});

describe('trend', () => {
  it('judges the goal on the average rather than on a good morning', () => {
    const t = trend(fourWeeks, 75, 13);

    expect(t.averageKg).toBeCloseTo(79.8, 1);
    expect(t.toGoKg).toBeCloseTo(4.8, 1);
    expect(t.rateKgPerWeek).toBeGreaterThan(0.5);
    expect(t.onTrack).toBe(true);
  });

  it('says behind when the goal needs more than the trend is giving', () => {
    // Same four weeks, but only four weeks left to lose the remaining 4.8 kg.
    const t = trend(fourWeeks, 75, 4);

    expect(t.neededRateKgPerWeek).toBeGreaterThan(t.rateKgPerWeek);
    expect(t.onTrack).toBe(false);
  });
});

describe('week by week', () => {
  it('compares week averages, not two single mornings', () => {
    const weeks = weekByWeek(fourWeeks);

    expect(weeks.map(w => w.label)).toEqual([
      'This week',
      'Last week',
      '2 weeks ago',
      '3 weeks ago',
    ]);
    // Each average is that week's seven readings, so a heavy Sunday cannot
    // make a losing week look like a gaining one.
    expect(weeks[0].averageKg).toBeCloseTo(sevenDayAverage(fourWeeks, 27), 5);
    expect(weeks[1].averageKg).toBeCloseTo(sevenDayAverage(fourWeeks, 20), 5);
  });

  it('shows losses as negative, and leaves the oldest week without a change', () => {
    const weeks = weekByWeek(fourWeeks);

    expect(weeks[0].changeKg).toBeLessThan(0);
    // Nothing behind the oldest week to compare against, and a zero there
    // would read as a week of no progress.
    expect(weeks[3].changeKg).toBeUndefined();
  });

  it('drops a part week rather than averaging four days against seven', () => {
    const tenDays = fourWeeks.filter(r => r.dayIndex >= 18);
    expect(weekByWeek(tenDays).map(w => w.label)).toEqual(['This week']);
  });

  it('survives having nothing to work from', () => {
    expect(weekByWeek([])).toEqual([]);
  });
});
