import React, {useState} from 'react';

import Welcome from './Welcome';
import AboutYou from './AboutYou';
import GoalStep from './Goal';
import MethodStep from './Method';
import TargetsStep from './Targets';

import {dailyPlan} from '../domain/targets';
import type {Goal, Profile} from '../domain/targets';
import type {Setup} from '../store/setup';

/** The five faces of setup, in the order they are asked. */
export const STEPS = ['welcome', 'about', 'goal', 'method', 'targets'] as const;

export type Step = (typeof STEPS)[number];

type Props = {
  /** The answers it starts from — the saved ones when there are any. */
  profile: Profile;
  goal?: Goal;
  /** Which face to open on. `Change goal` on the weight trend opens the goal. */
  step?: Step;
  /** Back out of the step it opened on. */
  onLeave?: () => void;
  onDone?: (setup: Setup) => void;
};

/**
 * Setup, as one screen.
 *
 * It was five stack routes, which meant five pushes: a slide between every
 * question and a back gesture that could leave you half way through a form.
 * Setup is one job with four questions in it, so it is one screen whose face
 * changes — the `switch` below is the whole navigation model, and nothing
 * animates between steps because nothing is being navigated to.
 *
 * The step bodies are still their own components. They own their own fields and
 * their own chrome; this holds only what has to outlive a step — the answers so
 * far, and which face is showing.
 */
export default function Onboarding({
  profile: initialProfile,
  goal: initialGoal,
  step: entry = 'welcome',
  onLeave,
  onDone,
}: Props) {
  const [step, setStep] = useState<Step>(entry);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [goal, setGoal] = useState<Goal>(
    initialGoal ?? {targetWeightKg: initialProfile.weightKg, weeks: 13},
  );

  /**
   * Back leaves the way it came in. Pressing back on the face setup opened at
   * belongs to whoever opened it — the weight trend wants its own screen back,
   * not the question before the one it asked for.
   */
  const back = () => {
    if (step === entry) {
      onLeave?.();
      return;
    }
    setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);
  };

  switch (step) {
    case 'welcome':
      return <Welcome onStart={() => setStep('about')} />;

    case 'about':
      return (
        <AboutYou
          profile={profile}
          onBack={back}
          onContinue={next => {
            setProfile(next);
            setStep('goal');
          }}
        />
      );

    case 'goal':
      return (
        <GoalStep
          profile={profile}
          onBack={back}
          onContinue={next => {
            setGoal(next);
            setStep('method');
          }}
        />
      );

    case 'method':
      return <MethodStep onBack={back} onContinue={() => setStep('targets')} />;

    case 'targets':
      return (
        <TargetsStep
          targets={dailyPlan(profile, goal).targets}
          weightKg={profile.weightKg}
          onBack={back}
          onDone={() => onDone?.({profile, goal})}
          onAdjust={() => setStep('method')}
        />
      );
  }
}
