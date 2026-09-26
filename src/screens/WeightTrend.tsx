import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Line} from 'react-native-svg';
import {Button, Header, Screen} from '../ui';
import {Check} from '../ui/icons';
import TrendChart from '../components/TrendChart';
import {trend} from '../domain/weight';
import type {Reading} from '../domain/weight';
import {radius, spacing, type as type_, useTheme} from '../theme';

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

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 30},
  legend: {flexDirection: 'row', gap: 14, marginTop: 6, paddingLeft: 8},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendLabel: {...type_.caption, fontSize: 11.5},
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stat: {flex: 1},
  statValue: {marginTop: 3},
  verdict: {borderRadius: 16, padding: 16, marginTop: 18},
  verdictHead: {flexDirection: 'row', alignItems: 'center', gap: 8},
  badge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verdictLine: {...type_.body, marginTop: 10},
  verdictDetail: {...type_.caption, lineHeight: 19, marginTop: 6},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12},
});
