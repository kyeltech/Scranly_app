import React, {useState} from 'react';
import {Image, Pressable, ScrollView, Text, View} from 'react-native';
import {Button, Header, Screen, Segmented, useActionBarInset} from '../ui';
import {ChevronRight, Hand} from '../ui/icons';
import {withThousands} from '../lib/format';
import {MEALS} from '../domain/day';
import type {MealName} from '../domain/day';
import {gramsOf} from '../domain/portion';
import {novaWord} from '../domain/food';
import type {FoodItem} from '../domain/food';
import {type as type_, useTheme} from '../theme';
import {foodDetail as styles} from '../styles';

/**
 * A food, in full, before it is logged.
 *
 * Tapping a row on Add food opens this rather than logging straight away: the
 * + on the row is the quick path and this is the considered one. It shows what
 * the entry actually carries — the whole panel as a pack prints it, the pack's
 * own photo, the scores, the ingredients — rather than the five figures the
 * day happens to total.
 *
 * **A dash is a blank, never a zero.** A pack that never stated its salt has
 * not said it has none, and the difference matters more here than anywhere
 * else in the app, because this is the screen somebody checks against the tin
 * in their hand.
 */
export default function FoodDetail({
  food,
  meal = 'Lunch',
  day,
  onBack,
  onAmount,
  onGuide,
  onEdit,
  onSource,
  onDay,
  onLog,
}: {
  food: FoodItem;
  meal?: MealName;
  /** The day it will be logged to, named as Today names it. */
  day?: string;
  onBack?: () => void;
  /** Change how much. Offered only where the portion's weight is knowable. */
  onAmount?: (food: FoodItem) => void;
  /** What a portion of this looks like, for a pack that states no serving. */
  onGuide?: (food: FoodItem) => void;
  onEdit?: (food: FoodItem) => void;
  /** Open the entry this food came from, where it can be corrected at source. */
  onSource?: (food: FoodItem) => void;
  onDay?: () => void;
  onLog?: (food: FoodItem, meal: MealName) => void;
}) {
  const t = useTheme();
  const barInset = useActionBarInset();
  const [chosenMeal, setChosenMeal] = useState<MealName>(meal);

  const more = food.more ?? {};
  const source = food.source;
  // Only where the weight is knowable: there is no honest answer for what 50 g
  // of a stock cube comes to, so the row reads and does not open.
  const changeable = gramsOf(food) !== undefined && onAmount !== undefined;

  /** Each row of the panel, in the order a UK pack prints them. */
  const panel: {name: string; value?: number; under?: boolean}[] = [
    {name: 'Fat', value: food.fatG},
    {name: 'of which saturates', value: more.satFatG, under: true},
    {name: 'Carbohydrate', value: food.carbsG},
    {name: 'of which sugars', value: more.sugarsG, under: true},
    {name: 'of which added', value: more.addedSugarsG, under: true},
    {name: 'Fibre', value: food.fibreG},
    {name: 'Protein', value: food.proteinG},
    {name: 'Salt', value: more.saltG},
    {name: 'as sodium', value: more.sodiumG, under: true},
  ];

  return (
    <Screen insetBottom={false}>
      <Header title="Add food" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.body, {paddingBottom: 120 + barInset}]}>
        <View style={styles.identity}>
          {source?.imageUrl ? (
            <Image
              source={{uri: source.imageUrl}}
              style={[styles.photo, {borderColor: t.line, backgroundColor: t.fill}]}
              accessibilityRole="image"
              accessibilityLabel={`${food.name}, as the pack looks`}
            />
          ) : (
            <View
              style={[styles.photo, {borderColor: t.line, backgroundColor: t.fill}]}
            />
          )}
          <View style={styles.identityText}>
            <Text style={[type_.productTitle, {color: t.text}]}>{food.name}</Text>
            <Text style={[styles.sub, {color: t.textMuted}]}>
              {[food.brand, source?.category].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>

        {/* Only what the entry carries. An empty badge says nothing twice. */}
        {source?.nutriScore || source?.novaGroup || source?.from ? (
          <View style={styles.badges}>
            {source.nutriScore ? (
              <View
                style={[
                  styles.badge,
                  {backgroundColor: t.verdict.ok, borderColor: t.verdict.ok},
                ]}>
                <View style={[styles.grade, {backgroundColor: t.status.under}]}>
                  <Text style={[styles.gradeLetter, {color: t.bg}]}>
                    {source.nutriScore}
                  </Text>
                </View>
                <Text style={[styles.badgeLabel, {color: t.status.under}]}>
                  NUTRI-SCORE
                </Text>
              </View>
            ) : null}
            {source.novaGroup === undefined ? null : (
              <View style={[styles.badge, {borderColor: t.line}]}>
                <Text style={[styles.badgeLabel, {color: t.textMuted}]}>
                  {/* The number is the entry's; the word is what it means. */}
                  {[`NOVA ${source.novaGroup}`, novaWord(source.novaGroup)]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            )}
            {source.from ? (
              <View style={[styles.badge, {borderColor: t.line}]}>
                {/* Short here, because the row at the foot of the screen says
                    it in full and names the entry with it. */}
                <Text style={[styles.badgeLabel, {color: t.textMuted}]}>
                  {source.from === 'Open Food Facts' ? 'OFF' : source.from}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, {color: t.textMuted}]}>AMOUNT</Text>
        <Pressable
          onPress={changeable ? () => onAmount?.(food) : undefined}
          disabled={!changeable}
          accessibilityRole={changeable ? 'button' : undefined}
          accessibilityLabel={
            changeable ? `Change how much, currently ${food.portion}` : undefined
          }
          style={[styles.card, styles.row, {backgroundColor: t.fill}]}>
          <Text style={[type_.body, {color: t.text}]}>How much</Text>
          <View style={styles.rowValue}>
            <Text style={[type_.bodyStrong, {color: t.text}]}>{food.portion}</Text>
            {changeable ? <ChevronRight colour={t.textFaint} size={14} /> : null}
          </View>
        </Pressable>

        {onGuide ? (
          <Pressable
            onPress={() => onGuide(food)}
            accessibilityRole="button"
            style={styles.guide}>
            <Hand colour={t.status.under} size={16} />
            <Text style={[styles.guideLabel, {color: t.status.under}]}>
              See what a portion looks like
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={[styles.headLabel, {color: t.textMuted}]}>NUTRITION</Text>
          {onEdit ? (
            <Pressable onPress={() => onEdit(food)} accessibilityRole="button">
              <Text style={[styles.link, {color: t.status.under}]}>
                Edit these numbers
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.card, {backgroundColor: t.fill}]}>
          <View style={styles.panel}>
            <View style={styles.figureBlock}>
              <Text style={[styles.figure, {color: t.text}]}>
                {withThousands(Math.round(food.kcal))}
              </Text>
              <Text style={[styles.unit, {color: t.textMuted}]}>kcal</Text>
              {more.kJ === undefined ? null : (
                <Text style={[styles.kj, {color: t.textFaint}]}>
                  {`${withThousands(Math.round(more.kJ))} kJ`}
                </Text>
              )}
            </View>
            <View style={styles.rows}>
              {panel.map(({name, value, under}) => (
                <View key={name} style={[styles.nutrient, under && styles.under]}>
                  <Text
                    style={[
                      under ? styles.underName : styles.nutrientName,
                      {color: under ? t.textMuted : t.text},
                    ]}>
                    {name}
                  </Text>
                  <Text
                    style={[
                      under ? styles.underValue : styles.nutrientValue,
                      {color: value === undefined ? t.textFaint : under ? t.textMuted : t.text},
                    ]}>
                    {value === undefined ? '—' : `${value} g`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.foot, {borderTopColor: t.line}]}>
            <Text style={[styles.footLabel, {color: t.textMuted}]}>
              {`Stated for ${food.portion}, as the entry gives it`}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, {color: t.textMuted}]}>LOG TO</Text>
        {day ? (
          <Pressable
            onPress={onDay}
            accessibilityRole="button"
            accessibilityLabel={`Change the day, currently ${day}`}
            style={[styles.card, styles.row, {backgroundColor: t.fill}]}>
            <Text style={[type_.body, {color: t.text}]}>Day</Text>
            <View style={styles.rowValue}>
              <Text style={[type_.bodyStrong, {color: t.text}]}>{day}</Text>
              <ChevronRight colour={t.textFaint} size={14} />
            </View>
          </Pressable>
        ) : null}
        <View style={styles.meals}>
          <Segmented
            options={MEALS}
            value={chosenMeal}
            onChange={next => setChosenMeal(next as MealName)}
          />
        </View>

        {source?.barcode && source.from ? (
          <Pressable
            onPress={onSource ? () => onSource(food) : undefined}
            disabled={!onSource}
            accessibilityRole={onSource ? 'button' : undefined}
            style={[styles.card, styles.row, {backgroundColor: t.fill}]}>
            <Text style={[styles.entry, {color: t.textMuted}]}>
              {`Entry ${source.barcode} on ${source.from}`}
            </Text>
            {onSource ? <ChevronRight colour={t.textFaint} size={14} /> : null}
          </Pressable>
        ) : null}

        {source?.ingredients ? (
          <>
            <Text style={[styles.sectionLabel, {color: t.textMuted}]}>
              INGREDIENTS
            </Text>
            <View style={[styles.card, {backgroundColor: t.fill}]}>
              <Text style={[styles.ingredients, {color: t.text}]}>
                {source.ingredients}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.actions, {backgroundColor: t.bg, paddingBottom: 20 + barInset}]}>
        <Button
          label={`Add to ${chosenMeal.toLowerCase()}`}
          sub={`${withThousands(Math.round(food.kcal))} kcal`}
          onPress={() => onLog?.(food, chosenMeal)}
        />
      </View>
    </Screen>
  );
}
