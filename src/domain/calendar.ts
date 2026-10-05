/**
 * Months, as a grid.
 *
 * The first version of the day picker was a hardcoded September: thirty cells,
 * a weekday offset of 1 that happened to be right, and a selected date typed in
 * by hand. It looked like a calendar and knew nothing. This works the dates out.
 *
 * Weeks start on Monday, because the app is British and the boards are labelled
 * M T W T F S S. Everything here uses local date parts rather than UTC: a UK
 * phone on BST reading UTC would roll the month over an hour before midnight.
 */

/** How a day went against its budget. */
export type DayMark = 'under' | 'over' | 'empty';

export type MonthDay = {
  /** Day of the month. */
  date: number;
  mark: DayMark;
  /** A day that has not happened. Not pickable — a diary has no future. */
  future?: boolean;
  /** ISO 'YYYY-MM-DD', which is how a diary will be keyed. */
  iso: string;
};

export type MonthGrid = {
  year: number;
  /** 0–11, as JavaScript counts them. */
  month: number;
  /** 'September 2026'. */
  label: string;
  /** Blank cells before the 1st, so dates land under the right weekday. */
  startsOn: number;
  days: MonthDay[];
  /** False in the month containing today: there is nothing ahead to look at. */
  canGoForward: boolean;
};

const MONTHS = [
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

/** 'YYYY-MM-DD' from local parts. Padded, so the strings sort. */
export function isoDate(year: number, month: number, date: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(date).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** Day 0 of the next month is the last day of this one, which is leap-year safe. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-first weekday index: Monday 0 … Sunday 6. */
export function weekdayOf(year: number, month: number, date: number): number {
  return (new Date(year, month, date).getDay() + 6) % 7;
}

/** Steps a year/month pair, rolling the year over in either direction. */
export function addMonths(
  year: number,
  month: number,
  delta: number,
): {year: number; month: number} {
  const moved = new Date(year, month + delta, 1);
  return {year: moved.getFullYear(), month: moved.getMonth()};
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/**
 * One month, ready to render. `marks` is keyed by ISO date; a day with no
 * entry shows as nothing logged, which is the truth about a day you skipped.
 */
export function monthGrid(
  year: number,
  month: number,
  {today, marks = {}}: {today: Date; marks?: Record<string, DayMark>},
): MonthGrid {
  const length = daysInMonth(year, month);
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const days: MonthDay[] = Array.from({length}, (_, i) => {
    const date = i + 1;
    const iso = isoDate(year, month, date);
    return {
      date,
      iso,
      // String comparison is safe on padded ISO dates and needs no timezone.
      future: iso > todayIso,
      mark: marks[iso] ?? 'empty',
    };
  });

  return {
    year,
    month,
    label: monthLabel(year, month),
    startsOn: weekdayOf(year, month, 1),
    days,
    canGoForward:
      year < today.getFullYear() ||
      (year === today.getFullYear() && month < today.getMonth()),
  };
}
