import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Button, Header, Note} from '../ui';
import {Camera, ChevronRight, Plus} from '../ui/icons';
import {radius, spacing, type as type_, useTheme} from '../theme';

export default function WeighIn({
  startKg,
  yesterdayKg,
  averageKg,
  onBack,
  onPhoto,
  onSave,
}: {
  startKg: number;
  yesterdayKg: number;
  averageKg: number;
  onBack?: () => void;
  onPhoto?: () => void;
  onSave?: (kg: number) => void;
}) {
  const t = useTheme();
  const [kg, setKg] = useState(startKg);
  const step = (by: number) => setKg(current => Math.round((current + by) * 10) / 10);

  return (
    <View style={[styles.screen, {backgroundColor: t.bg}]}>
      <Header
        title="Weigh-in"
        onBack={onBack}
        right={<Text style={[type_.caption, {color: t.textMuted}]}>Today</Text>}
      />

      <View style={styles.figureWrap}>
        <Pressable
          onPress={() => step(-0.1)}
          accessibilityRole="button"
          accessibilityLabel="Lower by 0.1 kg"
          style={[styles.stepper, {backgroundColor: t.fill}]}>
          <View style={[styles.minus, {backgroundColor: t.text}]} />
        </Pressable>
        <View style={styles.figureText}>
          <Text style={[styles.figure, {color: t.text}]}>{kg.toFixed(1)}</Text>
          <Text style={[styles.unit, {color: t.textMuted}]}>kg</Text>
        </View>
        <Pressable
          onPress={() => step(0.1)}
          accessibilityRole="button"
          accessibilityLabel="Raise by 0.1 kg"
          style={[styles.stepper, {backgroundColor: t.fill}]}>
          <Plus colour={t.text} size={20} />
        </Pressable>
      </View>

      <Text style={[styles.context, {color: t.textMuted}]}>
        {`Yesterday ${yesterdayKg.toFixed(1)} · 7-day average ${averageKg.toFixed(1)}`}
      </Text>

      <View style={styles.note}>
        <Note>
          Weigh at the same time each day — first thing, after the loo, before
          you eat or drink. Food and water move the scale by more than a day’s
          fat loss, so only a consistent routine makes the trend mean anything.
        </Note>
      </View>

      <Pressable
        onPress={onPhoto}
        accessibilityRole="button"
        style={styles.photo}>
        <View style={[styles.photoIcon, {backgroundColor: t.fill}]}>
          <Camera colour={t.text} size={18} />
        </View>
        <Text style={[type_.bodyStrong, styles.photoLabel, {color: t.text}]}>
          Photograph the scale instead
        </Text>
        <ChevronRight colour={t.textMuted} size={15} />
      </Pressable>

      <View style={styles.actions}>
        <Button label={`Save ${kg.toFixed(1)} kg`} onPress={() => onSave?.(kg)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  figureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: 40,
  },
  figureText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  figure: {...type_.figureHero, fontSize: 68, lineHeight: 70},
  unit: {...type_.title, fontSize: 24},
  stepper: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: {width: 20, height: 2.8, borderRadius: 2},
  context: {...type_.caption, textAlign: 'center', marginTop: 10},
  note: {paddingHorizontal: spacing.lg, marginTop: 30},
  photo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 16,
  },
  photoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {flex: 1},
  actions: {
    marginTop: 'auto',
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
});
