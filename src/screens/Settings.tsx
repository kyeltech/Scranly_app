import React, {useState} from 'react';
import {Linking, Pressable, ScrollView, Switch, Text, View} from 'react-native';
import {Header, Screen} from '../ui';
import {ChevronRight} from '../ui/icons';
import {withThousands} from '../lib/format';
import {brand, type as type_, useTheme} from '../theme';

import {settings as styles} from '../styles';
type Row =
  | {kind: 'link'; label: string; value?: string; note?: string; onPress?: () => void}
  | {kind: 'toggle'; label: string; note?: string; on: boolean}
  | {kind: 'plain'; label: string; value: string};

/** Matches package.json. A placeholder number here was read as a real version. */
const APP_VERSION = '0.0.1';

export default function Settings({
  targetsKcal = 0,
  goalKg = 0,
  goalDate = '',
  foodsAdded = 0,
  onBack,
  onGoal,
}: {
  /** The real daily budget, goal, and count — not the figures the board was drawn with. */
  targetsKcal?: number;
  goalKg?: number;
  goalDate?: string;
  foodsAdded?: number;
  onBack?: () => void;
  /** Edit the goal, through the same screen Change goal uses. */
  onGoal?: () => void;
}) {
  const t = useTheme();
  const [countExercise, setCountExercise] = useState(false);

  const sections: {title: string; rows: Row[]}[] = [
    {
      title: 'YOU',
      rows: [
        {kind: 'link', label: 'Targets', value: `${withThousands(targetsKcal)} kcal`},
        {kind: 'link', label: 'Method', value: 'Mifflin–St Jeor'},
        {
          kind: 'link',
          label: 'Goal',
          value: `${goalKg.toFixed(1)} kg by ${goalDate}`,
          onPress: onGoal,
        },
      ],
    },
    {
      title: 'LOGGING',
      rows: [
        {kind: 'link', label: 'Units', value: 'Metric'},
        {
          kind: 'toggle',
          label: 'Count exercise toward the budget',
          note: 'Off. Both your food and your watch overestimate, in opposite directions — eating it back usually wipes out the day.',
          on: false,
        },
        {kind: 'link', label: 'Week starts', value: 'Monday'},
      ],
    },
    {title: 'APPEARANCE', rows: [{kind: 'link', label: 'Theme', value: 'Follow device'}]},
    {
      title: 'DATA',
      rows: [
        {kind: 'link', label: 'Export everything', value: 'CSV'},
        {kind: 'link', label: 'Foods you added', value: String(foodsAdded)},
      ],
    },
    {
      title: 'SCRANLY',
      rows: [
        {kind: 'link', label: 'Invite a friend', value: '3 left'},
        {kind: 'plain', label: 'Version', value: APP_VERSION},
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
            {section.rows.map(row => (
              <Pressable
                key={row.label}
                onPress={row.kind === 'link' ? row.onPress : undefined}
                accessibilityRole={row.kind === 'plain' ? 'text' : 'button'}
                style={[styles.row, {borderBottomColor: t.line}]}>
                <View style={styles.rowText}>
                  <Text style={[type_.bodyStrong, {color: t.text}]}>{row.label}</Text>
                  {'note' in row && row.note ? (
                    <Text style={[styles.note, {color: t.textMuted}]}>{row.note}</Text>
                  ) : null}
                </View>
                {row.kind === 'toggle' ? (
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
            ))}
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
