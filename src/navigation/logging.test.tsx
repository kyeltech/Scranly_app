import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import Root from './Root';
import {memoryStore} from '../store/memory';
import {memoryDiary, memoryFoods} from '../store/memory';
import {kyel, kyelsGoal} from '../fixtures/profile';

const setUp = () => memoryStore({profile: kyel, goal: kyelsGoal});

const launch = async (element: React.ReactElement) => {
  const mounted = await render(element);
  await waitFor(() =>
    expect(screen.queryByLabelText('Getting your day ready')).toBeNull(),
  );
  return mounted;
};

/**
 * The walk that was impossible until now: log a food and find it on Today.
 *
 * Every save in Root was `navigation.goBack` — the screens worked, the sheets
 * closed, and nothing was written anywhere. These are what stop that coming
 * back.
 */
describe('logging a food', () => {
  it('puts it on Today, and takes it off the budget', async () => {
    const diary = memoryDiary();
    await launch(<Root store={setUp()} diary={diary} initialRoute="Today" />);

    // A fresh diary: the whole budget is still there. kyel's target is 1,815.
    expect(screen.getByText('1,815')).toBeTruthy();

    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByText('Add 1 item'));

    // 1,815 - 152 = 1,663, worked out from the fixture rather than by the code.
    await waitFor(() => expect(screen.getByText('1,663')).toBeTruthy());
    expect(screen.getByText('Porridge oats')).toBeTruthy();
  });

  it('writes it to the diary, so the next launch still has it', async () => {
    const diary = memoryDiary();
    await launch(<Root store={setUp()} diary={diary} initialRoute="Today" />);

    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByText('Add 1 item'));

    // Wait on the screen, not on the store: an async waitFor callback leaves a
    // promise running past the end of the test and poisons the next one.
    await waitFor(() => expect(screen.getByText('1,663')).toBeTruthy());

    const [entry] = await diary.read();
    expect(entry).toEqual(
      expect.objectContaining({
        name: 'Porridge oats',
        portion: '40 g',
        brand: 'Quaker',
        kcal: 152,
        proteinG: 5,
        carbsG: 27,
        fatG: 3,
      }),
    );
  });

  it('logs several at once, each as its own entry', async () => {
    const diary = memoryDiary();
    await launch(<Root store={setUp()} diary={diary} initialRoute="Today" />);

    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByLabelText('Add Semi-skimmed milk'));
    await fireEvent.press(screen.getByText('Add 2 items'));

    // 1,815 - 152 - 98 = 1,565.
    await waitFor(() => expect(screen.getByText('1,565')).toBeTruthy());

    expect(await diary.read()).toHaveLength(2);
  });

  it('opens on what was already logged, rather than a fixture day', async () => {
    const diary = memoryDiary();
    const first = await launch(
      <Root store={setUp()} diary={diary} initialRoute="Today" />,
    );

    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByText('Add 1 item'));
    await waitFor(() => expect(screen.getByText('1,663')).toBeTruthy());

    await act(async () => {
      first.unmount();
    });

    // Same diary, new launch.
    await launch(<Root store={setUp()} diary={diary} initialRoute="Today" />);

    expect(screen.getByText('1,663')).toBeTruthy();
  });
});

/**
 * Logging a scanned product.
 *
 * Every save in Scan was `navigation.goBack`: you could scan a barcode, see the
 * product and its numbers, tap "Add", and nothing was written. This is the last
 * mile that makes a scan actually land in the diary.
 */
