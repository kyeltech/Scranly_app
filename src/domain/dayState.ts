import {MEALS} from './day';
import type {DayView, LoggedFood, MacroView, MealView, Starter} from './day';
import type {DiaryEntry} from './diary';
import type {Targets} from './targets';
import {isoDate} from './calendar';
import type {DayMark} from './calendar';

/**
 * A day, worked out from the diary.
 *
 * This is the function `domain/day.ts` said would replace `fixtures/days.ts`:
 * it produces the same `DayView` from real entries and a set of targets, so
 * Today renders it without knowing anything changed.
 *
 * Pure on purpose. No store, no React, no clock of its own — the date and
 * today are both passed in, which is what makes every case below testable
 * without waiting for a particular day of the week to come round.
 */
export function dayState(
  entries: DiaryEntry[],
  targets: Targets,
  iso: string,
  today: Date,
): DayView {
  const onThisDay = entries.filter(e => e.date === iso);

  const kcalEaten = sum(onThisDay, e => e.kcal);

  return {
    ...labels(iso, today),
    kcalTarget: targets.kcal,
    kcalEaten,
    // Negative past the budget. The screen shows this number, not zero.
    kcalRemaining: targets.kcal - kcalEaten,
    macros: [
      macro('protein', 'PROTEIN', sum(onThisDay, e => e.proteinG), targets.proteinG),
      macro('carbs', 'CARBS', sum(onThisDay, e => e.carbsG), targets.carbsG),
      macro('fat', 'FAT', sum(onThisDay, e => e.fatG), targets.fatG),
    ],
    meals: mealsFrom(onThisDay.map(asLoggedFood)),
    starters: onThisDay.length === 0 ? startersFrom(entries) : undefined,
    // Only when the day alone would mislead — which is when it is over.
    weekNote:
      kcalEaten > targets.kcal ? weekNoteFor(entries, targets, iso) : undefined,
  };
}

/**
 * The day in four sections, each with its own total.
 *
 * Every meal is here whether or not it has food in it, because the section is
 * what you tap to log to that meal — and the totals are worked out here rather
 * than on the screen, which does no arithmetic of its own.
 */
export function mealsFrom(foods: LoggedFood[]): MealView[] {
  return MEALS.map(name => {
    const eaten = foods.filter(f => f.meal === name);
    return {
      name,
      kcal: eaten.reduce((total, f) => total + f.kcal, 0),
      foods: eaten,
    };
  });
}

/** How many days back the week note looks, today included. */
const WEEK = 7;

/**
 * Where the week stands, for a day that has gone over.
 *
 * One red number cannot speak for seven days: a day over inside a week under is
 * not a week over, and saying so is the difference between a useful number and
 * a telling-off.
 *
 * **An unlogged day is not a day you ate nothing.** Comparing a week's food
 * against seven days of budget would tell someone two days into using Scranly
 * that they were thousands under, off the back of five days they simply did not
 * log — and that reads as permission to eat. So the budget is counted per day
 * that actually has food against it.
 */
function weekNoteFor(
  entries: DiaryEntry[],
  targets: Targets,
  iso: string,
): DayView['weekNote'] {
  const window = daysBack(iso, WEEK);
  const inWeek = entries.filter(e => window.has(e.date));

  // At least one: this is only reached on a day that has gone over, so that
  // day is logged and inside the window.
  const loggedDays = new Set(inWeek.map(e => e.date)).size;

  const eaten = sum(inWeek, e => e.kcal);
  const budget = targets.kcal * loggedDays;

  return {kcal: Math.abs(eaten - budget), under: eaten < budget};
}

