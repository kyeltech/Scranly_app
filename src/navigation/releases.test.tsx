/**
 * The what's-new sheet and the update row, wired into the app.
 *
 * The rules are tested in `domain/releases.test.ts` and the sheet in
 * `screens/whatsnew.test.tsx`. These are the joins: that a first install is
 * quiet, that a sheet shown once stays shown-once across a relaunch, and that
 * the row on Today actually goes somewhere. Every one of them was a place the
 * work could have been finished and still done nothing.
 */
import React from 'react';
import {Linking} from 'react-native';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import Root from './Root';
import {memorySeen, memoryStore} from '../store/memory';
import {RELEASES} from '../domain/releases';
import {kyel, kyelsGoal} from '../fixtures/profile';

const setUp = () => memoryStore({profile: kyel, goal: kyelsGoal});

const launch = async (element: React.ReactElement) => {
  const mounted = await render(element);
  await waitFor(() =>
    expect(screen.queryByLabelText('Getting your day ready')).toBeNull(),
  );
  return mounted;
};

/** The release the app actually ships with, so the tests move when it does. */
const current = RELEASES[0];
/** A day inside that release's first three weeks: no row, nothing expiring. */
const fresh = new Date(`${current.on}T09:00:00`);
const plus = (days: number) => {
  const day = new Date(fresh);
  day.setDate(day.getDate() + days);
  return day;
};

const build = {version: current.version, build: current.build};
/** There is no endpoint in the repo, so the two ways in are injected on. */
const asking = {...build, canSend: true};

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('the first launch after an update', () => {
  it('raises the sheet over Today, once', async () => {
    // Somebody who was on an older build: the stored id is not this one.
    const seen = memorySeen('0.9 (1)');
    await launch(
      <Root store={setUp()} seen={seen} {...build} now={fresh} initialRoute="Today" />,
    );

    expect(await screen.findByText('WHAT’S NEW')).toBeTruthy();
    expect(screen.getByText(current.lines[0])).toBeTruthy();
  });

  it('writes the release down when it is dismissed, not when it is shown', async () => {
    const seen = memorySeen('0.9 (1)');
    await launch(
      <Root store={setUp()} seen={seen} {...build} now={fresh} initialRoute="Today" />,
    );
    await screen.findByText('WHAT’S NEW');

    // Not yet: a sheet killed by a crash is a sheet nobody read.
    expect(await seen.read()).toBe('0.9 (1)');

    await fireEvent.press(screen.getByText('Got it'));

    expect(screen.queryByText('WHAT’S NEW')).toBeNull();
    // Read plainly, once the screen has moved: an async waitFor callback leaves
    // a promise running past the end of the test and poisons the next one.
    expect(await seen.read()).toBe(current.id);
  });

  it('does not come back on the next launch', async () => {
    const seen = memorySeen(current.id);
    await launch(
      <Root store={setUp()} seen={seen} {...build} now={fresh} initialRoute="Today" />,
    );

    expect(screen.queryByText('WHAT’S NEW')).toBeNull();
  });

  it('takes the ghost through to the one place the app asks anything', async () => {
    const seen = memorySeen('0.9 (1)');
    await launch(
      <Root store={setUp()} seen={seen} {...asking} now={fresh} initialRoute="Today" />,
    );
    await screen.findByText('WHAT’S NEW');

    await fireEvent.press(screen.getByText('Tell me what you think'));

    expect(await screen.findByText(/What you say here is what gets built next/)).toBeTruthy();
    // And it counts as read: coming back from feedback is not the sheet again.
    expect(await seen.read()).toBe(current.id);
  });
});

describe('a first install', () => {
  it('says nothing at all — onboarding is the welcome', async () => {
    const seen = memorySeen();
    await launch(
      <Root store={setUp()} seen={seen} {...build} now={fresh} initialRoute="Today" />,
    );

    expect(screen.queryByText('WHAT’S NEW')).toBeNull();
  });

  it('notes where they came in, so the next release is the first they see', async () => {
    const seen = memorySeen();
    await launch(
      <Root store={setUp()} seen={seen} {...build} now={fresh} initialRoute="Today" />,
    );

    expect(await seen.read()).toBe(current.id);
  });
});

