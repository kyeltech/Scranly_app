/**
 * Feedback, sent.
 *
 * The same shape as the barcode lookup and for the same reasons: a ten-second
 * deadline so a hang is a designed state rather than a spinner forever, a
 * `Failure` with a code rather than a message, and the fetcher injected so no
 * test touches the network (`readers/product.ts`).
 *
 * What it posts to is Web3Forms: a service that takes a POST and emails it on.
 * No address in the app, which is the whole point — a mail draft put the
 * recipient in front of every tester and in the bundle besides.
 */

import {TIMEOUT_MS, codeForError, codeForStatus} from '../domain/failure';
import type {Failure} from '../domain/failure';
import type {Payload} from '../domain/feedback';

/**
 * Where feedback goes. Web3Forms takes a POST and emails it on; their docs are
 * explicit that the key in the request is not a secret — "You do not need to
 * hide the access key. Access key is public." It is an alias for an inbox and
 * can do nothing else, which is why it can live in an app at all.
 */
const ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * The inbox this reaches. Public by the service's own documentation — it is an
 * alias for an email address and can do nothing else, which is why it can sit
 * in an app at all. Emptying it hides both ways into the feedback screen, which
 * is what the app did before this line was filled in.
 */
// Typed as a string and not as its own literal, so emptying it stays a
// one-character edit rather than a type error in three other places.
export const ACCESS_KEY: string = '387dedd5-3e5e-456a-80d5-bbab0926e7a4';

/**
 * Whether there is anywhere to send to. A screen that takes what somebody
 * wrote and loses it is worse than no screen at all.
 */
export const canSend = ACCESS_KEY !== '';

/**
 * Our payload, as the fields the service expects.
 *
 * Flat strings only: their documentation never shows an array or a nested
 * object going over, and every example flattens a form to key/value pairs. So
 * the picks are joined here rather than in `domain/feedback.ts`, which keeps
 * the payload the app reasons about — and counts — a proper list. This function
 * is the whole of what is particular to this service; swapping it is this and
 * the endpoint above.
 *
 * `subject` is the field name their docs name for the email's subject line.
 * These five fields are enough: their examples all carry `name` and `email`
 * besides, and a real send on 15 November 2026 proved neither is required.
 */
export function fieldsFor(
  payload: Payload,
  key: string = ACCESS_KEY,
): Record<string, string> {
  return {
    access_key: key,
    subject: payload.subject,
    // An em dash rather than an empty field: an email with 'wants:' and nothing
    // after it reads as something that went wrong in the sending.
    wants: payload.wants.length > 0 ? payload.wants.join(', ') : '—',
    confusing: payload.confusing === '' ? '—' : payload.confusing,
    anything: payload.anything === '' ? '—' : payload.anything,
    release: payload.release,
  };
}

/** What a send came to. Sent, or a failure with the words it deserves. */
export type SendResult = {status: 'sent'} | {status: 'error'; failure: Failure};

/** Only the slice of `fetch` this uses, so a test can hand over a stand-in. */
type Poster = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal?: AbortSignal;
  },
) => Promise<{ok: boolean; status: number}>;

export async function sendFeedback(
  payload: Payload,
  fetcher: Poster = fetch as unknown as Poster,
  key: string = ACCESS_KEY,
): Promise<SendResult> {
  if (key === '') {
    // Nothing should have been able to get here, so this is the last guard
    // rather than a state anybody sees: `canSend` hides the way in.
    return {status: 'error', failure: {code: 'unknown', detail: 'no access key'}};
  }
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(), TIMEOUT_MS);
  try {
    const res = await fetcher(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(fieldsFor(payload, key)),
      signal: deadline.signal,
    });
    if (!res.ok) {
      return {
        status: 'error',
        failure: {code: codeForStatus(res.status), detail: res.status},
      };
    }
    return {status: 'sent'};
  } catch (error) {
    return {status: 'error', failure: {code: codeForError(error), detail: error}};
  } finally {
    clearTimeout(timer);
  }
}
