import React, {useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {
  Button,
  ChoiceField,
  Field,
  Header,
  Progress,
  Screen,
  Segmented,
} from '../ui';
import {Check} from '../ui/icons';
import {brand, type as type_, useTheme} from '../theme';
import type {Activity, Profile} from '../domain/targets';

import {aboutYou as styles} from '../styles';
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
  const [sex, setSex] = useState(profile.sex);
  const [age, setAge] = useState(String(profile.ageYears));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(profile.weightKg.toFixed(1));

  const asNumber = (text: string, fallback: number) => {
    const n = Number.parseFloat(text);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <Screen>
      <Header title="" overline="STEP 1 OF 4" onBack={onBack} />
      <Progress step={1} of={4} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[type_.stepTitle, {color: t.text}]}>About you</Text>
        <Text style={[styles.lede, {color: t.textMuted}]}>
          Used once, to work out what your body needs. It never leaves your phone.
        </Text>

        <View style={styles.units}>
          <Segmented options={['Metric', 'Imperial']} value="Metric" />
        </View>

        <View style={styles.row}>
          <ChoiceField
            label="SEX"
            value={sex === 'male' ? 'Male' : 'Female'}
            onPress={() => setSex(sex === 'male' ? 'female' : 'male')}
          />
          <Field
            label="AGE"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            suffix="years"
          />
        </View>
        <View style={styles.row}>
          <Field
            label="HEIGHT"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            suffix="cm"
          />
          <Field
            label="WEIGHT TODAY"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
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
          onPress={() =>
            onContinue?.({
              ...profile,
              sex,
              activity,
              ageYears: asNumber(age, profile.ageYears),
              heightCm: asNumber(height, profile.heightCm),
              weightKg: asNumber(weight, profile.weightKg),
            })
          }
        />
      </View>
    </Screen>
  );
}
