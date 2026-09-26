import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {ViewStyle} from 'react-native';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';
import {ChevronLeft} from './icons';

/** The screen's title row: a round back button, a title, and an optional right slot. */
export function Header({
  title,
  onBack,
  right,
  overline,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  overline?: string;
}) {
  const t = useTheme();
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.round, {backgroundColor: t.fill}]}>
          <ChevronLeft colour={t.text} size={17} />
        </Pressable>
      ) : null}
      <View style={styles.headerText}>
        {overline ? (
          <Text style={[styles.overline, {color: t.textMuted}]}>{overline}</Text>
        ) : null}
        <Text style={[type_.sectionTitle, {color: t.text}]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Button({
  label,
  sub,
  onPress,
  variant = 'primary',
  icon,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'ink';
  icon?: React.ReactNode;
}) {
  const t = useTheme();
  const bg =
    variant === 'primary' ? brand.lime : variant === 'ink' ? t.chipOnBg : t.fill;
  const fg =
    variant === 'primary' ? brand.onLime : variant === 'ink' ? t.chipOnText : t.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.button, {backgroundColor: bg}]}>
      {icon}
      <Text style={[type_.bodyStrong, {color: fg}]}>{label}</Text>
      {sub ? <Text style={[styles.buttonSub, {color: fg}]}>{sub}</Text> : null}
    </Pressable>
  );
}

/** A row of mutually exclusive choices. */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange?: (option: string) => void;
}) {
  const t = useTheme();
  return (
    <View style={styles.segmented}>
      {options.map(option => {
        const on = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange?.(option)}
            accessibilityRole="button"
            accessibilityState={{selected: on}}
            style={[
              styles.segment,
              {backgroundColor: on ? t.chipOnBg : t.fill},
            ]}>
            <Text
              style={[styles.segmentLabel, {color: on ? t.chipOnText : t.text}]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A labelled value box. Read-only for now — real editing comes with the keyboard slice. */
export function Field({
  label,
  value,
  suffix,
  placeholder,
  style,
}: {
  label: string;
  value?: string;
  suffix?: string;
  placeholder?: string;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const showing = value ?? placeholder ?? '';
  return (
    <View style={[styles.field, style]}>
      <Text style={[type_.label, {color: t.textMuted}]}>{label}</Text>
      <View style={[styles.fieldBox, {backgroundColor: t.fill}]}>
        <Text
          style={[styles.fieldValue, {color: value ? t.text : t.textFaint}]}>
          {showing}
        </Text>
        {suffix ? (
          <Text style={[type_.caption, {color: t.textMuted}]}>{suffix}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function Note({children, tone = 'quiet'}: {children: string; tone?: 'quiet' | 'warn'}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.note,
        {backgroundColor: tone === 'warn' ? t.status.overSoft : t.fill},
      ]}>
      <Text style={[styles.noteText, {color: t.text}]}>{children}</Text>
    </View>
  );
}

/** How far through a flow you are. */
export function Progress({step, of}: {step: number; of: number}) {
  const t = useTheme();
  return (
    <View style={styles.progress}>
      {Array.from({length: of}, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressBar,
            {backgroundColor: i < step ? brand.lime : t.line},
          ]}
        />
      ))}
    </View>
  );
}

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerText: {flex: 1},
  overline: {...type_.label, marginBottom: 1},
  round: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonSub: {...type_.caption, opacity: 0.6, fontWeight: '600'},
  segmented: {flexDirection: 'row', gap: 6},
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  segmentLabel: {...type_.caption, fontWeight: '600'},
  field: {flex: 1},
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginTop: 6,
    paddingHorizontal: 14,
    borderRadius: 13,
  },
  fieldValue: {...type_.body, flex: 1, fontWeight: '600'},
  note: {borderRadius: 16, padding: 14},
  noteText: {...type_.caption, lineHeight: 20},
  progress: {flexDirection: 'row', gap: 5, paddingHorizontal: spacing.lg},
  progressBar: {flex: 1, height: 4, borderRadius: radius.pill},
});
