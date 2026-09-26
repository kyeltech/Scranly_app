import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Field, Header, Screen} from '../ui';
import {Barcode, ChevronRight} from '../ui/icons';
import {brand, spacing, type as type_, useTheme} from '../theme';

export default function CreateFood({
  onBack,
  onScanLabel,
  onSave,
}: {
  onBack?: () => void;
  onScanLabel?: () => void;
  onSave?: () => void;
}) {
  const t = useTheme();
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
            <Text style={[type_.bodyStrong, {color: t.text}]}>
              Scan the label instead
            </Text>
            <Text style={[type_.caption, {color: t.textMuted}]}>
              Faster, and it fills all of this in
            </Text>
          </View>
          <ChevronRight colour={t.textMuted} size={15} />
        </Pressable>

        <Field label="NAME" value="Mum’s jollof rice" style={styles.field} />
        <Field label="BRAND" placeholder="Optional" style={styles.field} />

        <View style={styles.row}>
          <Field label="SERVING" value="250" suffix="g" />
          <Field label="CALORIES" value="418" suffix="kcal" />
        </View>

        <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>
          PER SERVING
        </Text>
        <View style={styles.row}>
          <Field label="PROTEIN" value="9.4" suffix="g" />
          <Field label="CARBS" value="76.0" suffix="g" />
          <Field label="FAT" value="8.2" suffix="g" />
        </View>

        <Text style={[styles.note, {color: t.textMuted}]}>
          Only a name and the calories are required. Macros can wait — the day
          still adds up without them.
        </Text>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Save food" onPress={onSave} />
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
    padding: 12,
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
  field: {marginTop: 14},
  row: {flexDirection: 'row', gap: 10, marginTop: 14},
  legend: {marginTop: 22},
  note: {...type_.caption, lineHeight: 18, marginTop: 16},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});
