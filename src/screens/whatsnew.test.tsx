/**
 * The sheet that says what changed.
 *
 * The rules about *when* it appears are in `domain/releases.test.ts`, which is
 * where they belong. These are about what it says once it is up — above all
 * that it never offers to fetch anything, because it is the thing somebody sees
 * after an update has already happened.
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import WhatsNew from './WhatsNew';
import type {Release} from '../domain/releases';

const fifth: Release = {
  id: '1.0 (5)',
  version: '1.0',
  build: '5',
  on: '2026-11-15',
  lines: ['Failures say which one it was', 'Try again works on the same tin'],
};

const fourth: Release = {
  id: '1.0 (4)',
  version: '1.0',
  build: '4',
  on: '2026-11-08',
  lines: ['The whole nutrition panel on a food'],
};

describe('one release', () => {
  it('counts what is different, because the number is the point', async () => {
    await render(<WhatsNew releases={[fifth]} />);

    expect(screen.getByText('Two things are different')).toBeTruthy();
    expect(screen.getByText('Failures say which one it was')).toBeTruthy();
  });

  it('counts one thing without the plural', async () => {
    await render(<WhatsNew releases={[fourth]} />);

    expect(screen.getByText('One thing is different')).toBeTruthy();
  });

  it('stamps the build and the day, so it reads as dated and not as an advert', async () => {
    await render(<WhatsNew releases={[fifth]} />);

    expect(screen.getByText('1.0 (5) · 15 November')).toBeTruthy();
  });

  it('never offers to fetch anything, because no app can install itself', async () => {
    await render(<WhatsNew releases={[fifth]} />);

    expect(screen.queryByText(/update|download|install|new version/i)).toBeNull();
  });

  it('closes on the button, which is also what counts as having read it', async () => {
    const onClose = jest.fn();
    await render(<WhatsNew releases={[fifth]} onClose={onClose} />);

    await fireEvent.press(screen.getByText('Got it'));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on the screen behind, the way every other sheet does', async () => {
    const onClose = jest.fn();
    await render(<WhatsNew releases={[fifth]} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Close what’s new'));
    expect(onClose).toHaveBeenCalled();
  });

  it('carries the one ask in the app, as a ghost', async () => {
    const onFeedback = jest.fn();
    await render(<WhatsNew releases={[fifth]} onFeedback={onFeedback} />);

    await fireEvent.press(screen.getByText('Tell me what you think'));
    expect(onFeedback).toHaveBeenCalled();
  });
});

describe('two releases at once', () => {
  it('says how many were missed rather than only the newest', async () => {
    // The TestFlight case, where a build a week is normal.
    await render(<WhatsNew releases={[fifth, fourth]} />);

    expect(screen.getByText('Two builds since you last looked')).toBeTruthy();
  });

  it('groups the lines under the release they came in, newest first', async () => {
    await render(<WhatsNew releases={[fifth, fourth]} />);

    expect(screen.getByText('1.0 (5) · 15 NOVEMBER')).toBeTruthy();
    expect(screen.getByText('1.0 (4) · 8 NOVEMBER')).toBeTruthy();
  });

  it('says that dismissing covers all of them', async () => {
    await render(<WhatsNew releases={[fifth, fourth]} />);

    expect(screen.getByText('Dismissing marks them all as read')).toBeTruthy();
  });
});

describe('nothing to say', () => {
  it('draws nothing at all, rather than an empty sheet', async () => {
    const view = await render(<WhatsNew releases={[]} />);

    expect(view.toJSON()).toBeNull();
  });
});
