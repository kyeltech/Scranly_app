import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {Close, Torch} from '../ui/icons';
import {brand, camera, radius, spacing, type as type_} from '../theme';

/**
 * The chrome every camera screen shares: the dark ground, the header, the
 * corner frame, the hint, the mode tabs and the shutter. It is dark in both
 * themes because it is a viewfinder, not a page.
 *
 * The picture inside it is a stand-in — see `subjects.tsx`. A camera library is
 * a native dependency and Kyel's call, so nothing here reads a real sensor yet;
 * when one is chosen only the `children` layer changes.
 */

/** What the frame's corners are saying. */
export type FrameState = 'aiming' | 'read' | 'failed';

const FRAME_COLOUR: Record<FrameState, string> = {
  aiming: 'rgba(255,255,255,0.75)',
  read: brand.lime,
  failed: '#E4726A',
};

export type Frame = {width: number; height: number; top: number};

export type Mode = 'barcode' | 'plate' | 'label';

export const MODE_LABEL: Record<Mode, string> = {
  barcode: 'Barcode',
  plate: 'Plate',
  label: 'Label',
};

export default function Viewfinder({
  title,
  onClose,
  onTorch,
  frame,
  frameState = 'aiming',
  scrim = 0,
  hint,
  hintDot = false,
  mode,
  onMode,
  footnote,
  onShutter,
  children,
  sheet,
  working,
}: {
  title: string;
  onClose?: () => void;
  onTorch?: () => void;
  /** Omitted once a sheet covers the picture and the frame would be pointless. */
  frame?: Frame;
  frameState?: FrameState;
  /** How far the picture is dimmed behind a sheet or a spinner. 0 to 1. */
  scrim?: number;
  hint?: string;
  hintDot?: boolean;
  mode?: Mode;
  onMode?: (next: Mode) => void;
  footnote?: string;
  onShutter?: () => void;
  /** The stand-in picture. */
  children?: React.ReactNode;
  /** The panel that rises over the picture, when there is one. */
  sheet?: React.ReactNode;
  /**
   * The reader is thinking. It takes over the screen rather than sitting in a
   * corner, because the one thing the person must not do meanwhile is move the
   * phone — and it says how long and how sure, since a guess presented as an
   * answer is the failure mode of every plate scanner.
   */
  working?: {title: string; body: string; onCancel?: () => void};
}) {
  const insets = useSafeAreaInsets();
  const bottomChrome = hint || mode || footnote || onShutter;

  return (
    <View style={styles.root}>
      <Svg style={StyleSheet.absoluteFill} testID="viewfinder-ground">
        <Defs>
          <LinearGradient id="ground" x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor={camera.bgTop} />
            <Stop offset="0.55" stopColor={camera.bgMid} />
            <Stop offset="1" stopColor={camera.bgBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ground)" />
      </Svg>

      {children}

      {scrim > 0 ? (
        <View
          style={[StyleSheet.absoluteFill, {backgroundColor: `rgba(8,10,7,${scrim})`}]}
        />
      ) : null}

      {frame ? (
        <View
          style={[
            styles.frame,
            {
              top: frame.top,
              width: frame.width,
              height: frame.height,
              marginLeft: -frame.width / 2,
            },
          ]}
          testID={`frame-${frameState}`}>
          {(['tl', 'tr', 'bl', 'br'] as const).map(corner => (
            <View
              key={corner}
              style={[
                styles.corner,
                styles[corner],
                {borderColor: FRAME_COLOUR[frameState]},
              ]}
            />
          ))}
        </View>
      ) : null}

      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.round}>
          <Close colour={camera.text} size={16} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {onTorch ? (
          <Pressable
            onPress={onTorch}
            accessibilityRole="button"
            accessibilityLabel="Torch"
            style={styles.round}>
            <Torch colour={camera.text} size={17} />
          </Pressable>
        ) : (
          <View style={styles.round} />
        )}
      </View>

      {bottomChrome ? (
        <View
          style={[
            styles.bottom,
            {paddingBottom: Math.max(insets.bottom, 20) + 14},
          ]}
          pointerEvents="box-none">
          {hint ? (
            <View style={styles.hint}>
              {hintDot ? <View style={styles.dot} /> : null}
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          ) : null}

          {mode && onMode ? (
            <View style={styles.tabs}>
              {(Object.keys(MODE_LABEL) as Mode[]).map(name => {
                const on = name === mode;
                return (
                  <Pressable
                    key={name}
                    onPress={() => onMode(name)}
                    accessibilityRole="button"
                    accessibilityState={{selected: on}}
                    style={[styles.tab, on ? styles.tabOn : null]}>
                    <Text style={[styles.tabLabel, on ? styles.tabLabelOn : null]}>
                      {MODE_LABEL[name]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {onShutter ? (
            <Pressable
              onPress={onShutter}
              accessibilityRole="button"
              accessibilityLabel="Take the photo"
              style={styles.shutter}>
              <View style={styles.shutterInner} />
            </Pressable>
          ) : null}

          {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
        </View>
      ) : null}

      {working ? (
        <View style={styles.working} pointerEvents="box-none">
          <View style={styles.dots}>
            {[1, 0.55, 0.25].map(opacity => (
              <View key={opacity} style={[styles.workingDot, {opacity}]} />
            ))}
          </View>
          <Text style={styles.workingTitle}>{working.title}</Text>
          <Text style={styles.workingBody}>{working.body}</Text>
        </View>
      ) : null}

      {working?.onCancel ? (
        <Pressable
          onPress={working.onCancel}
          accessibilityRole="button"
          style={[styles.cancel, {bottom: Math.max(insets.bottom, 20) + 16}]}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      ) : null}

      {sheet}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: brand.black900},
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  round: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: camera.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {...type_.bodyStrong, color: camera.text},
  frame: {position: 'absolute', left: '50%'},
  corner: {position: 'absolute', width: 34, height: 34},
  tl: {top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12},
  tr: {top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12},
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: 24,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(10,12,9,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  dot: {width: 7, height: 7, borderRadius: radius.pill, backgroundColor: brand.lime},
  hintText: {...type_.caption, fontSize: 12.5, fontWeight: '600', color: '#E7EEE3'},
  tabs: {
    flexDirection: 'row',
    gap: 2,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(10,12,9,0.55)',
  },
  tab: {paddingHorizontal: 18, paddingVertical: 8, borderRadius: radius.pill},
  tabOn: {backgroundColor: 'rgba(255,255,255,0.22)'},
  tabLabel: {...type_.caption, fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,0.55)'},
  tabLabelOn: {fontWeight: '700', color: camera.text},
  shutter: {
    width: 70,
    height: 70,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {width: 56, height: 56, borderRadius: radius.pill, backgroundColor: camera.text},
  footnote: {...type_.caption, fontSize: 12.5, color: 'rgba(255,255,255,0.5)'},
  working: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.lg,
  },
  dots: {flexDirection: 'row', gap: 7},
  workingDot: {width: 9, height: 9, borderRadius: radius.pill, backgroundColor: brand.lime},
  workingTitle: {
    ...type_.title,
    fontSize: 19,
    letterSpacing: -0.3,
    color: camera.text,
    textAlign: 'center',
  },
  workingBody: {
    ...type_.caption,
    fontSize: 13.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    maxWidth: 250,
  },
  cancel: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {...type_.bodyStrong, color: camera.text},
});
