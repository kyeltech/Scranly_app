/**
 * The animated splash, which decides when the app is allowed to start.
 *
 * Everything that matters here is in the effect, not the markup: whether the
 * motion setting is honoured, whether `onFinish` is called exactly once, and
 * whether an unmount part-way through leaves a timer or an animation running.
 * None of it had been exercised — the component was only ever rendered.
 */
import React from 'react';
import {AccessibilityInfo, Animated} from 'react-native';
import {act, render, screen} from '@testing-library/react-native';
import AnimatedSplash from './AnimatedSplash';
import {schemes, timing} from '../theme';

/** Stands in for the whole animation, so the test decides when it ends. */
function stubAnimation() {
  const handle = {
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  };
  jest.spyOn(Animated, 'parallel').mockReturnValue(handle as never);
  return handle;
}

/** Resolves the reduce-motion query the component awaits before deciding. */
const motion = (value: boolean | Error) =>
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockImplementation(() =>
      value instanceof Error ? Promise.reject(value) : Promise.resolve(value),
    );

/** Lets the awaited motion query settle. */
const settle = () => act(async () => {});

afterEach(() => jest.restoreAllMocks());

describe('AnimatedSplash', () => {
  it('hands over immediately when the phone asks for reduced motion', async () => {
    motion(true);
    const animation = stubAnimation();
    const onFinish = jest.fn();

    await render(<AnimatedSplash onFinish={onFinish} />);
    await settle();

    // Straight to the finished frame, no motion, no wait.
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(animation.start).not.toHaveBeenCalled();
  });

  it('animates when the phone does not', async () => {
    motion(false);
    const animation = stubAnimation();

    await render(<AnimatedSplash onFinish={jest.fn()} />);
    await settle();

    expect(animation.start).toHaveBeenCalledTimes(1);
  });

  it('animates when the motion setting cannot be read at all', async () => {
    // Some devices reject the query. A splash that never finishes would hold
    // the app on a lime screen for good, so the safe default is to animate.
    motion(new Error('no such setting'));
    const animation = stubAnimation();
    const onFinish = jest.fn();

    await render(<AnimatedSplash onFinish={onFinish} />);
    await settle();

    expect(animation.start).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('holds the finished frame briefly, then hands over', async () => {
    motion(false);
    const animation = stubAnimation();
    const onFinish = jest.fn();

    await render(<AnimatedSplash onFinish={onFinish} />);
    await settle();

    // The animation reports itself done.
    await act(async () => {
      animation.start.mock.calls[0][0]({finished: true});
    });
    expect(onFinish).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(timing.holdAfter);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('does not hand over when the animation was interrupted', async () => {
    motion(false);
    const animation = stubAnimation();
    const onFinish = jest.fn();

    await render(<AnimatedSplash onFinish={onFinish} />);
    await settle();

    await act(async () => {
      animation.start.mock.calls[0][0]({finished: false});
      jest.advanceTimersByTime(timing.holdAfter * 4);
    });

    expect(onFinish).not.toHaveBeenCalled();
  });

  it('stops the animation when it goes away mid-flight', async () => {
    motion(false);
    const animation = stubAnimation();

    const view = await render(<AnimatedSplash onFinish={jest.fn()} />);
    await settle();
    await act(async () => {
      view.unmount();
    });

    expect(animation.stop).toHaveBeenCalled();
  });

  it('does not hand over after it has gone away', async () => {
    motion(false);
    const animation = stubAnimation();
    const onFinish = jest.fn();

    const view = await render(<AnimatedSplash onFinish={onFinish} />);
    await settle();
    const done = animation.start.mock.calls[0][0];

    await act(async () => {
      done({finished: true});
    });
    await act(async () => {
      view.unmount();
    });
    await act(async () => {
      jest.advanceTimersByTime(timing.holdAfter * 4);
    });

    // The hold timer was cleared: calling onFinish here would start the app
    // behind a screen that is no longer there.
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('starts nothing if it goes away before the motion setting comes back', async () => {
    // Hold the motion query open, so the unmount lands first by construction
    // rather than by luck of the microtask queue.
    let answer: (value: boolean) => void = () => {};
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockReturnValue(new Promise<boolean>(resolve => {
        answer = resolve;
      }));
    const animation = stubAnimation();
    const onFinish = jest.fn();

    const view = await render(<AnimatedSplash onFinish={onFinish} />);
    await act(async () => {
      view.unmount();
    });
    await act(async () => {
      answer(false);
    });

    // The effect has to notice it was cancelled while awaiting, and start
    // neither the animation nor the handover.
    expect(animation.start).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('honours the reduced-motion path even if it unmounts straight after', async () => {
    motion(true);
    stubAnimation();
    const onFinish = jest.fn();

    const view = await render(<AnimatedSplash onFinish={onFinish} />);
    await settle();
    await act(async () => {
      view.unmount();
    });

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('leaves no way to start an animation for a screen that is already gone', async () => {
    // The component's only await is the motion setting, and the cancel check
    // after it is the only window there is. A second guard used to sit after
    // the animation was handed to the driver; nothing could reach it, because
    // no other code can run between those two statements. It has been removed,
    // and this pins the invariant that made it dead: an unmount can only land
    // before the setting comes back, never after it has started.
    motion(false);
    const animation = stubAnimation();

    const view = await render(<AnimatedSplash onFinish={jest.fn()} />);
    await settle();
    await act(async () => {
      view.unmount();
    });

    // Started once, and stopped by the cleanup — not by a mid-flight guard.
    expect(animation.start).toHaveBeenCalledTimes(1);
    expect(animation.stop).toHaveBeenCalledTimes(1);
  });

  it('takes a scheme override, so the three launch looks can be compared', async () => {
    motion(false);
    stubAnimation();

    await render(<AnimatedSplash onFinish={jest.fn()} schemeName="ink" />);
    await settle();

    expect(screen.getByLabelText('Scranly')).toBeTruthy();
    expect(screen.getByText('EAT. LOG. DONE.').props.style).toEqual(
      expect.objectContaining({color: schemes.ink.splash.tag}),
    );
  });

  it('defaults to the scheme the app ships with', async () => {
    motion(false);
    stubAnimation();

    await render(<AnimatedSplash onFinish={jest.fn()} />);
    await settle();

    expect(screen.getByText('EAT. LOG. DONE.').props.style).toEqual(
      expect.objectContaining({color: schemes.lime.splash.tag}),
    );
  });
});
