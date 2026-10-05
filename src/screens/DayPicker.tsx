import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Sheet from '../ui/Sheet';
import {Button} from '../ui';
import {ChevronLeft, ChevronRight} from '../ui/icons';
import {addMonths, isoDate, monthGrid} from '../domain/calendar';
import type {DayMark} from '../domain/calendar';
import {type as type_, useTheme} from '../theme';

import {dayPicker as styles} from '../styles';
/**
 * Which day to look at. It rises over Today rather than replacing it, because
 * you are picking a day to see, not leaving the day you are on.
 *
 * The grid is worked out rather than drawn — see src/domain/calendar.ts. Each
 * date carries a dot for how that day went, so the month is a record and not
 * just a calendar, and the legend is there because three coloured dots are not
 * self-explanatory and colour alone would exclude anyone who cannot tell two
 * of them apart.
 */

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DayPicker({
  /** How each day went, keyed by ISO date. Absent means nothing logged. */
  marks = {},
  /** Injected so tests do not drift with the wall clock. */
  today = new Date(),
  /** ISO date. Defaults to today, which is the day you came from. */
  selected,
  onSelect,
  onToday,
}: {
  marks?: Record<string, DayMark>;
  today?: Date;
  selected?: string;
  onSelect?: (iso: string) => void;
  onToday?: () => void;
}) {
  const t = useTheme();
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [pick, setPick] = useState(selected ?? todayIso);
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const grid = monthGrid(cursor.year, cursor.month, {today, marks});
  const step = (delta: number) => setCursor(addMonths(cursor.year, cursor.month, delta));

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
            onPress={() => step(-1)}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            style={[styles.round, {backgroundColor: t.fill}]}>
            <ChevronLeft colour={t.text} size={16} />
          </Pressable>
          <Text style={[type_.cardTitle, {color: t.text}]}>{grid.label}</Text>
          {/* A diary has no future, so forward stops at the month you are in. */}
          <Pressable
            onPress={() => step(1)}
            disabled={!grid.canGoForward}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            accessibilityState={{disabled: !grid.canGoForward}}
            style={[styles.round, {backgroundColor: t.fill}]}>
            <ChevronRight
              colour={grid.canGoForward ? t.text : t.textFaint}
              size={16}
            />
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
          {Array.from({length: grid.startsOn}, (_, i) => (
            <View key={`blank-${i}`} style={styles.cell} />
          ))}
          {grid.days.map(day => {
            const on = day.iso === pick;
            return (
              <Pressable
                key={day.iso}
                disabled={day.future}
                onPress={() => {
                  setPick(day.iso);
                  onSelect?.(day.iso);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${day.date} ${grid.label}`}
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
