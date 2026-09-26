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
  foods: [],
};
