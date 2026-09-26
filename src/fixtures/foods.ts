export type FoodItem = {
  id: string;
  name: string;
  /** Brand and portion, as the row shows it. */
  meta: string;
  kcal: number;
  /** True for foods this person has logged before — they rank above the database. */
  yours?: boolean;
};

/** What you have eaten this week, newest first. Stands in for the local store. */
export const recentFoods: FoodItem[] = [
  {id: 'oats', name: 'Porridge oats', meta: 'Quaker · 40 g · P 5 C 27 F 3', kcal: 152, yours: true},
  {id: 'milk', name: 'Semi-skimmed milk', meta: 'Tesco · 200 ml · P 7 C 10 F 3', kcal: 98, yours: true},
  {id: 'thigh', name: 'Chicken thigh, grilled', meta: '165 g · P 42 C 0 F 12', kcal: 287, yours: true},
  {id: 'rice', name: 'Basmati rice, cooked', meta: 'Tilda · 220 g · P 6 C 62 F 1', kcal: 286, yours: true},
  {id: 'yoghurt', name: 'Greek yoghurt, 0%', meta: 'Fage · 170 g · P 17 C 6 F 0', kcal: 97, yours: true},
  {id: 'banana', name: 'Banana', meta: '1 medium, 118 g · P 1 C 27 F 0', kcal: 105, yours: true},
  {id: 'pb', name: 'Peanut butter, smooth', meta: 'Meridian · 20 g · P 6 C 3 F 10', kcal: 122, yours: true},
  {id: 'avocado', name: 'Avocado', meta: '70 g · P 1 C 6 F 10', kcal: 114, yours: true},
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
