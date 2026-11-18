/**
 * What somebody thinks, turned into a draft they send themselves.
 *
 * The whole reason the app asks the questions itself rather than linking out to
 * a form: a form puts their words on somebody else's server, and About you says
 * data does not leave the phone. A mail draft keeps that sentence true — it sits
 * in Mail as theirs until they press send, and they can delete any line of it
 * first.
 *
 * Nothing here sends anything: this turns the screen's three answers into the
 * payload and the plain text, and `readers/feedback.ts` does the sending.
 *
 * There is no address in here, and that is the point. A mail draft put the
 * recipient in front of every tester and in the app bundle besides; the form
 * endpoint it posts to now keeps that out of the app entirely.
 */

/**
 * The things people can ask for by tapping.
 *
 * Every one of them is drawn in the app and not built, which is what makes the
 * taps worth counting: eight people asking for saved meals is a decision, where
 * eight paragraphs mentioning it is a feeling. Kept to eight so the list reads
 * in one go.
 */
export const WANTS = [
  'Saved meals',
  'Export everything',
  'Count exercise',
  'Water',
  'Units',
  'Week starts',
  'Invite a friend',
  'Recipes',
];

/** What the screen collects. Three questions, two of them in their own words. */
export type Answers = {
  wants: string[];
  confusing: string;
  anything: string;
};

/** Nothing picked and nothing written: there is no draft worth opening. */
export function isEmpty(answers: Answers): boolean {
  return (
    answers.wants.length === 0 &&
    answers.confusing.trim() === '' &&
    answers.anything.trim() === ''
  );
}

export function subjectFor(release: string | undefined): string {
  return release === undefined
    ? 'Scranly — feedback'
    : `Scranly ${release} — feedback`;
}

/**
 * The body, as the design board draws it: each question as a heading, their
 * answer indented under it, an empty question left out altogether, and one line
 * at the foot saying which build this was.
 */
export function bodyFor(answers: Answers, release: string | undefined): string {
  const parts: string[] = [];
  if (answers.wants.length > 0) {
    parts.push(['Would love to see', ...answers.wants.map(want => `  ${want}`)].join('\n'));
  }
  const confusing = indent(answers.confusing);
  if (confusing) {
    parts.push(`What’s confusing\n${confusing}`);
  }
  const anything = indent(answers.anything);
  if (anything) {
    parts.push(`Anything else\n${anything}`);
  }
  const stamp = release === undefined ? 'Scranly (version unknown)' : `Scranly ${release}`;
  return `${parts.join('\n\n')}\n\n—\n${stamp}`;
}

/** Their words, kept whole, every line of them under the heading. */
function indent(text: string): string {
  const lines = text
    .trim()
    .split('\n')
    .map(line => `  ${line.trim()}`.trimEnd())
    .filter(line => line !== '');
  return lines.join('\n');
}

/** What goes over the wire. Their three answers, and which build they were on. */
export type Payload = {
  subject: string;
  wants: string[];
  confusing: string;
  anything: string;
  release: string;
};

/**
 * The payload, with nothing in it that was not typed or read off the bundle.
 *
 * No model, no OS version, no identifier, no diary. None of it is needed to
 * read a sentence, and every field here is one somebody could have written out
 * by hand.
 */
export function payloadFor(answers: Answers, release: string | undefined): Payload {
  return {
    subject: subjectFor(release),
    wants: answers.wants,
    confusing: answers.confusing.trim(),
    anything: answers.anything.trim(),
    release: release ?? 'unknown',
  };
}
