import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {Button, Screen, useActionBarInset} from '../ui';
import {Barcode, Check, ChevronLeft, Close, Plus, SearchGlass} from '../ui/icons';
import {withThousands} from '../lib/format';
import {brand, type as type_, useTheme} from '../theme';
import {FILTER_COPY, foodsFor, recentFoods, searchFoods} from '../fixtures/foods';
import type {FoodItem} from '../fixtures/foods';

import {addFood as styles} from '../styles';
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
  const [filter, setFilter] = useState(FILTERS[0]);
  const [picked, setPicked] = useState<string[]>([]);

  const searching = query.trim().length > 0;
  const rows = useMemo(
    () => (searching ? searchFoods(query) : foodsFor(filter)),
    [query, searching, filter],
  );
  const copy = FILTER_COPY[filter] ?? FILTER_COPY.Recent;
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
          {FILTERS.map(name => {
            const on = name === filter;
            return (
              <Pressable
                key={name}
                onPress={() => setFilter(name)}
                accessibilityRole="button"
                accessibilityState={{selected: on}}
                style={[
                  styles.filter,
                  {backgroundColor: on ? t.chipOnBg : t.fill},
                ]}>
                <Text
                  style={[
                    styles.filterLabel,
                    {color: on ? t.chipOnText : t.text},
                  ]}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.list, {paddingBottom: 106 + barInset}]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.listHead}>
          <Text style={[type_.label, {color: t.textMuted}]}>
            {searching ? `${rows.length} RESULTS` : copy.head}
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
            {searching
              ? `Nothing matches “${query.trim()}”. Create it once and it is yours from now on.`
              : copy.empty ?? 'Nothing here yet.'}
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
