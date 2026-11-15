/**
 * A weight read off a scale's display, as a number the diary can keep.
 *
 * Owes nothing to how the digits were read — a TFLite model on the camera
 * later, a stand-in for now (ADR-0011) — the same way `readers/label.ts` owes
 * nothing to the OCR behind it. Its one job is to turn a read into a plausible
 * weight, or to turn it down: a seven-segment read goes wrong at a glare or an
 * angle, and a misread logged is worse than a misread caught, because the
 * screen can send the person to type it instead.
 */

/** A plausible adult weight in kilograms. Outside this, a read is a misread. */
const MIN_KG = 20;
const MAX_KG = 400;

/** The read as kilograms, to one decimal, or `undefined` when it is not one. */
export function toWeight(raw: string): number | undefined {
  const digits = raw.replace(/[^\d.]/g, '');
  const kg = Number.parseFloat(digits);
  if (!Number.isFinite(kg) || kg < MIN_KG || kg > MAX_KG) {
    return undefined;
  }
  return Math.round(kg * 10) / 10;
}
