import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ViewStyle} from 'react-native';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';
import {ChevronLeft, Info} from './icons';

/**
 * Every screen's outermost view. It owns the safe-area insets, so no screen
 * draws under the status bar or the home indicator — the header row is the
 * navigation on Today, and behind the notch it cannot be tapped at all.
 */
export function Screen({children}: {children: React.ReactNode}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: t.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      {children}
    </View>
  );
}

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

/** A labelled input. Typing into it is the point — see AboutYou and Goal. */
export function Field({
  label,
  value,
  onChangeText,
  suffix,
  placeholder,
  keyboardType = 'default',
  style,
}: {
  label: string;
  value?: string;
  onChangeText?: (next: string) => void;
  suffix?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Text style={[type_.label, {color: t.textMuted}]}>{label}</Text>
      <View style={[styles.fieldBox, {backgroundColor: t.fill}]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.textFaint}
          keyboardType={keyboardType}
          accessibilityLabel={label}
          style={[styles.fieldValue, {color: t.text}]}
        />
        {suffix ? (
          <Text style={[type_.caption, {color: t.textMuted}]}>{suffix}</Text>
        ) : null}
      </View>
    </View>
  );
}

/** Same box, but for a closed set of two — tapping it swaps the value. */
export function ChoiceField({
  label,
  value,
  onPress,
  style,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Text style={[type_.label, {color: t.textMuted}]}>{label}</Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.fieldBox, {backgroundColor: t.fill}]}>
        <Text style={[styles.fieldValue, {color: t.text}]}>{value}</Text>
      </Pressable>
    </View>
  );
}

export function Note({
  children,
  tone = 'quiet',
}: {
  children: string;
  /** quiet: a promise the app is making. caveat: an admission that a number is a guess. */
  tone?: 'quiet' | 'caveat';
}) {
  const t = useTheme();
  const caveat = tone === 'caveat';
  return (
    <View
      style={[
        styles.note,
        {backgroundColor: caveat ? t.caveat.bg : t.fill},
      ]}>
      {caveat ? null : <Info colour={t.status.under} size={15} />}
      <Text
        style={[styles.noteText, {color: caveat ? t.caveat.text : t.textMuted}]}>
        {children}
      </Text>
    </View>
  );
}

/**
 * A titled block of prose — the weigh-in routine, and anything else that is
 * guidance rather than a caveat. No icon: the overline says what it is, and
 * the body is read at full strength, not as a footnote.
 */
export function Panel({label, children}: {label: string; children: string}) {
  const t = useTheme();
  return (
    <View style={[styles.panel, {backgroundColor: t.fill}]}>
      <Text style={[type_.label, {color: t.textMuted}]}>{label}</Text>
      <Text style={[styles.panelText, {color: t.text}]}>{children}</Text>
    </View>
  );
}

/** A text-only action beside a primary button. Never a status colour — those mean something. */
export function TextAction({label, onPress}: {label: string; onPress?: () => void}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Text style={[styles.textAction, {color: t.text}]}>{label}</Text>
    </Pressable>
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
  screen: {flex: 1},
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
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteText: {...type_.caption, flex: 1, fontSize: 12.5, lineHeight: 18},
  panel: {borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16},
  panelText: {...type_.body, fontSize: 13.5, lineHeight: 20, marginTop: 6},
  textAction: {...type_.bodyStrong, textAlign: 'center'},
  progress: {flexDirection: 'row', gap: 5, paddingHorizontal: spacing.lg},
  progressBar: {flex: 1, height: 4, borderRadius: radius.pill},
});
