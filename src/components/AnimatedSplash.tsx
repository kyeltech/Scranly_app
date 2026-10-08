import React, {useEffect, useRef} from 'react';
import {AccessibilityInfo, Animated, Easing, View} from 'react-native';
import {scheme as activeScheme, schemes, timing} from '../theme';
import type {SchemeName} from '../theme';

import {animatedSplash as styles} from '../styles';
type Props = {
  /** Called once the animation has finished, so the app can take over. */
  onFinish: () => void;
  /** Override the scheme set in theme.ts (handy for side-by-side previews). */
  schemeName?: SchemeName;
};

/**
 * The animated splash. It takes over from the static boot splash that iOS and
 * Android show first, so the lime background is identical and the handover is
 * invisible.
 */
export default function AnimatedSplash({onFinish, schemeName}: Props) {
  const palette = (schemeName ? schemes[schemeName] : activeScheme).splash;
  const markScale = useRef(new Animated.Value(0.72)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const brandShift = useRef(new Animated.Value(12)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const tagShift = useRef(new Animated.Value(12)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let handoff: ReturnType<typeof setTimeout> | undefined;
    let running: Animated.CompositeAnimation | undefined;

    const run = async () => {
      let reduceMotion = false;
      try {
        reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      } catch {
        reduceMotion = false;
      }
      if (cancelled) {
        return;
      }

      if (reduceMotion) {
        markScale.setValue(1);
        markOpacity.setValue(1);
        brandShift.setValue(0);
        brandOpacity.setValue(1);
        tagShift.setValue(0);
        tagOpacity.setValue(1);
        onFinish();
        return;
      }

      running = Animated.parallel([
        Animated.parallel([
          Animated.timing(markOpacity, {
            toValue: 1,
            duration: timing.markIn,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(markScale, {
            toValue: 1,
            damping: 9,
            stiffness: 140,
            mass: 0.8,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(timing.brandDelay),
          Animated.parallel([
            Animated.timing(brandOpacity, {
              toValue: 1,
              duration: timing.brandIn,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(brandShift, {
              toValue: 0,
              duration: timing.brandIn,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(timing.tagDelay),
          Animated.parallel([
            Animated.timing(tagOpacity, {
              toValue: 1,
              duration: timing.brandIn,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(tagShift, {
              toValue: 0,
              duration: timing.brandIn,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);

      /**
       * Nothing between here and the cancelled check above can unmount this
       * component: the only await is the motion setting, and that is already
       * guarded. A second `if (cancelled) running.stop()` used to sit after
       * this call and could never run — the cleanup below is what stops a
       * started animation.
       */
      running.start(({finished}) => {
        if (finished && !cancelled) {
          handoff = setTimeout(onFinish, timing.holdAfter);
        }
      });
    };

    run();

    return () => {
      cancelled = true;
      running?.stop();
      if (handoff) {
        clearTimeout(handoff);
      }
    };
  }, [brandOpacity, brandShift, markOpacity, markScale, onFinish, tagOpacity, tagShift]);

  return (
    <View style={[styles.screen, {backgroundColor: palette.background}]}>
      <Animated.Image
        source={palette.mark}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Scranly"
        style={[
          styles.mark,
          {opacity: markOpacity, transform: [{scale: markScale}]},
        ]}
      />
      <Animated.Text
        style={[
          styles.brand,
          {color: palette.foreground},
          {opacity: brandOpacity, transform: [{translateY: brandShift}]},
        ]}>
        Scranly
      </Animated.Text>
      <Animated.Text
        style={[
          styles.tag,
          {color: palette.tag},
          {opacity: tagOpacity, transform: [{translateY: tagShift}]},
        ]}>
        EAT. LOG. DONE.
      </Animated.Text>
    </View>
  );
}

/** The boot splash background, so the static and animated splashes match. */
export const splashBackground = activeScheme.splash.background;
