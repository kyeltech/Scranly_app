import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {Button, Header, Panel, Screen} from '../ui';
import {Camera, ChevronRight, Plus} from '../ui/icons';
import {type as type_, useTheme} from '../theme';

import {weighIn as styles} from '../styles';
export default function WeighIn({
  startKg,
  yesterdayKg,
  averageKg,
  date,
  onBack,
  onPhoto,
  onSave,
}: {
  startKg: number;
  yesterdayKg: number;
  averageKg: number;
  /** Which day is being weighed: 'Tue 25 Sep'. */
  date: string;
  onBack?: () => void;
  onPhoto?: () => void;
  onSave?: (kg: number) => void;
}) {
  const t = useTheme();
  const [kg, setKg] = useState(startKg);
  const step = (by: number) => setKg(current => Math.round((current + by) * 10) / 10);

  return (
    <Screen>
      <Header
        title="Weigh-in"
        onBack={onBack}
        right={<Text style={[type_.caption, {color: t.textMuted}]}>{date}</Text>}
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
        <Panel label="WHY IT MATTERS">
          Weigh at the same time each day — first thing, after the loo, before
          you eat or drink. Food and water move the scale by more than a day’s
          fat loss, so only a consistent routine makes the trend mean anything.
        </Panel>
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
    </Screen>
  );
}
