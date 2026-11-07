import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Header, Screen, Segmented} from '../ui';
import {MEALS} from '../domain/day';
import type {MealName} from '../domain/day';
import type {FoodItem} from '../domain/food';
import {type as type_, useTheme} from '../theme';
import {foodDetail as styles} from '../styles';

/**
 * A food, in full, before it is logged.
 *
 * Tapping a row on Add food opens this rather than logging straight away — the
 * numbers, including fibre, where the + on the row is the quick path and this is
 * the considered one. Built from the scan found-sheet's shape and the screen
 * frame, so it is the same app, not a new one.
 *
 * The live portion stepper is a later slice: a `FoodItem`'s portion is a label
 * ("1 medium, 118 g"), not always grams, so rescaling needs a gram basis first.
 */
export default function FoodDetail({
  food,
  meal = 'Lunch',
  onBack,
  onLog,
}: {
  food: FoodItem;
  meal?: MealName;
  onBack?: () => void;
  onLog?: (food: FoodItem, meal: MealName) => void;
}) {
  const t = useTheme();
  const [chosenMeal, setChosenMeal] = useState<MealName>(meal);

  // Fibre shows a dash when it is unknown, never a zero — a food with no fibre
  // data has not said it has none.
  const chips: [string, string][] = [
    ['PROT', `${food.proteinG}`],
    ['CARB', `${food.carbsG}`],
    ['FAT', `${food.fatG}`],
    ['FIBRE', food.fibreG === undefined ? '—' : `${food.fibreG}`],
  ];

  return (
    <Screen>
      <Header title="Add food" onBack={onBack} />
      <View style={styles.body}>
        <Text style={[type_.productTitle, {color: t.text}]}>{food.name}</Text>
        <Text style={[styles.sub, {color: t.textMuted}]}>
          {[food.brand, food.portion].filter(Boolean).join(' · ')}
        </Text>

        <View style={styles.figureRow}>
          <Text style={[styles.figure, {color: t.text}]}>{food.kcal}</Text>
          <Text style={[styles.unit, {color: t.textMuted}]}>kcal</Text>
        </View>

        <View style={styles.chips}>
          {chips.map(([label, value]) => (
            <View key={label} style={[styles.chip, {backgroundColor: t.fill}]}>
              <Text style={[styles.chipLabel, {color: t.textMuted}]}>{label}</Text>
              <Text style={[styles.chipValue, {color: t.text}]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.meals}>
          <Segmented
            options={MEALS}
            value={chosenMeal}
            onChange={next => setChosenMeal(next as MealName)}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label={`Add to ${chosenMeal.toLowerCase()}`}
          onPress={() => onLog?.(food, chosenMeal)}
        />
      </View>
    </Screen>
  );
}
