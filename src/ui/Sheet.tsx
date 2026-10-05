import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme';

import {sheet as styles} from '../styles';
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
