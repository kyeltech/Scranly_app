import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Field, Header, Screen} from '../ui';
import {Barcode, ChevronRight} from '../ui/icons';
import {brand, spacing, type as type_, useTheme} from '../theme';

/** What the screen hands back. Blank macros are allowed — the note says so. */
export type NewFood = {
  name: string;
  brand: string;
  servingG: string;
  kcal: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
};

const EMPTY: NewFood = {
  name: '',
  brand: '',
  servingG: '',
  kcal: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
};

export default function CreateFood({
  initial = EMPTY,
  onBack,
  onScanLabel,
  onSave,
}: {
  initial?: NewFood;
  onBack?: () => void;
  onScanLabel?: () => void;
  onSave?: (food: NewFood) => void;
}) {
  const t = useTheme();
  const [food, setFood] = useState<NewFood>(initial);
  const set = <K extends keyof NewFood>(key: K) => (next: string) =>
    setFood(current => ({...current, [key]: next}));

  return (
    <Screen>
      <Header title="Create a food" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable
          onPress={onScanLabel}
          accessibilityRole="button"
          style={[styles.shortcut, {backgroundColor: t.fill}]}>
          <View style={styles.shortcutIcon}>
            <Barcode colour={brand.onLime} size={18} />
          </View>
          <View style={styles.shortcutText}>
            <Text style={[styles.shortcutTitle, {color: t.text}]}>
              Scan the label instead
            </Text>
            <Text style={[styles.shortcutSub, {color: t.textMuted}]}>
              Faster, and it fills all of this in
            </Text>
          </View>
          <ChevronRight colour={t.textMuted} size={15} />
        </Pressable>

        <Field
          label="NAME"
          shape="form"
          value={food.name}
          onChangeText={set('name')}
          placeholder="Mum’s jollof rice"
          style={styles.field}
        />
        <Field
          label="BRAND"
          shape="form"
          value={food.brand}
          onChangeText={set('brand')}
          placeholder="Optional"
          style={styles.field}
        />

        <View style={styles.row}>
          <Field
            label="SERVING"
            shape="form"
            value={food.servingG}
            onChangeText={set('servingG')}
            keyboardType="numeric"
            placeholder="250"
            suffix="g"
          />
          {/* The one number the day cannot be added up without. */}
          <Field
            label="CALORIES"
            shape="form"
            emphasis
            value={food.kcal}
            onChangeText={set('kcal')}
            keyboardType="numeric"
            placeholder="418"
            suffix="kcal"
            style={styles.calories}
          />
        </View>

        <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>
          PER SERVING
        </Text>
        <View style={styles.macros}>
          <Field
            label="PROTEIN"
            shape="compact"
            value={food.proteinG}
            onChangeText={set('proteinG')}
            keyboardType="decimal-pad"
            placeholder="9.4"
            suffix="g"
          />
          <Field
            label="CARBS"
            shape="compact"
            value={food.carbsG}
            onChangeText={set('carbsG')}
            keyboardType="decimal-pad"
            placeholder="76.0"
            suffix="g"
          />
          <Field
            label="FAT"
            shape="compact"
            value={food.fatG}
            onChangeText={set('fatG')}
            keyboardType="decimal-pad"
            placeholder="8.2"
            suffix="g"
          />
        </View>

        <Text style={[styles.note, {color: t.textMuted}]}>
          Only a name and the calories are required. Macros can wait — the day
          still adds up without them.
        </Text>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Save food" onPress={() => onSave?.(food)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 40},
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  shortcutIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {flex: 1},
  shortcutTitle: {...type_.bodyStrong, fontSize: 14.5},
  shortcutSub: {...type_.caption, fontSize: 12.5},
  field: {marginTop: 14},
  row: {flexDirection: 'row', gap: 10, marginTop: 14},
  calories: {flex: 0, width: 132},
  legend: {marginTop: 20},
  macros: {flexDirection: 'row', gap: 10, marginTop: 2},
  note: {...type_.caption, fontSize: 12.5, lineHeight: 18, marginTop: 16},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});
