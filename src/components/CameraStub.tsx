import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Close} from '../ui/icons';
import {brand, radius, spacing, type as type_} from '../theme';

/**
 * Stands in for the viewfinder until a camera library is chosen — that is a
 * native dependency and Kyel's call. Everything layered over it (the frame, the
 * hint, the result sheet) is real, so only this rectangle changes later.
 */
export default function CameraStub({
  title,
  hint,
  children,
  onClose,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <View style={styles.camera}>
      <View style={styles.top}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.round}>
          <Close colour="#FFFFFF" size={16} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.round} />
      </View>

      <View style={styles.frame}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <Text style={styles.placeholder}>Camera preview</Text>
      </View>

      {hint ? (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {flex: 1, backgroundColor: '#14170F'},
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  round: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {...type_.bodyStrong, color: '#FFFFFF'},
  frame: {
    marginTop: 90,
    marginHorizontal: 46,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {position: 'absolute', width: 34, height: 34, borderColor: brand.lime},
  tl: {top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12},
  tr: {top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12},
  bl: {bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12},
  br: {bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12},
  placeholder: {...type_.caption, color: 'rgba(255,255,255,0.35)'},
  hintWrap: {alignItems: 'center', marginTop: 28},
  hint: {
    ...type_.caption,
    color: '#E7EEE3',
    fontWeight: '600',
    backgroundColor: 'rgba(10,12,9,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
