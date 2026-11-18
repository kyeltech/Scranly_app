import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Sheet from '../ui/Sheet';
import {Button} from '../ui';
import {Check} from '../ui/icons';
import type {Release} from '../domain/releases';
import {useTheme} from '../theme';

import {whatsNew as styles} from '../styles';
/**
 * What changed, once, in the build it changed in.
 *
 * It describes the build it is running inside, so it needs no network and
 * cannot be wrong — and it is not a way to get an update, because no app can
 * install its own replacement. It is what somebody sees *after* TestFlight or
 * the App Store has done that.
 *
 * Several releases arrive in one sheet rather than one sheet each: on TestFlight
 * a build a week is normal and a queue of sheets on launch would be a punishment
 * for having been away. They are grouped, newest first, so the most recent thing
 * is the first thing read.
 *
 * No confetti and no "we have been busy". Three lines, a date, a way out, and
 * one ghost to say what you think — the people on TestFlight are the point of it.
 */
export default function WhatsNew({
  releases,
  onClose,
  onFeedback,
}: {
  /** Newest first. Everything missed since the last one that was read. */
  releases: Release[];
  onClose?: () => void;
  onFeedback?: () => void;
}) {
  const t = useTheme();
  if (releases.length === 0) {
    return null;
  }
  const newest = releases[0];
  const several = releases.length > 1;

  return (
    <View style={styles.scrim}>
      {/* Tapping the screen behind dismisses, as everywhere else — and counts
          as having read it, same as the button. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close what’s new"
      />
      <Sheet>
        <Text style={[styles.label, {color: t.textMuted}]}>WHAT’S NEW</Text>
        <Text style={[styles.title, {color: t.text}]}>
          {several
            ? `${count(releases.length)} builds since you last looked`
            : headline(newest.lines.length)}
        </Text>

        {releases.map(release => (
          <View key={release.id}>
            {/* Which release a line belongs to only matters when there is more
                than one. With one, the date at the foot says it. */}
            {several ? (
              <Text style={[styles.group, {color: t.textMuted}]}>
                {`${release.id} · ${dateWords(release.on).toUpperCase()}`}
              </Text>
            ) : null}
            {release.lines.map(line => (
              <View key={line} style={styles.line}>
                <View style={styles.tick}>
                  <Check colour={t.status.under} size={16} />
                </View>
                <Text style={[styles.lineText, {color: t.text}]}>{line}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={[styles.stamp, {color: t.textMuted}]}>
          {several
            ? 'Dismissing marks them all as read'
            : `${newest.id} · ${dateWords(newest.on)}`}
        </Text>

        <View style={styles.gap} />
        <Button label="Got it" onPress={onClose} />
        {/* The one ask in the app, and it is a ghost on a sheet somebody has
            already chosen to read. Gone entirely when there is nowhere for it
            to go: a button that does nothing is worse than one less button. */}
        {onFeedback ? (
          <>
            <View style={styles.gapSm} />
            <Button label="Tell me what you think" variant="ghost" onPress={onFeedback} />
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

/** 'Three things are different'. The number is the point, so it leads. */
function headline(lines: number): string {
  if (lines === 1) {
    return 'One thing is different';
  }
  return `${count(lines)} things are different`;
}

const WORDS: Record<number, string> = {2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five'};

const count = (n: number) => WORDS[n] ?? String(n);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const dateWords = (iso: string) => {
  const day = new Date(`${iso}T00:00:00`);
  return `${day.getDate()} ${MONTHS[day.getMonth()]}`;
};
