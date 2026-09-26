import {sevenDayAverage, trend} from './weight';
import {fourWeeks} from '../fixtures/weight';

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
