/**
 * The screen that asks, and the send it makes.
 *
 * What goes over the wire is asserted in `domain/feedback.test.ts` and
 * `readers/feedback.test.ts`. These are about the screen: that it cannot send
 * nothing, that it only claims to have sent when it has, and that a failure
 * never costs somebody the words they just wrote.
 */
import React from 'react';
import {Clipboard} from 'react-native';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import Feedback from './Feedback';
import type {SendResult} from '../readers/feedback';

const sends = () => jest.fn().mockResolvedValue({status: 'sent'} as SendResult);

const fails = (code: 'offline' | 'server' | 'rateLimited' = 'offline') =>
  jest.fn().mockResolvedValue({status: 'error', failure: {code}} as SendResult);

/** Never resolves: the screen while it is in the air. */
const hangs = () => jest.fn().mockReturnValue(new Promise<SendResult>(() => {}));

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('before anything is said', () => {
  it('cannot send an empty message', async () => {
    const send = sends();
    await render(<Feedback release="1.0 (4)" send={send} />);

    await fireEvent.press(screen.getByText('Pick one, or write a line'));

    expect(send).not.toHaveBeenCalled();
  });

  it('says what goes and what does not, before anything goes', async () => {
    await render(<Feedback release="1.0 (4)" send={sends()} />);

    expect(screen.getByText(/Nothing goes until you press Send/)).toBeTruthy();
    expect(screen.getByText(/nothing else about your phone/)).toBeTruthy();
  });

  it('never shows an address, which is the whole reason it posts', async () => {
    const view = await render(<Feedback release="1.0 (4)" send={sends()} />);

    expect(JSON.stringify(view.toJSON())).not.toMatch(/@\w+\./);
  });
});

describe('sending', () => {
  it('counts the taps on the button', async () => {
    await render(<Feedback release="1.0 (4)" send={sends()} />);

    await fireEvent.press(screen.getByText('Saved meals'));

    expect(screen.getByText('Send')).toBeTruthy();
    expect(screen.getByText('1 picked')).toBeTruthy();
  });

  it('sends the answers, and says so only once it has', async () => {
    const send = sends();
    await render(<Feedback release="1.0 (4)" send={send} />);

    await fireEvent.press(screen.getByText('Saved meals'));
    await fireEvent.changeText(screen.getByLabelText('Anything else'), 'let me log twice');
    await fireEvent.press(screen.getByText('Send'));

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        wants: ['Saved meals'],
        anything: 'let me log twice',
        release: '1.0 (4)',
      }),
    );
    expect(await screen.findByText(/Sent, and read/)).toBeTruthy();
  });

  it('empties the form once it is gone, so the screen is only what is unsent', async () => {
    await render(<Feedback release="1.0 (4)" send={sends()} />);

    await fireEvent.press(screen.getByText('Water'));
    await fireEvent.changeText(screen.getByLabelText('Anything else'), 'gone now');
    await fireEvent.press(screen.getByText('Send'));
    await screen.findByText(/Sent, and read/);

    expect(screen.queryByDisplayValue('gone now')).toBeNull();
    expect(screen.getByText('Pick one, or write a line')).toBeTruthy();
  });

  it('will not send twice while the first one is in the air', async () => {
    const send = hangs();
    await render(<Feedback release="1.0 (4)" send={send} />);

    await fireEvent.press(screen.getByText('Units'));
    await fireEvent.press(screen.getByText('Send'));

    expect(screen.getByText('Sending…')).toBeTruthy();
    await fireEvent.press(screen.getByText('Sending…'));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('drops the sent line the moment they write something else', async () => {
    await render(<Feedback release="1.0 (4)" send={sends()} />);
    await fireEvent.press(screen.getByText('Water'));
    await fireEvent.press(screen.getByText('Send'));
    await screen.findByText(/Sent, and read/);

    await fireEvent.changeText(screen.getByLabelText('What’s confusing?'), 'more');

    expect(screen.queryByText(/Sent, and read/)).toBeNull();
  });
});

describe('when it will not go', () => {
  it('says which failure it was, without talking about barcodes', async () => {
    await render(<Feedback release="1.0 (4)" send={fails('offline')} />);

    await fireEvent.press(screen.getByText('Saved meals'));
    await fireEvent.press(screen.getByText('Send'));

    expect(await screen.findByText('No connection')).toBeTruthy();
    expect(screen.queryByText(/barcode/)).toBeNull();
  });

  it('keeps every word they wrote', async () => {
    await render(<Feedback release="1.0 (4)" send={fails('server')} />);

    await fireEvent.changeText(screen.getByLabelText('Anything else'), 'keep this');
    await fireEvent.press(screen.getByText('Send'));
    await screen.findByText('The database is down');
    await fireEvent.press(screen.getByText('Leave it for now'));

    expect(screen.getByDisplayValue('keep this')).toBeTruthy();
  });

  it('tries again, which here genuinely helps', async () => {
    const send = jest
      .fn()
      .mockResolvedValueOnce({status: 'error', failure: {code: 'server'}} as SendResult)
      .mockResolvedValueOnce({status: 'sent'} as SendResult);
    await render(<Feedback release="1.0 (4)" send={send} />);

    await fireEvent.press(screen.getByText('Water'));
    await fireEvent.press(screen.getByText('Send'));
    await fireEvent.press(await screen.findByText('Try again'));

    expect(await screen.findByText(/Sent, and read/)).toBeTruthy();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('offers the clipboard, which needs no network at all', async () => {
    const copy = jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
    await render(<Feedback release="1.0 (4)" send={fails('offline')} />);

    await fireEvent.press(screen.getByText('Saved meals'));
    await fireEvent.press(screen.getByText('Send'));
    await fireEvent.press(await screen.findByText('Copy it instead'));

    expect(copy).toHaveBeenCalledWith(expect.stringContaining('Saved meals'));
    expect(screen.getByText(/Copied/)).toBeTruthy();
    expect(screen.queryByText('No connection')).toBeNull();
  });

  it('does not offer a retry as the way out of a rate limit', async () => {
    await render(<Feedback release="1.0 (4)" send={fails('rateLimited')} />);

    await fireEvent.press(screen.getByText('Water'));
    await fireEvent.press(screen.getByText('Send'));

    expect(await screen.findByText('Too many messages')).toBeTruthy();
    // Offered, but not as the lime button: it would be turned away again.
    await waitFor(() => expect(screen.getByText('Copy it instead')).toBeTruthy());
  });
});

describe('a build that cannot read its own version', () => {
  it('still sends, and admits what it does not know', async () => {
    const send = sends();
    await render(<Feedback send={send} />);

    await fireEvent.press(screen.getByText('Units'));
    await fireEvent.press(screen.getByText('Send'));

    expect(send).toHaveBeenCalledWith(expect.objectContaining({release: 'unknown'}));
  });
});
