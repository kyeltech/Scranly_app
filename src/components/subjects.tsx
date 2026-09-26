import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {fonts, type as type_} from '../theme';

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

const styles = StyleSheet.create({
  pack: {
    position: 'absolute',
    top: 208,
    left: 78,
    width: 236,
    height: 152,
    borderRadius: 10,
    backgroundColor: '#ECE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    transform: [{rotate: '-3deg'}],
  },
  bars: {flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 62},
  bar: {height: 62, backgroundColor: '#1B1B1B'},
  barLight: {backgroundColor: '#ECE9DF'},
  digits: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 3,
    color: '#4A4A46',
  },

  plate: {
    position: 'absolute',
    top: 250,
    alignSelf: 'center',
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: '#F3F1EA',
  },
  food: {position: 'absolute'},
  chicken: {
    top: 34,
    left: 30,
    width: 96,
    height: 74,
    borderRadius: 40,
    backgroundColor: '#B4763C',
  },
  rice: {top: 44, left: 120, width: 80, height: 66, borderRadius: 32, backgroundColor: '#EFEADD'},
  broccoli: {
    top: 120,
    left: 52,
    width: 64,
    height: 58,
    borderRadius: 26,
    backgroundColor: '#4E7A37',
  },
  oil: {top: 126, left: 122, width: 60, height: 52, borderRadius: 24, backgroundColor: '#C9A13F'},

  label: {
    position: 'absolute',
    top: 214,
    left: 70,
    width: 250,
    height: 290,
    borderRadius: 8,
    backgroundColor: '#F6F4EC',
    paddingHorizontal: 14,
    paddingTop: 14,
    transform: [{rotate: '1.5deg'}],
  },
  labelTitle: {fontFamily: fonts.bodyStrong, fontSize: 12, letterSpacing: 0.4, color: '#1B1B1B'},
  labelHead: {
    flexDirection: 'row',
    marginTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#CFCCC2',
  },
  labelHeadText: {flex: 1, fontFamily: fonts.body, fontSize: 9, color: '#5A5A55'},
  labelRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DFD5',
  },
  labelCell: {flex: 1, fontFamily: fonts.body, fontSize: 10, color: '#1B1B1B'},
  labelFigure: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#1B1B1B',
    textAlign: 'right',
  },

  scale: {
    position: 'absolute',
    top: 250,
    left: 62,
    width: 266,
    height: 200,
    borderRadius: 18,
    backgroundColor: '#20252A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lcd: {backgroundColor: '#0E1210', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 26},
  lcdText: {
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 2,
    color: '#9FE870',
  },
  scaleUnit: {
    ...type_.label,
    position: 'absolute',
    bottom: 14,
    fontSize: 10,
    letterSpacing: 2,
    color: '#5C6560',
  },
});