/** The ISO dates of the `count` days ending on `iso`, that day included. */
function daysBack(iso: string, count: number): Set<string> {
  const end = parseIso(iso);
  const dates = new Set<string>();
  for (let back = 0; back < count; back++) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - back);
    dates.add(isoDate(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return dates;
}

/** At most this many one-tap rows, so an empty day stays a short list. */
const MOST_STARTERS = 3;

/**
 * What this person actually starts the day with, most-logged first.
 *
 * The fixture invented three. Derived from the diary they are real, which
 * carries one consequence worth stating: a brand-new diary offers none, and the
 * empty day falls back to the Log food button alone. An invented list would be
 * worse — it would be a suggestion to eat something you have never eaten.
 */
function startersFrom(entries: DiaryEntry[]): Starter[] | undefined {
  const byName = new Map<string, {entry: DiaryEntry; count: number}>();

  for (const e of entries) {
    if (e.meal !== 'Breakfast') {
      continue;
    }
    const seen = byName.get(e.name);
    if (seen) {
      seen.count += 1;
    } else {
      byName.set(e.name, {entry: e, count: 1});
    }
  }

  if (byName.size === 0) {
    return undefined;
  }

  return [...byName.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, MOST_STARTERS)
    .map(({entry: e}) => ({
      id: e.id,
      name: e.name,
      // 'Quaker · 40 g', or just the portion when the food had no brand.
      meta: e.brand ? `${e.brand} · ${e.portion}` : e.portion,
      kcal: e.kcal,
    }));
}

function sum(entries: DiaryEntry[], of: (e: DiaryEntry) => number): number {
  return entries.reduce((total, e) => total + of(e), 0);
}

function macro(
  key: MacroView['key'],
  label: string,
  eatenG: number,
  targetG: number,
): MacroView {
  return {key, label, eatenG, targetG};
}

/** The entry as the screen shows it: no macros, because the rows do not show them. */
function asLoggedFood(e: DiaryEntry): LoggedFood {
  return {id: e.id, name: e.name, portion: e.portion, kcal: e.kcal, meal: e.meal};
}

/* ------------------------------------------------------------------ *
 * What the date means                                                 *
 * ------------------------------------------------------------------ */

const WEEKDAY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** 'Sat 19', as the past-day stepper names the day either side. */
function shortLabel(d: Date): string {
  return `${WEEKDAY[d.getDay()].slice(0, 3)} ${d.getDate()}`;
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  // Local parts, not Date.parse, which reads a bare date string as UTC.
  return new Date(y, m - 1, d);
}

function labels(iso: string, today: Date) {
  const date = parseIso(iso);
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday = iso === todayIso;

  const before = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  const after = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  return {
    dayLabel: WEEKDAY[date.getDay()],
    // Today needs no date; a day you navigated to does.
    dateLabel: isToday ? undefined : `${date.getDate()} ${MONTH[date.getMonth()]}`,
    past: !isToday,
    neighbours: isToday
      ? undefined
      : {
          prev: shortLabel(before),
          // Never offer a step into the future; the day after can be today.
          next: after > today ? shortLabel(today) : shortLabel(after),
        },
  };
}


/**
 * The dots the month picker draws, from the diary.
 *
 * These were fixture data alongside fixture days, so they agreed by
 * construction. Now the days come from the diary and the dots have to as well —
 * otherwise a day the picker shows with a red dot opens as an empty one, which
 * is the app contradicting itself in the space of one tap.
 *
 * A day with nothing on it is `empty`, not `under`. Nothing logged is not the
 * same as a day eaten carefully, and the dot should not claim it was.
 */
export function dayMarksFrom(
  entries: DiaryEntry[],
  targets: Targets,
  today: Date,
  weeks = 6,
): Record<string, DayMark> {
  const eatenPerDay = new Map<string, number>();
  for (const e of entries) {
    eatenPerDay.set(e.date, (eatenPerDay.get(e.date) ?? 0) + e.kcal);
  }

  const marks: Record<string, DayMark> = {};
  for (let back = 0; back < weeks * 7; back++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
    const iso = isoDate(d.getFullYear(), d.getMonth(), d.getDate());
    const eaten = eatenPerDay.get(iso);
    marks[iso] =
      eaten === undefined ? 'empty' : eaten > targets.kcal ? 'over' : 'under';
  }
  return marks;
}
