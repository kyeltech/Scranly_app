/**
 * What the Today screen renders. Everything here is already worked out — the
 * screen does no arithmetic of its own, it just shows what it is handed.
 *
 * For now these come from src/fixtures/days.ts. When `dayState` is built it
 * produces this same shape from a diary and a set of targets, and nothing on
 * the screen has to change.
 */

export type MealName = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

/**
 * The meals, in the order they are eaten.
 *
 * Today draws a section for each, every day, whether or not there is anything
 * in it: the section's + is how the meal gets decided, so an absent section
 * would be a meal you could not log to.
 */
export const MEALS: MealName[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export type LoggedFood = {
  id: string;
  name: string;
  /** How much of it, as the person logged it: '80 g', '1 medium'. */
  portion: string;
  kcal: number;
  meal: MealName;
};

/** One meal's section: what was logged to it, and what it came to. */
export type MealView = {
  name: MealName;
  /** Zero on a meal with nothing in it. */
  kcal: number;
  foods: LoggedFood[];
};

export type MacroKey = 'protein' | 'carbs' | 'fat';

export type MacroView = {
  key: MacroKey;
  label: string;
  eatenG: number;
  targetG: number;
};

/** A one-tap row on a day with nothing on it yet. */
export type Starter = {
  id: string;
  name: string;
  /** Brand and portion: 'Quaker · 40 g'. */
  meta: string;
  kcal: number;
};

export type DayView = {
  /** 'Tuesday' on today, 'Sunday' on a past day. */
  dayLabel: string;
  /** '20 September'. Only a past day carries one — today needs no date. */
  dateLabel?: string;
  /** True on a day that has been and gone. */
  past?: boolean;
  /** The days either side, as the stepper names them: 'Sat 19', 'Mon 21'. */
  neighbours?: {prev: string; next: string};
  /**
   * Where the week stands, when the day alone would mislead. A day over budget
   * inside a week under it is not the same as a week over, and the screen says
   * so rather than leaving one red number to speak for seven days.
   */
  weekNote?: {kcal: number; under: boolean};
  /** What this person usually starts the day with. Only used on an empty day. */
  starters?: Starter[];
  kcalTarget: number;
  kcalEaten: number;
  /** Negative once past the budget. The screen shows this number, not zero. */
  kcalRemaining: number;
  macros: MacroView[];
  /** Always four, in `MEALS` order. The flat list this replaced could not say
      which section a food belonged in. */
  meals: MealView[];
};
