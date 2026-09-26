import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Sheet from '../ui/Sheet';
import {Button} from '../ui';
import {ChevronLeft, ChevronRight} from '../ui/icons';
import {radius, spacing, type as type_, useTheme} from '../theme';

/**
 * Which day to look at. It rises over Today rather than replacing it, because
 * you are picking a day to see, not leaving the day you are on.
 *
 * Each date carries a dot for how that day went — under, over, or nothing
 * logged — so the month is a record and not just a calendar. The legend is
 * there because three coloured dots are not self-explanatory, and colour alone
 * would exclude anyone who cannot tell these two apart.
 */

export type DayMark = 'under' | 'over' | 'empty';

export type MonthDay = {
  /** Day of the month. */
  date: number;
  mark: DayMark;
  /** A day that has not happened yet. Not pickable. */
  future?: boolean;
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DayPicker({
  month,
  days,
  selected,
  /** Blank cells before the 1st, so the dates land under the right weekday. */
  startsOn = 0,
  onSelect,
  onPrev,
  onNext,
  onToday,
}: {
  month: string;
  days: MonthDay[];
  selected: number;
  startsOn?: number;
  onSelect?: (date: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
}) {
  const t = useTheme();
  const [pick, setPick] = useState(selected);
  const markColour: Record<DayMark, string> = {
    under: t.status.under,
    over: t.status.over,
    empty: 'transparent',
  };

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      <Sheet>
        <View style={styles.monthRow}>
          <Pressable
            onPress={onPrev}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            style={[styles.round, {backgroundColor: t.fill}]}>
            <ChevronLeft colour={t.text} size={16} />
          </Pressable>
          <Text style={[type_.cardTitle, {color: t.text}]}>{month}</Text>
          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            style={[styles.round, {backgroundColor: t.fill}]}>
            <ChevronRight colour={t.text} size={16} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {WEEKDAYS.map((day, i) => (
            <Text key={i} style={[styles.weekday, {color: t.textMuted}]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {Array.from({length: startsOn}, (_, i) => (
            <View key={`blank-${i}`} style={styles.cell} />
          ))}
          {days.map(day => {
            const on = day.date === pick;
            return (
              <Pressable
                key={day.date}
                disabled={day.future}
                onPress={() => {
                  setPick(day.date);
                  onSelect?.(day.date);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${day.date} ${month}`}
                accessibilityState={{selected: on, disabled: day.future}}
                style={[styles.cell, on ? {backgroundColor: t.chipOnBg} : null]}>
                <Text
                  style={[
                    styles.date,
                    on ? styles.dateOn : null,
                    {color: on ? t.chipOnText : day.future ? t.textFaint : t.text},
                  ]}>
                  {day.date}
                </Text>
                <View
                  style={[
                    styles.mark,
                    day.future
                      ? null
                      : day.mark === 'empty'
                      ? [styles.hollow, {borderColor: t.textFaint}]
                      : {backgroundColor: markColour[day.mark]},
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.legend, {borderTopColor: t.line}]}>
          {(
            [
              ['under', 'Under'],
              ['over', 'Over'],
              ['empty', 'Nothing logged'],
            ] as [DayMark, string][]
          ).map(([mark, label]) => (
            <View key={mark} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  mark === 'empty'
                    ? [styles.hollow, {borderColor: t.textFaint}]
                    : {backgroundColor: markColour[mark]},
                ]}
              />
              <Text style={[styles.legendLabel, {color: t.textMuted}]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.gap} />
        <Button label="Back to today" onPress={onToday} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  scrim: {backgroundColor: 'rgba(8,10,7,0.42)'},
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  round: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  weekday: {
    ...type_.caption,
    fontSize: 11,
    fontWeight: '600',
    width: `${100 / 7}%`,
    textAlign: 'center',
    marginBottom: 6,
  },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  date: {...type_.body, fontSize: 15, fontWeight: '600'},
  dateOn: {fontWeight: '700'},
  hollow: {borderWidth: 1},
  mark: {width: 5, height: 5, borderRadius: radius.pill},
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 6, height: 6, borderRadius: radius.pill},
  legendLabel: {...type_.caption, fontSize: 11.5},
  gap: {height: spacing.lg},
});
