import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import ComingSoon from './ComingSoon';

/**
 * A control tapped mid-task is a commitment, not browsing, and it earns a
 * sentence: what the thing is, that it is not built, and what to do meanwhile.
 * A list row gets a SOON chip instead and opens nothing — see Settings.
 */
describe('the coming soon sheet', () => {
  const meals = {
    title: 'Saved meals',
    body: 'A meal will remember a set of foods you log together — porridge, milk and a banana as one tap.',
    meanwhile: 'Until then, log them one at a time. They stay at the top of Recent.',
  };

  it('names the thing, rather than saying coming soon and nothing else', async () => {
    await render(<ComingSoon {...meals} />);

    expect(screen.getByText('Saved meals')).toBeTruthy();
    expect(screen.getByText(/porridge, milk and a banana/)).toBeTruthy();
  });

  it('says what to do meanwhile, which is the useful half', async () => {
    await render(<ComingSoon {...meals} />);

    expect(screen.getByText(/log them one at a time/i)).toBeTruthy();
  });

  it('works without one, for a thing that has no workaround', async () => {
    await render(<ComingSoon title="Invites" body="Not built yet." />);

    expect(screen.getByText('Invites')).toBeTruthy();
  });

  it('closes from the disc, the way every sheet here does', async () => {
    const onClose = jest.fn();
    await render(<ComingSoon {...meals} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('closes by tapping the screen it is sitting over', async () => {
    const onClose = jest.fn();
    await render(<ComingSoon {...meals} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Close Saved meals'));

    expect(onClose).toHaveBeenCalled();
  });

  /**
   * A date is a promise. This is a side project, and the one thing worse than
   * a feature that is missing is a date that passes.
   */
  it('never carries a date', async () => {
    const view = await render(<ComingSoon {...meals} />);
    const shown = JSON.stringify(view.toJSON());

    expect(shown).not.toMatch(/\b20\d\d\b/);
    expect(shown).not.toMatch(/next (week|month|year)/i);
  });
});
