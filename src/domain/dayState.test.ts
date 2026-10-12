import {dayMarksFrom, dayState} from './dayState';
import type {DiaryEntry} from './diary';
import {dailyPlan} from './targets';
import {kyel, kyelsGoal} from '../fixtures/profile';

const {targets} = dailyPlan(kyel, kyelsGoal);

/** Wednesday 16 September 2026, the clock every test in this project runs on. */
const TODAY = new Date(2026, 8, 16);

const entry = (over: Partial<DiaryEntry> = {}): DiaryEntry => ({
  id: 'e1',
  date: '2026-09-16',
  name: 'Porridge oats',
  portion: '80 g',
  kcal: 303,
  proteinG: 10,
  carbsG: 54,
  fatG: 6,
  meal: 'Breakfast',
  ...over,
});

describe('a day with nothing on it', () => {
  it('has the whole budget still to spend', () => {
    const day = dayState([], targets, '2026-09-16', TODAY);

    expect(day.kcalTarget).toBe(targets.kcal);
    expect(day.kcalEaten).toBe(0);
    expect(day.kcalRemaining).toBe(targets.kcal);
    expect(day.foods).toEqual([]);
  });

  it('still shows the macro rows, at zero against their targets', () => {
    const day = dayState([], targets, '2026-09-16', TODAY);

    expect(day.macros).toEqual([
      {key: 'protein', label: 'PROTEIN', eatenG: 0, targetG: targets.proteinG},
      {key: 'carbs', label: 'CARBS', eatenG: 0, targetG: targets.carbsG},
      {key: 'fat', label: 'FAT', eatenG: 0, targetG: targets.fatG},
    ]);
  });
});

describe('a day with food on it', () => {
  const entries = [
    entry({id: 'a', kcal: 303, proteinG: 10, carbsG: 54, fatG: 6}),
    entry({id: 'b', kcal: 287, proteinG: 48, carbsG: 0, fatG: 11, name: 'Chicken thigh', meal: 'Lunch'}),
  ];

  it('adds up what was eaten and what is left', () => {
    const day = dayState(entries, targets, '2026-09-16', TODAY);

    // 303 + 287, worked out by hand rather than by the code under test.
    expect(day.kcalEaten).toBe(590);
    expect(day.kcalRemaining).toBe(targets.kcal - 590);
  });

  it('adds up each macro separately', () => {
    const day = dayState(entries, targets, '2026-09-16', TODAY);

    expect(day.macros.map(m => m.eatenG)).toEqual([58, 54, 17]);
  });

  it('lists the food as it was logged', () => {
    const day = dayState(entries, targets, '2026-09-16', TODAY);

    expect(day.foods).toEqual([
      {id: 'a', name: 'Porridge oats', portion: '80 g', kcal: 303, meal: 'Breakfast'},
      {id: 'b', name: 'Chicken thigh', portion: '80 g', kcal: 287, meal: 'Lunch'},
    ]);
  });

  it('counts only the day asked for', () => {
    const day = dayState(
      [...entries, entry({id: 'c', date: '2026-09-15', kcal: 900})],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.kcalEaten).toBe(590);
    expect(day.foods).toHaveLength(2);
  });

  it('goes negative past the budget rather than stopping at zero', () => {
    const day = dayState(
      [entry({kcal: targets.kcal + 142})],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.kcalRemaining).toBe(-142);
  });
});

/**
 * The labels Today draws its header from. These were in fixtures/days.ts and
 * move here with the rest: they are what the date means, not stand-in data.
 */
describe('which day it is', () => {
  it('names today without dating it, and offers no stepper', () => {
    const day = dayState([], targets, '2026-09-16', TODAY);

    expect(day.dayLabel).toBe('Wednesday');
    expect(day.dateLabel).toBeUndefined();
    expect(day.past).toBe(false);
    expect(day.neighbours).toBeUndefined();
  });

  it('dates a past day and names the days either side', () => {
    const day = dayState([], targets, '2026-09-13', TODAY);

    expect(day.dayLabel).toBe('Sunday');
    expect(day.dateLabel).toBe('13 September');
    expect(day.past).toBe(true);
    expect(day.neighbours).toEqual({prev: 'Sat 12', next: 'Mon 14'});
  });

  it('never offers a step into the future', () => {
    // The day before today: stepping forward lands on today, not tomorrow.
    const day = dayState([], targets, '2026-09-15', TODAY);

    expect(day.neighbours).toEqual({prev: 'Mon 14', next: 'Wed 16'});
  });
});

/**
 * The one-tap rows on a day with nothing on it. The fixture invented three;
 * derived from the diary they are what this person actually starts the day
 * with, which means a brand-new diary has none to offer.
 */
