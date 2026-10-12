import type {FoodItem} from '../domain/food';

/**
 * The foods this person has created.
 *
 * Third store, same seam as the other two. Separate from the diary because a
 * food and a meal are different things: creating a food once should make it
 * available forever, while logging it is a thing that happened on a day.
 */
export type FoodStore = {
  read: () => Promise<FoodItem[]>;
  add: (item: FoodItem) => Promise<void>;
  peek?: () => FoodItem[] | undefined;
};

/** Whether a value read back out is a food that can be logged. */
export function isFood(value: unknown): value is FoodItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const f = value as Partial<FoodItem>;
  return (
    typeof f.id === 'string' &&
    typeof f.name === 'string' &&
    typeof f.portion === 'string' &&
    typeof f.kcal === 'number' &&
    typeof f.proteinG === 'number' &&
    typeof f.carbsG === 'number' &&
    typeof f.fatG === 'number' &&
    typeof f.meta === 'string'
  );
}
