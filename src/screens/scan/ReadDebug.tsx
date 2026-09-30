import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../theme';
import type {LabelRead} from '../../readers';

/**
 * What the reader actually got, on the phone that got it.
 *
 * Two rounds of label fixes were made without anyone seeing ML Kit's output for
 * a real nutrition table, because the obvious channels do not carry it: React
 * Native stopped forwarding console.log to the Metro terminal, and Xcode's
 * console needs the debugger attached and someone at the Mac. A failed read is
 * on the phone, in the kitchen, so the diagnosis belongs there too.
 *
 * Development builds only — `__DEV__` is false in a release bundle and none of
 * this ships.
 */
export default function ReadDebug({
  read,
  error,
}: {
  read?: LabelRead;
  error?: string;
}) {
  const t = useTheme();

  const lines: string[] = error
    ? [`capture threw:`, error]
    : read
    ? [
        `${read.rows.length} row(s) after grouping`,
        ...read.rows.map((row, i) => `${i + 1}. ${row}`),
        '',
        `read: ${JSON.stringify(read.reading.per100)}`,
        `serving: ${String(read.reading.servingG)}`,
        `unread: ${JSON.stringify(read.reading.unread)}`,
      ]
    : ['no read recorded'];

  return (
    <View style={[styles.wrap, {backgroundColor: t.surface}]}>
      <Text style={[styles.title, {color: t.textMuted}]}>WHAT THE READER GOT</Text>
      <ScrollView style={styles.scroll}>
        {lines.map((line, i) => (
          <Text key={i} selectable style={[styles.line, {color: t.text}]}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 16, maxHeight: 320, gap: 8},
  title: {fontSize: 11, letterSpacing: 2, fontWeight: '600'},
  scroll: {maxHeight: 260},
  line: {fontSize: 12, fontFamily: 'Menlo', lineHeight: 17},
});
