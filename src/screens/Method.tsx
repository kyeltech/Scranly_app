import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Header, Note, Progress, Screen} from '../ui';
import {Check} from '../ui/icons';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';

export type MethodKey = 'bodyweight' | 'mifflin';

const METHODS: {key: MethodKey; name: string; what: string; why: string}[] = [
  {
    key: 'bodyweight',
    name: 'Your bodyweight formula',
    what: 'Everything comes off your weight alone: 10 kcal, 0.8 g protein and 0.3 g fat per pound, fibre from the calories, carbs take what is left.',
    why: 'Simple, and the one you already use on paper.',
  },
  {
    key: 'mifflin',
    name: 'Mifflin–St Jeor',
    what: 'Estimates what you burn from height, age, sex and activity, then takes the deficit off that.',
    why: 'More inputs, and it moves when your training does.',
  },
];

export default function Method({
  onBack,
  onContinue,
}: {
  onBack?: () => void;
  onContinue?: (method: MethodKey) => void;
}) {
  const t = useTheme();
  const [chosen, setChosen] = useState<MethodKey>('bodyweight');

  return (
    <Screen>
      <Header title="" overline="STEP 3 OF 4" onBack={onBack} />
      <Progress step={3} of={4} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[type_.stepTitle, {color: t.text}]}>
          How should the targets be worked out?
        </Text>
        <Text style={[styles.lede, {color: t.textMuted}]}>
          Two ways in. Neither is more correct — they just start from different
          places.
        </Text>

        {METHODS.map(method => {
          const on = method.key === chosen;
          return (
            <Pressable
              key={method.key}
              onPress={() => setChosen(method.key)}
              accessibilityRole="button"
              accessibilityState={{selected: on}}
              style={[
                styles.card,
                {backgroundColor: t.fill},
                on ? styles.cardChosen : styles.cardResting,
              ]}>
              <View style={styles.cardHead}>
                <View
                  style={[
                    styles.tick,
                    on ? styles.tickOn : styles.tickOff,
                    on ? null : {borderColor: t.controlLine},
                  ]}>
                  {on ? <Check colour={brand.onLime} size={12} /> : null}
                </View>
                <Text style={[type_.sectionTitle, {color: t.text}]}>
                  {method.name}
                </Text>
              </View>
              <Text style={[styles.what, {color: t.textMuted}]}>{method.what}</Text>
              <Text style={[styles.why, {color: t.text}]}>{method.why}</Text>
            </Pressable>
          );
        })}

        <View style={styles.note}>
          <Note tone="caveat">
            Either way these are a starting guess. After two weeks of logging,
            Scranly compares them against your actual weight trend and offers to
            adjust — that beats both formulas.
          </Note>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="See my targets" onPress={() => onContinue?.(chosen)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  card: {borderRadius: 16, borderWidth: 2, padding: 14, marginTop: 12},
  cardChosen: {borderColor: brand.lime},
  cardResting: {borderColor: 'transparent'},
  tickOn: {backgroundColor: brand.lime},
  tickOff: {borderWidth: 1.5},
  cardHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  tick: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  what: {...type_.caption, lineHeight: 20, marginTop: 8},
  why: {...type_.caption, lineHeight: 18, marginTop: 8, opacity: 0.75},
  note: {marginTop: 18},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});
