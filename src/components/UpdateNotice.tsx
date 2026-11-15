import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {ChevronRight} from '../ui/icons';
import type {Notice} from '../domain/releases';
import {useTheme} from '../theme';

import {updateNotice as styles} from '../styles';
/**
 * The one row on Today that is about the app rather than the day.
 *
 * Three things it can say — there is a newer build to fetch, this one is close
 * to its deadline, this is the last of it — and one tap, into TestFlight. The
 * tone carries the urgency and the words carry the facts: a date rather than a
 * countdown, because '13 February' is something a person can act on and '76
 * days remaining' is a number that invites doing nothing.
 *
 * It only ever appears on a TestFlight build, where a build genuinely does stop
 * opening after ninety days (`domain/releases.ts`). The row is never a claim
 * that a newer build exists — the app cannot see TestFlight, so it points at
 * the door rather than saying somebody is at it.
 */
export default function UpdateNotice({
  notice,
  onPress,
}: {
  notice: Notice;
  onPress?: () => void;
}) {
  const t = useTheme();
  /**
   * News sits on the plain surface; a deadline is the warm caveat the app uses
   * for anything it is admitting; the last two days take the over colour. The
   * only difference between them is tone, because the row, the place and the
   * tap are the same.
   */
  const ground =
    notice.kind === 'signpost'
      ? t.fill
      : notice.kind === 'deadline'
      ? t.caveat.bg
      : t.verdict.fast;
  const ink =
    notice.kind === 'signpost'
      ? t.text
      : notice.kind === 'deadline'
      ? t.caveat.text
      : t.status.over;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notice.line}. ${notice.sub}`}
      style={[styles.row, {backgroundColor: ground}]}>
      <View style={styles.text}>
        <Text style={[styles.line, {color: ink}]}>{notice.line}</Text>
        <Text style={[styles.sub, {color: ink}]}>{notice.sub}</Text>
      </View>
      <ChevronRight colour={ink} size={14} />
    </Pressable>
  );
}
