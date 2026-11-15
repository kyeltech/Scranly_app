import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Sheet from '../ui/Sheet';
import {Close} from '../ui/icons';
import {useTheme} from '../theme';
import {comingSoon as styles} from '../styles';

/**
 * A thing that is not built, said to somebody who has already tapped.
 *
 * There are three ways to say this in the app and this is the middle one. A
 * row in a list gets a SOON chip and opens nothing, because browsing a list is
 * not a commitment. A mode inside a full screen says it in place — the plate,
 * in the viewfinder, where there is nowhere to put a sheet. This is for the
 * tab or button tapped mid-task: the person is waiting for something, and a
 * sentence is owed.
 *
 * Never a screen of its own. A destination with a header and a way back, for
 * something that cannot do anything, gives an empty promise the weight of a
 * place — and ADR-0002 caps the destinations on purpose.
 *
 * **No dates.** A date is a promise, and the only thing worse than a missing
 * feature is a date that passes.
 */
export default function ComingSoon({
  title,
  body,
  meanwhile,
  onClose,
}: {
  /** The thing, named. 'Coming soon' on its own tells nobody anything. */
  title: string;
  body: string;
  /** What to do until it exists. Left out where there is no honest answer. */
  meanwhile?: string;
  onClose?: () => void;
}) {
  const t = useTheme();

  return (
    <View style={styles.scrim}>
      {/* The screen behind is still there, and tapping it is how a sheet is
          dismissed everywhere else. Drawn first, so the sheet sits over it. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={`Close ${title}`}
      />
      <Sheet>
        <View style={styles.head}>
          <Text style={[styles.title, {color: t.text}]}>{title}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[styles.close, {backgroundColor: t.fill}]}>
            <Close colour={t.text} size={14} />
          </Pressable>
        </View>

        <Text style={[styles.body, {color: t.text}]}>{body}</Text>
        {meanwhile ? (
          <Text style={[styles.meanwhile, {color: t.textMuted}]}>{meanwhile}</Text>
        ) : null}
        <View style={styles.tail} />
      </Sheet>
    </View>
  );
}
