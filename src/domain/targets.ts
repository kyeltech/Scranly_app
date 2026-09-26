/**
 * Daily targets — calories and the four macros.
 *
 * The method, and why it is this method rather than bodyweight alone, is
 * recorded in docs/adr/0001-daily-targets.md. Change the numbers here and
 * that ADR is wrong; change them in both or in neither.
 */

export type Sex = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'very';

export type Profile = {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
  activity: Activity;
};

/** Where they are heading, and by when. A goal without a date cannot make a target. */
export type Goal = {
  targetWeightKg: number;
  weeks: number;
};

export type Targets = {
  kcal: number;
  proteinG: number;
  /** Fibre is a slice inside this, not a separate macro on top of it. */
  carbsG: number;
  fatG: number;
  fibreG: number;
};

export type Plan = {
  /** What the goal and date asked for, before any cap. */
  requestedRateKgPerWeek: number;
  /** What the app will actually aim for. */
  rateKgPerWeek: number;
  /** True when the request was faster than the cap and has been held back. */
  capped: boolean;
  /** How long the goal takes at the rate actually used. */
  weeksToGoal: number;
  targets: Targets;
};

/** Multipliers turning resting expenditure into daily expenditure. Convention, not a validated standard. */
const ACTIVITY: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
};

/** A rule of thumb. Published values run 7,000–7,700, which is why step 7 of the ADR exists. */
const KCAL_PER_KG_OF_FAT = 7700;

/** Losing faster than 1% of body weight a week costs muscle. The app caps rather than obeys. */
const MAX_RATE_FRACTION = 0.01;

/** Kyel's conversion. Deliberately 2.2, not 2.20462 — the macro layer is his, worked in round pounds. */
const LB_PER_KG = 2.2;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** Mifflin–St Jeor resting rate, times the activity multiplier. */
export function maintenanceKcal(profile: Profile): number {
  const {weightKg, heightCm, ageYears, sex, activity} = profile;
  const resting =
    10 * weightKg + 6.25 * heightCm - 5 * ageYears + (sex === 'male' ? 5 : -161);
  return resting * ACTIVITY[activity];
}

export function dailyPlan(profile: Profile, goal: Goal): Plan {
  const maintenance = maintenanceKcal(profile);

  const requestedRateKgPerWeek =
    (profile.weightKg - goal.targetWeightKg) / goal.weeks;
  const rateKgPerWeek = Math.min(
    requestedRateKgPerWeek,
    profile.weightKg * MAX_RATE_FRACTION,
  );
  const capped = rateKgPerWeek < requestedRateKgPerWeek;
  const weeksToGoal =
    (profile.weightKg - goal.targetWeightKg) / rateKgPerWeek;
  const kcal = Math.round(
    maintenance - (rateKgPerWeek * KCAL_PER_KG_OF_FAT) / 7,
  );

  const lb = Math.round(profile.weightKg * LB_PER_KG);
  const proteinG = Math.floor(lb * 0.8);
  const fatG = clamp(
    Math.floor(lb * 0.3),
    Math.round((kcal * 0.2) / 9),
    Math.round((kcal * 0.35) / 9),
  );
  const fibreG = Math.floor((kcal / 1000) * 14);
  const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);

  return {
    requestedRateKgPerWeek,
    rateKgPerWeek,
    capped,
    weeksToGoal,
    targets: {kcal, proteinG, carbsG, fatG, fibreG},
  };
}
