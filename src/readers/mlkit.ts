import {toRows} from './rows';
import type {RecognisedLine} from './rows';

/**
 * Turning ML Kit's result into the rows the label parser reads.
 *
 * Two differences from the shape `rows.ts` works in, both small and both worth
 * doing here rather than bending the parser around one library:
 *
 *   · ML Kit positions a line with {left, top, width, height}; the grouping
 *     wants {x, y, width, height}.
 *   · `frame` is optional. A line without one cannot be placed against its
 *     neighbours, so it is kept as its own row rather than guessed at or
 *     dropped — a label that half-positions should lose its columns, not its
 *     numbers.
 */

/** What @react-native-ml-kit/text-recognition returns, narrowed to what matters. */
export type MlKitResult = {
  text?: string;
  blocks?: {
    lines?: {
      text: string;
      frame?: {left: number; top: number; width: number; height: number};
    }[];
  }[];
};

export function rowsFromMlKit(result: MlKitResult): string[] {
  const positioned: RecognisedLine[] = [];
  const unpositioned: string[] = [];

  for (const block of result.blocks ?? []) {
    for (const line of block.lines ?? []) {
      if (!line.text?.trim()) {
        continue;
      }
      if (line.frame) {
        positioned.push({
          text: line.text,
          boundingBox: {
            x: line.frame.left,
            y: line.frame.top,
            width: line.frame.width,
            height: line.frame.height,
          },
        });
      } else {
        unpositioned.push(line.text.trim());
      }
    }
  }

  return [...toRows(positioned), ...unpositioned];
}

/**
 * ML Kit's iOS side does `NSURL URLWithString:`, which needs a scheme — and the
 * camera hands back a bare filesystem path. Without this the read fails with an
 * empty result rather than an error, which is the worst kind of bug to chase.
 */
export function asImageUrl(path: string): string {
  return path.startsWith('/') ? `file://${path}` : path;
}
