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

/**
 * A table row names its nutrient and then states the numbers: 'Energy 1728kJ /
 * 416kcal', 'Fat 34.9g'. Prose about the pack does the opposite — it mentions
 * the unit at the end, after a serving size: 'Each slice (30g) contains
 * 75kcal'.
 *
 * Reading that sentence as the energy row is how a photo that caught only the
 * small print under a panel produced a complete-looking reading of one row,
 * 75 kcal per 100 g, with nothing flagged as unread because the line had
 * matched. A footnote is not a nutrition table.
 *
 * So the keyword has to come before the first number. A line that mentions a
 * nutrient only after its numbers is prose, and is passed over in silence the
 * way a column header is — reporting it as unread would put a warning on every
 * label that carries a perfectly ordinary footnote.
 */
function isProse(line: string, at: number): boolean {
  const firstDigit = line.search(/\d/);
  return firstDigit !== -1 && at > firstDigit;
}

function nutrientOf(line: string): Nutrient | undefined | 'prose' {
  for (const [nutrient, pattern] of NUTRIENTS) {
    const at = line.match(pattern)?.index;
    if (at === undefined) {
      continue;
    }
    return isProse(line, at) ? 'prose' : nutrient;
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
    if (!nutrient || nutrient === 'prose' || isHeader(line)) {
      // A header and a footnote are both expected and neither is worth
      // reporting; anything else carrying a number is a miss.
      if (nutrient !== 'prose' && !isHeader(line) && /\d/.test(line)) {
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

/**
 * Whether this is a nutrition panel or a scrap of one.
 *
 * A photo that catches the small print and none of the table still parses: it
 * comes back with a serving size, one row and nothing marked unread, and the
 * result sheet presents it as a finished reading with a Save button under it.
 * That happened on the first real label, and the screen gave no sign of it.
 *
 * So there is a floor. Energy is on every panel in the country, and a panel
 * carries more than two rows — anything below that is a fragment, and a
 * fragment is a failed read rather than a thin answer. The cost of the floor is
 * a re-snap when it misjudges; the cost of no floor is a wrong number in the
 * diary that looks exactly like a right one.
 */
export function isUsable(reading: LabelReading): boolean {
  return (
    reading.per100.energyKcal !== undefined &&
    Object.keys(reading.per100).length >= 3
  );
}

/** The order a UK label prints them, which is the order to show them back. */
const ROW_ORDER: [Nutrient, string, boolean][] = [
  ['energyKcal', 'Energy', false],
  ['fat', 'Fat', false],
  ['saturates', 'of which saturates', true],
  ['carbs', 'Carbohydrate', false],
  ['sugars', 'of which sugars', true],
  ['fibre', 'Fibre', false],
  ['protein', 'Protein', false],
  ['salt', 'Salt', false],
];

/** kcal has no unit suffix on the label; everything else is grams. */
function shown(nutrient: Nutrient, value: number | undefined): string {
  if (value === undefined) {
    return '—';
  }
  return nutrient === 'energyKcal' ? `${value} kcal` : `${value} g`;
}

/**
 * A reading, as the result sheet lists it. Only what was actually read: a
 * nutrient the label did not carry is left out rather than shown as zero, and
 * one that was read for 100 g but not per serving shows a dash in that column.
 */
export function toLabelRows(read: {reading: LabelReading}): {
  id: string;
  name: string;
  under?: boolean;
  per100: string;
  perServing: string;
}[] {
  const {per100, perServing} = read.reading;
  return ROW_ORDER.filter(([nutrient]) => per100[nutrient] !== undefined).map(
    ([nutrient, name, under]) => ({
      id: nutrient,
      name,
      under,
      per100: shown(nutrient, per100[nutrient]),
      perServing: shown(nutrient, perServing[nutrient]),
    }),
  );
}
