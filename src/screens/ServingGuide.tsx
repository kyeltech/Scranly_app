import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import Sheet from '../ui/Sheet';
import {Button} from '../ui';
import {Close} from '../ui/icons';
import MeasureGlyph from '../components/measures';
import {SERVING_CARDS, cardFor, caveatFor} from '../domain/servings';
import type {ServingCard} from '../domain/servings';
import type {FoodItem} from '../domain/food';
import {brand, useTheme, useThemeName} from '../theme';
import {servingGuide as styles} from '../styles';

/** The sheet's inside, once the screen's own padding is taken off. */
const SIDE_PADDING = 24;

/**
 * What a portion of this looks like.
 *
 * Reached from the amount row, which is the question it answers: a bag of
 * almonds states per 100 g and leaves you holding it. Sixteen cards, measured
 * in hands — see domain/servings.ts for why hands and not tennis balls — and
 * every card knows its weight, so the button sets the amount rather than
 * leaving you to convert a gesture into a number yourself.
 *
 * It opens on the food's own group, taken from the entry's category, instead
 * of making anyone swipe to it.
 */
export default function ServingGuide({
  food,
  onUse,
  onClose,
}: {
  food: FoodItem;
  /** Set the amount to the card's weight. Absent on a card measured in millilitres. */
  onUse?: (grams: number) => void;
  onClose?: () => void;
}) {
  const t = useTheme();
  // The lime is the accent in the dark; in the light it needs the deeper one
  // to hold its edge against a pale fill.
  const accent = useThemeName() === 'dark' ? brand.lime : brand.limeDeep;
  const {width} = useWindowDimensions();
  const page = width - SIDE_PADDING * 2;

  const opensAt = Math.max(
    0,
    SERVING_CARDS.indexOf(cardFor(food.source?.category) ?? SERVING_CARDS[0]),
  );
  const [showing, setShowing] = useState(opensAt);
  const card: ServingCard = SERVING_CARDS[showing];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const at = Math.round(e.nativeEvent.contentOffset.x / page);
    if (at !== showing && at >= 0 && at < SERVING_CARDS.length) {
      setShowing(at);
    }
  };

  return (
    <View style={styles.scrim}>
      {/* The screen behind is still there, and tapping it is how a sheet is
          dismissed everywhere else; drawn first so the sheet sits over it. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close the serving guide"
      />
      <Sheet>
        <View style={styles.head}>
          <Text style={[styles.title, {color: t.text}]}>How much is that?</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[styles.close, {backgroundColor: t.fill}]}>
            <Close colour={t.text} size={14} />
          </Pressable>
        </View>
        <Text style={[styles.sub, {color: t.textMuted}]}>
          {showing === opensAt && food.source?.category
            ? `${card.group} — the group this food is in`
            : card.group}
        </Text>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          contentOffset={{x: opensAt * page, y: 0}}
          style={styles.pager}>
          {SERVING_CARDS.map(one => (
            <View key={one.id} style={{width: page}}>
              <View style={[styles.card, {backgroundColor: t.fill}]}>
                <MeasureGlyph
                  name={one.glyph}
                  ink={t.text}
                  accent={accent}
                  size={104}
                />
                {/* The group heads the sheet, not the card: swiping changes
                    the line above, so saying it twice would be noise. */}
                <View style={styles.cardText}>
                  <Text style={[styles.measure, {color: t.text}]}>{one.measure}</Text>
                  <View style={styles.amountRow}>
                    <Text style={[styles.amount, {color: t.text}]}>
                      {one.amount.value}
                    </Text>
                    <Text style={[styles.amountUnit, {color: t.textMuted}]}>
                      {one.amount.unit}
                    </Text>
                  </View>
                  {one.kcal ? (
                    <Text style={[styles.cardKcal, {color: t.textMuted}]}>{one.kcal}</Text>
                  ) : null}
                  {one.note ? (
                    <Text style={[styles.cardKcal, {color: t.textMuted}]}>{one.note}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {SERVING_CARDS.map((one, at) => (
            <View
              key={one.id}
              style={[
                styles.dot,
                at === showing && styles.dotOn,
                {backgroundColor: at === showing ? t.text : t.controlLine},
              ]}
            />
          ))}
        </View>

        {/* What this measure needs said, which is not the same on a spoon as
            on a hand — see domain/servings.ts. */}
        <View style={[styles.note, {backgroundColor: t.caveat.bg}]}>
          <Text style={[styles.noteText, {color: t.caveat.text}]}>
            {caveatFor(card)}
          </Text>
        </View>

        {/* Where the card points somewhere else — cooked pasta to the coin
            that measures the same food dry. On the board this stood in place
            of the caveat; it sits under it here so the card still says where
            its numbers come from. */}
        {card.tip ? (
          <View style={[styles.tip, {backgroundColor: t.fill}]}>
            <MeasureGlyph
              name={card.tip.glyph}
              ink={t.textMuted}
              accent={accent}
              size={34}
            />
            <Text style={[styles.tipText, {color: t.textMuted}]}>
              {card.tip.text}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {card.grams === undefined || onUse === undefined ? null : (
            <Button
              label={`Use ${card.grams} g`}
              onPress={() => onUse(card.grams as number)}
            />
          )}
        </View>
      </Sheet>
    </View>
  );
}
