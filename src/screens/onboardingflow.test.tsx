import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Onboarding from './Onboarding';
import {kyel} from '../fixtures/profile';

/**
 * Setup is one screen that changes what it shows, not five screens that push
 * one another. These assert the step it is on AND that the steps either side
 * are nowhere on screen — a stack would leave the previous one mounted behind.
 */
describe('setup', () => {
  it('opens on the welcome, and only the welcome', async () => {
    await render(<Onboarding profile={kyel} />);

    expect(screen.getByText('EAT. LOG. DONE.')).toBeTruthy();
    expect(screen.queryByText('About you')).toBeNull();
    expect(screen.queryByText('STEP 1 OF 4')).toBeNull();
  });

  it('replaces the welcome with the first step rather than covering it', async () => {
    await render(<Onboarding profile={kyel} />);

    await fireEvent.press(screen.getByText('Set up my targets'));

    expect(screen.getByText('About you')).toBeTruthy();
    expect(screen.getByText('STEP 1 OF 4')).toBeTruthy();
    expect(screen.queryByText('EAT. LOG. DONE.')).toBeNull();
    expect(screen.queryByText('Set up my targets')).toBeNull();
  });

  it('goes back a step, and only one step is ever showing', async () => {
    await render(<Onboarding profile={kyel} />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.getByText('STEP 2 OF 4')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Back'));

    expect(screen.getByText('STEP 1 OF 4')).toBeTruthy();
    expect(screen.queryByText('STEP 2 OF 4')).toBeNull();
  });

  it('leaves the way it came in when back is pressed on the welcome', async () => {
    const onLeave = jest.fn();
    await render(<Onboarding profile={kyel} onLeave={onLeave} />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByLabelText('Back'));

    expect(screen.queryByText('EAT. LOG. DONE.')).toBeTruthy();
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('hands over the answers it collected, not the ones it started with', async () => {
    const onDone = jest.fn();
    await render(<Onboarding profile={kyel} onDone={onDone} />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Very'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.changeText(screen.getByLabelText('GOAL'), '79');
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));
    await fireEvent.press(screen.getByText('Start logging'));

    expect(onDone).toHaveBeenCalledWith({
      profile: {...kyel, activity: 'very'},
      goal: {targetWeightKg: 79, weeks: 13},
    });
  });

  it('shows the targets the answers produce, not the fixture ones', async () => {
    await render(<Onboarding profile={kyel} />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Very'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));

    // A very active 83 kg man, not the lightly-active 1,815.
    expect(screen.getByText('2,450')).toBeTruthy();
    expect(screen.queryByText('1,815')).toBeNull();
  });

  it('goes back to the method from the targets, where the numbers come from', async () => {
    await render(<Onboarding profile={kyel} step="targets" />);

    await fireEvent.press(screen.getByText('Set them myself instead'));

    expect(screen.getByText('STEP 3 OF 4')).toBeTruthy();
    expect(screen.queryByText('Your daily targets')).toBeNull();
  });

  it('opens at the step it was asked for, so Change goal lands on the goal', async () => {
    await render(<Onboarding profile={kyel} step="goal" />);

    expect(screen.getByText('Where are you heading?')).toBeTruthy();
    expect(screen.getByText('STEP 2 OF 4')).toBeTruthy();
  });

  it('leaves when back is pressed on the step it opened at', async () => {
    const onLeave = jest.fn();
    await render(<Onboarding profile={kyel} step="goal" onLeave={onLeave} />);

    await fireEvent.press(screen.getByLabelText('Back'));

    expect(onLeave).toHaveBeenCalled();
  });
});
