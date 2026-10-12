import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import AnimatedSplash from './src/components/AnimatedSplash';
import LoadingScreen from './src/components/LoadingScreen';
import Root from './src/navigation/Root';
import {mmkvDiary, mmkvFoods, mmkvStore, storeFailure} from './src/store/mmkv';
import {useTheme} from './src/theme';

type Phase = 'splash' | 'loading' | 'ready';

/**
 * Setup, on disk. MMKV answers synchronously, so `Root` knows which screen to
 * open in its first render rather than drawing a loading frame while it finds
 * out (ADR-0007).
 *
 * Built once, here, rather than inside the component: one storage instance per
 * process, and `mmkvStore` swallows a missing pod so this cannot stop the app
 * from starting.
 */
const setupStore = mmkvStore();

/**
 * The diary, on disk. Same storage and the same tolerance for a missing pod as
 * the setup store — built once here so it outlives any remount of `Root`.
 */
const diaryStore = mmkvDiary();

/** The foods made in Create a food, so they are there to log again tomorrow. */
const foodStore = mmkvFoods();

export default function App() {
  const [phase, setPhase] = useState<Phase>('splash');
  const firstLoad = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Hide the static boot splash as soon as React has something on screen.
    BootSplash.hide({fade: true}).catch(() => {});
    return () => {
      if (firstLoad.current) {
        clearTimeout(firstLoad.current);
      }
    };
  }, []);

  const handleSplashFinish = useCallback(() => {
    setPhase('loading');
    // Stands in for the first read of the diary and targets.
    firstLoad.current = setTimeout(() => setPhase('ready'), 1600);
  }, []);

  return (
    <SafeAreaProvider>
      {phase === 'splash' ? (
        <AnimatedSplash onFinish={handleSplashFinish} />
      ) : phase === 'loading' ? (
        <LoadingScreen />
      ) : (
        <Shell />
      )}
      {/* Outside the phase switch: a build that cannot remember setup should
          say so from the first frame, not once the splash has finished. */}
      <StoreTrouble />
    </SafeAreaProvider>
  );
}

function Shell() {
  const t = useTheme();
  return (
    <View style={[styles.fill, {backgroundColor: t.bg}]}>
      <StatusBar barStyle={t.statusBar} />
      {/* The diary still runs on the fixtures in src/fixtures. Setup does not:
          the store decides whether the questions get asked (ADR-0007). */}
      <Root store={setupStore} diary={diaryStore} foods={foodStore} />
    </View>
  );
}

/**
 * A dev-build readout for the one failure that is otherwise invisible.
 *
 * MMKV not opening means setup is asked on every launch, and the app has no
 * other way of saying so — which is exactly how it got shipped to a phone once
 * and read as the gate not working. Loud in dev, absent in release, because a
 * user cannot act on it and the app still works without its memory.
 *
 * The commonest cause is a JS reload onto a binary built before `pod install`:
 * the pod is in the lockfile and not yet in the app. A full rebuild fixes it.
 */
function StoreTrouble() {
  const reason = storeFailure();
  if (!__DEV__ || reason === undefined) {
    return null;
  }
  return (
    <View style={styles.trouble} pointerEvents="none">
      <Text style={styles.troubleText}>
        {'DEV: setup will not be remembered — MMKV did not open.\n'}
        {reason}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  trouble: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#B23F36',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 28,
  },
  troubleText: {color: '#FFFFFF', fontSize: 11, lineHeight: 15},
});
