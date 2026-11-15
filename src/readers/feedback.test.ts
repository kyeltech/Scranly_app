/**
 * Sending, and every way it can fail.
 *
 * The words belong to the failure component; what is asserted here is that the
 * right code comes out, that a hang gives up rather than spinning forever, and
 * that nothing about the phone goes over the wire.
 */
import {ACCESS_KEY, canSend, fieldsFor, sendFeedback} from './feedback';
import {payloadFor} from '../domain/feedback';

const payload = payloadFor(
  {wants: ['Saved meals'], confusing: 'the chart', anything: ''},
  '1.0 (4)',
);

/** A key shaped like the real thing, which is a UUID. */
const key = '00000000-1111-2222-3333-444444444444';

const stub = (status: number) => () => Promise.resolve({ok: status < 300, status});

describe('a send', () => {
  it('posts flat JSON to the service, and nothing it was not given', async () => {
    let seen: {url?: string; init?: {method: string; headers: Record<string, string>; body: string}} = {};
    const capture = (at: string, init: {method: string; headers: Record<string, string>; body: string}) => {
      seen = {url: at, init};
      return Promise.resolve({ok: true, status: 200});
    };

    await expect(sendFeedback(payload, capture, key)).resolves.toEqual({status: 'sent'});

    expect(seen.url).toBe('https://api.web3forms.com/submit');
    expect(seen.init?.method).toBe('POST');
    expect(seen.init?.headers['Content-Type']).toBe('application/json');
    expect(seen.init?.headers.Accept).toBe('application/json');
    const body = JSON.parse(seen.init?.body ?? '{}');
    expect(body).toEqual({
      access_key: key,
      subject: 'Scranly 1.0 (4) — feedback',
      wants: 'Saved meals',
      confusing: 'the chart',
      anything: '—',
      release: '1.0 (4)',
    });
    expect(Object.keys(body)).toHaveLength(6);
  });

  it('is sent on any 2xx, because a form service answers how it likes', async () => {
    await expect(sendFeedback(payload, stub(201), key)).resolves.toEqual({status: 'sent'});
  });

  it('reads a rate limit as a rate limit', async () => {
    const result = await sendFeedback(payload, stub(429), key);
    expect(result.status === 'error' && result.failure.code).toBe('rateLimited');
  });

  it('reads a 500 as the far end being down, not as your fault', async () => {
    const result = await sendFeedback(payload, stub(503), key);
    expect(result.status === 'error' && result.failure.code).toBe('server');
  });

  it('is offline when there is no network at all', async () => {
    const offline = () => Promise.reject(new TypeError('Network request failed'));
    const result = await sendFeedback(payload, offline, key);
    expect(result.status === 'error' && result.failure.code).toBe('offline');
  });

  it('gives up after ten seconds rather than spinning for ever', async () => {
    jest.useFakeTimers();
    const hangs = (_at: string, init: {signal?: AbortSignal}) =>
      new Promise<never>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(Object.assign(new Error('Aborted'), {name: 'AbortError'})),
        );
      });

    const sending = sendFeedback(payload, hangs, key);
    jest.advanceTimersByTime(10000);
    const result = await sending;

    expect(result.status === 'error' && result.failure.code).toBe('timeout');
    jest.useRealTimers();
  });

  it('does not leave the deadline running once it has gone through', async () => {
    jest.useFakeTimers();
    await sendFeedback(payload, stub(200), key);
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });
});

describe('the fields this service wants', () => {
  it('joins the picks into one string, since arrays are not documented', () => {
    const fields = fieldsFor(
      payloadFor({wants: ['Saved meals', 'Water'], confusing: '', anything: ''}, '1.0 (4)'),
      key,
    );

    expect(fields.wants).toBe('Saved meals, Water');
  });

  it('says a dash where there is no answer, not an empty field', () => {
    // 'confusing:' with nothing after it reads as a fault in the sending.
    const fields = fieldsFor(payloadFor({wants: [], confusing: '', anything: 'x'}, '1.0 (4)'), key);

    expect(fields.wants).toBe('—');
    expect(fields.confusing).toBe('—');
    expect(fields.anything).toBe('x');
  });

  it('is flat strings throughout, which is all the service documents', () => {
    const fields = fieldsFor(payload, key);

    for (const value of Object.values(fields)) {
      expect(typeof value).toBe('string');
    }
  });
});

describe('the inbox', () => {
  it('has a key, so the screen is reachable at all', () => {
    expect(canSend).toBe(true);
  });

  it('carries a whole one, which a truncated paste would not', () => {
    // The service's keys are UUIDs. Half of one fails at the far end with a
    // 400, which is a long way from here to find out.
    expect(ACCESS_KEY).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('refuses to send rather than pretending it did', async () => {
    const fetcher = jest.fn();
    const result = await sendFeedback(payload, fetcher as never, '');

    expect(result.status).toBe('error');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