describe('starters, on an empty day', () => {
  const breakfast = (over: Partial<DiaryEntry>): DiaryEntry =>
    entry({meal: 'Breakfast', ...over});

  it('offers nothing at all when there is no history', () => {
    const day = dayState([], targets, '2026-09-16', TODAY);

    expect(day.starters).toBeUndefined();
  });

  it('offers what is logged at breakfast most often', () => {
    const history = [
      breakfast({id: '1', date: '2026-09-15', name: 'Porridge oats', portion: '40 g', kcal: 152}),
      breakfast({id: '2', date: '2026-09-14', name: 'Porridge oats', portion: '40 g', kcal: 152}),
      breakfast({id: '3', date: '2026-09-14', name: 'Greek yoghurt, 0%', portion: '170 g', kcal: 97}),
    ];

    const day = dayState(history, targets, '2026-09-16', TODAY);

    expect(day.starters?.map(s => s.name)).toEqual([
      'Porridge oats',
      'Greek yoghurt, 0%',
    ]);
  });

  it('names the brand beside the portion when the food has one', () => {
    const day = dayState(
      [breakfast({date: '2026-09-15', name: 'Porridge oats', brand: 'Quaker', portion: '40 g', kcal: 152})],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.starters?.[0]).toEqual({
      id: expect.any(String),
      name: 'Porridge oats',
      meta: 'Quaker · 40 g',
      kcal: 152,
    });
  });

  it('shows the portion alone when there is no brand', () => {
    const day = dayState(
      [breakfast({date: '2026-09-15', name: 'Toast', portion: '2 slices', kcal: 180})],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.starters?.[0].meta).toBe('2 slices');
  });

  it('counts only breakfasts — dinner is not how you start a day', () => {
    const day = dayState(
      [entry({date: '2026-09-15', name: 'Takeaway pizza', meal: 'Dinner'})],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.starters).toBeUndefined();
  });

  it('offers at most three, so the empty day stays a short list', () => {
    const history = ['Oats', 'Yoghurt', 'Toast', 'Eggs'].map((name, i) =>
      breakfast({id: `${i}`, date: '2026-09-15', name}),
    );

    const day = dayState(history, targets, '2026-09-16', TODAY);

    expect(day.starters).toHaveLength(3);
  });

  it('says nothing once the day has food on it', () => {
    const day = dayState(
      [
        breakfast({id: 'old', date: '2026-09-15', name: 'Porridge oats'}),
        entry({id: 'today', date: '2026-09-16'}),
      ],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.starters).toBeUndefined();
  });
});

/**
 * Where the week stands, said only when the day alone would mislead.
 *
 * The trap: an unlogged day is not a day you ate nothing. Comparing a week's
 * food against seven days of budget would tell someone two days into using
 * Scranly that they are thousands under — which reads as permission to eat,
 * off the back of days they simply did not log.
 */
describe('the week note', () => {
  const over = (date: string) => entry({id: `over-${date}`, date, kcal: targets.kcal + 142});
  const onTarget = (date: string) => entry({id: date, date, kcal: targets.kcal});

  it('says nothing on a day inside its budget', () => {
    const day = dayState([entry({kcal: 100})], targets, '2026-09-16', TODAY);

    expect(day.weekNote).toBeUndefined();
  });

  it('puts an over day in the context of the week', () => {
    // Three days under by 200 each, then today over by 142.
    const history = ['2026-09-13', '2026-09-14', '2026-09-15'].map(date =>
      entry({id: date, date, kcal: targets.kcal - 200}),
    );

    const day = dayState([...history, over('2026-09-16')], targets, '2026-09-16', TODAY);

    // 600 under across three days, 142 over today: 458 under on the week.
    expect(day.weekNote).toEqual({kcal: 458, under: true});
  });

  it('says so when the week is over too, rather than only when it flatters', () => {
    const history = ['2026-09-14', '2026-09-15'].map(date => over(date));

    const day = dayState([...history, over('2026-09-16')], targets, '2026-09-16', TODAY);

    expect(day.weekNote).toEqual({kcal: 426, under: false});
  });

  it('counts only the days that were logged, not the days that were not', () => {
    // One day logged on target, then today over. A week's budget would make
    // this read as wildly under; two days' budget is the honest comparison.
    const day = dayState(
      [onTarget('2026-09-15'), over('2026-09-16')],
      targets,
      '2026-09-16',
      TODAY,
    );

    expect(day.weekNote).toEqual({kcal: 142, under: false});
  });

  it('looks back seven days and no further', () => {
    const day = dayState(
      [onTarget('2026-09-08'), over('2026-09-16')],
      targets,
      '2026-09-16',
      TODAY,
    );

    // The 8th is outside the window, so only today counts.
    expect(day.weekNote).toEqual({kcal: 142, under: false});
  });
});

/**
 * The dots on the month. They used to come from `fixtures/days.ts` while the
 * days themselves came from the same place, so they agreed by construction.
 * Now the days come from the diary, and if the dots did not, a day the picker
 * shows as over would open as empty.
 */
describe('the dots on the month', () => {
  it('marks a day with nothing logged as empty', () => {
    const marks = dayMarksFrom([], targets, TODAY);

    expect(marks['2026-09-16']).toBe('empty');
  });

  it('marks a day inside its budget as under', () => {
    const marks = dayMarksFrom(
      [entry({date: '2026-09-15', kcal: 500})],
      targets,
      TODAY,
    );

    expect(marks['2026-09-15']).toBe('under');
  });

  it('marks a day past its budget as over', () => {
    const marks = dayMarksFrom(
      [entry({date: '2026-09-15', kcal: targets.kcal + 1})],
      targets,
      TODAY,
    );

    expect(marks['2026-09-15']).toBe('over');
  });

  it('agrees with the day it opens', () => {
    const entries = [entry({date: '2026-09-15', kcal: targets.kcal + 142})];
    const marks = dayMarksFrom(entries, targets, TODAY);
    const day = dayState(entries, targets, '2026-09-15', TODAY);

    expect(marks['2026-09-15']).toBe('over');
    expect(day.kcalRemaining).toBeLessThan(0);
  });

  it('covers the weeks the picker can show', () => {
    const marks = dayMarksFrom([], targets, TODAY, 6);

    expect(Object.keys(marks)).toHaveLength(42);
    expect(marks['2026-09-16']).toBeDefined();
  });
});
