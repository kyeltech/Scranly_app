import React from 'react';
import {Text, View} from 'react-native';
import {Button, Screen} from '../ui';
import {type as type_, useTheme} from '../theme';
import {errorBoundary as styles} from '../styles';

/** The screen shown when something below the boundary crashed in render. */
function Crashed({onReset}: {onReset: () => void}) {
  const t = useTheme();
  return (
    <Screen>
      <View style={styles.body}>
        <Text style={[type_.sheetTitle, {color: t.text}]}>Scranly hit a problem</Text>
        <Text style={[styles.detail, {color: t.textMuted}]}>
          Something on this screen crashed. What you have logged is safe on your
          phone — this is the screen, not your diary. Try again.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Try again" onPress={onReset} />
      </View>
    </Screen>
  );
}

type Props = {children: React.ReactNode};
type State = {crashed: boolean};

/**
 * The last catch for a render crash (ADR-0006). Without it, a throw during
 * render tears the whole tree down to a blank screen — which is exactly how a
 * missing pod once took the app down. This turns that into a screen with a way
 * back rather than nothing at all.
 *
 * A class, because only a class component can be an error boundary: the hooks
 * API has no equivalent of `getDerivedStateFromError`.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {crashed: false};

  static getDerivedStateFromError(): State {
    return {crashed: true};
  }

  componentDidCatch(error: unknown) {
    // Loud in a dev build; in release there is nowhere to send it yet (ADR-0006).
    if (__DEV__) {
      console.error('[scranly] a screen crashed in render', error);
    }
  }

  reset = () => this.setState({crashed: false});

  render() {
    if (this.state.crashed) {
      return <Crashed onReset={this.reset} />;
    }
    return this.props.children;
  }
}
