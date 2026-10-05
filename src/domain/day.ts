/**
 * What the Today screen renders. Everything here is already worked out — the
 * screen does no arithmetic of its own, it just shows what it is handed.
 *
 * For now these come from src/fixtures/days.ts. When `dayState` is built it
 * produces this same shape from a diary and a set of targets, and nothing on
 * the screen has to change.
 */

export type MealName = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type LoggedFood = {
  id: string;
  name: string;
  /** How much of it, as the person logged it: '80 g', '1 medium'. */
  portion: string;
  kcal: number;
  meal: MealName;
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
  foods: LoggedFood[];
};
