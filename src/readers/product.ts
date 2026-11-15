/**
 * A barcode, turned into a food.
 *
 * Like `label.ts` and the OCR library, this owes nothing to how the bytes
 * arrived: it takes the `product` object from an Open Food Facts response and
 * hands back the shape the scan screens already render. Swapping the data
 * source later is a change here and nowhere that draws it.
 *
 * ADR-0010 is why the lookup is Open Food Facts, called straight from the
 * phone.
 */

import {food} from '../domain/food';
import type {FoodItem, MoreNutrition, Source} from '../domain/food';

/** A packaged food, per 100 g, as a scan hands it over. */
export type Product = {
  barcode: string;
  name: string;
  brand: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Fibre, when Open Food Facts states it. The app tracks a fibre target. */
  fibreG?: number;
  /**
   * The rest of the panel, and what the entry says besides numbers. None of it
   * is counted; all of it is shown on the food's own screen, which is the
   * difference between a row and a food.
   */
  kJ?: number;
  satFatG?: number;
  sugarsG?: number;
  addedSugarsG?: number;
  saltG?: number;
  sodiumG?: number;
  imageUrl?: string;
  nutriScore?: string;
  novaGroup?: number;
  category?: string;
  ingredients?: string;
  /** The pack's own serving, in grams, when Open Food Facts states one. */
  serving?: {grams: number; kcal: number};
};

/** An amount of a product, with its energy. The macros scale from the product. */
export type Serving = {
  id: string;
  label: string;
  grams: number;
  kcal: number;
};

/**
 * The servings a scanned product can offer.
 *
 * Open Food Facts carries per-100 g for everything, so that is the one every
 * scan can show. The pack's own servings — a slice, a whole pack — are not in
 * the data and are not invented; from here it is per 100 g or weigh it in
 * grams (ADR-0010). A per-serving row follows once the serving size is read.
 */
export function servingsFor(product: Product): Serving[] {
  const servings: Serving[] = [
    {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: product.kcal},
  ];
  if (product.serving) {
    servings.push({
      id: 'per-serving',
      label: `Per serving (${product.serving.grams} g)`,
      grams: product.serving.grams,
      kcal: product.serving.kcal,
    });
  }
  return servings;
}

/**
 * A serving's macros, scaled from the product's per-100 g figures by how much
 * energy the serving carries. At per 100 g the scale is one and the macros are
 * the product's own; a smaller serving is a smaller share of all three.
 */
export function servingMacros(
  product: Pick<Product, 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fibreG'>,
  serving: Pick<Serving, 'kcal'>,
): {proteinG: number; carbsG: number; fatG: number; fibreG: number} {
  const scale = serving.kcal / product.kcal;
  return {
    proteinG: product.proteinG * scale,
    carbsG: product.carbsG * scale,
    fatG: product.fatG * scale,
    fibreG: (product.fibreG ?? 0) * scale,
  };
}

/**
 * A scanned product at a chosen serving, as a food the diary can log. The
 * energy is the serving's; the macros are scaled to it. The id is the barcode,
 * so the same product reads as the same food — the diary gives each entry its
 * own id when it is logged.
 */
export function fromProduct(product: Product, serving: Serving): FoodItem {
  const macros = servingMacros(product, serving);
  const scale = serving.kcal / product.kcal;
  return food({
    id: `off-${product.barcode}`,
    name: product.name,
    brand: product.brand || undefined,
    portion: `${serving.grams} g`,
    kcal: serving.kcal,
    proteinG: macros.proteinG,
    carbsG: macros.carbsG,
    fatG: macros.fatG,
    fibreG: product.fibreG === undefined ? undefined : macros.fibreG,
    portionG: serving.grams,
    more: moreOf(product, scale),
    source: sourceOf(product),
    yours: true,
  });
}

/** The rest of the panel, scaled to the serving the way the macros are. */
function moreOf(product: Product, scale: number): MoreNutrition | undefined {
  const more: MoreNutrition = {
    ...only('kJ', product.kJ, scale),
    ...only('satFatG', product.satFatG, scale),
    ...only('sugarsG', product.sugarsG, scale),
    ...only('addedSugarsG', product.addedSugarsG, scale),
    ...only('saltG', product.saltG, scale),
    ...only('sodiumG', product.sodiumG, scale),
  };
  return Object.keys(more).length ? more : undefined;
}

