import type {MealName} from './day';

/**
 * One thing eaten, as it was logged.
 *
 * Flat and keyed by date rather than nested under a day, because a diary is
 * appended to far more often than it is read whole: adding a food is one record,
 * not a read-modify-write of a day.
 *
 * It carries its own macros. `LoggedFood` — what the screen shows — does not,
 * and the fixtures got away with hardcoding the macro totals beside the food
 * list. A real day has to add them up from somewhere.
 */
export type DiaryEntry = {
  id: string;
  /** Which day it belongs to, as an ISO date. */
  date: string;
  name: string;
  /** Who makes it, when the food came from a packet that said so. */
  brand?: string;
  /** How much, as the person logged it: '80 g', '1 medium'. */
  portion: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  meal: MealName;
};
