import React, {useState} from 'react';
import {Linking, Pressable, ScrollView, Switch, Text, View} from 'react-native';
import {Header, Screen} from '../ui';
import {ChevronRight} from '../ui/icons';
import {withThousands} from '../lib/format';
import type {Activity} from '../domain/targets';
import {brand, type as type_, useTheme} from '../theme';
import {activityName} from './AboutYou';

import {settings as styles} from '../styles';
/**
 * A row. `soon` is for the ones that are designed and not built: they keep
 * their place in the list, say so where the value would be, and stop being
 * tappable — honest at a glance, rather than after a tap that goes nowhere.
 */
type Row =
  | {kind: 'link'; label: string; value?: string; note?: string; soon?: boolean; onPress?: () => void}
  | {kind: 'toggle'; label: string; note?: string; on: boolean; soon?: boolean}
  | {kind: 'plain'; label: string; value: string};

export default function Settings({
  targetsKcal = 0,
  goalKg = 0,
  goalDate = '',
  activity = 'moderate',
  foodsAdded = 0,
  release,
  onBack,
  onGoal,
  onProfile,
  onTargets,
  onMethod,
  onFoods,
  onFeedback,
  onWhatsNew,
}: {
  /** The real daily budget, goal, and count — not the figures the board was drawn with. */
  targetsKcal?: number;
  goalKg?: number;
  goalDate?: string;
  /** How active they said they were, for the About you row's value. */
  activity?: Activity;
  foodsAdded?: number;
  /**
   * The build this is, as '1.0 (4)'. Undefined in a build that cannot read its
   * own version, and the row says so rather than showing a number from
   * package.json that was never the binary's (`src/version.ts`).
   */
  release?: string;
  onBack?: () => void;
  /** Edit the goal, through the same screen Change goal uses. */
  onGoal?: () => void;
  /** Height, age, sex and activity — the facts the rest is computed from. */
  onProfile?: () => void;
  /** The setup steps these rows show the answers from. */
  onTargets?: () => void;
  onMethod?: () => void;
  /** The foods you typed in yourself. */
  onFoods?: () => void;
  /** The one ask in the app, and the only screen that collects words. */
  onFeedback?: () => void;
  /** What changed in this build, on demand — the only way back to the sheet. */
  onWhatsNew?: () => void;
}) {
  const t = useTheme();
  const [countExercise, setCountExercise] = useState(false);

  const sections: {title: string; rows: Row[]}[] = [
    {
      title: 'YOU',
      rows: [
        // Cause before effect: the facts you gave, then the method, then where
        // you are heading, then what comes out of all three.
        {
          kind: 'link',
          label: 'About you',
          value: activityName(activity),
          onPress: onProfile,
        },
        {kind: 'link', label: 'Method', value: 'Mifflin–St Jeor', onPress: onMethod},
        {
          kind: 'link',
          label: 'Goal',
          value: `${goalKg.toFixed(1)} kg by ${goalDate}`,
          onPress: onGoal,
        },
        {
          kind: 'link',
          label: 'Targets',
          value: `${withThousands(targetsKcal)} kcal`,
          onPress: onTargets,
        },
      ],
    },
    {
      title: 'LOGGING',
      rows: [
        {kind: 'link', label: 'Units', soon: true},
        {
          kind: 'toggle',
          label: 'Count exercise toward the budget',
          soon: true,
          note: 'Off. Both your food and your watch overestimate, in opposite directions — eating it back usually wipes out the day.',
          on: false,
        },
        {kind: 'link', label: 'Week starts', soon: true},
      ],
    },
    {title: 'APPEARANCE', rows: [{kind: 'link', label: 'Theme', soon: true}]},
    {
      title: 'DATA',
      rows: [
        {kind: 'link', label: 'Export everything', soon: true},
        {
          kind: 'link',
          label: 'Foods you added',
          value: String(foodsAdded),
          onPress: onFoods,
        },
      ],
    },
    {
      title: 'SCRANLY',
      rows: [
        // First, because it is the only thing on this screen that is a request
        // of them rather than a setting of theirs — and absent altogether when
        // there is nowhere for it to go, rather than a row that swallows words.
        ...(onFeedback
          ? [{kind: 'link', label: 'Tell me what you think', onPress: onFeedback} as Row]
          : []),
        // The version row used to be a dead end showing a number from
        // package.json. It is now the way back to what changed in this build.
        {kind: 'link', label: 'What’s new', value: release ?? '—', onPress: onWhatsNew},
        {kind: 'link', label: 'Invite a friend', soon: true},
      ],
    },
  ];

  return (
    <Screen>
      <Header title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        {sections.map(section => (
          <View key={section.title}>
            <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>
              {section.title}
            </Text>
            {section.rows.map(row => {
              const soon = 'soon' in row && row.soon === true;
              return (
              <Pressable
                key={row.label}
                onPress={row.kind === 'link' && !soon ? row.onPress : undefined}
                disabled={soon}
                accessibilityRole={row.kind === 'plain' ? 'text' : 'button'}
                accessibilityLabel={row.label}
                accessibilityState={soon ? {disabled: true} : undefined}
                style={[styles.row, {borderBottomColor: t.line}]}>
                <View style={styles.rowText}>
                  <Text
                    style={[type_.bodyStrong, {color: soon ? t.textMuted : t.text}]}>
                    {row.label}
                  </Text>
                  {'note' in row && row.note ? (
                    <Text style={[styles.note, {color: t.textMuted}]}>{row.note}</Text>
                  ) : null}
                </View>
                {soon ? (
                  <View style={[styles.soon, {borderColor: t.line}]}>
                    <Text style={[styles.soonLabel, {color: t.textMuted}]}>SOON</Text>
                  </View>
                ) : row.kind === 'toggle' ? (
                  <Switch
                    value={countExercise}
                    onValueChange={setCountExercise}
                    accessibilityLabel={row.label}
                    trackColor={{true: brand.lime, false: t.controlLine}}
                  />
                ) : (
                  <>
                    <Text style={[type_.caption, {color: t.textMuted}]}>
                      {row.value}
                    </Text>
                    {row.kind === 'link' ? (
                      <ChevronRight colour={t.textMuted} size={15} />
                    ) : null}
                  </>
                )}
              </Pressable>
              );
            })}
          </View>
        ))}
        <Text style={[styles.footer, {color: t.textMuted}]}>
          No account to upgrade, nothing to subscribe to, and nothing here sells
          your diary on. That is the whole business model.
        </Text>
        {/* ODbL requires the licence named and Open Food Facts credited with a
            link wherever its data is used. The scanned numbers come from there,
            so the credit lives here (ADR-0010). */}
        <Text
          accessibilityRole="link"
          onPress={() => Linking.openURL('https://openfoodfacts.org')}
          style={[styles.credit, {color: t.textMuted}]}>
          Food data from{' '}
          <Text style={styles.creditLink}>Open Food Facts</Text>, licensed under
          the ODbL.
        </Text>
      </ScrollView>
    </Screen>
  );
}
