import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="sheet"
      style={[
        styles.sheet,
        tall ? styles.tall : null,
        {
          backgroundColor: t.bg,
          borderTopColor: t.line,
          // The sheet's own button sits above the home indicator, not in it.
          paddingBottom: Math.max(insets.bottom, 14),
        },
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
  },
  /**
   * A DEFINITE height, not maxHeight. A scrolling list inside a tall sheet
   * fills the space with flex: 1, and flex against an auto-height parent
   * resolves to nothing — which rendered the plate and label sheets with their
   * chrome and an invisible list. 74% is the boards' 614–616 of 844.
   */
  tall: {height: '74%'},
  grab: {width: 38, height: 4, borderRadius: 99, alignSelf: 'center', marginBottom: 16},
});
