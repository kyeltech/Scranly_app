import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing, useTheme} from '../theme';

/** The panel that rises over the camera. */
export default function Sheet({children}: {children: React.ReactNode}) {
  const t = useTheme();
  return (
    <View style={[styles.sheet, {backgroundColor: t.bg, borderTopColor: t.line}]}>
      <View style={[styles.grab, {backgroundColor: t.controlLine}]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginTop: 'auto',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 30,
  },
  grab: {width: 38, height: 4, borderRadius: 99, alignSelf: 'center', marginBottom: 16},
});
