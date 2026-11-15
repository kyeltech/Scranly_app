import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Button, Header, Screen} from '../ui';
import {withThousands} from '../lib/format';
import type {FoodItem} from '../domain/food';
import {type as type_, useTheme} from '../theme';
import {myFoods as styles} from '../styles';

/**
 * The foods you typed in yourself.
 *
 * Settings counted them and stopped there, so the only way to see one again
 * was to search for it while logging — which is no way to find out what you
 * had already made, or to notice the one you got wrong.
 *
 * A row opens nothing yet. Editing needs `replace` and `remove` on the food
 * store and neither exists, so the rows carry no chevron: a chevron is a
 * promise that something is behind it.
 */
export default function MyFoods({
  foods = [],
  onBack,
  onCreate,
}: {
  /** As the store holds them, oldest first. */
  foods?: FoodItem[];
  onBack?: () => void;
  onCreate?: () => void;
}) {
  const t = useTheme();
  // Newest first: the one you just made is the one you are looking for.
  const mine = [...foods].reverse();

  return (
    <Screen insetBottom={false}>
      <Header title="Foods you added" onBack={onBack} />

      {mine.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, {color: t.text}]}>Nothing yet</Text>
          <Text style={[styles.emptyBody, {color: t.text}]}>
            When the database does not have a food — a home recipe, a market
            stall, a tin whose barcode nobody has scanned — you type it in once
            and it is yours from then on.
          </Text>
          <Text style={[styles.emptyNote, {color: t.textMuted}]}>
            Scanning a label fills most of the form in for you.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={[styles.lede, {color: t.textMuted}]}>
            Foods you typed in yourself, because the database did not have them.
            Newest first.
          </Text>
          <Text style={[styles.count, {color: t.textMuted}]}>
            {mine.length === 1 ? '1 FOOD' : `${mine.length} FOODS`}
          </Text>

          {mine.map(item => (
            <View key={item.id} style={[styles.row, {borderBottomColor: t.line}]}>
              <View style={styles.rowText}>
                <Text style={[type_.bodyStrong, {color: t.text}]}>{item.name}</Text>
                <Text style={[styles.meta, {color: t.textMuted}]}>{item.meta}</Text>
                <Text style={[styles.logged, {color: t.textFaint}]}>
                  {loggedLine(item.logged)}
                </Text>
              </View>
              <Text style={[styles.kcal, {color: t.text}]}>
                {withThousands(Math.round(item.kcal))}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <Button label="Create a food" onPress={onCreate} />
      </View>
    </Screen>
  );
}

/**
 * How often it has been logged, which is what tells you whether typing it in
 * was worth the minute — and which of these you can clear out later.
 */
function loggedLine(times: number | undefined): string {
  if (!times) {
    return 'Not logged yet';
  }
  return times === 1 ? 'Logged once' : `Logged ${times} times`;
}
