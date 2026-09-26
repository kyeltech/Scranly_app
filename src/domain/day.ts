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

export type DayView = {
  /** 'Tuesday' on today, 'Sunday' on a past day. */
  dayLabel: string;
  kcalTarget: number;
  kcalEaten: number;
  /** Negative once past the budget. The screen shows this number, not zero. */
  kcalRemaining: number;
  macros: MacroView[];
  foods: LoggedFood[];
};
