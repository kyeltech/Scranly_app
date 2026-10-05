import {dailyPlan} from './targets';

// Kyel, as the worked example in docs/adr/0001-daily-targets.md records him.
const kyel = {
  weightKg: 83,
  heightCm: 182,
  ageYears: 32,
  sex: 'male' as const,
  activity: 'light' as const,
};

describe('dailyPlan', () => {
  it('produces the targets recorded in ADR-0001 for a three-month goal', () => {
    const plan = dailyPlan(kyel, {targetWeightKg: 75, weeks: 13});

    expect(plan.targets).toEqual({
      kcal: 1815,
      proteinG: 146,
      fatG: 54,
      fibreG: 25,
      carbsG: 186,
    });
  });

  it('caps a goal asking for more than 1% of body weight a week', () => {
    const plan = dailyPlan(kyel, {targetWeightKg: 75, weeks: 4});

    expect(plan.capped).toBe(true);
    expect(plan.requestedRateKgPerWeek).toBeCloseTo(2.0, 2);
    expect(plan.rateKgPerWeek).toBeCloseTo(0.83, 2);
    // It reports the date the capped rate reaches, not the one that was asked for.
    expect(plan.weeksToGoal).toBeCloseTo(9.6, 1);
    expect(plan.targets.kcal).toBe(1579);
  });
});
