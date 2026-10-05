import React, {useState} from 'react';
import {Clipboard, Pressable, ScrollView, Text, View} from 'react-native';
import {useTheme} from '../../theme';
import type {LabelRead} from '../../readers';

import {readDebug as styles} from '../../styles';
/**
 * What the reader actually got, on the phone that got it.
 *
 * Two rounds of label fixes were made without anyone seeing ML Kit's output for
 * a real nutrition table, because none of the obvious channels carry it. React
 * Native stopped forwarding console.log to the Metro terminal. Xcode's console
 * needs the debugger attached and someone sitting at the Mac. A screenshot of
 * the rows is too small to read, and there is too much of it to select by hand.
 *
 * So it copies. One tap puts the whole dump on the clipboard, which is the only
 * step in this that has to work first time — a failed read happens in a kitchen,
 * and whoever is holding the phone should not have to fight to report it.
 *
 * Development builds only: `__DEV__` is false in a release bundle.
 */
export default function ReadDebug({
  read,
  error,
}: {
  read?: LabelRead;
  error?: string;
}) {
  const t = useTheme();
  const [copied, setCopied] = useState(false);

  const dump = error
    ? `capture threw:\n${error}`
    : read
    ? [
        `rows after grouping: ${read.rows.length}`,
        ...read.rows.map((row, i) => `${i + 1}| ${row}`),
        ``,
        `per100:    ${JSON.stringify(read.reading.per100)}`,
        `perServing:${JSON.stringify(read.reading.perServing)}`,
        `servingG:  ${String(read.reading.servingG)}`,
        `unread:    ${JSON.stringify(read.reading.unread)}`,
      ].join('\n')
    : 'no read recorded';

  const copy = () => {
    // Deprecated in core but still shipped, and this panel never reaches a
    // release build — not worth a dependency to avoid a warning.
    Clipboard.setString(dump);
    setCopied(true);
  };

  return (
    <View style={[styles.wrap, {backgroundColor: t.surface}]}>
      <View style={styles.head}>
        <Text style={[styles.title, {color: t.textMuted}]}>WHAT THE READER GOT</Text>
        <Pressable
          onPress={copy}
          accessibilityRole="button"
          accessibilityLabel="Copy the read"
          style={[styles.copy, {borderColor: t.controlLine}]}>
          <Text style={[styles.copyText, {color: t.text}]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll}>
        <Text selectable style={[styles.line, {color: t.text}]}>
          {dump}
        </Text>
      </ScrollView>
    </View>
  );
}
