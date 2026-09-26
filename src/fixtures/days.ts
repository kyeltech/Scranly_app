import type {MonthDay} from '../screens/DayPicker';
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
 * A month of days, for the day picker. The dots are how each day went; the
 * 26th on is not here yet. Stands in for a query over the local store.
 */
export const september: MonthDay[] = [
  ...[1, 2, 3].map(date => ({date, mark: 'under' as const})),
  {date: 4, mark: 'over' as const},
  {date: 5, mark: 'under' as const},
  {date: 6, mark: 'under' as const},
  {date: 7, mark: 'empty' as const},
  {date: 8, mark: 'under' as const},
  {date: 9, mark: 'under' as const},
  {date: 10, mark: 'over' as const},
  {date: 11, mark: 'under' as const},
  {date: 12, mark: 'under' as const},
  {date: 13, mark: 'under' as const},
  {date: 14, mark: 'empty' as const},
  {date: 15, mark: 'under' as const},
  {date: 16, mark: 'over' as const},
  ...[17, 18, 19, 20].map(date => ({date, mark: 'under' as const})),
  {date: 21, mark: 'empty' as const},
  ...[22, 23, 24, 25].map(date => ({date, mark: 'under' as const})),
  ...[26, 27, 28, 29, 30].map(date => ({
    date,
    mark: 'empty' as const,
    future: true,
  })),
];

/** 1 September 2026 is a Tuesday, so the grid starts one cell in. */
export const septemberStartsOn = 1;
