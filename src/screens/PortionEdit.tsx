import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import CameraStub from '../components/CameraStub';
import Sheet from '../ui/Sheet';
import {Button, Segmented} from '../ui';
import {Plus} from '../ui/icons';
import {radius, spacing, type as type_, useTheme} from '../theme';

const PRESETS = [100, 125, 150, 175, 200];
/** Per gram, from the fixture's chicken thigh: 261 kcal at 150 g. */
const KCAL_PER_G = 261 / 150;

export default function PortionEdit({
  name = 'Chicken thigh, grilled',
  guessG = 150,
  onClose,
  onSave,
}: {
  name?: string;
  guessG?: number;
  onClose?: () => void;
  onSave?: (grams: number) => void;
}) {
  const t = useTheme();
  const [grams, setGrams] = useState(guessG);
  const kcal = Math.round(grams * KCAL_PER_G);

  return (
    <CameraStub title="Scan" onClose={onClose}>
      <Sheet>
        <Text style={[type_.title, {color: t.text}]}>{name}</Text>
        <Text style={[type_.caption, {color: t.textMuted}]}>
          {`The photo guessed ${guessG} g`}
        </Text>

        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => setGrams(g => Math.max(0, g - 5))}
            accessibilityRole="button"
            accessibilityLabel="Less"
            style={[styles.stepper, {backgroundColor: t.fill}]}>
            <View style={[styles.minus, {backgroundColor: t.text}]} />
          </Pressable>
          <View style={styles.amount}>
            <Text style={[styles.figure, {color: t.text}]}>{String(grams)}</Text>
            <Text style={[styles.unit, {color: t.textMuted}]}>g</Text>
          </View>
          <Pressable
            onPress={() => setGrams(g => g + 5)}
            accessibilityRole="button"
            accessibilityLabel="More"
            style={[styles.stepper, {backgroundColor: t.fill}]}>
            <Plus colour={t.text} size={20} />
          </Pressable>
        </View>

        <View style={styles.presets}>
          {PRESETS.map(preset => {
            const on = preset === grams;
            return (
              <Pressable
                key={preset}
                onPress={() => setGrams(preset)}
                accessibilityRole="button"
                accessibilityState={{selected: on}}
                style={[styles.preset, {backgroundColor: on ? t.chipOnBg : t.fill}]}>
                <Text
                  style={[styles.presetLabel, {color: on ? t.chipOnText : t.text}]}>
                  {`${preset} g`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.units}>
          <Segmented options={['Grams', 'Ounces', 'Pieces']} value="Grams" />
        </View>

        <View style={[styles.guide, {backgroundColor: t.fill}]}>
          <Text style={[type_.label, {color: t.textMuted}]}>IF YOU ARE GUESSING</Text>
          <Text style={[styles.guideText, {color: t.text}]}>
            One thigh, boneless ≈ 75 g{'\n'}Your palm, thickness included ≈ 120 g
          </Text>
        </View>

        <View style={styles.liveRow}>
          <Text style={[styles.live, {color: t.text}]}>{String(kcal)}</Text>
          <Text style={[type_.caption, {color: t.textMuted}]}>kcal at this portion</Text>
        </View>

        <View style={styles.spacer} />
        <Button label="Save this portion" onPress={() => onSave?.(grams)} />
      </Sheet>
    </CameraStub>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  amount: {flexDirection: 'row', alignItems: 'baseline', gap: 6},
  figure: {...type_.figureHero, fontSize: 44, lineHeight: 46},
  unit: {...type_.title, fontSize: 20},
  stepper: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: {width: 18, height: 2.8, borderRadius: 2},
  presets: {flexDirection: 'row', gap: 6, marginTop: 18},
  preset: {flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill},
  presetLabel: {...type_.caption, fontWeight: '700'},
  units: {marginTop: 10},
  guide: {borderRadius: 14, padding: 14, marginTop: 16},
  guideText: {...type_.caption, lineHeight: 20, marginTop: 5},
  liveRow: {flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 18},
  live: {...type_.figureLg, fontSize: 26},
  spacer: {height: spacing.lg},
});
