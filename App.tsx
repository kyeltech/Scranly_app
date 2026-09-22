import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import AnimatedSplash from './src/components/AnimatedSplash';
import LoadingScreen from './src/components/LoadingScreen';
import {colors, scheme, type} from './src/theme';

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
    // Stands in for the first fetch of the diary and targets.
    firstLoad.current = setTimeout(() => setPhase('ready'), 1600);
  }, []);

  if (phase === 'splash') {
    return (
      <>
        <StatusBar barStyle={scheme.splash.statusBar} />
        <AnimatedSplash onFinish={handleSplashFinish} />
      </>
    );
  }

  if (phase === 'loading') {
    return (
      <>
        <StatusBar barStyle={scheme.loading.statusBar} />
        <LoadingScreen />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <Text style={styles.heading}>Today</Text>
        <Text style={styles.note}>
          Calorie budget, meals and macros go here next.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {flex: 1, backgroundColor: colors.paper},
  body: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24},
  heading: {...type.brandSmall, color: colors.ink},
  note: {...type.status, color: colors.muted, textAlign: 'center'},
});
