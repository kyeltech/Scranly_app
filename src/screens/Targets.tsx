import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Header, Note, Progress} from '../ui';
import {withThousands} from '../lib/format';
import {radius, spacing, type as type_, useTheme} from '../theme';
import type {Targets as TargetValues} from '../domain/targets';

export default function Targets({
  targets,
  weightKg,
  onBack,
  onDone,
}: {
  targets: TargetValues;
  weightKg: number;
  onBack?: () => void;
  onDone?: () => void;
}) {
  const t = useTheme();
  const kcal = targets.kcal;
  const rows = [
    {label: 'Protein', grams: targets.proteinG, pct: Math.round((targets.proteinG * 4 * 100) / kcal), colour: t.macro.protein},
    {label: 'Carbs', grams: targets.carbsG, pct: Math.round((targets.carbsG * 4 * 100) / kcal), colour: t.macro.carbs},
    {label: 'Fat', grams: targets.fatG, pct: Math.round((targets.fatG * 9 * 100) / kcal), colour: t.macro.fat},
  ];

  return (
    <View style={[styles.screen, {backgroundColor: t.bg}]}>
      <Header title="" overline="STEP 4 OF 4" onBack={onBack} />
      <Progress step={4} of={4} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[type_.title, {color: t.text}]}>Your daily targets</Text>
        <Text style={[styles.lede, {color: t.textMuted}]}>
          {`At ${weightKg.toFixed(1)} kg, for the goal and date you set.`}
        </Text>

        <View style={styles.headline}>
          <Text style={[styles.figure, {color: t.text}]}>{withThousands(kcal)}</Text>
          <Text style={[type_.bodyStrong, styles.unit, {color: t.textMuted}]}>
            kcal a day
          </Text>
        </View>

        {rows.map(row => (
          <View key={row.label} style={[styles.row, {borderBottomColor: t.line}]}>
            <View style={styles.rowHead}>
              <Text style={[type_.bodyStrong, {color: t.text}]}>{row.label}</Text>
              <View style={styles.rowRight}>
                <Text style={[type_.caption, {color: t.textMuted}]}>
                  {`${row.pct}% of calories`}
                </Text>
                <Text style={[type_.figureMd, {color: t.text}]}>{`${row.grams} g`}</Text>
              </View>
            </View>
            <View style={[styles.track, {backgroundColor: t.track}]}>
              <View style={[styles.fill, {width: `${row.pct}%`, backgroundColor: row.colour}]} />
            </View>
          </View>
        ))}

        <View style={[styles.row, {borderBottomColor: t.line}]}>
          <View style={styles.rowHead}>
            <Text style={[type_.bodyStrong, {color: t.text}]}>Fibre</Text>
            <Text style={[type_.figureMd, {color: t.text}]}>
              {`${targets.fibreG} g`}
            </Text>
          </View>
          <Text style={[type_.caption, styles.fibreNote, {color: t.textMuted}]}>
            14 g per 1,000 kcal — counted inside the carbs, not on top
          </Text>
        </View>

        <View style={styles.note}>
          <Note>
            These move with you. Every time your 7-day weight average shifts, the
            targets follow — you will not have to redo this.
          </Note>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Start logging" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  headline: {flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 22},
  figure: {...type_.figureHero, fontSize: 56, lineHeight: 56},
  unit: {paddingBottom: 6},
  row: {paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth},
  rowHead: {flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between'},
  rowRight: {flexDirection: 'row', alignItems: 'baseline', gap: 8},
  track: {height: 6, borderRadius: radius.pill, marginTop: 8, overflow: 'hidden'},
  fill: {height: 6},
  fibreNote: {marginTop: 6},
  note: {marginTop: 16},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 30, paddingTop: spacing.sm},
});
