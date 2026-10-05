export type FoodItem = {
  id: string;
  name: string;
  /** Brand and portion, as the row shows it. */
  meta: string;
  kcal: number;
  /** True for foods this person has logged before — they rank above the database. */
  yours?: boolean;
  /** How many times it has been logged. What 'Frequent' sorts on. */
  logged?: number;
  /** True for a food this person created themselves, rather than matched. */
  mine?: boolean;
};

/** What you have eaten this week, newest first. Stands in for the local store. */
export const recentFoods: FoodItem[] = [
  {id: 'oats', name: 'Porridge oats', meta: 'Quaker · 40 g · P 5 C 27 F 3', kcal: 152, yours: true, logged: 48},
  {id: 'milk', name: 'Semi-skimmed milk', meta: 'Tesco · 200 ml · P 7 C 10 F 3', kcal: 98, yours: true, logged: 44},
  {id: 'thigh', name: 'Chicken thigh, grilled', meta: '165 g · P 42 C 0 F 12', kcal: 287, yours: true, logged: 21},
  {id: 'rice', name: 'Basmati rice, cooked', meta: 'Tilda · 220 g · P 6 C 62 F 1', kcal: 286, yours: true, logged: 19},
  {id: 'yoghurt', name: 'Greek yoghurt, 0%', meta: 'Fage · 170 g · P 17 C 6 F 0', kcal: 97, yours: true, logged: 31},
  {id: 'banana', name: 'Banana', meta: '1 medium, 118 g · P 1 C 27 F 0', kcal: 105, yours: true, logged: 26},
  {id: 'pb', name: 'Peanut butter, smooth', meta: 'Meridian · 20 g · P 6 C 3 F 10', kcal: 122, yours: true, logged: 12},
  {id: 'avocado', name: 'Avocado', meta: '70 g · P 1 C 6 F 10', kcal: 114, yours: true, logged: 7, mine: true},
];

/** The database beyond your own foods. Searched only when you type. */
export const libraryFoods: FoodItem[] = [
  {id: 'breast', name: 'Chicken breast, grilled', meta: '100 g · P 31 C 0 F 4', kcal: 165},
  {id: 'thigh-raw', name: 'Chicken thigh, raw', meta: '100 g · P 18 C 0 F 15', kcal: 209},
  {id: 'tikka', name: 'Chicken tikka masala', meta: 'Tesco · 400 g · P 32 C 38 F 26', kcal: 528},
  {id: 'roast', name: 'Roast chicken, skin on', meta: '100 g · P 27 C 0 F 12', kcal: 220},
  {id: 'stock', name: 'Chicken stock cube', meta: 'Knorr · 1 cube · P 1 C 2 F 1', kcal: 20},
];

/**
 * Your own foods first, then the library — which is the whole reason logging
 * gets faster the longer you use it.
 */
export function searchFoods(query: string): FoodItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }
  const hit = (f: FoodItem) => f.name.toLowerCase().includes(needle);
  return [...recentFoods.filter(hit), ...libraryFoods.filter(hit)];
}

/** Foods created by hand rather than matched — what 'My foods' holds. */
export const myFoods: FoodItem[] = [
  {
    id: 'jollof',
    name: 'Mum\u2019s jollof rice',
    meta: 'Mine · 250 g · P 9 C 76 F 8',
    kcal: 418,
    yours: true,
    mine: true,
    logged: 9,
  },
  ...recentFoods.filter(f => f.mine),
];

/**
 * Saved combinations — a breakfast logged as one thing. Empty until saving a
 * meal is built, and the screen says so rather than showing a blank list.
 */
export const savedMeals: FoodItem[] = [];

/** What each chip on Add food lists. */
export function foodsFor(filter: string): FoodItem[] {
  switch (filter) {
    case 'Frequent':
      // Most-logged first: the point of the chip is to skip the scrolling.
      return [...recentFoods].sort((a, b) => (b.logged ?? 0) - (a.logged ?? 0));
    case 'My foods':
      return myFoods;
    case 'Meals':
      return savedMeals;
    default:
      return recentFoods;
  }
}

/** The heading over each chip's list, and what to say when it is empty. */
export const FILTER_COPY: Record<string, {head: string; empty?: string}> = {
  Recent: {head: 'EATEN THIS WEEK'},
  Frequent: {head: 'MOST LOGGED'},
  'My foods': {head: 'FOODS YOU MADE', empty: 'Nothing yet. Create a food and it lands here.'},
  Meals: {
    head: 'SAVED MEALS',
    empty: 'No saved meals yet. Log a few things together and save them as one.',
  },
};
