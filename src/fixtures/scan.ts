/**
 * What the three scan modes come back with. Dynamic mocks, not an API: the
 * shapes are what a real reader would hand over, so swapping the source later
 * touches these files and nothing that renders them.
 */

export const BARCODE = '5012345678900';

export type Product = {
  barcode: string;
  name: string;
  brand: string;
  /** Per the chosen serving, which is why it moves when the serving does. */
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type Serving = {
  id: string;
  /** How the pack says it: "1 slice", "Per 100 g". */
  label: string;
  grams: number;
  kcal: number;
};

/** A barcode that Open Food Facts knows. */
export const matchedProduct: Product = {
  barcode: BARCODE,
  name: 'Mature Cheddar',
  brand: 'Cathedral City',
  kcal: 125,
  proteinG: 7.7,
  carbsG: 0.1,
  fatG: 10.4,
};

/** The servings the pack itself offers, before anyone reaches for scales. */
export const packServings: Serving[] = [
  {id: 'slice', label: '1 slice', grams: 30, kcal: 125},
  {id: 'two-slices', label: '2 slices', grams: 60, kcal: 250},
  {id: 'hundred', label: 'Per 100 g', grams: 100, kcal: 416},
  {id: 'pack', label: 'Whole pack', grams: 250, kcal: 1040},
];

export type PlateItem = {
  id: string;
  name: string;
  /** Always hedged: a photograph cannot know a weight. */
  portion: string;
  kcal: number;
  /** True where the guess is the shakiest — oil is invisible in a photo. */
  leastSure?: boolean;
};

/** What the plate reader thinks it saw. Every line is correctable. */
export const platedItems: PlateItem[] = [
  {id: 'chicken', name: 'Chicken thigh, grilled', portion: 'about 150 g', kcal: 261},
  {id: 'rice', name: 'White rice, cooked', portion: 'about 200 g', kcal: 260},
  {id: 'broccoli', name: 'Broccoli, steamed', portion: 'about 80 g', kcal: 27},
  {id: 'oil', name: 'Oil or dressing', portion: 'about 1 tbsp', kcal: 119, leastSure: true},
];

export type LabelRow = {
  id: string;
  name: string;
  /** An indented sub-line on the pack: "of which saturates". */
  under?: boolean;
  per100: string;
  perServing: string;
};

/** A UK label carries both columns, so the app must ask which one to save. */
export const labelRows: LabelRow[] = [
  {id: 'energy', name: 'Energy', per100: '416 kcal', perServing: '125 kcal'},
  {id: 'fat', name: 'Fat', per100: '34.9 g', perServing: '10.4 g'},
  {id: 'saturates', name: 'of which saturates', under: true, per100: '21.7 g', perServing: '6.5 g'},
  {id: 'carbs', name: 'Carbohydrate', per100: '0.1 g', perServing: '0.1 g'},
  {id: 'sugars', name: 'of which sugars', under: true, per100: '0.1 g', perServing: '0.1 g'},
  {id: 'protein', name: 'Protein', per100: '25.4 g', perServing: '7.7 g'},
  {id: 'salt', name: 'Salt', per100: '1.8 g', perServing: '0.5 g'},
];

/** The serving size the label's second column is stated for. */
export const labelServingG = 30;
