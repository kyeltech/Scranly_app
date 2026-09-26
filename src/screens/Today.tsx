import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Ring from '../components/Ring';
import {Cog, Plus, Scanner, TrendUp} from '../ui/icons';
import {MINUS, withThousands} from '../lib/format';
import {Screen, useActionBarInset} from '../ui';
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
  /** The day name opens the month. */
  onDay?: () => void;
  /** The one-tap starters on an empty day. */
  onStarter?: (id: string) => void;
  /** Change what is already logged. */
  onEdit?: () => void;
  /** The stepper either side of a past day's date, and the way back. */
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onToday?: () => void;
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
  onDay,
  onStarter,
  onEdit,
  onPrevDay,
  onNextDay,
  onToday,
}: Props) {
  const t = useTheme();
  const barInset = useActionBarInset();
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
    <Screen insetBottom={false}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 106 + barInset}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={onDay}
            accessibilityRole="button"
            accessibilityLabel="Pick a day"
            style={styles.dayName}>
            <Text style={[type_.sectionTitle, {color: t.text}]}>{day.dayLabel}</Text>
            {day.dateLabel ? (
              <Text style={[styles.dateLabel, {color: t.textMuted}]}>
                {day.dateLabel}
              </Text>
            ) : null}
          </Pressable>
          <View style={styles.headerActions}>
            {day.past ? (
              <Pressable
                onPress={onToday}
                style={[styles.chip, {backgroundColor: brand.lime}]}
                accessibilityRole="button">
                <Text style={[styles.chipLabel, {color: brand.onLime}]}>Today</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={onWeek}
                style={[styles.chip, {backgroundColor: t.fill}]}
                accessibilityRole="button">
                <Text style={[styles.chipLabel, {color: t.text}]}>Week</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onSettings}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              style={[styles.cog, {backgroundColor: t.fill}]}>
              <Cog colour={t.text} size={16} />
            </Pressable>
          </View>
        </View>

        {day.neighbours ? (
          <View style={styles.stepper}>
            <Pressable onPress={onPrevDay} accessibilityRole="button">
              <Text style={[styles.stepperLabel, {color: t.textMuted}]}>
                {`‹ ${day.neighbours.prev}`}
              </Text>
            </Pressable>
            <Text style={[styles.stepperLabel, {color: t.textFaint}]}>·</Text>
            <Pressable onPress={onNextDay} accessibilityRole="button">
              <Text style={[styles.stepperLabel, {color: t.textMuted}]}>
                {`${day.neighbours.next} ›`}
              </Text>
            </Pressable>
          </View>
        ) : null}

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

        {day.weekNote ? (
          <View style={styles.weekNote}>
            <View style={[styles.weekPill, {backgroundColor: t.fill}]}>
              <TrendUp colour={day.weekNote.under ? t.status.under : t.status.over} size={15} />
              <Text style={[styles.weekLabel, {color: t.text}]}>
                This week you are{' '}
                {/* The figure carries the colour, not the sentence: the whole
                    point of the pill is the one word 'under' or 'over'. */}
                <Text
                  style={[
                    styles.weekFigure,
                    {color: day.weekNote.under ? t.status.under : t.status.over},
                  ]}>
                  {`${withThousands(day.weekNote.kcal)} ${day.weekNote.under ? 'under' : 'over'}`}
                </Text>
              </Text>
            </View>
          </View>
        ) : null}

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

        {/*
          An empty day offers a way out of itself. A blank list is technically
          correct and useless: what this person has every morning is one tap
          away, and that is the whole first-log problem solved.
        */}
        {empty && day.starters ? (
          <View style={styles.diary}>
            <Text style={[type_.sectionTitle, {color: t.text}]}>
              Start with what you usually have
            </Text>
            <Text style={[styles.starterLede, {color: t.textMuted}]}>
              Your most-logged breakfast, one tap each.
            </Text>
            {day.starters.map(starter => (
              <Pressable
                key={starter.id}
                onPress={() => onStarter?.(starter.id)}
                accessibilityRole="button"
                accessibilityLabel={`Log ${starter.name}`}
                style={[styles.row, {borderBottomColor: t.line}]}>
                <View style={styles.rowText}>
                  <Text style={[type_.bodyStrong, {color: t.text}]}>{starter.name}</Text>
                  <Text style={[type_.caption, {color: t.textMuted}]}>{starter.meta}</Text>
                </View>
                <Text style={[type_.figureMd, {color: t.text}]}>{starter.kcal}</Text>
                <View style={styles.starterAdd}>
                  <Plus colour={brand.onLime} size={16} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!empty && (
        <View style={styles.diary}>
          <View style={styles.diaryHead}>
            <Text style={[type_.sectionTitle, {color: t.text}]}>
              {day.past ? 'Logged that day' : 'Logged today'}
            </Text>
            <Pressable onPress={onEdit} accessibilityRole="button">
              <Text style={[styles.edit, {color: t.text}]}>Edit</Text>
            </Pressable>
          </View>
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

      <View
        style={[styles.actions, {backgroundColor: t.bg, paddingBottom: barInset}]}>
        <Pressable
          onPress={onScan}
          accessibilityRole="button"
          style={[
            styles.button,
            styles.secondary,
            {
              backgroundColor: t.secondaryButton.bg,
              borderColor: t.secondaryButton.border,
            },
          ]}>
          <Scanner colour={brand.lime} size={19} testID="icon-scan" />
          <Text style={[type_.bodyStrong, {color: t.secondaryButton.fg}]}>Scan</Text>
        </Pressable>
        <Pressable
          onPress={onLogFood}
          accessibilityRole="button"
          style={[styles.button, {backgroundColor: brand.lime}]}>
          <Plus colour={brand.onLime} size={19} testID="icon-log-food" />
          <Text style={[type_.bodyStrong, {color: brand.onLime}]}>Log food</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dayName: {flex: 1},
  dateLabel: {...type_.caption, fontSize: 12},
  headerActions: {flexDirection: 'row', gap: spacing.sm},
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
    paddingHorizontal: spacing.lg,
  },
  stepperLabel: {...type_.caption, fontSize: 12},
  weekNote: {alignItems: 'center', marginTop: -6, marginBottom: 14},
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  weekLabel: {...type_.caption, fontSize: 12.5},
  weekFigure: {fontWeight: '700'},
  diaryHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  edit: {...type_.caption, fontWeight: '600'},
  starterLede: {...type_.caption, marginTop: 3, marginBottom: 6},
  starterAdd: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  },
  secondary: {borderWidth: 1},
  button: {
    flex: 1,
    height: 54,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
