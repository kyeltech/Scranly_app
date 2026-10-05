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
    expect(screen.getByText('EAT. LOG. DONE.')).toBeTruthy();
    expect(screen.getByText('Set up my targets')).toBeTruthy();
    expect(screen.getByText('I have an invite code')).toBeTruthy();
  });
});

describe('About you', () => {
  it('explains why it is asking, and shows the profile it was given', async () => {
    await render(<AboutYou profile={kyel} />);
    expect(screen.getByText(/never leaves your phone/)).toBeTruthy();
    expect(screen.getByDisplayValue('182')).toBeTruthy();
    expect(screen.getByDisplayValue('83.0')).toBeTruthy();
  });

  it('lets you type your own numbers in', async () => {
    const onContinue = jest.fn();
    await render(<AboutYou profile={kyel} onContinue={onContinue} />);

    await fireEvent.changeText(screen.getByLabelText('HEIGHT'), '176');
    await fireEvent.changeText(screen.getByLabelText('AGE'), '41');
    await fireEvent.changeText(screen.getByLabelText('WEIGHT TODAY'), '78.4');
    await fireEvent.press(screen.getByLabelText('SEX'));
    await fireEvent.press(screen.getByText('Continue'));

    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({heightCm: 176, ageYears: 41, weightKg: 78.4, sex: 'female'}),
    );
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
  // kyel is 83.0 kg heading for 75.0, so 8.0 kg to lose. His 1%-a-week cap is
  // 0.83, which 6 weeks and 2 months both break and 3 months — the default —
  // does not.

  it('recalculates when the goal weight is typed', async () => {
    await render(<Goal profile={kyel} />);
    expect(screen.getByText('0.6 kg')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('GOAL'), '79');

    // 4 kg over the same three months is half the pace.
    expect(screen.getByText('0.3 kg')).toBeTruthy();
  });

  it('does the arithmetic out loud for the date chosen', async () => {
    await render(<Goal profile={kyel} />);

    // Three months is the default.
    expect(screen.getByText('0.6 kg')).toBeTruthy();
    expect(screen.getByText('A pace most people can hold')).toBeTruthy();
    // The horizon is named the way it was offered, not converted to weeks.
    expect(screen.getByText(/8\.0 kg in 3 months/)).toBeTruthy();
  });

  it('names the cost of a goal that is too fast, and offers a slower date', async () => {
    await render(<Goal profile={kyel} />);

    await fireEvent.press(screen.getByText('6 weeks'));

    expect(screen.getByText('Faster than most people hold')).toBeTruthy();
    expect(screen.getByText(/comes off as muscle/)).toBeTruthy();
    expect(screen.getByText('Try 3 months instead')).toBeTruthy();
  });

  it('shows the pace that was asked for, not the one the cap allows', async () => {
    await render(<Goal profile={kyel} />);

    await fireEvent.press(screen.getByText('6 weeks'));

    // 8 kg in 6 weeks is 1.3 a week. Showing the capped 0.8 here would read
    // as the app not having understood what was typed.
    expect(screen.getByText('1.3 kg')).toBeTruthy();
    expect(screen.queryByText('0.8 kg')).toBeNull();
  });

  it('prices the slower date beside the offer of it', async () => {
    await render(<Goal profile={kyel} />);

    await fireEvent.press(screen.getByText('6 weeks'));

    // 8 kg over 13 weeks. The chip alone would be an ask to trust it.
    expect(screen.getByText('0.62 kg a week')).toBeTruthy();
  });

  it('goes back to a holdable pace when the suggestion is taken', async () => {
    await render(<Goal profile={kyel} />);

    await fireEvent.press(screen.getByText('6 weeks'));
    await fireEvent.press(screen.getByText('Try 3 months instead'));

    expect(screen.getByText('A pace most people can hold')).toBeTruthy();
    // Nothing left to suggest once the gentlest date is the one chosen.
    expect(screen.queryByText('Try 3 months instead')).toBeNull();
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
    // The design has a second, quieter way out of this screen.
    expect(screen.getByText('Set them myself instead')).toBeTruthy();
  });
});
