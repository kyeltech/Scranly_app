import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Screen, TextAction} from '../ui';
import {Mark} from '../ui/icons';
import {spacing, type as type_, useTheme} from '../theme';

export default function Welcome({onStart}: {onStart?: () => void}) {
  const t = useTheme();
  return (
    <Screen>
      <View style={styles.body}>
        <Mark colour={t.text} />
        <Text style={[type_.brand, styles.word, {color: t.text}]}>Scranly</Text>
        <Text style={[type_.tag, styles.tag, {color: t.textMuted}]}>
          EAT. LOG. DONE.
        </Text>
        <Text style={[styles.pitch, {color: t.text}]}>
          A food diary that will make Day very rich, and Ezekiel very happy. Plenty adverts, Plenty
          subscription, we want youer money, we want everything.
        </Text>
        <Text style={[styles.small, {color: t.textMuted}]}>
          Setting up takes about a minute. You can change any of it later.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Set up my targets" onPress={onStart} />
        <TextAction label="I have an invite code" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  body: {flex: 1, justifyContent: 'center', paddingHorizontal: 26},
  word: {marginTop: 22},
  tag: {marginTop: 6},
  pitch: {...type_.body, fontSize: 16, lineHeight: 24, marginTop: 26},
  small: {...type_.caption, marginTop: 14},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 20, gap: spacing.lg},
});
