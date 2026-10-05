import React from 'react';
import {StyleSheet} from 'react-native';
import {render, screen} from '@testing-library/react-native';
import Sheet from './Sheet';
import {Text} from 'react-native';

/**
 * A layout guard, not an appearance one. The plate and label sheets render a
 * scrolling list with flex: 1, and flex against an auto-height parent resolves
 * to nothing — so those sheets came up with their chrome and an invisible list.
 *
 * No test tree can catch that: the rows are all present in the output whatever
 * their measured height is, which is exactly why it reached a device. What can
 * be asserted is the property that made it possible.
 */
function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

describe('The sheet over the camera', () => {
  it('hugs its content by default', async () => {
    await render(
      <Sheet>
        <Text>Mature Cheddar</Text>
      </Sheet>,
    );

    const style = styleOf('sheet');
    expect(style.height).toBeUndefined();
    expect(style.marginTop).toBe('auto');
  });

  it('gives a tall sheet a definite height, so a flex child has something to fill', async () => {
    await render(
      <Sheet tall>
        <Text>Four things on the plate</Text>
      </Sheet>,
    );

    const style = styleOf('sheet');
    // maxHeight alone leaves the height auto, and collapses the list to zero.
    expect(typeof style.height).toBe('string');
    expect(style.height).toBe('74%');
  });

  it('clears the home indicator, so its own button is not under it', async () => {
    await render(
      <Sheet>
        <Text>Add to lunch</Text>
      </Sheet>,
    );

    expect(styleOf('sheet').paddingBottom).toBeGreaterThanOrEqual(14);
  });
});