/** A field, scaled, or nothing at all — never a zero standing in for silence. */
function only(
  key: keyof MoreNutrition,
  value: number | undefined,
  scale: number,
): Partial<MoreNutrition> {
  return value === undefined ? {} : {[key]: value * scale};
}

function sourceOf(product: Product): Source | undefined {
  const source: Source = {
    from: 'Open Food Facts',
    ...(product.barcode ? {barcode: product.barcode} : {}),
    ...(product.imageUrl ? {imageUrl: product.imageUrl} : {}),
    ...(product.nutriScore ? {nutriScore: product.nutriScore} : {}),
    ...(product.novaGroup === undefined ? {} : {novaGroup: product.novaGroup}),
    ...(product.category ? {category: product.category} : {}),
    ...(product.ingredients ? {ingredients: product.ingredients} : {}),
  };
  return source;
}

/**
 * The pack serving in grams, when Open Food Facts states one. A serving in
 * millilitres is not grams and the app logs grams, so it is left to the weigh
 * path rather than guessed at. The energy is the pack's own if stated, else
 * scaled from per 100 g.
 */
function servingOf(
  product: OffProduct,
  per100Kcal: number,
): {grams: number; kcal: number} | undefined {
  const match = /([\d.]+)\s*g\b/i.exec(product.serving_size ?? '');
  if (!match) {
    return undefined;
  }
  const grams = Number(match[1]);
  if (!Number.isFinite(grams) || grams <= 0) {
    return undefined;
  }
  const ownKcal = product.nutriments?.['energy-kcal_serving'];
  const kcal =
    typeof ownKcal === 'number' ? ownKcal : Math.round((per100Kcal * grams) / 100);
  return {grams, kcal};
}

/** The `product` object Open Food Facts returns, read loosely. */
type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  /** How the pack states its serving: "50 g", "1 portion (330 ml)". */
  serving_size?: string;
  /** Broad to specific, comma separated: 'Plant-based foods, Nuts, Whole almonds'. */
  categories?: string;
  ingredients_text?: string;
  image_front_small_url?: string;
  /** 'a' to 'e', or 'unknown' / 'not-applicable' for an entry it cannot grade. */
  nutriscore_grade?: string;
  nova_group?: number;
  nutriments?: Record<string, unknown>;
};

/** A nutriment, when the entry states one. A missing field is not a zero. */
function stated(nutriments: Record<string, unknown>, key: string): number | undefined {
  const value = nutriments[key];
  return typeof value === 'number' ? value : undefined;
}

/** Only where it is a number, so the field is absent rather than undefined. */
function when(key: string, value: number | undefined): Record<string, number> {
  return value === undefined ? {} : {[key]: value};
}

/**
 * The most specific category, which is the last one listed: 'Plant-based
 * foods' is true of half the database, 'Whole almonds' is the one worth
 * printing — and the one that picks the serving guide's card.
 */
function categoryOf(categories: string | undefined): string | undefined {
  const named = (categories ?? '')
    .split(',')
    .map(one => one.trim())
    .filter(Boolean);
  return named.at(-1);
}

/**
 * The grade, in the case the badge shows it. Open Food Facts answers 'unknown'
 * or 'not-applicable' for an entry it cannot grade, and neither is a letter.
 */
function gradeOf(grade: string | undefined): string | undefined {
  return grade && /^[a-e]$/i.test(grade) ? grade.toUpperCase() : undefined;
}

/** What a lookup came to: a food, a confirmed miss, or a failure to reach it. */
export type LookupResult =
  | {status: 'found'; product: Product}
  | {status: 'not-found'}
  | {status: 'error'};

/** What a search came to: the products it found (maybe none), or a failure. */
export type SearchResult =
  | {status: 'ok'; products: Product[]}
  | {status: 'error'};

/** Only the slice of `fetch` this uses, so a test can hand over a stand-in. */
type Fetcher = (
  url: string,
  init?: {headers?: Record<string, string>},
) => Promise<{ok: boolean; status: number; json: () => Promise<any>}>;

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';
const SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl';
const FIELDS =
  'code,product_name,brands,serving_size,nutriments,categories,ingredients_text,' +
  'image_front_small_url,nutriscore_grade,nova_group';

