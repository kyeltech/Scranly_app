import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

type P = {colour: string; size?: number; testID?: string};

const stroke = (d: string, w: number) =>
  function Icon({colour, size = 18, testID}: P) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" testID={testID}>
        <Path
          d={d}
          fill="none"
          stroke={colour}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };

export const ChevronLeft = stroke('M15 5l-7 7 7 7', 2.4);
export const ChevronRight = stroke('M9 6l6 6-6 6', 2.4);
export const ChevronDown = stroke('M6 9l6 6 6-6', 2.4);
export const Plus = stroke('M12 5v14M5 12h14', 2.6);
export const Check = stroke('M5 12.5l4.5 4.5L19 7', 3);
export const Search = stroke('M20 20l-3.6-3.6', 2.2);
export const Close = stroke('M6 6l12 12M18 6L6 18', 2.6);
export const Barcode = stroke(
  'M4 7V5.5A1.5 1.5 0 015.5 4H7M17 4h1.5A1.5 1.5 0 0120 5.5V7M20 17v1.5a1.5 1.5 0 01-1.5 1.5H17M7 20H5.5A1.5 1.5 0 014 18.5V17M8 9v6M11.5 9v6M15.5 9v6',
  2,
);
/**
 * The scan button on Today. Not the same glyph as `Barcode`, which is the
 * corner-brackets one inside the add-food search field — the design uses a
 * scanner here and a target there, and they are doing different jobs.
 */
export function Scanner({colour, size = 19, testID}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" testID={testID}>
      <Rect
        x={3}
        y={7}
        width={18}
        height={12}
        rx={2}
        fill="none"
        stroke={colour}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <Path
        d="M7 7V5h10v2"
        fill="none"
        stroke={colour}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** The week-so-far pill on Today. */
export const TrendUp = stroke('M4 15l6-6 4 4 6-7', 2.2);

/** The torch toggle in the viewfinder header. */
export const Torch = stroke('M13 2L5 14h6l-1 8 8-12h-6l1-8z', 2);
/** The warning in the no-match sheet, and anywhere a read went wrong. */
export const Warning = stroke('M12 7v6M12 17h.01', 2.4);
/** The result-count sort control on the search results. */
export const Sort = stroke('M4 6h16M7 12h10M10 18h4', 2.2);

export const Camera = stroke('M3 8a2 2 0 012-2h3l1.5-2h5L19 6h0a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z', 2);

export function SearchGlass({colour, size = 18}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={7} fill="none" stroke={colour} strokeWidth={2.2} />
      <Path d="M20 20l-3.6-3.6" stroke={colour} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function Cog({colour, size = 16}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={3} fill="none" stroke={colour} strokeWidth={2} />
      <Path
        d="M4 12h2M18 12h2M12 4v2M12 18v2"
        stroke={colour}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** The Scranly mark: a fork whose tines are a bar chart. */
export function Mark({colour, size = 72}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Path d="M52 41a7 7 0 0114 0v39H52z" fill={colour} />
      <Path d="M73 53a7 7 0 0114 0v27H73z" fill={colour} />
      <Path d="M94 33a7 7 0 0114 0v47H94z" fill={colour} />
      <Path d="M48 86a8 8 0 018-8h48a8 8 0 010 16H56a8 8 0 01-8-8z" fill={colour} />
      <Path d="M71 92h18v31a9 9 0 01-18 0z" fill={colour} />
    </Svg>
  );
}

export function Info({colour, size = 15}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={colour} strokeWidth={2.4} />
      <Path d="M12 8v5" stroke={colour} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M12 16h.01" stroke={colour} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}
