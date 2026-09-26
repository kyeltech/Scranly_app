import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Field, Header, Progress} from '../ui';
import {withThousands} from '../lib/format';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';
import {dailyPlan} from '../domain/targets';
import type {Profile} from '../domain/targets';

const HORIZONS = [
  {label: '6 weeks', weeks: 6},
  {label: '2 months', weeks: 9},
  {label: '3 months', weeks: 13},
];

export default function Goal({
  profile,
  onBack,
  onContinue,
}: {
  profile: Profile;
  onBack?: () => void;
  onContinue?: (goal: {targetWeightKg: number; weeks: number}) => void;
}) {
  const t = useTheme();
  const [goalKg] = useState(75);
  const [weeks, setWeeks] = useState(13);

  const goal = {targetWeightKg: goalKg, weeks};
  const plan = dailyPlan(profile, goal);
  const tooFast = plan.capped;

  const deficit = Math.round(profile.weightKg - goalKg);
  const daily = Math.round(
    ((profile.weightKg - goalKg) / plan.weeksToGoal) * 7700 / 7,
  );

  return (
    <View style={[styles.screen, {backgroundColor: t.bg}]}>
      <Header title="" overline="STEP 2 OF 4" onBack={onBack} />
      <Progress step={2} of={4} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[type_.title, {color: t.text}]}>Where are you heading?</Text>
        <Text style={[styles.lede, {color: t.textMuted}]}>
          A goal needs a date, or there is nothing to be on track against.
        </Text>

        <View style={styles.row}>
          <Field label="TODAY" value={profile.weightKg.toFixed(1)} suffix="kg" />
          <Field label="GOAL" value={goalKg.toFixed(1)} suffix="kg" />
        </View>

        <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>BY WHEN</Text>
        <View style={styles.horizons}>
          {HORIZONS.map(h => {
            const on = h.weeks === weeks;
            return (
              <Pressable
                key={h.label}
                onPress={() => setWeeks(h.weeks)}
                accessibilityRole="button"
                accessibilityState={{selected: on}}
                style={[
                  styles.horizon,
                  {backgroundColor: on ? t.chipOnBg : t.fill},
                ]}>
                <Text
                  style={[
                    styles.horizonLabel,
                    {color: on ? t.chipOnText : t.text},
                  ]}>
                  {h.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.verdict,
            {backgroundColor: tooFast ? t.status.overSoft : t.fill},
          ]}>
          <View style={styles.rateRow}>
            <Text
              style={[
                styles.rate,
                {color: tooFast ? t.status.over : t.status.under},
              ]}>
              {plan.rateKgPerWeek.toFixed(1)} kg
            </Text>
            <Text
              style={[
                type_.bodyStrong,
                {color: tooFast ? t.status.over : t.status.under},
              ]}>
              a week
            </Text>
          </View>
          <Text style={[type_.bodyStrong, styles.verdictLine, {color: t.text}]}>
            {tooFast ? 'Faster than most people hold' : 'A pace most people can hold'}
          </Text>
          <Text style={[styles.detail, {color: t.textMuted}]}>
            {`${deficit}.0 kg in ${Math.round(plan.weeksToGoal)} weeks — about ${withThousands(daily)} kcal a day below what you burn.`}
          </Text>
          <Text style={[styles.detail, {color: t.textMuted}]}>
            {tooFast
              ? 'At this rate more of the loss comes off as muscle rather than fat, and the daily deficit is one few people keep up. Scranly will track it either way — it just will not pretend it is comfortable.'
              : 'Under 1% of your body weight a week. Scranly checks this against your real weight trend after two weeks and tells you if the maths was optimistic.'}
          </Text>
          {tooFast ? (
            <Pressable
              onPress={() => setWeeks(13)}
              accessibilityRole="button"
              style={styles.suggestion}>
              <Text style={[styles.suggestionChip, {color: brand.onLime}]}>
                Try 3 months instead
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Continue" onPress={() => onContinue?.(goal)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  row: {flexDirection: 'row', gap: 10, marginTop: 20},
  legend: {marginTop: 20},
  horizons: {flexDirection: 'row', gap: 6, marginTop: 8},
  horizon: {flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill},
  horizonLabel: {...type_.caption, fontWeight: '600'},
  verdict: {borderRadius: 16, padding: 16, marginTop: 20},
  rateRow: {flexDirection: 'row', alignItems: 'baseline', gap: 8},
  rate: {...type_.figureLg, fontSize: 30},
  verdictLine: {marginTop: 8},
  detail: {...type_.caption, lineHeight: 19, marginTop: 6},
  suggestion: {marginTop: 12, alignSelf: 'flex-start'},
  suggestionChip: {
    ...type_.caption,
    fontWeight: '700',
    backgroundColor: brand.lime,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 30, paddingTop: spacing.sm},
});
