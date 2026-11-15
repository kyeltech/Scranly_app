import React from 'react';
import {Text, View} from 'react-native';
import Sheet from '../../ui/Sheet';
import {Button} from '../../ui';
import {Warning} from '../../ui/icons';
import {actsFor, wordsFor} from '../../domain/failure';
import type {Failure, Way, Where} from '../../domain/failure';
import {type as type_, useTheme} from '../../theme';

import {failureSheet as styles} from '../../styles';
/**
 * One sheet for every failure the app has.
 *
 * It is given a `Failure` and owns every word of it: the caller passes what
 * happened and which ways out it can honour, never a title or a button label.
 * That is what keeps the copy consistent across the scanner, the search and
 * whatever asks next — and makes a change to the wording one edit rather than
 * eight (ADR-0006).
 *
 * The anatomy is fixed: warning tile, title, body, one lime action, at least
 * one ghost. A sheet whose only button is "Try again" is a trap, so a caller
 * that offers nothing but a retry gets no sheet worth showing — see `actsFor`.
 */
export default function FailureSheet({
  failure,
  on,
  where = 'lookup',
}: {
  failure: Failure;
  /** The handlers this caller has. A way with no handler is not drawn. */
  on: Partial<Record<Way, () => void>>;
  /**
   * Which of the two the caller is: the same code means the same thing in both,
   * but the sentence about what still works cannot name a barcode to somebody
   * who has just written a message.
   */
  where?: Where;
}) {
  const t = useTheme();
  const words = wordsFor(failure, where);
  const ways = (Object.keys(on) as Way[]).filter(way => on[way]);
  const {primary, ghosts} = actsFor(failure, ways, where);

  return (
    <Sheet>
      <View style={styles.head}>
        <View testID="failure-tile" style={[styles.icon, {backgroundColor: t.verdict.fast}]}>
          <Warning colour={t.status.over} size={18} />
        </View>
        <View style={styles.text}>
          <Text style={[type_.cardTitle, {color: t.text}]}>{words.title}</Text>
          {failure.subject ? (
            <Text style={[type_.caption, {color: t.textMuted}]}>{failure.subject}</Text>
          ) : null}
        </View>
      </View>

      <Text style={[styles.body, {color: t.textMuted}]}>{words.body}</Text>

      {primary ? (
        <>
          <View style={styles.gap} />
          <Button label={primary.label} onPress={on[primary.way]} />
        </>
      ) : null}

      {ghosts.map(ghost => (
        <React.Fragment key={ghost.way}>
          <View style={styles.gapSm} />
          <Button label={ghost.label} variant="ghost" onPress={on[ghost.way]} />
        </React.Fragment>
      ))}

      {/* Useful to quote, impossible to misread as advice. The thrown error
          itself stays in `detail`, for the log and for __DEV__. */}
      {failure.reference ? (
        <Text style={[styles.reference, {color: t.textMuted}]}>
          {`Reference ${failure.reference}`}
        </Text>
      ) : null}
    </Sheet>
  );
}
