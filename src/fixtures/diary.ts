import {isoDate} from '../domain/calendar';
import type {DiaryEntry} from '../domain/diary';

/**
 * A few weeks of logging, derived from a day rather than typed out for one
 * month — so a test can hand it a fixed clock and the picker is right in
 * October too.
 *
 * This replaces `dayMarks` and `dayFor`, which invented the days *and* the dots
 * that pointed at them. Here there is one source: entries. The dots come from
 * counting them, which is what stops the month and the day disagreeing.
 *
 * Stands in for a diary somebody actually kept.
 */
export function aLoggedWeek(today: Date, weeks = 6): DiaryEntry[] {
  const entries: DiaryEntry[] = [];

  for (let back = 0; back < weeks * 7; back++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
    const date = isoDate(d.getFullYear(), d.getMonth(), d.getDate());

    // Sundays are the days he does not log; every sixth day or so goes over.
    if (d.getDay() === 0) {
      continue;
    }
    const heavy = back % 6 === 3;

    entries.push(
      line(date, 'b', 'Porridge oats', 'Quaker', '80 g', 303, 10, 54, 6, 'Breakfast'),
      line(date, 'l1', 'Chicken thigh, grilled', undefined, '165 g', 287, 42, 0, 12, 'Lunch'),
      line(date, 'l2', 'Basmati rice, cooked', 'Tilda', '220 g', 286, 6, 62, 1, 'Lunch'),
      ...(heavy
        ? [line(date, 'd', 'Takeaway pizza', undefined, '½ large', 1100, 44, 120, 44, 'Dinner')]
        : [line(date, 'd', 'Salmon fillet', undefined, '150 g', 312, 34, 0, 19, 'Dinner')]),
    );
  }

  return entries;
}

function line(
  date: string,
  slot: string,
  name: string,
  brand: string | undefined,
  portion: string,
  kcal: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  meal: DiaryEntry['meal'],
): DiaryEntry {
  return {id: `${date}-${slot}`, date, name, brand, portion, kcal, proteinG, carbsG, fatG, meal};
}
