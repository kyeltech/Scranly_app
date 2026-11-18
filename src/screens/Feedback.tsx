import React, {useState} from 'react';
import {Clipboard, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {Button, Header, Screen, useActionBarInset} from '../ui';
import FailureSheet from './scan/FailureSheet';
import {WANTS, bodyFor, isEmpty, payloadFor} from '../domain/feedback';
import type {Answers} from '../domain/feedback';
import type {Failure} from '../domain/failure';
import {sendFeedback} from '../readers/feedback';
import type {SendResult} from '../readers/feedback';
import {brand, useTheme} from '../theme';

import {feedback as styles} from '../styles';
/**
 * The one place the app asks for anything.
 *
 * TestFlight collects feedback already, but only from somebody who has already
 * hit a problem and cared enough to screenshot it. Nothing in it asks what a
 * person wishes the app did, and nobody opens TestFlight to volunteer that — so
 * the question that decides what gets built next is asked here, where they are.
 *
 * Three questions, one of them a row of taps: eight people tapping the same
 * chip is a decision, where eight paragraphs mentioning it is a feeling.
 *
 * Sent from here, to a form endpoint that keeps my address out of the app —
 * nobody has to go through their own mail to say something, and nobody is
 * handed an address they did not ask for. Nothing goes until Send is pressed,
 * and what goes is the three answers and the build: About you's promise is
 * about the profile, and none of that is in the payload (`domain/feedback.ts`).
 *
 * The app never asks for any of this on its own: there are two ways in, this
 * screen's row in Settings and one ghost on the what's-new sheet — and both
 * disappear when there is no endpoint to send to.
 */
export default function Feedback({
  /** The build this is about, as '1.0 (4)'. Undefined when it cannot be read. */
  release,
  /** How it gets there. Injected so no test touches the network. */
  send = sendFeedback,
  onBack,
}: {
  release?: string;
  send?: (payload: ReturnType<typeof payloadFor>) => Promise<SendResult>;
  onBack?: () => void;
}) {
  const t = useTheme();
  const barInset = useActionBarInset();
  const [answers, setAnswers] = useState<Answers>({
    wants: [],
    confusing: '',
    anything: '',
  });
  /**
   * Idle, going, or gone. 'sent' is a thing the app can finally say honestly:
   * the far end answered, which a mail draft could never tell us.
   */
  const [stage, setStage] = useState<'idle' | 'sending' | 'sent'>('idle');
  /** Why it did not go. The sheet owns the words (`domain/failure.ts`). */
  const [failure, setFailure] = useState<Failure | undefined>();
  const [copied, setCopied] = useState(false);

  const nothingYet = isEmpty(answers);

  const toggle = (want: string) =>
    setAnswers(current => ({
      ...current,
      wants: current.wants.includes(want)
        ? current.wants.filter(w => w !== want)
        : [...current.wants, want],
    }));

  const write = (key: 'confusing' | 'anything') => (next: string) => {
    setAnswers(current => ({...current, [key]: next}));
    // They are writing again, so the last thing this said is no longer true.
    setStage('idle');
    setCopied(false);
  };

  const submit = () => {
    setStage('sending');
    setFailure(undefined);
    send(payloadFor(answers, release)).then(result => {
      if (result.status === 'sent') {
        // Gone, so the form empties: what is on the screen is always what has
        // not been sent yet.
        setAnswers({wants: [], confusing: '', anything: ''});
        setCopied(false);
        setStage('sent');
        return;
      }
      // Their words stay exactly where they are. Nothing is lost to a failure.
      setFailure(result.failure);
      setStage('idle');
    });
  };

  return (
    <Screen insetBottom={false}>
      <Header title="Tell me what you think" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.body, {paddingBottom: 140 + barInset}]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <Text style={[styles.intro, {color: t.textMuted}]}>
          A handful of people are using this, and you are one of them. What you
          say here is what gets built next — be blunt.
        </Text>

        <Text style={[styles.label, {color: t.textMuted}]}>
          WHAT WOULD YOU LOVE TO SEE
        </Text>
        <View style={styles.chips}>
          {WANTS.map(want => {
            const on = answers.wants.includes(want);
            return (
              <Pressable
                key={want}
                onPress={() => toggle(want)}
                accessibilityRole="button"
                accessibilityState={{selected: on}}
                style={[styles.chip, {backgroundColor: on ? brand.lime : t.fill}]}>
                <Text style={[styles.chipLabel, {color: on ? brand.onLime : t.text}]}>
                  {want}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, {color: t.textMuted}]}>WHAT’S CONFUSING?</Text>
        <Prose
          label="What’s confusing?"
          placeholder="Anything that made you stop and work it out."
          value={answers.confusing}
          onChangeText={write('confusing')}
        />

        <Text style={[styles.label, {color: t.textMuted}]}>ANYTHING ELSE</Text>
        <Prose
          label="Anything else"
          placeholder="The thing you would change first."
          value={answers.anything}
          onChangeText={write('anything')}
        />

        {/* What the screen is honest about, and it changes once the draft is
            open: the app cannot know whether anything was sent, so it does not
            thank anybody for sending it. */}
        <View
          style={[
            styles.note,
            {backgroundColor: copied || stage === 'sent' ? t.fill : t.caveat.bg},
          ]}>
          <Text
            style={[
              styles.noteText,
              {color: copied || stage === 'sent' ? t.textMuted : t.caveat.text},
            ]}>
            {copied
              ? 'Copied. Paste it wherever reaches me — a message, a note, anything.'
              : stage === 'sent'
              ? 'Sent, and read. If it needs an answer you will get one.'
              : 'Nothing goes until you press Send. What goes is these answers and the version you are on — nothing else about your phone, and nothing you have logged.'}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, {paddingBottom: 12 + barInset}]}>
        <Button
          label={
            stage === 'sending'
              ? 'Sending…'
              : nothingYet
              ? 'Pick one, or write a line'
              : 'Send'
          }
          sub={
            nothingYet || stage === 'sending' || answers.wants.length === 0
              ? undefined
              : `${answers.wants.length} picked`
          }
          disabled={nothingYet || stage === 'sending'}
          /**
           * No handler at all rather than a handler that declines: a button
           * whose press runs something and then does nothing is the same
           * mistake one layer down, and only one of the two can be tested.
           */
          onPress={nothingYet || stage === 'sending' ? undefined : submit}
        />
      </View>

      {/* Same sheet as every other failure, and the same codes — said for
          sending rather than for a lookup, so nothing talks about barcodes.
          Retrying genuinely helps here, and the clipboard is the way out that
          needs no network at all. */}
      {failure ? (
        <FailureSheet
          failure={failure}
          where="send"
          on={{
            retry: () => {
              setFailure(undefined);
              submit();
            },
            copy: () => {
              Clipboard.setString(bodyFor(answers, release));
              setCopied(true);
              setFailure(undefined);
            },
            close: () => setFailure(undefined),
          }}
        />
      ) : null}
    </Screen>
  );
}

/** A box for a sentence or two of their own words. Not the stat Field: that is one line. */
function Prose({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (next: string) => void;
}) {
  const t = useTheme();
  return (
    <View style={[styles.field, {backgroundColor: t.fill}]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.textMuted}
        accessibilityLabel={label}
        multiline
        style={[styles.input, {color: t.text}]}
      />
    </View>
  );
}
