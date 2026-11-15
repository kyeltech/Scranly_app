/**
 * What a portion looks like, when the pack will not say.
 *
 * A bag of almonds states per 100 g and nothing else, so "how much is that?"
 * is left to the person holding it. The guidance that answers it here is the
 * British Nutrition Foundation's "Find your balance", which measures in hands
 * rather than in cups and tennis balls: a palm of nuts, two cupped hands of
 * cooked pasta, a fist of baked potato, two thumbs of cheese.
 *
 * Hands are the right unit for a phone. You always have them, and they scale —
 * a bigger person has bigger hands and gets a bigger portion, which is the
 * method working rather than failing.
 *
 * **Every figure here is published, none is estimated.** The source was due
 * for review in January 2022; re-check before relying on it.
 */

/** The drawings the cards carry. See components/measures.tsx. */
export type MeasureGlyph =
  | 'handful'
  | 'cupped'
  | 'fist'
  | 'halfHand'
  | 'palm'
  | 'thumbs'
  | 'spoon'
  | 'glass'
  | 'coin';

/**
 * What kind of measure a card uses, which decides what is true to say under
 * it. Ten of the sixteen are hands; the rest are not, and the line about hands
 * scaling with the person is nonsense on a spoon or a glass.
 */
export type MeasureKind =
  | 'hand'
  | 'tablespoon'
  | 'servingSpoon'
  | 'teaspoon'
  | 'glass'
  | 'object';

export type ServingCard = {
  id: string;
  glyph: MeasureGlyph;
  kind: MeasureKind;
  /** The group, as the card heads it. */
  group: string;
  /** How to measure it, in words. */
  measure: string;
  /**
   * What that comes to, as the source states it — a range stays a range. The
   * figure and its unit are separate because the card sets them in different
   * sizes: the weight is the thing you read, the unit is just what it is in.
   */
  amount: {value: string; unit: string};
  /**
   * The weight the card's button sets, where the source gives one weight to
   * set. A card measured in millilitres has none: 200 ml of milk is not 200 g,
   * and the diary logs grams.
   */
  grams?: number;
  /** The published energy for that portion, where the source gives one. */
  kcal?: string;
  /** Anything else on the card worth saying. */
  note?: string;
  /**
   * A pointer to the card that answers the next question. Two of these foods
   * are the same food in different states — spaghetti dry and pasta cooked —
   * and whichever you are holding, the other one is what you want next.
   */
  tip?: {glyph: MeasureGlyph; text: string};
  /** Words in a food's category that pick this card. */
  matches: string[];
};

/**
 * The sixteen, in the order the guide shows them: the day's starches, then
 * what goes with them, then what is poured or spread.
 */
