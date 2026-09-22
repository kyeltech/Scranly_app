import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import {scheme as activeScheme, schemes, timing, type} from '../theme';
import type {SchemeName} from '../theme';

type Props = {
  /** Line shown under the mark. Keep it short and plain. */
  message?: string;
  /** Override the scheme set in theme.ts (handy for side-by-side previews). */
  schemeName?: SchemeName;
};

/** The three fork tines at rest, left to right, inside a 116pt square. */
const TINES = [
  {left: 38, height: 34},
  {left: 53, height: 24},
  {left: 68, height: 39},
];

/**
 * Looping loading state: the fork's tines rise and fall like a bar chart
 * filling in. Reuse it anywhere the app is waiting on the server.
 */
export default function LoadingScreen({
  message = 'Getting your day ready',
  schemeName,
}: Props) {
  const palette = (schemeName ? schemes[schemeName] : activeScheme).loading;
  const tines = useRef(TINES.map(() => new Animated.Value(0.5))).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.timing(bar, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ),
      ...tines.map((value, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * timing.tineStagger),
            Animated.timing(value, {
              toValue: 1,
              duration: timing.tineLoop / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0.5,
              duration: timing.tineLoop / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    ];

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [bar, tines]);

  return (
    <View
      style={[styles.screen, {backgroundColor: palette.background}]}
      accessibilityLabel={message}>
      <View style={styles.art}>
        {tines.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.tine,
              {
                backgroundColor: palette.foreground,
                left: TINES[index].left,
                height: TINES[index].height,
                top: 58 - TINES[index].height,
                transform: [{scaleY: value}],
              },
            ]}
          />
        ))}
        <Animated.Image
          source={palette.forkBase}
          resizeMode="contain"
          style={styles.forkBase}
        />
      </View>

      <Text style={[styles.brand, {color: palette.foreground}]}>Scranly</Text>

      <View style={[styles.barTrack, {backgroundColor: palette.track}]}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: palette.foreground,
              transform: [
                {
                  translateX: bar.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 160],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      <Text style={[styles.status, {color: palette.status}]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  art: {width: 116, height: 116},
  // Tines sit on the crossbar and grow upward from it.
  tine: {
    position: 'absolute',
    width: 10,
    borderRadius: 5,
    transformOrigin: 'bottom',
  },
  forkBase: {position: 'absolute', top: 0, left: 0, width: 116, height: 116},
  brand: {...type.brandSmall},
  barTrack: {width: 128, height: 5, borderRadius: 3, overflow: 'hidden'},
  barFill: {width: 48, height: 5, borderRadius: 3},
  status: {...type.status},
});
