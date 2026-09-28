/**
 * Turning what OCR saw into rows you could read aloud.
 *
 * OCR does not hand back a table. It hands back boxes of text wherever it found
 * them, and on a two-column nutrition panel the nutrient names and the number
 * columns often come back as separate boxes — because that is how they are
 * printed. Feeding those straight to the parser reads the names and loses every
 * number.
 *
 * So: group the recognised lines by where they sit vertically, then read each
 * group left to right. That makes 'Fat' and '34.9g' and '10.4g' one line again,
 * which is what the parser assumes and what a person sees.
 */

/** The shape any OCR library gives us, narrowed to what this needs. */
export type RecognisedLine = {
  text: string;
  boundingBox: {x: number; y: number; width: number; height: number};
};

/**
 * Two lines belong to the same row when their vertical spans overlap by more
 * than this share of the shorter one. Generous, because a photographed label is
 * never quite square on and the right-hand columns drift a pixel or two.
 */
const OVERLAP = 0.5;

function overlaps(a: RecognisedLine, b: RecognisedLine): boolean {
  const aTop = a.boundingBox.y;
  const aBottom = aTop + a.boundingBox.height;
  const bTop = b.boundingBox.y;
  const bBottom = bTop + b.boundingBox.height;

  const shared = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);
  if (shared <= 0) {
    return false;
  }
  const shorter = Math.min(a.boundingBox.height, b.boundingBox.height);
  return shorter > 0 && shared / shorter >= OVERLAP;
}

/**
 * Groups recognised lines into visual rows, top to bottom, each read left to
 * right. A row is compared against the lines already in it rather than against
 * its first member, so a row that drifts downward across a wide label still
 * holds together.
 */
export function toRows(lines: RecognisedLine[]): string[] {
  const sorted = [...lines]
    .filter(line => line.text.trim().length > 0)
    .sort((a, b) => a.boundingBox.y - b.boundingBox.y);

  const rows: RecognisedLine[][] = [];
  for (const line of sorted) {
    const row = rows.find(existing => existing.some(member => overlaps(member, line)));
    if (row) {
      row.push(line);
    } else {
      rows.push([line]);
    }
  }

  return rows.map(row =>
    [...row]
      .sort((a, b) => a.boundingBox.x - b.boundingBox.x)
      .map(line => line.text.trim())
      .join('  ')
      .trim(),
  );
}

/**
 * What the OCR result looks like from react-native-nitro-ocr. Kept structural
 * rather than imported, so the parser and this file owe nothing to the library
 * — which matters while that library is a beta.
 */
export type OcrResultShape = {
  blocks?: {lines?: RecognisedLine[]}[];
};

/** Every recognised line in a result, whichever block it came from. */
export function linesOf(result: OcrResultShape): RecognisedLine[] {
  return (result.blocks ?? []).flatMap(block => block.lines ?? []);
}