export const SERVING_CARDS: ServingCard[] = [
  {
    id: 'cereal',
    glyph: 'handful',
    kind: 'hand',
    group: 'Breakfast cereal',
    measure: '3 handfuls',
    amount: {value: '40', unit: 'g'},
    grams: 40,
    kcal: '130–150 kcal',
    matches: ['cereal', 'muesli', 'granola', 'cornflake'],
  },
  {
    id: 'porridge',
    glyph: 'handful',
    kind: 'hand',
    group: 'Porridge oats, dry',
    measure: 'A handful and a half',
    amount: {value: '40–45', unit: 'g'},
    grams: 40,
    kcal: '171 kcal',
    matches: ['oat', 'porridge'],
  },
  {
    id: 'pasta',
    glyph: 'cupped',
    kind: 'hand',
    group: 'Pasta or rice, cooked',
    measure: 'Two hands, cupped together',
    amount: {value: '180', unit: 'g cooked'},
    grams: 180,
    kcal: '236–270 kcal',
    note: '65–75 g dried, which is about 2 handfuls',
    tip: {
      glyph: 'coin',
      text:
        'Spaghetti instead: a bunch that fits through a hole the size of a ' +
        '£1 coin is about 75 g dried.',
    },
    matches: ['pasta', 'rice', 'couscous', 'noodle', 'penne', 'fusilli', 'macaroni'],
  },
  {
    id: 'spaghetti',
    glyph: 'coin',
    kind: 'object',
    group: 'Spaghetti, dried',
    measure: 'A bunch the width of a £1 coin',
    amount: {value: '75', unit: 'g dried'},
    grams: 75,
    matches: ['spaghetti', 'linguine', 'tagliatelle'],
  },
  {
    id: 'potato',
    glyph: 'fist',
    kind: 'hand',
    group: 'Baked potato',
    measure: 'The size of your fist',
    amount: {value: '220', unit: 'g'},
    grams: 220,
    kcal: '213 kcal',
    matches: ['potato'],
  },
  {
    id: 'chicken',
    glyph: 'halfHand',
    kind: 'hand',
    group: 'Chicken breast, cooked',
    measure: 'Half the size of your hand',
    amount: {value: '120', unit: 'g'},
    grams: 120,
    kcal: '178 kcal',
    matches: ['chicken', 'turkey', 'poultry'],
  },
  {
    id: 'steak',
    glyph: 'halfHand',
    kind: 'hand',
    group: 'Steak, cooked',
    measure: 'Half the size of your hand',
    amount: {value: '130', unit: 'g'},
    grams: 130,
    kcal: '310 kcal',
    matches: ['steak', 'beef', 'lamb', 'pork'],
  },
  {
    id: 'fish',
    glyph: 'halfHand',
    kind: 'hand',
    group: 'Fish fillet, cooked',
    measure: 'Half a hand to a whole hand',
    amount: {value: '100–140', unit: 'g'},
    grams: 120,
    kcal: '106–148 kcal',
    matches: ['fish', 'salmon', 'cod', 'tuna', 'mackerel', 'haddock'],
  },
  {
    id: 'pulses',
    glyph: 'spoon',
    kind: 'tablespoon',
    group: 'Beans, chickpeas, lentils',
    measure: '6 tablespoons',
    amount: {value: '120', unit: 'g'},
    grams: 120,
    kcal: '120–140 kcal',
    matches: ['bean', 'chickpea', 'lentil', 'pulse', 'houmous', 'hummus'],
  },
  {
    id: 'nuts',
    glyph: 'palm',
    kind: 'hand',
    group: 'Nuts and seeds',
    measure: 'What fits in your palm',
    amount: {value: '20', unit: 'g'},
    grams: 20,
    kcal: '113–137 kcal',
    matches: ['nut', 'almond', 'cashew', 'walnut', 'peanut', 'seed'],
  },
  {
    id: 'cheese',
    glyph: 'thumbs',
    kind: 'hand',
    group: 'Hard cheese',
    measure: 'The size of two thumbs',
    amount: {value: '30', unit: 'g'},
    grams: 30,
    kcal: '125 kcal, or 94 reduced-fat',
    matches: ['cheese', 'cheddar', 'stilton', 'brie'],
  },
  {
    id: 'yoghurt',
    glyph: 'spoon',
    kind: 'tablespoon',
    group: 'Yoghurt',
    measure: '4 tablespoons, or one pot',
    amount: {value: '120', unit: 'g'},
    grams: 120,
    kcal: '68 kcal, low fat',
    matches: ['yoghurt', 'yogurt'],
  },
  {
    id: 'milk',
    glyph: 'glass',
    kind: 'glass',
    group: 'Milk, or a plant drink',
    measure: 'One glass',
    amount: {value: '200', unit: 'ml'},
    kcal: '68 skimmed · 92 semi · 126 whole',
    matches: ['milk', 'soya drink', 'oat drink'],
  },
  {
    id: 'fruit',
    glyph: 'handful',
    kind: 'hand',
    group: 'Fruit',
    measure: 'One handful, or one medium fruit',
    amount: {value: '80', unit: 'g'},
    grams: 80,
    note: 'One of your five a day',
    matches: ['fruit', 'apple', 'banana', 'berry', 'berries', 'orange', 'pear'],
  },
  {
    id: 'veg',
    glyph: 'spoon',
    kind: 'servingSpoon',
    group: 'Vegetables',
    measure: '3 serving spoons',
    amount: {value: '80', unit: 'g'},
    grams: 80,
    note: 'One of your five a day',
    matches: ['vegetable', 'carrot', 'broccoli', 'pea', 'salad', 'spinach'],
  },
  {
    id: 'oil',
    glyph: 'spoon',
    kind: 'teaspoon',
    group: 'Oil or spread',
    measure: 'One teaspoon',
    amount: {value: '3–5', unit: 'g'},
    grams: 5,
    kcal: '27 kcal a teaspoon · 99 a tablespoon',
    matches: ['oil', 'spread', 'butter', 'margarine'],
  },
];

/**
 * The card a food opens on, from the category its entry gives.
 *
 * Nothing is returned for a category no card covers. A guess would be worse
 * than none here: it would put a weight in front of somebody along with a hand
 * gesture that has nothing to do with what they are holding.
 */
export function cardFor(category: string | undefined): ServingCard | undefined {
  const words = (category ?? '').toLowerCase();
  if (!words) {
    return undefined;
  }
  // In list order, except that spaghetti is tried before pasta: it is pasta,
  // and it is the one measured through a hole rather than by the handful.
  const ordered = [
    ...SERVING_CARDS.filter(card => card.id === 'spaghetti'),
    ...SERVING_CARDS.filter(card => card.id !== 'spaghetti'),
  ];
  return ordered.find(card => card.matches.some(word => words.includes(word)));
}

/** Said under every card, because it is true of every card. */
const SOURCE = 'These are averages for an adult, from the British Nutrition Foundation.';

/**
 * What a measure is worth saying about, by the kind of measure it is.
 *
 * One line used to sit under every card: that a hand is a measure you always
 * have with you and that it scales with the person. True of the ten cards
 * measured in hands, and nonsense on the six that are not — nothing about a
 * tablespoon scales with the hand holding it.
 */
const ABOUT: Record<MeasureKind, string> = {
  hand:
    'A hand is a measure you always have with you, and it scales: a bigger ' +
    'person has bigger hands and gets a bigger portion.',
  tablespoon:
    'A tablespoon here is a 10 ml spoon — the one you eat soup or pudding ' +
    'with, not the one you serve with.',
  servingSpoon:
    'A serving spoon, not a tablespoon: the big one you dish up with.',
  teaspoon:
    'Spread thinly, which is what the weight assumes — not a loaded spoon.',
  glass:
    'Millilitres, not grams. The diary counts grams, so this card measures ' +
    'and sets nothing.',
  object:
    'Dried, not cooked. The same spaghetti after water is the cooked pasta ' +
    'card: 65–75 g dry is the 180 g there.',
};

/** The caveat under a card: what its measure needs said, then where it is from. */
export function caveatFor(card: ServingCard): string {
  return `${ABOUT[card.kind]} ${SOURCE}`;
}
