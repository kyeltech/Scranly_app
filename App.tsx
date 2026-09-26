import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import AnimatedSplash from './src/components/AnimatedSplash';
import LoadingScreen from './src/components/LoadingScreen';
import Root from './src/navigation/Root';
import {useTheme} from './src/theme';

type Phase = 'splash' | 'loading' | 'ready';

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
    </SafeAreaProvider>
  );
}

function Shell() {
  const t = useTheme();
  return (
    <View style={[styles.fill, {backgroundColor: t.bg}]}>
      <StatusBar barStyle={t.statusBar} />
      {/* Everything runs on the fixtures in src/fixtures until there is a store.
          Start on 'Today' instead of 'Welcome' to skip onboarding while testing. */}
      <Root initialRoute="Welcome" />
    </View>
  );
}

const styles = StyleSheet.create({fill: {flex: 1}});