describe('logging a scanned product', () => {
  /** Today, at a fixed hour, so the clock-guessed meal is not the wall clock's. */
  const at = (hour: number) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 30);
  };

  /** Walk the drawn stand-in (no camera in a test) from aiming to a match. */
  const walkToMatch = async () => {
    // Two steps, aiming -> looking -> found, with the effect in between.
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await screen.findByText('Mature Cheddar');
  };

  it('writes the scanned food to the diary at its serving and meal', async () => {
    const diary = memoryDiary();
    // A bare scan with no meal falls back to the clock; pin it to lunchtime.
    await launch(
      <Root store={setUp()} diary={diary} now={at(12)} initialRoute="Scan" />,
    );

    await walkToMatch();
    await fireEvent.press(screen.getByText('Add to lunch'));

    const [entry] = await diary.read();
    expect(entry).toEqual(
      expect.objectContaining({
        name: 'Mature Cheddar',
        brand: 'Cathedral City',
        portion: '30 g',
        kcal: 125,
        meal: 'Lunch',
      }),
    );
  });

  it('scans into the meal you opened the scanner from, not always lunch', async () => {
    const diary = memoryDiary();
    // Noon, so the clock would say lunch — but opening through Snack must win.
    await launch(
      <Root
        store={setUp()}
        diary={diary}
        foods={memoryFoods()}
        now={at(12)}
        initialRoute="Today"
      />,
    );

    await fireEvent.press(screen.getByLabelText('Add to Snack'));
    await fireEvent.press(screen.getByLabelText('Scan a barcode'));

    await walkToMatch();
    await fireEvent.press(screen.getByText('Add to snack'));

    expect((await diary.read())[0].meal).toBe('Snack');
  });
});

/**
 * Opening a food before logging it.
 *
 * Tapping a row used to log it straight off. Now the row opens the food in full
 * — its numbers, including fibre — and the detail's button is what logs it; the
 * + on the row stays the quick path.
 */
describe('opening a food from the list', () => {
  it('shows the food and logs it from the detail, to the right meal', async () => {
    const diary = memoryDiary();
    const noon = new Date();
    noon.setHours(12, 30, 0, 0); // the clock would guess lunch
    await launch(
      <Root store={setUp()} diary={diary} now={noon} initialRoute="Today" />,
    );

    await fireEvent.press(screen.getByText('Log food'));
    // Tap the row, not the +, so the detail opens rather than logging.
    await fireEvent.press(screen.getByText('Porridge oats'));

    // On the detail: its energy, and the meal it will log to.
    expect(screen.getByText('152')).toBeTruthy();
    await fireEvent.press(screen.getByText('Add to lunch'));

    const [entry] = await diary.read();
    expect(entry).toEqual(
      expect.objectContaining({name: 'Porridge oats', meal: 'Lunch'}),
    );
  });
});

/**
 * Create a food, and find it afterwards.
 *
 * The screen collected every field and `Root` dropped it on the floor: you
 * typed a tuna can in, tapped Save, and it was nowhere — not in your foods,
 * not on Today.
 */
describe('creating a food', () => {
  const fillIn = async () => {
    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByText('Create a food'));

    await fireEvent.changeText(screen.getByLabelText('NAME'), 'Skipjack tuna');
    await fireEvent.changeText(screen.getByLabelText('BRAND'), 'Aldi');
    await fireEvent.changeText(screen.getByLabelText('SERVING'), '51');
    await fireEvent.changeText(screen.getByLabelText('CALORIES'), '55');
    await fireEvent.changeText(screen.getByLabelText('PROTEIN'), '12.7');
    await fireEvent.changeText(screen.getByLabelText('FAT'), '0.5');
    await fireEvent.press(screen.getByText('Save food'));
  };

  it('keeps the food, so it is there to log again tomorrow', async () => {
    const foods = memoryFoods();
    await launch(
      <Root store={setUp()} diary={memoryDiary()} foods={foods} initialRoute="Today" />,
    );

    await fillIn();

    // Wait on the screen, never on the store: an async waitFor callback leaves
    // a promise running past the end of the test and poisons the next one.
    await waitFor(() => expect(screen.getByText('1,760')).toBeTruthy());

    const [tuna] = await foods.read();
    expect(tuna).toEqual(
      expect.objectContaining({
        name: 'Skipjack tuna',
        brand: 'Aldi',
        portion: '51 g',
        kcal: 55,
        proteinG: 12.7,
        fatG: 0.5,
      }),
    );
  });

  it('logs it to today as well, because that is why you typed it in', async () => {
    const diary = memoryDiary();
    await launch(
      <Root store={setUp()} diary={diary} foods={memoryFoods()} initialRoute="Today" />,
    );

    await fillIn();

    // 1,815 - 55.
    await waitFor(() => expect(screen.getByText('1,760')).toBeTruthy());
    expect((await diary.read())[0].name).toBe('Skipjack tuna');
  });

  it('keeps nothing when the form has no calories on it', async () => {
    const foods = memoryFoods();
    const diary = memoryDiary();
    await launch(
      <Root store={setUp()} diary={diary} foods={foods} initialRoute="Today" />,
    );

    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByText('Create a food'));
    await fireEvent.changeText(screen.getByLabelText('NAME'), 'Mystery');
    await fireEvent.press(screen.getByText('Save food'));

    expect(await foods.read()).toEqual([]);
    expect(await diary.read()).toEqual([]);
  });
});

