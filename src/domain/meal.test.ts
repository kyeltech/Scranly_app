import {mealAt} from './meal';

/** Any date will do — only the time of day is read. */
const at = (hour: number, minute = 0) =>
  mealAt(new Date(2026, 8, 16, hour, minute));

/**
 * Which meal it is, by the clock.
 *
 * Only one path needs this: the Log food button at the bottom of Today, which
 * is the one way in that does not come from a meal's own +. The guess is shown
 * on the screen it opens — "Add to Dinner" — so it is never applied silently.
 */
describe('the meal, by the clock', () => {
  it('is breakfast in the morning', () => {
    expect(at(6)).toBe('Breakfast');
    expect(at(10, 59)).toBe('Breakfast');
  });

  it('is lunch from eleven', () => {
    expect(at(11)).toBe('Lunch');
    expect(at(15, 59)).toBe('Lunch');
  });

  it('is dinner from four', () => {
    expect(at(16)).toBe('Dinner');
    expect(at(21, 59)).toBe('Dinner');
  });

  /**
   * Late food is a snack, not a dinner, and 3am is not breakfast either — a
   * night shift or a late one is the case this gets wrong most often, and
   * Snack is the answer that claims least.
   */
  it('is a snack late at night and in the small hours', () => {
    expect(at(22)).toBe('Snack');
    expect(at(1)).toBe('Snack');
    expect(at(3, 59)).toBe('Snack');
  });

  it('turns over to breakfast at four in the morning', () => {
    expect(at(4)).toBe('Breakfast');
  });
});
