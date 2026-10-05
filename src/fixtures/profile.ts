import type {Goal, Profile} from '../domain/targets';

/**
 * Kyel. Height is his; age is still a placeholder, and every published figure
 * that depends on it moves when he gives the real one.
 */
export const kyel: Profile = {
  weightKg: 83,
  heightCm: 182,
  ageYears: 32,
  sex: 'male',
  activity: 'light',
};

export const kyelsGoal: Goal = {targetWeightKg: 75, weeks: 13};