describe('a build the list has never heard of', () => {
  it('shows nothing, rather than somebody else’s changelog', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen('0.9 (1)')}
        version="9.9"
        build="99"
        now={fresh}
        initialRoute="Today"
      />,
    );

    expect(screen.queryByText('WHAT’S NEW')).toBeNull();
  });
});

describe('the row on Today', () => {
  it('stays away while the build is still young', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        beta
        now={plus(5)}
        initialRoute="Today"
      />,
    );

    expect(screen.queryByText('Get the newest build')).toBeNull();
  });

  it('points at TestFlight once the build is three weeks old', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        beta
        now={plus(22)}
        initialRoute="Today"
      />,
    );

    expect(screen.getByText('Get the newest build')).toBeTruthy();
  });

  it('names the day it stops working, a fortnight out', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        beta
        now={plus(80)}
        initialRoute="Today"
      />,
    );

    expect(screen.getByText(/This build stops working on/)).toBeTruthy();
  });

  it('goes to TestFlight when tapped, which is where the Update button is', async () => {
    const open = jest.spyOn(Linking, 'openURL');
    open.mockReset();
    open.mockResolvedValue(undefined);
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        beta
        now={plus(22)}
        initialRoute="Today"
      />,
    );

    await fireEvent.press(screen.getByText('Get the newest build'));

    expect(open).toHaveBeenCalledWith('itms-beta://');
  });

  it('falls back to the web when TestFlight cannot be opened', async () => {
    // Better than a row that goes nowhere, which is what hiding it would be.
    const open = jest.spyOn(Linking, 'openURL');
    open.mockReset();
    open.mockRejectedValueOnce(new Error('no scheme')).mockResolvedValue(undefined);
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        beta
        now={plus(22)}
        initialRoute="Today"
      />,
    );

    await fireEvent.press(screen.getByText('Get the newest build'));

    await waitFor(() =>
      expect(open).toHaveBeenCalledWith('https://testflight.apple.com/'),
    );
  });

  it('never appears on an App Store build, which has its own machinery', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        beta={false}
        now={plus(80)}
        initialRoute="Today"
      />,
    );

    expect(screen.queryByText(/stops working/)).toBeNull();
    expect(screen.queryByText('Get the newest build')).toBeNull();
  });

  it('never appears in a build that cannot read its own version', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        version={undefined}
        build={undefined}
        beta
        now={plus(80)}
        initialRoute="Today"
      />,
    );

    expect(screen.queryByText(/stops working/)).toBeNull();
  });
});

describe('from Settings', () => {
  it('opens what changed in this build, on demand', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        now={fresh}
        initialRoute="Settings"
      />,
    );

    // The row shows the build, where it used to show a number out of package.json.
    expect(screen.getByText(current.id)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('What’s new'));

    expect(await screen.findByText('WHAT’S NEW')).toBeTruthy();
  });

  it('opens the feedback screen', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...asking}
        now={fresh}
        initialRoute="Settings"
      />,
    );

    await fireEvent.press(screen.getByLabelText('Tell me what you think'));

    expect(await screen.findByText(/be blunt/)).toBeTruthy();
  });

  it('says it does not know the build rather than showing a made-up number', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen()}
        version={undefined}
        build={undefined}
        now={fresh}
        initialRoute="Settings"
      />,
    );

    expect(screen.getByText('—')).toBeTruthy();
  });

  it('has no feedback row at all until there is somewhere to send to', async () => {
    // A row that collects words it cannot deliver is worse than no row: this
    // is the state the app actually ships in until the endpoint is filled in.
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen(current.id)}
        {...build}
        canSend={false}
        now={fresh}
        initialRoute="Settings"
      />,
    );

    expect(screen.queryByLabelText('Tell me what you think')).toBeNull();
    // And the rest of the section is untouched.
    expect(screen.getByLabelText('What’s new')).toBeTruthy();
  });

  it('drops the ghost from the sheet for the same reason', async () => {
    await launch(
      <Root
        store={setUp()}
        seen={memorySeen('0.9 (1)')}
        {...build}
        canSend={false}
        now={fresh}
        initialRoute="Today"
      />,
    );
    await screen.findByText('WHAT’S NEW');

    expect(screen.queryByText('Tell me what you think')).toBeNull();
    expect(screen.getByText('Got it')).toBeTruthy();
  });
});
