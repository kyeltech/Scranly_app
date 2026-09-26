import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing, useTheme} from '../theme';

/**
 * The panel that rises over the camera. It hugs its content by default; `tall`
 * is for the two results that carry a scrolling list — the plate and the label
 * — and lets the sheet take most of the screen without ever covering the header.
 */
export default function Sheet({
  children,
  tall = false,
}: {
  children: React.ReactNode;
  tall?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.sheet,
        tall ? styles.tall : null,
        {backgroundColor: t.bg, borderTopColor: t.line},
      ]}>
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
    paddingBottom: 14,
  },
  tall: {flexShrink: 1, maxHeight: '78%'},
  grab: {width: 38, height: 4, borderRadius: 99, alignSelf: 'center', marginBottom: 16},
});
