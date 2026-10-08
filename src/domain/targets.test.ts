import {dailyPlan, maintenanceKcal} from './targets';

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

/**
 * The other half of Mifflin–St Jeor.
 *
 * The formula's sex term is +5 or −161, and only the +5 side had ever run — so
 * a sign error on the other branch would have shipped. The app is for Kyel
 * first and friends after, and those friends are not all male.
 */
describe('maintenanceKcal, both sexes', () => {
  const base = {weightKg: 83, heightCm: 182, ageYears: 32, activity: 'light' as const};

  it('is 166 kcal lower for a female profile, before the activity multiplier', () => {
    const male = maintenanceKcal({...base, sex: 'male'});
    const female = maintenanceKcal({...base, sex: 'female'});

    // 5 − (−161) = 166, scaled by the shared activity multiplier of 1.375.
    expect(male - female).toBeCloseTo(166 * 1.375, 6);
    expect(female).toBeLessThan(male);
  });

  it('gives a female profile a lower calorie target for the same goal', () => {
    const male = dailyPlan({...base, sex: 'male'}, {targetWeightKg: 75, weeks: 13});
    const female = dailyPlan({...base, sex: 'female'}, {targetWeightKg: 75, weeks: 13});

    expect(female.targets.kcal).toBeLessThan(male.targets.kcal);
    // Protein is set from body weight, not from the energy budget, so it holds.
    expect(female.targets.proteinG).toBe(male.targets.proteinG);
  });

  it('rises with activity, in the documented order', () => {
    const at = (activity: 'sedentary' | 'light' | 'moderate' | 'very') =>
      maintenanceKcal({...base, sex: 'male', activity});

    expect(at('sedentary')).toBeLessThan(at('light'));
    expect(at('light')).toBeLessThan(at('moderate'));
    expect(at('moderate')).toBeLessThan(at('very'));
  });
});
