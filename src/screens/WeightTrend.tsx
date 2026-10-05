import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import Svg, {Circle, Line} from 'react-native-svg';
import {Button, Header, Screen} from '../ui';
import {Check} from '../ui/icons';
import TrendChart from '../components/TrendChart';
import {trend, weekByWeek} from '../domain/weight';
import type {Reading} from '../domain/weight';
import {MINUS} from '../lib/format';
import {type as type_, useTheme} from '../theme';

import {weightTrend as styles} from '../styles';
export default function WeightTrend({
  readings,
  goalKg,
  weeksRemaining,
  goalDate,
  onBack,
  onAdd,
  onChangeGoal,
}: {
  readings: Reading[];
  goalKg: number;
  weeksRemaining: number;
  goalDate: string;
  onBack?: () => void;
  onAdd?: () => void;
  onChangeGoal?: () => void;
}) {
  const t = useTheme();
  const summary = trend(readings, goalKg, weeksRemaining);
  const weeks = weekByWeek(readings);
  const tone = summary.onTrack ? t.status.under : t.status.close;

  return (
    <Screen>
      <Header
        title="Weight"
        onBack={onBack}
        right={
          <Pressable onPress={onAdd} accessibilityRole="button">
            <Text style={[type_.bodyStrong, {color: t.text}]}>Add</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        <TrendChart
          readings={readings}
          paceFrom={summary.startKg}
          paceTo={summary.startKg - summary.neededRateKgPerWeek * 4}
        />

        <View style={styles.legend}>
          <Legend colour={t.textMuted} kind="dots" label="Daily" />
          <Legend colour={t.text} kind="solid" label="7-day average" />
          <Legend colour={t.status.under} kind="dashed" label="On-pace line" />
        </View>

        <View style={[styles.stats, {borderBottomColor: t.line}]}>
          <Stat label="START" value={`${summary.startKg.toFixed(1)} kg`} />
          <Stat label="NOW" value={`${summary.averageKg.toFixed(1)} kg`} />
          <Stat label="TO GO" value={`${summary.toGoKg.toFixed(1)} kg`} />
        </View>

        <View
          style={[
            styles.verdict,
            {backgroundColor: summary.onTrack ? t.verdict.ok : t.verdict.fast},
          ]}>
          <View style={styles.verdictHead}>
            <View style={[styles.badge, {backgroundColor: tone}]}>
              <Check colour={t.bg} size={13} />
            </View>
            <Text style={[type_.sectionTitle, {color: t.text}]}>
              {summary.onTrack ? 'On track' : 'Behind the pace'}
            </Text>
          </View>
          <Text style={[styles.verdictLine, {color: t.text}]}>
            {`Losing ${summary.rateKgPerWeek.toFixed(2)} kg a week against the ${summary.neededRateKgPerWeek.toFixed(2)} the goal needs.`}
          </Text>
          <Text style={[styles.verdictDetail, {color: t.textMuted}]}>
            {`At this pace you reach ${goalKg.toFixed(1)} kg around ${goalDate}. Judged on the 7-day average, so a heavy Sunday will not change it.`}
          </Text>
        </View>

        {/*
          The chart shows the shape; this shows the arithmetic. Week averages,
          not week-end readings: two single mornings compared measure what you
          drank, not what you lost.
        */}
        <Text style={[type_.label, styles.weeksHead, {color: t.textMuted}]}>
          WEEK BY WEEK
        </Text>
        {weeks.map(week => (
          <View key={week.label} style={[styles.weekRow, {borderBottomColor: t.line}]}>
            <Text style={[styles.weekLabel, {color: t.text}]}>{week.label}</Text>
            <Text style={[styles.weekAverage, {color: t.textMuted}]}>
              {`${week.averageKg.toFixed(1)} kg`}
            </Text>
            <Text
              style={[
                styles.weekChange,
                {
                  color:
                    week.changeKg === undefined
                      ? t.textFaint
                      : week.changeKg <= 0
                      ? t.status.under
                      : t.status.over,
                },
              ]}>
              {week.changeKg === undefined
                ? '—'
                : `${week.changeKg <= 0 ? MINUS : '+'} ${Math.abs(week.changeKg).toFixed(1)}`}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Change the goal" variant="ghost" onPress={onChangeGoal} />
      </View>
    </Screen>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  const t = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[type_.label, {color: t.textMuted}]}>{label}</Text>
      <Text style={[type_.figureMd, styles.statValue, {color: t.text}]}>{value}</Text>
    </View>
  );
}

function Legend({
  colour,
  kind,
  label,
}: {
  colour: string;
  kind: 'dots' | 'solid' | 'dashed';
  label: string;
}) {
  const t = useTheme();
  return (
    <View style={styles.legendItem}>
      <Svg width={16} height={8}>
        {kind === 'dots' ? (
          <>
            <Circle cx={4} cy={4} r={2.6} fill={colour} />
            <Circle cx={12} cy={4} r={2.6} fill={colour} />
          </>
        ) : (
          <Line
            x1={0}
            y1={4}
            x2={16}
            y2={4}
            stroke={colour}
            strokeWidth={kind === 'solid' ? 2.4 : 2}
            strokeDasharray={kind === 'dashed' ? '4 4' : undefined}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <Text style={[styles.legendLabel, {color: t.textMuted}]}>{label}</Text>
    </View>
  );
}
