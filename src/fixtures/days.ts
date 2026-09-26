import {isoDate} from '../domain/calendar';
import type {DayMark} from '../domain/calendar';
import type {DayView} from '../domain/day';

/** A normal day, two thirds through the budget. The board the design was approved on. */
export const aNormalDay: DayView = {
  dayLabel: 'Tuesday',
  kcalTarget: 1830,
  kcalEaten: 1188,
  kcalRemaining: 642,
  macros: [
    {key: 'protein', label: 'PROTEIN', eatenG: 104, targetG: 146},
    {key: 'carbs', label: 'CARBS', eatenG: 142, targetG: 188},
    {key: 'fat', label: 'FAT', eatenG: 38, targetG: 55},
  ],
  foods: [
    {id: '1', name: 'Porridge oats', portion: '80 g', kcal: 303, meal: 'Breakfast'},
    {id: '2', name: 'Chicken thigh, grilled', portion: '165 g', kcal: 287, meal: 'Lunch'},
    {id: '3', name: 'Basmati rice', portion: '220 g', kcal: 286, meal: 'Lunch'},
  ],
};

/** Past the budget: the number goes negative and the ring goes round. */
export const anOverBudgetDay: DayView = {
  dayLabel: 'Tuesday',
  kcalTarget: 1830,
  kcalEaten: 1972,
  kcalRemaining: -142,
  macros: [
    {key: 'protein', label: 'PROTEIN', eatenG: 158, targetG: 146},
    {key: 'carbs', label: 'CARBS', eatenG: 205, targetG: 188},
    {key: 'fat', label: 'FAT', eatenG: 61, targetG: 55},
  ],
  // One day over inside a week under it is not a week over, so the screen says
  // where the week stands rather than leaving the red number to speak for seven days.
  weekNote: {kcal: 320, under: true},
  foods: [
    {id: '1', name: 'Takeaway pizza', portion: '½ large', kcal: 784, meal: 'Dinner'},
    {id: '2', name: 'Chicken thigh, grilled', portion: '165 g', kcal: 287, meal: 'Lunch'},
  ],
};

/** Nothing logged yet: the whole budget is still there to spend. */
export const aFreshDay: DayView = {
  dayLabel: 'Tuesday',
  kcalTarget: 1830,
  kcalEaten: 0,
  kcalRemaining: 1830,
  macros: [
    {key: 'protein', label: 'PROTEIN', eatenG: 0, targetG: 146},
    {key: 'carbs', label: 'CARBS', eatenG: 0, targetG: 188},
    {key: 'fat', label: 'FAT', eatenG: 0, targetG: 55},
  ],
  // What he has most mornings, one tap each — an empty list would be correct
  // and useless.
  starters: [
    {id: 'oats', name: 'Porridge oats', meta: 'Quaker · 40 g', kcal: 152},
    {id: 'milk', name: 'Semi-skimmed milk', meta: 'Tesco · 200 ml', kcal: 98},
    {id: 'yoghurt', name: 'Greek yoghurt, 0%', meta: 'Fage · 170 g', kcal: 97},
  ],
  foods: [],
};

/** A day that has been and gone: a date, a stepper, and no logging to do. */
export const aPastDay: DayView = {
  dayLabel: 'Sunday',
  dateLabel: '20 September',
  past: true,
  neighbours: {prev: 'Sat 19', next: 'Mon 21'},
  kcalTarget: 1830,
  kcalEaten: 1640,
  kcalRemaining: 190,
  macros: [
    {key: 'protein', label: 'PROTEIN', eatenG: 151, targetG: 146},
    {key: 'carbs', label: 'CARBS', eatenG: 160, targetG: 188},
    {key: 'fat', label: 'FAT', eatenG: 49, targetG: 55},
  ],
  foods: [
    {id: '1', name: 'Greek yoghurt, 0%', portion: '170 g', kcal: 97, meal: 'Breakfast'},
    {id: '2', name: 'Roast chicken', portion: '200 g', kcal: 440, meal: 'Lunch'},
  ],
};

/**
 * How the last few weeks went, keyed by ISO date. Derived from a day rather
 * than typed out for one month, so the picker is right in October too — and
 * so a test can hand it a fixed day.
 *
 * Stands in for a query over the diary.
 */
export function dayMarks(today: Date, weeks = 6): Record<string, DayMark> {
  const marks: Record<string, DayMark> = {};
  for (let back = 0; back < weeks * 7; back++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
    const weekday = d.getDay();
    // Sundays are the days he does not log; every fourth day or so goes over.
    const mark: DayMark =
      weekday === 0 ? 'empty' : back % 6 === 3 ? 'over' : 'under';
    marks[isoDate(d.getFullYear(), d.getMonth(), d.getDate())] = mark;
  }
  return marks;
}
