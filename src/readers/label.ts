/**
 * Reading a UK nutrition label.
 *
 * OCR hands back lines of text. This turns them into numbers. It is the actual
 * work of the label reader, and it is deliberately independent of which OCR
 * library produced the lines — Apple Vision, ML Kit or anything else — so the
 * library can be swapped without touching any of this.
 *
 * What makes UK labels awkward, all of it seen on real packaging:
 *
 *   Energy        1728kJ / 416kcal      two units on one line
 *   Fat           34.9g                 plain
 *   of which saturates   21.7g          an indented sub-row of the line above
 *   Salt          <0.5g                 a threshold, not a number
 *   Carbohydrate  0,1g                  a comma decimal on imported packaging
 *   Energy (kcal) 416                   the unit in the header, not the value
 *
 * Two columns is the norm — per 100 g, and per serving — and the app has to
 * know which is which, because saving the wrong one doubles or halves the day.
 */

export type Nutrient =
  | 'energyKcal'
  | 'fat'
  | 'saturates'
  | 'carbs'
  | 'sugars'
  | 'fibre'
  | 'protein'
  | 'salt';

export type LabelReading = {
  /** Grams the second column is stated for, when the label says. */
  servingG?: number;
  per100: Partial<Record<Nutrient, number>>;
  perServing: Partial<Record<Nutrient, number>>;
  /**
   * Lines that could not be placed. Surfaced rather than swallowed: a label
   * the parser half-read should say so, not quietly drop the fat.
   */
  unread: string[];
};

/**
 * How each nutrient announces itself. Order matters — the sub-rows are tested
 * before their parents, because 'of which saturates' also contains nothing
 * that would match 'fat' but 'saturated fat' does.
 */
const NUTRIENTS: [Nutrient, RegExp][] = [
  ['saturates', /satur/i],
  ['sugars', /sugar/i],
  ['fibre', /fibre|fiber/i],
  ['energyKcal', /energy|calorie|kcal|kj/i],
  ['fat', /\bfat\b/i],
  ['carbs', /carbohydrate|\bcarbs?\b/i],
  ['protein', /protein/i],
  ['salt', /\bsalt\b|sodium/i],
];

/** A number, with an optional decimal comma and an optional < threshold. */
const NUMBER = /(?:<\s*)?(\d+(?:[.,]\d+)?)/g;

function toNumber(raw: string): number {
  return Number.parseFloat(raw.replace(',', '.'));
}

/**
 * Energy is the one row with two units on it. kcal is what the app counts, so
 * prefer the kcal figure and fall back to converting the kJ one.
 */
/** 4.184 kJ to the kcal. Rounded, because a label's own kcal is rounded too. */
const toKcal = (kj: number) => Math.round(kj / 4.184);

function energyFrom(line: string): number[] {
  // The usual shape: the unit sits against the number.
  const kcal = [...line.matchAll(/(\d+(?:[.,]\d+)?)\s*k?cal/gi)].map(m => toNumber(m[1]));
  if (kcal.length) {
    return kcal;
  }
  const kj = [...line.matchAll(/(\d+(?:[.,]\d+)?)\s*kj/gi)].map(m => toNumber(m[1]));
  if (kj.length) {
    return kj.map(toKcal);
  }

  // Otherwise the unit is in the header and the values are bare:
  //   'Energy (kcal)      416'
  //   'Energy (kJ/kcal)   1728/416   518/125'
  const plain = [...line.matchAll(NUMBER)].map(m => toNumber(m[1]));
  const saysKcal = /kcal|\bcal/i.test(line);
  const saysKj = /kj/i.test(line);

  if (saysKj && saysKcal) {
    // Both units per column, kJ first — so kcal is every second figure.
    return plain.filter((_, i) => i % 2 === 1);
  }
  if (saysKj) {
    return plain.map(toKcal);
  }
  // kcal, or a bare 'Energy 416', which on a UK label means kcal.
  return plain;
}

/**
 * The serving the second column is for. Labels say it several ways:
 *   'per 30g'  ·  'per serving (30 g)'  ·  'Each slice (30g) contains'
 */
function servingFrom(lines: string[]): number | undefined {
  for (const line of lines) {
    if (/per\s*100\s*m?[lg]/i.test(line) && !/per\s*serving/i.test(line)) {
      // A per-100 header may carry the serving column beside it: 'per 100g per 30g'.
      const others = [...line.matchAll(/per\s*(\d+(?:[.,]\d+)?)\s*m?[lg]/gi)]
        .map(m => toNumber(m[1]))
        .filter(v => v !== 100);
      if (others.length) {
        return others[0];
      }
    }
    const explicit = line.match(/(?:serving|slice|portion|each|pack)[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*m?[lg]/i);
    if (explicit) {
      return toNumber(explicit[1]);
    }
  }
  return undefined;
}

/** True where a line is a column header rather than a nutrient row. */
function isHeader(line: string): boolean {
  return /typical values|per\s*100|nutrition|reference intake|\bri\b/i.test(line);
}

function nutrientOf(line: string): Nutrient | undefined {
  for (const [nutrient, pattern] of NUTRIENTS) {
    if (pattern.test(line)) {
      return nutrient;
    }
  }
  return undefined;
}

/**
 * Turns OCR lines into a reading.
 *
 * The first number on a row is taken as per 100 g and the second, if there is
 * one, as per serving — which is the order every UK label uses. A row with one
 * number only fills per 100 g, and the screen then has only one column to
 * offer, which is the honest outcome rather than a guess at the other.
 */
export function parseLabel(lines: string[]): LabelReading {
  const per100: Partial<Record<Nutrient, number>> = {};
  const perServing: Partial<Record<Nutrient, number>> = {};
  const unread: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      continue;
    }

    const nutrient = nutrientOf(line);
    if (!nutrient || isHeader(line)) {
      // A header is expected and not worth reporting; anything else is a miss.
      if (!isHeader(line) && /\d/.test(line)) {
        unread.push(line);
      }
      continue;
    }

    const values =
      nutrient === 'energyKcal'
        ? energyFrom(line)
        : [...line.matchAll(NUMBER)].map(m => toNumber(m[1]));

    if (!values.length) {
      unread.push(line);
      continue;
    }

    // Don't let a second reading of the same nutrient overwrite the first:
    // 'Fat' before 'of which saturates' means the fat row is the fat row.
    if (per100[nutrient] === undefined) {
      per100[nutrient] = values[0];
      if (values.length > 1) {
        perServing[nutrient] = values[1];
      }
    }
  }

  return {servingG: servingFrom(lines), per100, perServing, unread};
}
