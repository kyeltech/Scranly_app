import React from 'react';
import {Text, View} from 'react-native';
import {Button, Screen} from '../ui';
import {Mark} from '../ui/icons';
import {type as type_, useTheme} from '../theme';

import {welcome as styles} from '../styles';
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
          A food diary that costs nothing and sells nothing. No adverts, no
          subscription, no premium tier waiting behind a screen.
        </Text>
        <Text style={[styles.small, {color: t.textMuted}]}>
          Setting up takes about a minute. You can change any of it later.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Set up my targets" onPress={onStart} />
        <Text style={[styles.invite, {color: t.status.under}]}>
          I have an invite code
        </Text>
      </View>
    </Screen>
  );
}
