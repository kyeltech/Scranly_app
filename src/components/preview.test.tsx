/**
 * The live picture, and what it does when there is no camera to show.
 *
 * This component is the one that took the whole app down once: a static import
 * of a native module that a missing `pod install` had left out threw during
 * render, and the app opened on a white screen. It now renders nothing instead,
 * and the viewfinder's drawn stand-in shows in its place.
 */
jest.mock('react-native-vision-camera', () => {
  throw new Error('Native module VisionCamera not found');
});

import React from 'react';
import {render} from '@testing-library/react-native';
import Preview from './Preview';

describe('Preview, on a build with no camera native module', () => {
  it('renders nothing rather than throwing', async () => {
    const view = await render(<Preview outputs={[]} />);

    expect(view.toJSON()).toBeNull();
  });

  it('renders nothing whatever it is handed', async () => {
    // The caller cannot know the module is missing, so every prop combination
    // has to be survivable.
    const view = await render(<Preview outputs={[]} torch isActive={false} />);

    expect(view.toJSON()).toBeNull();
  });
});
