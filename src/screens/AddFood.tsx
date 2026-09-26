import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Button, Screen, useActionBarInset} from '../ui';
import {Barcode, Check, ChevronLeft, Close, Plus, SearchGlass} from '../ui/icons';
import {withThousands} from '../lib/format';
import {brand, radius, spacing, type as type_, useTheme} from '../theme';
import {recentFoods, searchFoods} from '../fixtures/foods';
import type {FoodItem} from '../fixtures/foods';

const FILTERS = ['Recent', 'Frequent', 'My foods', 'Meals'];

export default function AddFood({
  meal = 'lunch',
  onBack,
  onScan,
  onCreate,
  onAdd,
}: {
  meal?: string;
  onBack?: () => void;
  onScan?: () => void;
  onCreate?: () => void;
  onAdd?: (items: FoodItem[]) => void;
}) {
  const t = useTheme();
  const barInset = useActionBarInset();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const searching = query.trim().length > 0;
  const rows = useMemo(
    () => (searching ? searchFoods(query) : recentFoods),
    [query, searching],
  );
  const chosen = useMemo(
    () => [...recentFoods, ...searchFoods(query)].filter(f => picked.includes(f.id)),
    [picked, query],
  );
  const total = chosen.reduce((sum, f) => sum + f.kcal, 0);

  const toggle = (id: string) =>
    setPicked(current =>
      current.includes(id) ? current.filter(x => x !== id) : [...current, id],
    );

  return (
    <Screen insetBottom={false}>
      <View style={styles.head}>
        {searching ? null : (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[styles.round, {backgroundColor: t.fill}]}>
            <ChevronLeft colour={t.text} size={17} />
          </Pressable>
        )}
        <Text style={[type_.sectionTitle, styles.title, {color: t.text}]}>
          {`Add to ${meal}`}
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View
          style={[
            styles.search,
            {backgroundColor: t.fill},
            searching ? styles.searchFocused : styles.searchResting,
          ]}>
          <SearchGlass colour={t.textMuted} size={17} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search foods and brands"
            placeholderTextColor={t.textMuted}
            accessibilityLabel="Search foods and brands"
            style={[styles.input, {color: t.text}]}
          />
          {searching ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={[styles.clear, {backgroundColor: t.controlLine}]}>
              <Close colour={t.bg} size={11} />
            </Pressable>
          ) : (
            <Pressable
              onPress={onScan}
              accessibilityRole="button"
              accessibilityLabel="Scan a barcode"
              style={styles.scan}>
              <Barcode colour={brand.onLime} size={19} />
            </Pressable>
          )}
        </View>
        {searching ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button">
            <Text style={[type_.bodyStrong, {color: t.text}]}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      {searching ? null : (
        <View style={styles.filters}>
          {FILTERS.map((filter, i) => (
            <View
              key={filter}
              style={[
                styles.filter,
                {backgroundColor: i === 0 ? t.chipOnBg : t.fill},
              ]}>
              <Text
                style={[
                  styles.filterLabel,
                  {color: i === 0 ? t.chipOnText : t.text},
                ]}>
                {filter}
              </Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.list, {paddingBottom: 106 + barInset}]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.listHead}>
          <Text style={[type_.label, {color: t.textMuted}]}>
            {searching ? `${rows.length} RESULTS` : 'EATEN THIS WEEK'}
          </Text>
          {searching ? (
            <Text style={[type_.caption, {color: t.textMuted}]}>Yours first</Text>
          ) : (
            <Pressable onPress={onCreate} accessibilityRole="button">
              <Text style={[type_.bodyStrong, {color: t.text}]}>
                Create a food
              </Text>
            </Pressable>
          )}
        </View>

        {rows.length === 0 ? (
          <Text style={[styles.none, {color: t.textMuted}]}>
            {`Nothing matches “${query.trim()}”. Create it once and it is yours from now on.`}
          </Text>
        ) : null}

        {rows.map(food => {
          const on = picked.includes(food.id);
          return (
            <Pressable
              key={food.id}
              onPress={() => toggle(food.id)}
              accessibilityRole="button"
              accessibilityState={{selected: on}}
              style={[styles.row, {borderBottomColor: t.line}]}>
              <View style={styles.rowText}>
                <View style={styles.nameRow}>
                  <Text style={[type_.bodyStrong, {color: t.text}]}>{food.name}</Text>
                  {searching && food.yours ? (
                    <Text style={[styles.yours, {color: t.status.under}]}>YOURS</Text>
                  ) : null}
                </View>
                <Text style={[type_.caption, {color: t.textMuted}]}>{food.meta}</Text>
              </View>
              <Text style={[type_.figureMd, {color: t.text}]}>{food.kcal}</Text>
              <View
                style={[
                  styles.control,
                  {backgroundColor: on ? brand.lime : t.fill},
                ]}>
                {on ? (
                  <Check colour={brand.onLime} size={15} />
                ) : (
                  <Plus colour={t.text} size={15} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {picked.length > 0 ? (
        <View style={[styles.actions, {paddingBottom: barInset}]}>
          <Button
            label={`Add ${picked.length} ${picked.length === 1 ? 'item' : 'items'}`}
            sub={`${withThousands(total)} kcal`}
            onPress={() => onAdd?.(chosen)}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {flex: 1},
  round: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 18,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingLeft: 14,
    paddingRight: 7,
    borderRadius: 15,
    borderWidth: 2,
  },
  searchFocused: {borderColor: brand.lime},
  searchResting: {borderColor: 'transparent'},
  input: {...type_.body, flex: 1, paddingVertical: 0},
  clear: {
    width: 19,
    height: 19,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scan: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, marginTop: 18},
  filter: {paddingHorizontal: 15, paddingVertical: 8, borderRadius: radius.pill},
  filterLabel: {...type_.caption, fontWeight: '600'},
  list: {paddingHorizontal: spacing.lg, paddingTop: 18},
  listHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  none: {...type_.caption, lineHeight: 20, paddingVertical: 16},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
  yours: {...type_.label, fontSize: 10, letterSpacing: 0.8},
  control: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
