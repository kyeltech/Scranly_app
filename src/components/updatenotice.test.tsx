/**
 * The one row on Today that is about the app rather than the day.
 *
 * What it says is worked out in `domain/releases.ts` and tested there. These
 * are about the row itself: that the tone changes with the kind, that the whole
 * row is one tap, and that a screen reader gets both lines rather than the
 * first one and a chevron.
 */
import React from 'react';
import {StyleSheet} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import UpdateNotice from './UpdateNotice';
import {palettes} from '../theme';

const light = palettes.light;

const groundOf = (name: string) =>
  StyleSheet.flatten(screen.getByLabelText(name).props.style).backgroundColor;

describe('the update notice', () => {
  it('sits on the plain surface when it is only pointing at the door', async () => {
    await render(
      <UpdateNotice
        notice={{kind: 'signpost', line: 'Get the newest build', sub: 'New ones land in TestFlight'}}
      />,
    );

    expect(groundOf('Get the newest build. New ones land in TestFlight')).toBe(light.fill);
  });

  it('takes the warm ground once there is a deadline, which the app is admitting', async () => {
    await render(
      <UpdateNotice
        notice={{kind: 'deadline', line: 'This build stops working on 13 February', sub: 'Open TestFlight for the newest one'}}
      />,
    );

    expect(
      groundOf('This build stops working on 13 February. Open TestFlight for the newest one'),
    ).toBe(light.caveat.bg);
  });

  it('turns red for the last two days, and only then', async () => {
    await render(
      <UpdateNotice
        notice={{kind: 'last', line: 'Two days left on this build', sub: 'After Saturday it will not open at all'}}
      />,
    );

    expect(groundOf('Two days left on this build. After Saturday it will not open at all')).toBe(
      light.verdict.fast,
    );
  });

  it('is one tap, anywhere on it', async () => {
    const onPress = jest.fn();
    await render(
      <UpdateNotice
        notice={{kind: 'signpost', line: 'Get the newest build', sub: 'New ones land in TestFlight'}}
        onPress={onPress}
      />,
    );

    await fireEvent.press(screen.getByText('Get the newest build'));
    expect(onPress).toHaveBeenCalled();
  });

  it('reads out the consequence as well as the headline', async () => {
    // The second line is the half that matters: the first one is a date.
    await render(
      <UpdateNotice
        notice={{kind: 'last', line: 'One day left on this build', sub: 'After Friday it will not open at all'}}
      />,
    );

    expect(
      screen.getByLabelText('One day left on this build. After Friday it will not open at all'),
    ).toBeTruthy();
  });
});
