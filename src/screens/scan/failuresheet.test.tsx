/**
 * The one sheet, against the anatomy board.
 *
 * The copy itself is tested in `domain/failure.test.ts`; what matters here is
 * that the sheet draws what it is given and nothing it was not — above all that
 * it never shows a button the caller cannot honour, which is how a dead end
 * gets built by accident.
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import FailureSheet from './FailureSheet';

/** Every string the sheet rendered, in the order it rendered them. */
function texts(node: unknown): string[] {
  if (typeof node === 'string') {
    return [node];
  }
  if (Array.isArray(node)) {
    return node.flatMap(texts);
  }
  if (node && typeof node === 'object') {
    return texts((node as {children?: unknown}).children);
  }
  return [];
}

describe('A failure sheet', () => {
  it('says what happened and what still works', async () => {
    await render(<FailureSheet failure={{code: 'offline'}} on={{retry: jest.fn()}} />);

    expect(screen.getByText('No connection')).toBeTruthy();
    expect(screen.getByText(/all work offline/)).toBeTruthy();
  });

  it('names the subject it was given, so the code is there to read', async () => {
    await render(
      <FailureSheet
        failure={{code: 'offline', subject: '5449000000996'}}
        on={{retry: jest.fn()}}
      />,
    );

    expect(screen.getByText('5449000000996')).toBeTruthy();
  });

  it('shows a reference to quote, and never the error itself', async () => {
    await render(
      <FailureSheet
        failure={{
          code: 'unknown',
          reference: 'OFF-7F3A',
          detail: new Error('TypeError: cannot read property of undefined'),
        }}
        on={{retry: jest.fn()}}
      />,
    );

    expect(screen.getByText('Reference OFF-7F3A')).toBeTruthy();
    expect(screen.queryByText(/TypeError/)).toBeNull();
  });

  it('runs the handler behind the way it drew', async () => {
    const retry = jest.fn();
    const fromLabel = jest.fn();
    await render(<FailureSheet failure={{code: 'offline'}} on={{retry, fromLabel}} />);

    await fireEvent.press(screen.getByText('Try again'));
    expect(retry).toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Add it from the label'));
    expect(fromLabel).toHaveBeenCalled();
  });

  it('draws no button for a way the caller cannot honour', async () => {
    await render(<FailureSheet failure={{code: 'offline'}} on={{retry: jest.fn()}} />);

    expect(screen.queryByText('Add it from the label')).toBeNull();
    expect(screen.queryByText('Type the food in instead')).toBeNull();
  });

  it('gives the label path the lime button where a retry cannot help', async () => {
    // Not the colour — the order. The primary is the first button in the sheet.
    await render(
      <FailureSheet
        failure={{code: 'notFound', subject: '0000000000000'}}
        on={{retry: jest.fn(), fromLabel: jest.fn(), typeItIn: jest.fn()}}
      />,
    );

    const order = texts(screen.toJSON());
    const buttons = ['Add it from the label', 'Scan something else', 'Type the food in instead'];
    const places = buttons.map(label => order.indexOf(label));
    expect(places.every(place => place >= 0)).toBe(true);
    expect(Math.min(...places)).toBe(order.indexOf('Add it from the label'));
  });
});
