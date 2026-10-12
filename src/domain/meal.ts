import type {MealName} from './day';

/**
 * Which meal it is, by the clock.
 *
 * The meal is normally decided by where you tapped — every section on Today
 * has its own + (PRD flow 2, "Tap + on a meal"). This is for the one way in
 * that has no section behind it: the Log food button at the bottom of the
 * screen. The guess it makes is shown on the screen it opens, so a wrong one
 * is visible rather than silent.
 *
 * The day turns over at four rather than at midnight: food at one in the
 * morning belongs to the night you are still in, and calling it breakfast
 * would put it on the wrong day's first meal.
 */
export function mealAt(now: Date): MealName {
  const hour = now.getHours();

  if (hour >= 22 || hour < 4) {
    return 'Snack';
  }
  if (hour < 11) {
    return 'Breakfast';
  }
  if (hour < 16) {
    return 'Lunch';
  }
  return 'Dinner';
}
