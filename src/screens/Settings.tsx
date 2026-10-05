import React, {useState} from 'react';
import {Pressable, ScrollView, Switch, Text, View} from 'react-native';
import {Header, Screen} from '../ui';
import {ChevronRight} from '../ui/icons';
import {brand, type as type_, useTheme} from '../theme';

import {settings as styles} from '../styles';
type Row =
  | {kind: 'link'; label: string; value?: string; note?: string}
  | {kind: 'toggle'; label: string; note?: string; on: boolean}
  | {kind: 'plain'; label: string; value: string};

const SECTIONS: {title: string; rows: Row[]}[] = [
  {
    title: 'YOU',
    rows: [
      {kind: 'link', label: 'Targets', value: '1,815 kcal'},
      {kind: 'link', label: 'Method', value: 'Bodyweight'},
      {kind: 'link', label: 'Goal', value: '75.0 kg by 24 Nov'},
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
      {kind: 'link', label: 'Foods you added', value: '12'},
    ],
  },
  {
    title: 'SCRANLY',
    rows: [
      {kind: 'link', label: 'Invite a friend', value: '3 left'},
      {kind: 'plain', label: 'Version', value: '0.1.0'},
    ],
  },
];

export default function Settings({onBack}: {onBack?: () => void}) {
  const t = useTheme();
  const [countExercise, setCountExercise] = useState(false);

  return (
    <Screen>
      <Header title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        {SECTIONS.map(section => (
          <View key={section.title}>
            <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>
              {section.title}
            </Text>
            {section.rows.map(row => (
              <Pressable
                key={row.label}
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
      </ScrollView>
    </Screen>
  );
}
