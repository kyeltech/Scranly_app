export type {FoodItem} from '../domain/food';
import {food} from '../domain/food';
import type {FoodItem} from '../domain/food';
export {food};

/** What you have eaten this week, newest first. Stands in for the local store. */
export const recentFoods: FoodItem[] = [
  food({id: 'oats', name: 'Porridge oats', brand: 'Quaker', portion: '40 g', proteinG: 5, carbsG: 27, fatG: 3, kcal: 152, yours: true, logged: 48}),
  food({id: 'milk', name: 'Semi-skimmed milk', brand: 'Tesco', portion: '200 ml', proteinG: 7, carbsG: 10, fatG: 3, kcal: 98, yours: true, logged: 44}),
  food({id: 'thigh', name: 'Chicken thigh, grilled', portion: '165 g', proteinG: 42, carbsG: 0, fatG: 12, kcal: 287, yours: true, logged: 21}),
  food({id: 'rice', name: 'Basmati rice, cooked', brand: 'Tilda', portion: '220 g', proteinG: 6, carbsG: 62, fatG: 1, kcal: 286, yours: true, logged: 19}),
  food({id: 'yoghurt', name: 'Greek yoghurt, 0%', brand: 'Fage', portion: '170 g', proteinG: 17, carbsG: 6, fatG: 0, kcal: 97, yours: true, logged: 31}),
  food({id: 'banana', name: 'Banana', portion: '1 medium, 118 g', proteinG: 1, carbsG: 27, fatG: 0, kcal: 105, yours: true, logged: 26}),
  food({id: 'pb', name: 'Peanut butter, smooth', brand: 'Meridian', portion: '20 g', proteinG: 6, carbsG: 3, fatG: 10, kcal: 122, yours: true, logged: 12}),
  food({id: 'avocado', name: 'Avocado', portion: '70 g', proteinG: 1, carbsG: 6, fatG: 10, kcal: 114, yours: true, logged: 7, mine: true}),
];

/** The database beyond your own foods. Searched only when you type. */
export const libraryFoods: FoodItem[] = [
  food({id: 'breast', name: 'Chicken breast, grilled', portion: '100 g', proteinG: 31, carbsG: 0, fatG: 4, kcal: 165}),
  food({id: 'thigh-raw', name: 'Chicken thigh, raw', portion: '100 g', proteinG: 18, carbsG: 0, fatG: 15, kcal: 209}),
  food({id: 'tikka', name: 'Chicken tikka masala', brand: 'Tesco', portion: '400 g', proteinG: 32, carbsG: 38, fatG: 26, kcal: 528}),
  food({id: 'roast', name: 'Roast chicken, skin on', portion: '100 g', proteinG: 27, carbsG: 0, fatG: 12, kcal: 220}),
  food({id: 'stock', name: 'Chicken stock cube', brand: 'Knorr', portion: '1 cube', proteinG: 1, carbsG: 2, fatG: 1, kcal: 20}),
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
  food({
    id: 'jollof',
    name: 'Mum\u2019s jollof rice',
    brand: 'Mine',
    portion: '250 g',
    proteinG: 9,
    carbsG: 76,
    fatG: 8,
    kcal: 418,
    yours: true,
    mine: true,
    logged: 9,
  }),
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
