import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import CameraStub from '../components/CameraStub';
import Sheet from '../ui/Sheet';
import {Button, Segmented} from '../ui';
import {ChevronDown} from '../ui/icons';
import {radius, spacing, type as type_, useTheme} from '../theme';

export type ScanState = 'looking' | 'found' | 'nomatch';

const BARCODE = '5012345678900';

export default function ScanResult({
  state = 'found',
  onClose,
  onAdd,
  onAddFromLabel,
  onRetry,
}: {
  state?: ScanState;
  onClose?: () => void;
  onAdd?: () => void;
  onAddFromLabel?: () => void;
  onRetry?: () => void;
}) {
  const t = useTheme();
  const [meal, setMeal] = useState('Lunch');

  return (
    <CameraStub title="Scan" onClose={onClose}>
      <Sheet>
        {state === 'looking' ? (
          <>
            <Text style={[type_.label, {color: t.textMuted}]}>LOOKING UP</Text>
            <Text style={[type_.title, styles.code, {color: t.text}]}>{BARCODE}</Text>
            <View style={[styles.progress, {backgroundColor: t.track}]}>
              <View style={[styles.progressFill, {backgroundColor: t.status.under}]} />
            </View>
            {[62, 40, 86].map(w => (
              <View
                key={w}
                style={[styles.skeleton, {width: `${w}%`, backgroundColor: t.track}]}
              />
            ))}
            <View style={styles.spacer} />
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </>
        ) : state === 'nomatch' ? (
          <>
            <Text style={[type_.sectionTitle, {color: t.status.over}]}>
              Not in the database
            </Text>
            <Text style={[type_.caption, styles.code, {color: t.textMuted}]}>
              {BARCODE}
            </Text>
            <Text style={[styles.body, {color: t.textMuted}]}>
              Open Food Facts has most UK branded food, but not all of it. Add
              this one from the label and it is yours from now on — and everyone
              else’s.
            </Text>
            <View style={styles.spacer} />
            <Button label="Add it from the label" onPress={onAddFromLabel} />
            <View style={styles.gap} />
            <Button label="Scan something else" variant="ghost" onPress={onRetry} />
          </>
        ) : (
          <>
            <Text style={[type_.title, {color: t.text}]}>Mature Cheddar</Text>
            <Text style={[type_.caption, {color: t.textMuted}]}>
              {`Cathedral City · ${BARCODE}`}
            </Text>

            <View style={styles.figureRow}>
              <Text style={[styles.figure, {color: t.text}]}>125</Text>
              <Text style={[type_.caption, styles.unit, {color: t.textMuted}]}>
                kcal
              </Text>
              <View style={styles.macroChips}>
                {[
                  {label: 'PROT', value: '7.7'},
                  {label: 'CARB', value: '0.1'},
                  {label: 'FAT', value: '10.4'},
                ].map(macro => (
                  <View key={macro.label} style={[styles.chip, {backgroundColor: t.fill}]}>
                    <Text style={[styles.chipLabel, {color: t.textMuted}]}>
                      {macro.label}
                    </Text>
                    <Text style={[type_.figureSm, {color: t.text}]}>{macro.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change the serving"
              style={[styles.serving, {backgroundColor: t.fill}]}>
              <Text style={[type_.caption, {color: t.textMuted}]}>Serving</Text>
              <View style={styles.servingRight}>
                <Text style={[type_.bodyStrong, {color: t.text}]}>30 g · 1 slice</Text>
                <ChevronDown colour={t.textMuted} size={15} />
              </View>
            </Pressable>

            <View style={styles.meals}>
              <Segmented
                options={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
                value={meal}
                onChange={setMeal}
              />
            </View>

            <View style={styles.spacer} />
            <Button label={`Add to ${meal.toLowerCase()}`} onPress={onAdd} />
          </>
        )}
      </Sheet>
    </CameraStub>
  );
}

const styles = StyleSheet.create({
  code: {marginTop: 4},
  progress: {height: 4, borderRadius: radius.pill, marginTop: 16, overflow: 'hidden'},
  progressFill: {width: '46%', height: 4},
  skeleton: {height: 13, borderRadius: 7, marginTop: 10},
  body: {...type_.caption, lineHeight: 21, marginTop: 14},
  figureRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 16},
  figure: {...type_.figureLg, fontSize: 38, lineHeight: 38},
  unit: {paddingBottom: 4},
  macroChips: {flexDirection: 'row', gap: 6, marginLeft: 'auto'},
  chip: {alignItems: 'center', borderRadius: 12, paddingHorizontal: 11, paddingVertical: 7},
  chipLabel: {...type_.label, fontSize: 10, letterSpacing: 0.8},
  serving: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  servingRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  meals: {marginTop: 14},
  spacer: {height: spacing.lg},
  gap: {height: 10},
});
