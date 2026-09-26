import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Viewfinder from '../components/Viewfinder';
import {ScaleDisplay} from '../components/subjects';
import Sheet from '../ui/Sheet';
import {Button, Note} from '../ui';
import {radius, spacing, type as type_, useTheme} from '../theme';

/**
 * Photograph the scale rather than type the number. Two stages, both designed:
 * aim, then check what was read — because a display photographed at an angle is
 * exactly where this goes wrong, and the app says so rather than hoping.
 *
 * No mode tabs: this is reached from the weigh-in, not from the food scanner,
 * and switching to Barcode from here would make no sense.
 */
export default function ScalePhoto({
  reading,
  yesterdayKg,
  averageKg,
  stage: initialStage = 'aiming',
  onClose,
  onSave,
  onFix,
}: {
  /** What the display says. A real read comes from the camera later. */
  reading: number;
  yesterdayKg: number;
  averageKg: number;
  stage?: 'aiming' | 'read';
  onClose?: () => void;
  onSave?: (kg: number) => void;
  /** Tapping the number falls back to typing it — the read was wrong. */
  onFix?: () => void;
}) {
  const t = useTheme();
  const [stage, setStage] = useState(initialStage);
  const aiming = stage === 'aiming';

  return (
    <Viewfinder
      title="Weigh-in"
      onClose={onClose}
      onTorch={() => {}}
      frame={
        aiming
          ? {width: 298, height: 236, top: 232}
          : {width: 278, height: 204, top: 248}
      }
      frameState={aiming ? 'aiming' : 'read'}
      scrim={aiming ? 0 : 0.55}
      hint={aiming ? 'Hold the phone flat over the display' : undefined}
      onShutter={aiming ? () => setStage('read') : undefined}
      sheet={
        aiming ? undefined : (
          <Sheet>
            <View style={styles.head}>
              <View style={styles.dot} />
              <Text style={[type_.label, {color: t.textMuted}]}>
                READ FROM THE DISPLAY
              </Text>
            </View>

            <Pressable
              onPress={onFix}
              accessibilityRole="button"
              accessibilityLabel="Fix the reading"
              style={styles.figureRow}>
              <Text
                style={[styles.figure, {color: t.text, borderBottomColor: t.guessLine}]}>
                {reading.toFixed(1)}
              </Text>
              <Text style={[styles.unit, {color: t.textMuted}]}>kg</Text>
            </Pressable>

            <Text style={[styles.body, {color: t.textMuted}]}>
              Tap the number if it misread. A display photographed at an angle is
              exactly where this goes wrong.
            </Text>

            <View style={styles.note}>
              <Note>
                {`Yesterday ${yesterdayKg.toFixed(1)} · 7-day average ${averageKg.toFixed(1)}`}
              </Note>
            </View>

            <View style={styles.gap} />
            <Button label={`Save ${reading.toFixed(1)} kg`} onPress={() => onSave?.(reading)} />
            <View style={styles.gapSm} />
            <Button label="Take it again" variant="ghost" onPress={() => setStage('aiming')} />
          </Sheet>
        )
      }>
      <ScaleDisplay reading={reading.toFixed(1)} />
    </Viewfinder>
  );
}

const styles = StyleSheet.create({
  head: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dot: {width: 7, height: 7, borderRadius: radius.pill, backgroundColor: '#C2F24D'},
  figureRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10},
  figure: {
    ...type_.figureHero,
    fontSize: 56,
    lineHeight: 56,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
  },
  unit: {...type_.title, fontSize: 18, fontWeight: '600', paddingBottom: 6},
  body: {...type_.caption, lineHeight: 19, marginTop: 12},
  note: {marginTop: 16},
  gap: {height: spacing.lg},
  gapSm: {height: 10},
});
