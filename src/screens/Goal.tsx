import React, {useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {Button, Field, Header, Progress, Screen} from '../ui';
import {withThousands} from '../lib/format';
import {brand, type as type_, useTheme} from '../theme';
import {dailyPlan} from '../domain/targets';
import type {Profile} from '../domain/targets';

import {goal as styles} from '../styles';
/**
 * How long they have. The label is what the screen says — "2 months", not
 * "9 weeks" — because a horizon is how people think about it; the weeks are
 * what the maths needs.
 */
const HORIZONS = [
  {label: '6 weeks', weeks: 6},
  {label: '2 months', weeks: 9},
  {label: '3 months', weeks: 13},
];

/** The gentlest horizon on offer — what the too-fast card suggests instead. */
const EASIEST = HORIZONS[HORIZONS.length - 1];

/** Rounded the way the prose reads it: "about 850 kcal", not "about 855 kcal". */
function toNearestTen(n: number) {
  return Math.round(n / 10) * 10;
}

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
  const [goalText, setGoalText] = useState('75.0');
  // Three months by default: the horizon ADR-0001 works its numbers from, and
  // the only one of the three kyel's own weight can hold.
  const [weeks, setWeeks] = useState(13);

  const parsed = Number.parseFloat(goalText);
  const goalKg = Number.isFinite(parsed) ? parsed : profile.weightKg;
  const goal = {targetWeightKg: goalKg, weeks};
  const plan = dailyPlan(profile, goal);
  const tooFast = plan.capped;

  const horizon = HORIZONS.find(h => h.weeks === weeks) ?? HORIZONS[0];
  const toGoKg = Math.max(0, profile.weightKg - goalKg);
  /**
   * The rate they asked for, not the one the app will hold them to. The card
   * has to show the ask — being told 0.8 when you typed something that means
   * 1.2 reads as the app not having understood you. The cap is the app's
   * answer, and the suggestion chip below is where it offers it.
   */
  const rate = plan.requestedRateKgPerWeek;
  const daily = toNearestTen((toGoKg * 7700) / (weeks * 7));
  const easierRate = toGoKg / EASIEST.weeks;
  const suggest = tooFast && EASIEST.weeks !== weeks;

  return (
    <Screen>
      <Header title="" overline="STEP 2 OF 4" onBack={onBack} />
      <Progress step={2} of={4} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[type_.stepTitle, {color: t.text}]}>Where are you heading?</Text>
        <Text style={[styles.lede, {color: t.textMuted}]}>
          A goal needs a date, or there is nothing to be on track against.
        </Text>

        <View style={styles.row}>
          <Field label="TODAY" value={profile.weightKg.toFixed(1)} suffix="kg" />
          <Field
            label="GOAL"
            value={goalText}
            onChangeText={setGoalText}
            keyboardType="decimal-pad"
            suffix="kg"
          />
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
            {backgroundColor: tooFast ? t.verdict.fast : t.verdict.ok},
          ]}>
          <View style={styles.rateRow}>
            <Text
              style={[
                styles.rate,
                {color: tooFast ? t.status.over : t.status.under},
              ]}>
              {`${rate.toFixed(1)} kg`}
            </Text>
            <Text
              style={[
                styles.rateUnit,
                {color: tooFast ? t.status.over : t.status.under},
              ]}>
              a week
            </Text>
          </View>
          <Text style={[type_.bodyStrong, styles.verdictLine, {color: t.text}]}>
            {tooFast ? 'Faster than most people hold' : 'A pace most people can hold'}
          </Text>
          <Text style={[styles.detail, {color: t.textMuted}]}>
            {`${toGoKg.toFixed(1)} kg in ${horizon.label} — about ${withThousands(daily)} kcal a day below what you burn.`}
          </Text>
          <Text style={[styles.detail, styles.detailSecond, {color: t.textMuted}]}>
            {tooFast
              ? 'At this rate more of the loss comes off as muscle rather than fat, and the daily deficit is one few people keep up. Scranly will track it either way — it just will not pretend it is comfortable.'
              : 'Under 1% of your body weight a week. Scranly checks this against your real weight trend after two weeks and tells you if the maths was optimistic.'}
          </Text>
          {suggest ? (
            <View style={styles.suggestion}>
              <Pressable
                onPress={() => setWeeks(EASIEST.weeks)}
                accessibilityRole="button">
                <Text style={[styles.suggestionChip, {color: brand.onLime}]}>
                  {`Try ${EASIEST.label} instead`}
                </Text>
              </Pressable>
              <Text style={[styles.suggestionRate, {color: t.textMuted}]}>
                {`${easierRate.toFixed(2)} kg a week`}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Continue" onPress={() => onContinue?.(goal)} />
      </View>
    </Screen>
  );
}
