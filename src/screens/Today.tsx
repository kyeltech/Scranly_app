import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Ring from '../components/Ring';
import {Cog} from '../ui/icons';
import {MINUS, withThousands} from '../lib/format';
import {Screen} from '../ui';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';
import type {Palette} from '../theme';
import type {DayView, MacroKey} from '../domain/day';

type Props = {
  day: DayView;
  onScan?: () => void;
  onLogFood?: () => void;
  /** Today's header is the navigation — there is no tab bar. */
  onWeek?: () => void;
  onSettings?: () => void;
};

const MACRO_COLOUR: Record<MacroKey, keyof Palette['macroBar']> = {
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
};

/**
 * The screen the app opens on. It renders what it is handed and works nothing
 * out for itself — see src/domain/day.ts.
 */
export default function Today({
  day,
  onScan,
  onLogFood,
  onWeek,
  onSettings,
}: Props) {
  const t = useTheme();
  const over = day.kcalRemaining < 0;
  const empty = day.foods.length === 0;

  const figure = over
    ? MINUS + withThousands(Math.abs(day.kcalRemaining))
    : withThousands(day.kcalRemaining);

  const caption = over ? 'kcal over' : empty ? 'kcal to spend' : 'kcal left';
  const captionColour = over ? t.status.over : empty ? t.textMuted : t.status.under;

  const sub = empty
    ? 'Nothing logged yet'
    : `${withThousands(day.kcalEaten)} of ${withThousands(day.kcalTarget)}`;

  // Under budget: one lime arc. Over: a pale full lap, then the overflow on top,
  // so how far past you are has a size rather than just a colour.
  const arcs = empty
    ? []
    : over
    ? [
        {colour: t.status.overSoft, fraction: 1},
        {
          colour: t.status.over,
          fraction: (day.kcalEaten - day.kcalTarget) / day.kcalTarget,
        },
      ]
    : [{colour: brand.lime, fraction: day.kcalEaten / day.kcalTarget}];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[type_.sectionTitle, {color: t.text}]}>{day.dayLabel}</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={onWeek}
              style={[styles.chip, {backgroundColor: t.fill}]}
              accessibilityRole="button">
              <Text style={[styles.chipLabel, {color: t.text}]}>Week</Text>
            </Pressable>
            <Pressable
              onPress={onSettings}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              style={[styles.cog, {backgroundColor: t.fill}]}>
              <Cog colour={t.text} size={16} />
            </Pressable>
          </View>
        </View>

        <View style={styles.ringWrap}>
          <Ring
            trackColour={t.track}
            arcs={arcs}
            label={`${figure} ${caption}`}
          />
          <View style={styles.ringCentre} pointerEvents="none">
            <Text style={[type_.figureHero, {color: over ? t.status.over : t.text}]}>
              {figure}
            </Text>
            <Text style={[styles.caption, {color: captionColour}]}>{caption}</Text>
            <Text style={[type_.caption, {color: t.textMuted}]}>{sub}</Text>
          </View>
        </View>

        <View style={styles.macros}>
          {day.macros.map(macro => {
            const filled = Math.min(macro.eatenG / macro.targetG, 1);
            const past = macro.eatenG > macro.targetG;
            return (
              <View key={macro.key} style={styles.macro}>
                <Text style={[type_.label, {color: t.textMuted}]}>{macro.label}</Text>
                <Text
                  style={[
                    type_.figureMd,
                    styles.macroValue,
                    {color: past ? t.status.over : t.text},
                  ]}>
                  {macro.eatenG}
                  <Text style={[type_.caption, {color: t.textMuted}]}>
                    {` / ${macro.targetG}g`}
                  </Text>
                </Text>
                <View style={[styles.macroTrack, {backgroundColor: t.track}]}>
                  <View
                    style={[
                      styles.macroFill,
                      {
                        width: `${filled * 100}%`,
                        backgroundColor: t.macroBar[MACRO_COLOUR[macro.key]],
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Nothing to list on a fresh day — the ring already says so, and the
            row of foods you usually have at this hour is its own slice. */}
        {!empty && (
        <View style={styles.diary}>
          <Text style={[type_.sectionTitle, {color: t.text}]}>Logged today</Text>
          {day.foods.map(food => (
            <View
              key={food.id}
              style={[styles.row, {borderBottomColor: t.line}]}>
              <View style={[styles.mealTile, {backgroundColor: t.fill}]}>
                <Text style={[type_.label, {color: t.textMuted}]}>
                  {food.meal[0]}
                </Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[type_.bodyStrong, {color: t.text}]}>{food.name}</Text>
                <Text style={[type_.caption, {color: t.textMuted}]}>
                  {`${food.portion} · ${food.meal}`}
                </Text>
              </View>
              <Text style={[type_.figureMd, {color: t.text}]}>{food.kcal}</Text>
            </View>
          ))}
        </View>
        )}
      </ScrollView>

      <View style={[styles.actions, {backgroundColor: t.bg, borderTopColor: t.line}]}>
        <Pressable
          onPress={onScan}
          accessibilityRole="button"
          style={[styles.button, {backgroundColor: t.chipOnBg}]}>
          <Text style={[type_.bodyStrong, {color: t.chipOnText}]}>Scan</Text>
        </Pressable>
        <Pressable
          onPress={onLogFood}
          accessibilityRole="button"
          style={[styles.button, {backgroundColor: brand.lime}]}>
          <Text style={[type_.bodyStrong, {color: brand.onLime}]}>Log food</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  scroll: {paddingBottom: 120},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerActions: {flexDirection: 'row', gap: spacing.sm},
  chip: {paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill},
  chipLabel: {...type_.caption, fontWeight: '600'},
  cog: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm},
  ringCentre: {position: 'absolute', alignItems: 'center'},
  caption: {...type_.caption, fontWeight: '600', marginTop: spacing.xs},
  macros: {flexDirection: 'row', gap: 14, paddingHorizontal: spacing.lg},
  macro: {flex: 1, alignItems: 'center'},
  macroValue: {marginTop: 3},
  macroTrack: {
    height: 5,
    borderRadius: radius.pill,
    marginTop: 7,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  macroFill: {height: 5},
  diary: {paddingHorizontal: spacing.lg, marginTop: spacing.lg},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mealTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {flex: 1},
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    flex: 1,
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
