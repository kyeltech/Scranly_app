/**
 * Thousands separators done by hand rather than with toLocaleString, which
 * depends on which ICU data the device shipped with — Android builds without
 * full ICU quietly return an unseparated string, and the number on Today is
 * the one thing that must never render differently on someone else's phone.
 */
export function withThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** A true minus sign (U+2212), not a hyphen. It aligns with the digits. */
export const MINUS = '−';
