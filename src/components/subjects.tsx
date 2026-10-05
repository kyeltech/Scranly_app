import React from 'react';
import {Text, View} from 'react-native';

import {subjects as styles} from '../styles';
/**
 * What the camera is pointed at — drawn, not photographed.
 *
 * A camera library is a native dependency and Kyel's call, so until that is
 * made these stand in for the sensor's picture. They are deliberately the only
 * pretend thing on these screens: the frame, the hints, the mode tabs and every
 * result sheet over them are real. Replacing them later is one layer swapped,
 * not a screen rewritten.
 */

/** Uneven bars, so it reads as a barcode rather than a striped block. */
const BARS = [3, 2, 6, 3, 2, 4, 5, 2, 3, 5, 7, 3, 2, 2, 6, 4, 3, 3, 5, 2, 2, 5, 6, 3, 4, 2, 3, 4, 7];

export function BarcodeCard() {
  return (
    <View style={styles.pack} testID="subject-barcode">
      <View style={styles.bars}>
        {BARS.map((width, i) => (
          <View key={i} style={[styles.bar, i % 2 ? styles.barLight : null, {width}]} />
        ))}
      </View>
      <Text style={styles.digits}>5 012345 678900</Text>
    </View>
  );
}

/** Four things on a plate, from above. */
export function Plate() {
  return (
    <View style={styles.plate} testID="subject-plate">
      <View style={[styles.food, styles.chicken]} />
      <View style={[styles.food, styles.rice]} />
      <View style={[styles.food, styles.broccoli]} />
      <View style={[styles.food, styles.oil]} />
    </View>
  );
}

const LABEL_ROWS: [string, string, string][] = [
  ['Energy', '1728kJ / 416kcal', '125kcal'],
  ['Fat', '34.9g', '10.4g'],
  ['of which saturates', '21.7g', '6.5g'],
  ['Carbohydrate', '0.1g', '0.1g'],
  ['of which sugars', '0.1g', '0.1g'],
  ['Protein', '25.4g', '7.7g'],
  ['Salt', '1.8g', '0.5g'],
];

/** A UK nutrition table, both columns, slightly askew as a real one would be. */
export function NutritionLabel() {
  return (
    <View style={styles.label} testID="subject-label">
      <Text style={styles.labelTitle}>NUTRITION</Text>
      <View style={styles.labelHead}>
        <Text style={styles.labelHeadText}>Typical values</Text>
        <Text style={styles.labelHeadText}>per 100g</Text>
        <Text style={styles.labelHeadText}>per 30g</Text>
      </View>
      {LABEL_ROWS.map(([name, per100, perServing]) => (
        <View key={name} style={styles.labelRow}>
          <Text style={styles.labelCell} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.labelFigure}>{per100}</Text>
          <Text style={styles.labelFigure}>{perServing}</Text>
        </View>
      ))}
    </View>
  );
}

/** A bathroom scale's LCD, seen from above. */
export function ScaleDisplay({reading}: {reading: string}) {
  return (
    <View style={styles.scale} testID="subject-scale">
      <View style={styles.lcd}>
        <Text style={styles.lcdText}>{reading}</Text>
      </View>
      <Text style={styles.scaleUnit}>KG</Text>
    </View>
  );
}
