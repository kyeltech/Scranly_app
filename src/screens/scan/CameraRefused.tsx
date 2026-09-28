import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import Sheet from '../../ui/Sheet';
import {Button} from '../../ui';
import {Warning} from '../../ui/icons';
import {radius, type as type_, useTheme} from '../../theme';

/**
 * The camera was refused.
 *
 * There is no board for this — a camera can always be said no to, and the
 * design does not cover it. Built on the same sheet as every other scan
 * outcome, so it reads as part of the scanner rather than an error page.
 *
 * Two things it must do: say what the camera is for, in the app's own terms
 * rather than the system's, and leave a way to log food anyway. A refusal that
 * dead-ends is a refusal that makes the app feel broken.
 */
export default function CameraRefused({
  /** True when the app may still ask; false once only Settings can grant it. */
  canAsk,
  onAsk,
  onTypeItIn,
  onClose,
}: {
  canAsk: boolean;
  onAsk?: () => void;
  onTypeItIn?: () => void;
  onClose?: () => void;
}) {
  const t = useTheme();

  return (
    <Sheet>
      <View style={styles.head}>
        <View style={[styles.icon, {backgroundColor: t.verdict.fast}]}>
          <Warning colour={t.status.over} size={18} />
        </View>
        <Text style={[type_.cardTitle, styles.title, {color: t.text}]}>
          Scranly cannot see
        </Text>
      </View>

      <Text style={[styles.body, {color: t.textMuted}]}>
        The camera is how scanning works — a barcode, a nutrition label, a plate.
        Nothing it sees is uploaded or kept: the reading happens on your phone and
        the photo is thrown away.
      </Text>

      {canAsk ? (
        <>
          <View style={styles.gap} />
          <Button label="Allow the camera" onPress={onAsk} />
        </>
      ) : (
        <>
          <Text style={[styles.body, {color: t.textMuted}]}>
            It has been turned off for Scranly, so it has to be turned back on in
            Settings.
          </Text>
          <View style={styles.gap} />
          <Button label="Open Settings" onPress={() => {
              Linking.openSettings().catch(() => {});
            }} />
        </>
      )}

      <View style={styles.gapSm} />
      {/* Never a dead end: the day can still be logged by hand. */}
      <Button label="Type the food in instead" variant="ghost" onPress={onTypeItIn} />
      <View style={styles.gapSm} />
      <Button label="Not now" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: {flexDirection: 'row', alignItems: 'center', gap: 10},
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {flex: 1},
  body: {...type_.body, fontSize: 14, marginTop: 14},
  gap: {height: 20},
  gapSm: {height: 10},
});
