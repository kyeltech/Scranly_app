import {food} from './food';
import type {FoodItem, MoreNutrition, NewFood} from './food';

/**
 * What a portion weighs, and the same food at another weight.
 *
 * `FoodItem.portion` is a label — '40 g', '1 medium, 118 g', '1 cube' — which
 * is right for a row but useless for arithmetic. Nothing could rescale a food,
 * so the detail screen could show the amount the database happened to state
 * and no other. A food carries `portionG` now; where it does not, the label is
 * read for a weight rather than the food being refused out of hand.
 */

/** The grams a portion is, or `undefined` when nothing says. */
export function gramsOf(
  item: Pick<FoodItem, 'portion'> & {portionG?: number},
): number | undefined {
  if (usable(item.portionG)) {
    return item.portionG;
  }
  // The last weight on the label, because the first number is usually how many
  // of a thing it is: '1 medium, 118 g' is one banana weighing 118 g. A
  // millilitre figure is passed over — 200 ml of milk is about 206 g, and
  // close is not the same when the day adds it up.
  const weights = [...item.portion.matchAll(/(\d+(?:\.\d+)?)\s*g\b/gi)];
  const last = weights.at(-1);
  return last ? Number(last[1]) : undefined;
}

/**
 * The same food at `grams`, or `undefined` when it cannot be known.
 *
 * Refusing is the point. A stock cube states no weight, so there is no honest
 * way to say what 50 g of it comes to, and a screen that offered an amount
 * would be inventing one. The caller shows no amount row instead.
 */
export function scaleTo(item: FoodItem, grams: number): FoodItem | undefined {
  const basis = gramsOf(item);
  if (basis === undefined || !usable(grams)) {
    return undefined;
  }

  const factor = grams / basis;
  return food({
    ...item,
    portion: `${round1(grams)} g`,
    portionG: grams,
    // Energy is whole on every screen that shows it; the macros keep a place.
    kcal: Math.round(item.kcal * factor),
    proteinG: round1(item.proteinG * factor),
    carbsG: round1(item.carbsG * factor),
    fatG: round1(item.fatG * factor),
    // Unknown stays unknown: scaling a blank into a zero would be the food
    // claiming it has none of something it never mentioned.
    fibreG: item.fibreG === undefined ? undefined : round1(item.fibreG * factor),
    // The rest of the panel scales with it; where it came from does not,
    // because half an almond is the same almond.
    more: scaleMore(item.more, factor),
  });
}

/**
 * The rest of the panel at the new weight.
 *
 * Three places, not one. Salt and the sodium behind it arrive in hundredths of
 * a gram, and half of 0.01 g rounded the way a macro is would be a food
 * claiming it has no salt at all. The screen rounds for reading; the number
 * kept here stays true.
 */
function scaleMore(
  more: MoreNutrition | undefined,
  factor: number,
): MoreNutrition | undefined {
  if (more === undefined) {
    return undefined;
  }
  const scaled: MoreNutrition = {};
  for (const [key, value] of Object.entries(more) as [keyof MoreNutrition, number][]) {
    if (value !== undefined) {
      scaled[key] = key === 'kJ' ? Math.round(value * factor) : round3(value * factor);
    }
  }
  return scaled;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function usable(grams: number | undefined): grams is number {
  return typeof grams === 'number' && Number.isFinite(grams) && grams > 0;
}

/** One decimal place, without the floating-point dust: 49.9 * 0.5 is not 24.950000000000003. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * A food, back as the Create a food form.
 *
 * 'Edit these numbers' on the detail screen opens the form on the food you
 * were looking at, which is how a wrong figure in the database gets fixed by
 * the person holding the packet. Every field is a string, because every field
 * is a text input; a serving the food cannot state is left blank rather than
 * guessed, so the form asks instead of asserting.
 */
export function toForm(item: FoodItem): NewFood {
  // The weight behind the portion, which is the label's own '40 g' where the
  // food carries no grams of its own.
  const grams = gramsOf(item);
  return {
    name: item.name,
    brand: item.brand ?? '',
    servingG: grams === undefined ? '' : String(grams),
    kcal: String(item.kcal),
    proteinG: String(item.proteinG),
    carbsG: String(item.carbsG),
    fatG: String(item.fatG),
  };
}
