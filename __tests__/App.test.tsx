/**
 * @format
 */

import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {mmkvStore} from '../src/store/mmkv';
import App from '../App';

/**
 * The mock's own controls, reached by require the way the OCR tests do: they
 * are not on the real module, and importing them would not type-check once the
 * package is installed.
 */
const mmkvMock = require('react-native-mmkv') as {
  __resetMmkv: () => void;
  __setMmkvNative: (present: boolean) => void;
  __setRaw: (key: string, value: string) => void;
  __getRaw: (key: string) => string;
  __setWriteError: (error: Error) => void;
};


beforeEach(() => {
  mmkvMock.__resetMmkv();
  // Re-open the storage so the process-level failure reflects this test, not
  // whatever the last one left behind.
  mmkvStore();
});

test('renders correctly', async () => {
  await render(<App />);
});

/**
 * The silence that cost a build: MMKV failing to open meant setup on every
 * launch and nothing on screen to say why. In a dev build it says so.
 */
describe('when the setup store cannot open', () => {
  it('says so on screen, rather than quietly asking for setup again', async () => {
    mmkvMock.__setMmkvNative(false);
    mmkvStore();

    await render(<App />);

    expect(screen.getByText(/setup will not be remembered/i)).toBeTruthy();
    expect(screen.getByText(/not registered/)).toBeTruthy();
  });

  it('says nothing when the store opened', async () => {
    await render(<App />);

    expect(screen.queryByText(/setup will not be remembered/i)).toBeNull();
  });
});
