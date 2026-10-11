import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import Root from './Root';
import {memoryStore} from '../store/memory';
import {kyel, kyelsGoal} from '../fixtures/profile';

/**
 * The store is read before the first screen is chosen, so every launch starts
 * on the loading screen the app already had. `launch` is that wait — asserting
 * through it would be asserting on the frame before the gate had answered.
 */
const launch = async (element: React.ReactElement) => {
  const mounted = await render(element);
  await waitFor(() =>
    expect(screen.queryByLabelText('Getting your day ready')).toBeNull(),
  );
  return mounted;
};

/**
 * ADR-0007. Setup ran on every launch because the app had no memory, not
 * because setup was repeating. These walk the gate: what the store says decides
 * what opens.
 */
describe('the setup gate', () => {
  it('asks the questions when the store has nothing', async () => {
    await launch(<Root store={memoryStore()} />);

    expect(screen.getByText('EAT. LOG. DONE.')).toBeTruthy();
  });

  it('opens on Today when the store has been through setup', async () => {
    await launch(<Root store={memoryStore({profile: kyel, goal: kyelsGoal})} />);

    expect(screen.getByText('kcal left')).toBeTruthy();
    expect(screen.queryByText('EAT. LOG. DONE.')).toBeNull();
  });

  it('hands the saved answers to setup, not the fixture ones', async () => {
    const store = memoryStore({
      profile: {...kyel, weightKg: 71.4},
      goal: {targetWeightKg: 68, weeks: 9},
    });

    // Change goal is the one way back into setup once it is done, so it is
    // where a returning user would see a stale profile.
    await launch(<Root store={store} initialRoute="Weight" />);
    await fireEvent.press(screen.getByText('Change the goal'));

    expect(screen.getByDisplayValue('71.4')).toBeTruthy();
    expect(screen.queryByDisplayValue('83.0')).toBeNull();
  });

  it('saves the answers when setup finishes', async () => {
    const store = memoryStore();
    await launch(<Root store={store} />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Very'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));
    await fireEvent.press(screen.getByText('Start logging'));

    await expect(store.read()).resolves.toEqual({
      profile: {...kyel, activity: 'very'},
      goal: {targetWeightKg: 75, weeks: 13},
    });
  });

  it('does not ask again on the next launch', async () => {
    const store = memoryStore();
    const first = await launch(<Root store={store} />);

    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));
    await fireEvent.press(screen.getByText('Start logging'));
    // Unmounted inside act, or the effect cleanup lands after the next render
    // and every test after this one sees the wrong tree.
    await act(async () => {
      first.unmount();
    });

    // Same store, new launch.
    await launch(<Root store={store} />);

    expect(screen.getByText('kcal left')).toBeTruthy();
    expect(screen.queryByText('EAT. LOG. DONE.')).toBeNull();
  });

  it('still lands on Today when the save fails, and says so rather than swallowing it', async () => {
    // A storage that opened and then refused the write. Setup is lost for the
    // next launch, which is a cost — taking the app down on the last tap of
    // setup would be a bigger one.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = {
      ...memoryStore(),
      write: () => Promise.reject(new Error('mmkv: instance is read-only')),
    };

    await launch(<Root store={store} />);
    await fireEvent.press(screen.getByText('Set up my targets'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('See my targets'));
    await fireEvent.press(screen.getByText('Start logging'));

    expect(screen.getByText('kcal left')).toBeTruthy();
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringMatching(/read-only/)),
    );
    warn.mockRestore();
  });

  it('asks again rather than opening Today when the store cannot be read', async () => {
    const broken = {
      ...memoryStore(),
      read: () => Promise.reject(new Error('no disk')),
    };

    await launch(<Root store={broken} />);

    expect(screen.getByText('EAT. LOG. DONE.')).toBeTruthy();
  });
});

describe('Change goal', () => {
  it('opens setup at the goal, not at the first question', async () => {
    await launch(
      <Root store={memoryStore({profile: kyel, goal: kyelsGoal})} initialRoute="Weight" />,
    );

    await fireEvent.press(screen.getByText('Change the goal'));

    expect(screen.getByText('Where are you heading?')).toBeTruthy();
    expect(screen.queryByText('About you')).toBeNull();
  });

  it('comes back to the weight trend when backed out of', async () => {
    await launch(
      <Root store={memoryStore({profile: kyel, goal: kyelsGoal})} initialRoute="Weight" />,
    );

    await fireEvent.press(screen.getByText('Change the goal'));
    await fireEvent.press(screen.getByLabelText('Back'));

    expect(screen.getByText('On track')).toBeTruthy();
  });
});

/**
 * A store that can answer on the spot, which is what MMKV is for. The gate
 * should take that answer and never reach for the slow one — a `read` here is
 * a loading frame the user did not need to see.
 */
const instantStore = (initial?: Parameters<typeof memoryStore>[0]) => {
  const inner = memoryStore(initial);
  let held = initial ?? null;
  return {
    read: jest.fn(inner.read),
    write: jest.fn(async (s: NonNullable<typeof held>) => {
      held = s;
      await inner.write(s);
    }),
    clear: jest.fn(inner.clear),
    peek: () => held,
  };
};

describe('a store that answers without waiting', () => {
  it('opens Today without ever asking for the slow read', async () => {
    const store = instantStore({profile: kyel, goal: kyelsGoal});

    await render(<Root store={store} />);

    expect(screen.getByText('kcal left')).toBeTruthy();
    expect(screen.queryByLabelText('Getting your day ready')).toBeNull();
    expect(store.read).not.toHaveBeenCalled();
  });

  it('opens setup without ever asking for the slow read', async () => {
    const store = instantStore();

    await render(<Root store={store} />);

    expect(screen.getByText('EAT. LOG. DONE.')).toBeTruthy();
    expect(store.read).not.toHaveBeenCalled();
  });

  it('falls back to the slow read when the store cannot answer', async () => {
    // What a build with no pod looks like: peek declines, so the gate has to
    // wait after all rather than treat "cannot answer" as "nothing saved".
    const store = {
      ...memoryStore({profile: kyel, goal: kyelsGoal}),
      peek: () => undefined,
    };
    const read = jest.spyOn(store, 'read');

    await launch(<Root store={store} />);

    expect(screen.getByText('kcal left')).toBeTruthy();
    expect(read).toHaveBeenCalled();
  });
});
