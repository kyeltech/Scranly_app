import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import Sheet from '../../ui/Sheet';
import {Button, Note, Segmented} from '../../ui';
import {Check, ChevronDown, ChevronRight, Info, Plus, Warning} from '../../ui/icons';
import {withThousands} from '../../lib/format';
import {brand, type as type_, useTheme} from '../../theme';
import type {LabelRow, PlateItem, Product, Serving} from '../../fixtures/scan';

import {scanSheets as styles} from '../../styles';
/**
 * The panels that rise over the viewfinder. One per outcome of the three
 * modes, kept together because they share a shape and differ only in what
 * they are honest about.
 */

/** A number the reader guessed, marked so it reads as tappable and provisional. */
function Guess({children, onPress}: {children: string; onPress?: () => void}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.guessRow}>
      <Text style={[styles.guess, {color: t.status.under, borderBottomColor: t.guessLine}]}>
        {children}
      </Text>
      <ChevronDown colour={t.status.under} size={13} />
    </Pressable>
  );
}

/* ---------------------------------------------------------------- *
 * Barcode                                                          *
 * ---------------------------------------------------------------- */

/** Waiting on the database. The shape of the answer, before the answer. */
export function LookingUpSheet({
  barcode,
  onCancel,
}: {
  barcode: string;
  onCancel?: () => void;
}) {
  const t = useTheme();
  return (
    <Sheet>
      <Text style={[type_.label, {color: t.textMuted}]}>LOOKING UP</Text>
      <Text style={[styles.code, {color: t.text}]}>{barcode}</Text>
      <View style={[styles.progress, {backgroundColor: t.track}]}>
        <View style={[styles.progressFill, {backgroundColor: brand.lime}]} />
      </View>
      {[62, 40, 86].map((width, i) => (
        <View
          key={width}
          style={[
            styles.skeleton,
            i === 0 ? styles.skeletonTall : null,
            {width: `${width}%`, backgroundColor: t.track},
          ]}
        />
      ))}
      <View style={styles.gapLg} />
      <Button label="Cancel" variant="ghost" onPress={onCancel} />
    </Sheet>
  );
}

/** A barcode the database has never heard of. */
export function NoMatchSheet({
  barcode,
  onFromLabel,
  onRetry,
}: {
  barcode: string;
  onFromLabel?: () => void;
  onRetry?: () => void;
}) {
  const t = useTheme();
  return (
    <Sheet>
      <View style={styles.failHead}>
        <View style={[styles.failIcon, {backgroundColor: t.verdict.fast}]}>
          <Warning colour={t.status.over} size={18} />
        </View>
        <View style={styles.failText}>
          <Text style={[type_.cardTitle, {color: t.text}]}>
            Not in the database
          </Text>
          <Text style={[type_.caption, {color: t.textMuted}]}>{barcode}</Text>
        </View>
      </View>
      <Text style={[styles.body, {color: t.textMuted}]}>
        Open Food Facts has most UK branded food, but not all of it. Add this
        one from the label and it is yours from now on — and everyone else’s.
      </Text>
      <View style={styles.gapLg} />
      <Button label="Add it from the label" onPress={onFromLabel} />
      <View style={styles.gapSm} />
      <Button label="Scan something else" variant="ghost" onPress={onRetry} />
    </Sheet>
  );
}

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

