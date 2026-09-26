import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Welcome from './Welcome';
import AboutYou from './AboutYou';
import Goal from './Goal';
import Method from './Method';
import Targets from './Targets';
import {kyel, kyelsGoal} from '../fixtures/profile';
import {dailyPlan} from '../domain/targets';

describe('Welcome', () => {
  it('says what the app costs before asking for anything', async () => {
    await render(<Welcome />);
    expect(screen.getByText('Scranly')).toBeTruthy();
    expect(screen.getByText(/costs nothing and sells nothing/)).toBeTruthy();
    expect(screen.getByText('Set up my targets')).toBeTruthy();
  });
});

describe('About you', () => {
  it('explains why it is asking, and shows the profile it was given', async () => {
    await render(<AboutYou profile={kyel} />);
    expect(screen.getByText(/never leaves your phone/)).toBeTruthy();
    expect(screen.getByText('182')).toBeTruthy();
    expect(screen.getByText('83.0')).toBeTruthy();
  });

  it('hands back the activity level that was picked', async () => {
    const onContinue = jest.fn();
    await render(<AboutYou profile={kyel} onContinue={onContinue} />);

    await fireEvent.press(screen.getByText('Very'));
    await fireEvent.press(screen.getByText('Continue'));

    expect(onContinue).toHaveBeenCalledWith({...kyel, activity: 'very'});
  });
});

describe('Goal', () => {
  it('does the arithmetic out loud for the date chosen', async () => {
    await render(<Goal profile={kyel} />);
    // Three months is the default: 8 kg over 13 weeks.
    expect(screen.getByText('0.6 kg')).toBeTruthy();
    expect(screen.getByText('A pace most people can hold')).toBeTruthy();
  });

  it('names the cost of a goal that is too fast, and offers a slower date', async () => {
    await render(<Goal profile={kyel} />);

    await fireEvent.press(screen.getByText('6 weeks'));

    expect(screen.getByText('Faster than most people hold')).toBeTruthy();
    expect(screen.getByText(/comes off as muscle/)).toBeTruthy();
    expect(screen.getByText('Try 3 months instead')).toBeTruthy();
  });

  it('goes back to a holdable pace when the suggestion is taken', async () => {
    await render(<Goal profile={kyel} />);

    await fireEvent.press(screen.getByText('6 weeks'));
    await fireEvent.press(screen.getByText('Try 3 months instead'));

    expect(screen.getByText('A pace most people can hold')).toBeTruthy();
  });
});

describe('Method', () => {
  it('describes what each method starts from, and admits both are guesses', async () => {
    await render(<Method />);
    expect(screen.getByText('Your bodyweight formula')).toBeTruthy();
    expect(screen.getByText('Mifflin–St Jeor')).toBeTruthy();
    expect(screen.getByText(/that beats both formulas/)).toBeTruthy();
  });
});

describe('Targets', () => {
  it('shows the five numbers, and promises they follow your weight', async () => {
    const {targets} = dailyPlan(kyel, kyelsGoal);
    await render(<Targets targets={targets} weightKg={kyel.weightKg} />);

    expect(screen.getByText('1,815')).toBeTruthy();
    expect(screen.getByText('146 g')).toBeTruthy();
    expect(screen.getByText('186 g')).toBeTruthy();
    expect(screen.getByText('54 g')).toBeTruthy();
    expect(screen.getByText('25 g')).toBeTruthy();
    expect(screen.getByText(/targets follow/)).toBeTruthy();
  });
});