/**
 * Open Food Facts asks every request to name itself; reads need nothing more.
 * ADR-0010 verified there is no API key to hold, which is why this is called
 * straight from the phone and not through a server.
 */
const USER_AGENT = 'Scranly/0.1 (ezekielayikoe9@gmail.com)';

/**
 * Map an Open Food Facts `product` to ours, or `undefined` when it carries too
 * little to log: a nameless entry cannot be shown, and one with no energy is
 * nothing to count — either is no better than a barcode that was never found.
 */
export function productFromOff(product: OffProduct): Product | undefined {
  const nutriments = product.nutriments ?? {};
  const name = product.product_name ?? '';
  const kcal = nutriments['energy-kcal_100g'];
  if (!name || typeof kcal !== 'number') {
    return undefined;
  }
  const serving = servingOf(product, kcal);
  const category = categoryOf(product.categories);
  const grade = gradeOf(product.nutriscore_grade);
  const ingredients = product.ingredients_text?.trim();
  return {
    barcode: product.code ?? '',
    name,
    brand: product.brands ?? '',
    kcal,
    proteinG: nutriments.proteins_100g as number,
    carbsG: nutriments.carbohydrates_100g as number,
    fatG: nutriments.fat_100g as number,
    ...when('fibreG', stated(nutriments, 'fiber_100g')),
    // The rest of the panel. Absent where the entry is silent, kept where it
    // states a zero — almonds really do have no added sugar.
    ...when('kJ', stated(nutriments, 'energy-kj_100g')),
    ...when('satFatG', stated(nutriments, 'saturated-fat_100g')),
    ...when('sugarsG', stated(nutriments, 'sugars_100g')),
    ...when('addedSugarsG', stated(nutriments, 'added-sugars_100g')),
    ...when('saltG', stated(nutriments, 'salt_100g')),
    ...when('sodiumG', stated(nutriments, 'sodium_100g')),
    ...(product.image_front_small_url ? {imageUrl: product.image_front_small_url} : {}),
    ...(grade ? {nutriScore: grade} : {}),
    ...(product.nova_group === undefined ? {} : {novaGroup: product.nova_group}),
    ...(category ? {category} : {}),
    ...(ingredients ? {ingredients} : {}),
    ...(serving ? {serving} : {}),
  };
}

/**
 * Look a barcode up in Open Food Facts, called straight from the phone.
 *
 * The `fetcher` is injected so the behaviour can be tested without a network;
 * at runtime it defaults to the platform `fetch`.
 */
export async function lookupBarcode(
  barcode: string,
  fetcher: Fetcher = fetch as unknown as Fetcher,
): Promise<LookupResult> {
  let body: {product?: OffProduct};
  try {
    const res = await fetcher(`${ENDPOINT}/${barcode}.json?fields=${FIELDS}`, {
      headers: {'User-Agent': USER_AGENT},
    });
    // 429 is the rate limit, any other non-2xx a server problem: a failure to
    // reach the data, not a verdict on the barcode. A miss is a 200 that says
    // so in the body, handled below.
    if (!res.ok) {
      return {status: 'error'};
    }
    body = await res.json();
  } catch {
    return {status: 'error'};
  }
  const product = body.product ? productFromOff(body.product) : undefined;
  return product ? {status: 'found', product} : {status: 'not-found'};
}

/**
 * Search Open Food Facts by name, called straight from the phone.
 *
 * Search is rate-limited harder than a read — about ten a minute — and the docs
 * warn against firing one per keystroke, so the caller debounces (ADR-0010).
 * Nameless or dataless hits are dropped: a search throws up plenty, and one
 * that cannot be shown or logged is no result at all.
 */
export async function searchProducts(
  query: string,
  fetcher: Fetcher = fetch as unknown as Fetcher,
): Promise<SearchResult> {
  const url =
    `${SEARCH}?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&fields=${FIELDS}&page_size=20`;
  try {
    const res = await fetcher(url, {headers: {'User-Agent': USER_AGENT}});
    if (!res.ok) {
      return {status: 'error'};
    }
    const body = await res.json();
    const raw: OffProduct[] = Array.isArray(body.products) ? body.products : [];
    const products = raw
      .map(productFromOff)
      .filter((p): p is Product => p !== undefined);
    return {status: 'ok', products};
  } catch {
    return {status: 'error'};
  }
}
