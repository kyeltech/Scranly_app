import type {Goal, Profile} from '../domain/targets';

/**
 * What setup produced. `read` returning this is the whole onboarding gate:
 * something saved means they have been through it, `null` means they have not.
 *
 * There is deliberately no `hasOnboarded` boolean. A flag and the answers can
 * disagree — a flag set with no profile behind it opens Today on nothing — and
 * one source of truth cannot.
 */
export type Setup = {
  profile: Profile;
  goal: Goal;
};

/**
 * Where setup is kept. An interface, not an implementation, because ADR-0007
 * leaves the store itself undecided and the gate does not care: AsyncStorage,
 * MMKV or anything else slots in behind this without the app noticing.
 */
export type SetupStore = {
  /** The saved setup, or null when there is none or what is there is unusable. */
  read: () => Promise<Setup | null>;
  write: (setup: Setup) => Promise<void>;
  /** Start again. Nothing calls this yet — Settings has no board for it. */
  clear: () => Promise<void>;
  /**
   * The same answer as `read`, without the wait, for a store that can give one.
   *
   * This is what a synchronous store buys: the first screen is known before
   * anything is drawn, so there is no loading frame between the splash and the
   * app and no moment where the route is still unknown.
   *
   * `undefined` means *cannot answer* — not *nothing saved*. A store with no
   * native module behind it has to say `undefined`, because answering `null`
   * would send a returning user back through setup on the strength of a build
   * problem. Callers fall back to `read` when they get it.
   */
  peek?: () => Setup | null | undefined;
};

/**
 * Whether a value read back out is a setup we can open the app on.
 *
 * A store hands back whatever was in it: a record half-written when the app was
 * killed, a shape from an older version, the result of a bad parse. Opening
 * Today on any of those is worse than asking the four questions again, so
 * anything that does not type-check as a setup reads as no setup at all.
 */
export function isSetup(value: unknown): value is Setup {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const {profile, goal} = value as Partial<Setup>;
  return (
    typeof profile === 'object' &&
    profile !== null &&
    typeof profile.weightKg === 'number' &&
    typeof profile.heightCm === 'number' &&
    typeof profile.ageYears === 'number' &&
    typeof profile.sex === 'string' &&
    typeof profile.activity === 'string' &&
    typeof goal === 'object' &&
    goal !== null &&
    typeof goal.targetWeightKg === 'number' &&
    typeof goal.weeks === 'number'
  );
}
