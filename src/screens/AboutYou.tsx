import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Field, Header, Progress, Segmented} from '../ui';
import {Check} from '../ui/icons';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';
import type {Activity, Profile} from '../domain/targets';

const LEVELS: {key: Activity; name: string; detail: string}[] = [
  {key: 'sedentary', name: 'Sedentary', detail: 'Desk work, little walking'},
  {key: 'light', name: 'Light', detail: 'On your feet, or 1–3 sessions a week'},
  {key: 'moderate', name: 'Active', detail: '4–5 hard sessions a week'},
  {key: 'very', name: 'Very', detail: 'Daily training or physical work'},
];

export default function AboutYou({
  profile,
  onBack,
  onContinue,
}: {
  profile: Profile;
  onBack?: () => void;
  onContinue?: (profile: Profile) => void;
}) {
  const t = useTheme();
  const [activity, setActivity] = useState<Activity>(profile.activity);

  return (
    <View style={[styles.screen, {backgroundColor: t.bg}]}>
      <Header title="" overline="STEP 1 OF 4" onBack={onBack} />
      <Progress step={1} of={4} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[type_.title, {color: t.text}]}>About you</Text>
        <Text style={[styles.lede, {color: t.textMuted}]}>
          Used once, to work out what your body needs. It never leaves your phone.
        </Text>

        <View style={styles.units}>
          <Segmented options={['Metric', 'Imperial']} value="Metric" />
        </View>

        <View style={styles.row}>
          <Field label="SEX" value={profile.sex === 'male' ? 'Male' : 'Female'} />
          <Field label="AGE" value={String(profile.ageYears)} suffix="years" />
        </View>
        <View style={styles.row}>
          <Field label="HEIGHT" value={String(profile.heightCm)} suffix="cm" />
          <Field
            label="WEIGHT TODAY"
            value={profile.weightKg.toFixed(1)}
            suffix="kg"
          />
        </View>

        <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>
          HOW ACTIVE ARE YOU?
        </Text>
        {LEVELS.map(level => {
          const on = level.key === activity;
          return (
            <Pressable
              key={level.key}
              onPress={() => setActivity(level.key)}
              accessibilityRole="button"
              accessibilityState={{selected: on}}
              style={[styles.level, {borderBottomColor: t.line}]}>
              <View
                style={[
                  styles.tick,
                  on ? styles.tickOn : styles.tickOff,
                  on ? null : {borderColor: t.controlLine},
                ]}>
                {on ? <Check colour={brand.onLime} size={12} /> : null}
              </View>
              <View style={styles.levelText}>
                <Text style={[type_.bodyStrong, {color: t.text}]}>{level.name}</Text>
                <Text style={[type_.caption, {color: t.textMuted}]}>
                  {level.detail}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label="Continue"
          onPress={() => onContinue?.({...profile, activity})}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  units: {marginTop: 20},
  row: {flexDirection: 'row', gap: 10, marginTop: 14},
  legend: {marginTop: 22, marginBottom: 4},
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tick: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: {backgroundColor: brand.lime},
  tickOff: {borderWidth: 1.5},
  levelText: {flex: 1},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 30, paddingTop: spacing.sm},
});