/**
 * The shortcut on Create a food says "Scan the label instead — faster, and it
 * fills all of this in". It filled in nothing: Scan parsed the panel and then
 * navigated to an empty form, dropping the reading on the way.
 */
describe('creating a food from a label', () => {
  it('opens the form already filled from what the label said', async () => {
    await launch(
      <Root
        store={setUp()}
        diary={memoryDiary()}
        foods={memoryFoods()}
        initialRoute="Scan"
      />,
    );

    // The label mode, read, with its panel showing.
    await fireEvent.press(screen.getByText('Label'));
    await fireEvent.press(screen.getByLabelText('Take the photo'));
    await fireEvent.press(screen.getByText('Save this food'));

    // The fixture panel's serving column, in the form rather than on the floor.
    expect(screen.getByDisplayValue('30')).toBeTruthy();
    expect(screen.getByDisplayValue('125')).toBeTruthy();
  });
});

/**
 * Which meal it lands in.
 *
 * `Root` had `'Lunch'` written into both save paths, so every food logged on
 * any screen at any hour went down as lunch — and the "what you usually start
 * the day with" list, which counts breakfasts, could never fill. The meal is
 * where you were standing when you tapped now: each section on Today has its
 * own +, per PRD flow 2.
 */
describe('which meal it lands in', () => {
  /** Today, at a fixed hour — the date has to be today for the day to show it. */
  const at = (hour: number) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 30);
  };

  it('logs to the meal whose + you tapped', async () => {
    const diary = memoryDiary();
    await launch(<Root store={setUp()} diary={diary} initialRoute="Today" />);

    await fireEvent.press(screen.getByLabelText('Add to Dinner'));

    // The screen it opens says where the food is going.
    expect(screen.getByText('Add to Dinner')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByText('Add 1 item'));
    await waitFor(() => expect(screen.getByText('1,663')).toBeTruthy());

    expect((await diary.read())[0].meal).toBe('Dinner');
  });

  it('asks the clock only for the button at the bottom, which has no meal behind it', async () => {
    const diary = memoryDiary();
    await launch(
      <Root store={setUp()} diary={diary} now={at(19)} initialRoute="Today" />,
    );

    await fireEvent.press(screen.getByText('Log food'));
    expect(screen.getByText('Add to Dinner')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByText('Add 1 item'));
    await waitFor(() => expect(screen.getByText('1,663')).toBeTruthy());

    expect((await diary.read())[0].meal).toBe('Dinner');
  });

  it('puts a breakfast-time log at breakfast, so the starters list can fill', async () => {
    const diary = memoryDiary();
    await launch(
      <Root store={setUp()} diary={diary} now={at(8)} initialRoute="Today" />,
    );

    await fireEvent.press(screen.getByText('Log food'));
    await fireEvent.press(screen.getByLabelText('Add Porridge oats'));
    await fireEvent.press(screen.getByText('Add 1 item'));
    await waitFor(() => expect(screen.getByText('1,663')).toBeTruthy());

    expect((await diary.read())[0].meal).toBe('Breakfast');
  });

  it('keeps the meal when you create a food from a section rather than picking one', async () => {
    const diary = memoryDiary();
    await launch(
      <Root
        store={setUp()}
        diary={diary}
        foods={memoryFoods()}
        initialRoute="Today"
      />,
    );

    await fireEvent.press(screen.getByLabelText('Add to Snack'));
    await fireEvent.press(screen.getByText('Create a food'));
    await fireEvent.changeText(screen.getByLabelText('NAME'), 'Biltong');
    await fireEvent.changeText(screen.getByLabelText('CALORIES'), '90');
    await fireEvent.press(screen.getByText('Save food'));

    await waitFor(() => expect(screen.getByText('1,725')).toBeTruthy());

    expect((await diary.read())[0].meal).toBe('Snack');
  });
});
