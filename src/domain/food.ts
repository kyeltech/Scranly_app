/**
 * The rest of the nutrition panel, when the source stated it.
 *
 * Every field is optional and a blank stays blank: a pack that never mentioned
 * salt has not said it has none, and a zero here is a claim the entry made.
 */
export type MoreNutrition = {
  kJ?: number;
  satFatG?: number;
  sugarsG?: number;
  addedSugarsG?: number;
  saltG?: number;
  /** The sodium behind the salt. UK packs print salt; some entries print both. */
  sodiumG?: number;
};

/** Where a food came from, and what that entry carries besides numbers. */
export type Source = {
  /** Named rather than coded, because it is shown: 'Open Food Facts'. */
  from?: string;
  barcode?: string;
  imageUrl?: string;
  /** A to E, in the case a badge shows it. */
  nutriScore?: string;
  /** 1 to 4: how processed the entry reckons it is. */
  novaGroup?: number;
  /** The most specific category the entry gives: 'Whole almonds'. */
  category?: string;
  ingredients?: string;
};

/**
 * A food, as the app knows it.
 *
 * Lives in the domain rather than in `fixtures/` because created foods are now
 * real: the fixtures were the only source when this type was written, and they
 * are not any more.
 */
export type FoodItem = {
  id: string;
  name: string;
  /** Who makes it, when the food came from a packet that said so. */
  brand?: string;
  /** How much, as the row offers it: '40 g', '1 medium, 118 g', '1 cube'. */
  portion: string;
  /**
   * What that portion weighs, when it is known. The label above is for reading;
   * this is for arithmetic — see domain/portion.ts, which falls back to reading
   * a weight out of the label when a food carries none.
   */
  portionG?: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Fibre, when it is known. Not every food carries it; the day counts it when it does. */
  fibreG?: number;
  /** True for foods this person has logged before — they rank above the database. */
  yours?: boolean;
  /** How many times it has been logged. What 'Frequent' sorts on. */
  logged?: number;
  /** True for a food this person created themselves, rather than matched. */
  mine?: boolean;
  /** The rest of the panel. The diary counts none of it; the detail screen shows it. */
  more?: MoreNutrition;
  /** Where it came from. Absent on a food typed in by hand. */
  source?: Source;
  /**
   * Brand, portion and macros as the row shows them. Built by `food` rather
   * than typed out: written by hand, the macros existed only as display text,
   * so nothing could add them up — and the diary has to.
   */
  meta: string;
};

/**
 * A food, with its description built from its numbers so the two cannot
 * disagree.
 */
export function food(fields: Omit<FoodItem, 'meta'>): FoodItem {
  const {brand, portion, proteinG, carbsG, fatG} = fields;
  const macros = `P ${proteinG} C ${carbsG} F ${fatG}`;
  return {
    ...fields,
    meta: [brand, portion, macros].filter(Boolean).join(' · '),
  };
}

/** The Create a food form. Every field is a string, because they are text inputs. */
export type NewFood = {
  name: string;
  brand: string;
  servingG: string;
  kcal: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
};

/**
 * The form, as a food — or nothing, when it is not one yet.
 *
 * The screen asks for a name and the calories and says the rest can wait, so
 * those two are what make a food. A blank macro is zero; a blank *calorie*
 * field is not, because a food with no calories would silently add nothing to
 * a day while looking like it had been logged.
 */
export function fromForm(fields: NewFood): FoodItem | undefined {
  const name = fields.name.trim();
  const kcal = Number.parseFloat(fields.kcal);

  if (!name || !Number.isFinite(kcal)) {
    return undefined;
  }

  const serving = fields.servingG.trim();

  return food({
    id: `mine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    brand: fields.brand.trim() || undefined,
    // A food created without a serving is still a food; it is just one serving
    // of itself, which is how the portion reads until somebody says otherwise.
    portion: serving ? `${serving} g` : '1 serving',
    kcal,
    proteinG: orZero(fields.proteinG),
    carbsG: orZero(fields.carbsG),
    fatG: orZero(fields.fatG),
    yours: true,
    mine: true,
  });
}

function orZero(text: string): number {
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : 0;
}

/**
 * A scanned label, as the Create a food form.
 *
 * The screen promises "Scan the label instead — faster, and it fills all of
 * this in", and until now it filled in nothing: the reading was parsed and
 * then dropped on the way to an empty form.
 *
 * **The serving column wins.** A panel states per 100 g and, usually, per
 * serving; the second is what you ate, and it is the one the pack's own
 * "1/2 can" refers to. With no serving column the per-100 g figures are used
 * and the serving reads 100 g, which is true rather than convenient.
 *
 * A nutrient the parser could not find is left blank, never zero. Blank reads
 * as unknown and invites a human to look; a zero is a claim that the food has
 * none of it, which for fat or protein is a lie the day then adds up.
 */
export function fromReading(reading: {
  servingG?: number;
  per100: Partial<Record<string, number>>;
  perServing: Partial<Record<string, number>>;
}): NewFood {
  const hasServing = reading.perServing.energyKcal !== undefined;
  const column = hasServing ? reading.perServing : reading.per100;
  const servingG = hasServing ? reading.servingG : 100;

  return {
    // A nutrition panel carries neither, so they stay for the person to type.
    name: '',
    brand: '',
    servingG: servingG === undefined ? '' : String(servingG),
    kcal: asText(column.energyKcal),
    proteinG: asText(column.protein),
    carbsG: asText(column.carbs),
    fatG: asText(column.fat),
  };
}

/** A number as the form holds it, or blank when there was nothing to show. */
function asText(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

/**
 * How processed the entry reckons a food is, as the badge says it.
 *
 * NOVA is a number on the entry — 1 to 4 — and a word on the screen. Turned
 * into the word here so that no screen has to remember what 3 means, and so
 * that a group outside the four says nothing at all rather than 'NOVA 7'.
 */
export function novaWord(group: number): string | undefined {
  return (
    {
      1: 'UNPROCESSED',
      2: 'CULINARY INGREDIENT',
      3: 'PROCESSED',
      4: 'ULTRA-PROCESSED',
    } as Record<number, string>
  )[group];
}