/** A match, its numbers, and the two choices left: how much, and which meal. */
export function FoundSheet({
  product,
  serving,
  meal,
  onMeal,
  onServing,
  onAdd,
}: {
  product: Product;
  serving: Serving;
  meal: string;
  onMeal?: (next: string) => void;
  onServing?: () => void;
  onAdd?: () => void;
}) {
  const t = useTheme();
  const scale = serving.kcal / product.kcal;
  const macros: [string, number][] = [
    ['PROT', product.proteinG * scale],
    ['CARB', product.carbsG * scale],
    ['FAT', product.fatG * scale],
  ];

  return (
    <Sheet>
      <Text style={[type_.productTitle, {color: t.text}]}>{product.name}</Text>
      <Text style={[type_.caption, {color: t.textMuted}]}>
        {`${product.brand} · ${product.barcode}`}
      </Text>

      <View style={styles.figureRow}>
        <Text style={[styles.figure, {color: t.text}]}>
          {withThousands(serving.kcal)}
        </Text>
        <Text style={[styles.unit, {color: t.textMuted}]}>kcal</Text>
        <View style={styles.macroChips}>
          {macros.map(([label, value]) => (
            <View key={label} style={[styles.chip, {backgroundColor: t.fill}]}>
              <Text style={[styles.chipLabel, {color: t.textMuted}]}>{label}</Text>
              <Text style={[type_.figureSm, {color: t.text}]}>{value.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        onPress={onServing}
        accessibilityRole="button"
        accessibilityLabel="Change the serving"
        style={[styles.serving, {backgroundColor: t.fill}]}>
        <Text style={[type_.caption, {color: t.textMuted}]}>Serving</Text>
        <View style={styles.servingRight}>
          <Text style={[type_.bodyStrong, {color: t.text}]}>
            {`${serving.grams} g · ${serving.label}`}
          </Text>
          <ChevronDown colour={t.textMuted} size={15} />
        </View>
      </Pressable>

      <View style={styles.meals}>
        <Segmented options={MEALS} value={meal} onChange={onMeal} />
      </View>

      <View style={styles.gapLg} />
      <Button label={`Add to ${meal.toLowerCase()}`} onPress={onAdd} />
    </Sheet>
  );
}

/** How much of it. The pack's own servings first, scales only if you want them. */
export function ServingSheet({
  product,
  servings,
  chosen,
  onChoose,
  onWeigh,
  onUse,
}: {
  product: Product;
  servings: Serving[];
  chosen: Serving;
  onChoose?: (next: Serving) => void;
  onWeigh?: () => void;
  onUse?: () => void;
}) {
  const t = useTheme();
  return (
    <Sheet>
      <Text style={[type_.sheetTitle, {color: t.text}]}>How much?</Text>
      <Text style={[type_.caption, {color: t.textMuted}]}>
        {`${product.name} · ${product.brand}`}
      </Text>

      <Text style={[type_.label, styles.legend, {color: t.textMuted}]}>FROM THE PACK</Text>
      {servings.map(serving => {
        const on = serving.id === chosen.id;
        return (
          <Pressable
            key={serving.id}
            onPress={() => onChoose?.(serving)}
            accessibilityRole="radio"
            accessibilityState={{selected: on}}
            accessibilityLabel={serving.label}
            style={[styles.servingRow, {borderBottomColor: t.line}]}>
            <View
              style={[
                styles.radio,
                on ? {backgroundColor: brand.lime} : styles.radioOff,
                on ? null : {borderColor: t.controlLine},
              ]}>
              {on ? <Check colour={brand.onLime} size={13} /> : null}
            </View>
            <View style={styles.servingText}>
              <Text style={[type_.bodyStrong, {color: t.text}]}>{serving.label}</Text>
              <Text style={[type_.caption, {color: t.textMuted}]}>{`${serving.grams} g`}</Text>
            </View>
            <Text style={[type_.figureMd, {color: t.text}]}>
              {withThousands(serving.kcal)}
            </Text>
          </Pressable>
        );
      })}

      <Pressable onPress={onWeigh} accessibilityRole="button" style={styles.weigh}>
        <View style={[styles.radio, {backgroundColor: t.fill}]}>
          <Plus colour={t.text} size={13} />
        </View>
        <Text style={[type_.bodyStrong, styles.weighLabel, {color: t.text}]}>
          Weigh it — enter grams
        </Text>
        <ChevronRight colour={t.textMuted} size={15} />
      </Pressable>

      <View style={styles.gapLg} />
      <Button
        label={`Use ${chosen.label}`}
        sub={`${withThousands(chosen.kcal)} kcal`}
        onPress={onUse}
      />
    </Sheet>
  );
}

/* ---------------------------------------------------------------- *
 * Plate                                                            *
 * ---------------------------------------------------------------- */

/** Everything the plate reader thinks it saw, every line correctable. */
export function PlateResultSheet({
  items,
  meal,
  onCorrect,
  onAddMissing,
  onAdd,
}: {
  items: PlateItem[];
  meal: string;
  onCorrect?: (item: PlateItem) => void;
  onAddMissing?: () => void;
  onAdd?: () => void;
}) {
  const t = useTheme();
  const total = items.reduce((sum, item) => sum + item.kcal, 0);

  return (
    <Sheet tall>
      <View style={styles.plateHead}>
        <View style={styles.plateHeadText}>
          <Text style={[type_.sheetTitle, {color: t.text}]}>
            {`${COUNT[items.length] ?? items.length} things on the plate`}
          </Text>
          <Text style={[type_.caption, {color: t.textMuted}]}>
            Tap a portion to correct it
          </Text>
        </View>
        <View style={styles.plateTotal}>
          <Text style={[styles.plateFigure, {color: t.text}]}>{withThousands(total)}</Text>
          <Text style={[styles.plateUnit, {color: t.textMuted}]}>kcal</Text>
        </View>
      </View>

      <View style={styles.caveat}>
        <Note tone="caveat" icon={<Info colour={t.status.close} size={15} />}>
          A photo cannot see weight. These portions are a starting guess —
          correct one and Scranly remembers it for next time.
        </Note>
      </View>

      <ScrollView style={styles.plateList}>
        {items.map(item => (
          <View key={item.id} style={[styles.plateRow, {borderBottomColor: t.line}]}>
            <View style={styles.tick}>
              <Check colour={brand.onLime} size={16} />
            </View>
            <View style={styles.plateRowText}>
              <View style={styles.plateName}>
                <Text style={[type_.bodyStrong, {color: t.text}]}>{item.name}</Text>
                {item.leastSure ? (
                  <Text style={[styles.flag, {color: t.status.close, backgroundColor: t.caveat.bg}]}>
                    NOT SURE
                  </Text>
                ) : null}
              </View>
              <Guess onPress={() => onCorrect?.(item)}>{item.portion}</Guess>
            </View>
            <Text style={[type_.figureMd, {color: t.text}]}>{item.kcal}</Text>
          </View>
        ))}

        <Pressable onPress={onAddMissing} accessibilityRole="button" style={styles.missing}>
          <Plus colour={t.status.under} size={15} />
          <Text style={[styles.missingLabel, {color: t.status.under}]}>
            Something it missed
          </Text>
        </Pressable>
      </ScrollView>

      <Button
        label={`Add ${items.length} items to ${meal.toLowerCase()}`}
        sub={`${withThousands(total)} kcal`}
        onPress={onAdd}
      />
    </Sheet>
  );
}

const COUNT: Record<number, string> = {1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five'};

/* ---------------------------------------------------------------- *
 * Label                                                            *
 * ---------------------------------------------------------------- */

export type LabelColumn = 'per100' | 'perServing';

/** What was read off the label, and which of a UK label's two columns to keep. */
export function LabelResultSheet({
  rows,
  servingG,
  column,
  unread,
  onColumn,
  onFix,
  onSave,
}: {
  rows: LabelRow[];
  servingG: number;
  /**
   * Lines the reader could not place. Shown rather than swallowed: the photo
   * never leaves the phone, so the text is the only way to see why a read went
   * wrong — and the only thing worth sending to whoever fixes the parser.
   */
  unread?: string[];
  column: LabelColumn;
  onColumn?: (next: LabelColumn) => void;
  onFix?: (row: LabelRow) => void;
  onSave?: () => void;
}) {
  const t = useTheme();
  const columns: [LabelColumn, string][] = [
    ['per100', 'Per 100 g'],
    ['perServing', `Per serving (${servingG} g)`],
  ];

  return (
    <Sheet tall>
      <View style={styles.readHead}>
        <View style={styles.readDot} />
        <Text style={[type_.label, {color: t.textMuted}]}>READ FROM THE LABEL</Text>
      </View>
      <Text style={[type_.sheetTitle, styles.readTitle, {color: t.text}]}>
        Check these before saving
      </Text>

      <View style={styles.columns}>
        {columns.map(([key, label]) => {
          const on = key === column;
          return (
            <Pressable
              key={key}
              onPress={() => onColumn?.(key)}
              accessibilityRole="button"
              accessibilityState={{selected: on}}
              style={[styles.column, {backgroundColor: on ? t.chipOnBg : t.fill}]}>
              <Text style={[styles.columnLabel, {color: on ? t.chipOnText : t.text}]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.columnNote, {color: t.textMuted}]}>
        UK labels carry both columns. Scranly saves the one you pick — tap any
        number to fix a misread.
      </Text>

      <ScrollView style={styles.labelList}>
        {unread && unread.length > 0 ? (
          <View style={styles.unread}>
            <Note tone="caveat" icon={<Info colour={t.status.close} size={15} />}>
              {`Could not place: ${unread.join(' · ')}`}
            </Note>
          </View>
        ) : null}
        {rows.map(row => (
          <View key={row.id} style={[styles.labelRow, {borderBottomColor: t.line}]}>
            <Text
              style={[
                row.under ? styles.labelUnder : styles.labelName,
                {color: row.under ? t.textMuted : t.text},
              ]}>
              {row.name}
            </Text>
            <Pressable
              onPress={() => onFix?.(row)}
              accessibilityRole="button"
              accessibilityLabel={`Fix ${row.name}`}>
              <Text
                style={[styles.labelFigure, {color: t.text, borderBottomColor: t.guessLine}]}>
                {row[column]}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Button label="Save this food" onPress={onSave} />
    </Sheet>
  );
}
