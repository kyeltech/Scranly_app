import {memoryDiary} from './memory';
import {isEntry} from './diary';
import type {DiaryEntry} from '../domain/diary';

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

/**
 * The contract every diary store honours. The in-memory one today, whatever
 * sits behind it tomorrow — the same walk runs against MMKV in mmkv.test.ts.
 */
describe('the diary store', () => {
  it('is empty before anything has been logged', async () => {
    await expect(memoryDiary().read()).resolves.toEqual([]);
  });

  it('gives back what was logged', async () => {
    const diary = memoryDiary();

    await diary.add(entry());

    await expect(diary.read()).resolves.toEqual([entry()]);
  });

  it('keeps every entry, including two of the same food on one day', async () => {
    const diary = memoryDiary();

    await diary.add(entry({id: 'a'}));
    await diary.add(entry({id: 'b'}));

    await expect(diary.read()).resolves.toHaveLength(2);
  });

  it('takes an entry off the diary by id', async () => {
    const diary = memoryDiary();
    await diary.add(entry({id: 'a'}));
    await diary.add(entry({id: 'b'}));

    await diary.remove('a');

    const left = await diary.read();
    expect(left.map(e => e.id)).toEqual(['b']);
  });

  it('shrugs at being asked to remove something that is not there', async () => {
    const diary = memoryDiary();
    await diary.add(entry({id: 'a'}));

    await expect(diary.remove('nope')).resolves.toBeUndefined();
    await expect(diary.read()).resolves.toHaveLength(1);
  });

  it('keeps a copy, so editing what was passed in cannot change what was logged', async () => {
    const diary = memoryDiary();
    const logged = entry();

    await diary.add(logged);
    logged.kcal = 9999;

    const [saved] = await diary.read();
    expect(saved.kcal).toBe(303);
  });

  it('hands out a copy too, so editing what was read cannot change the diary', async () => {
    const diary = memoryDiary();
    await diary.add(entry());

    const first = await diary.read();
    first[0].kcal = 9999;

    const second = await diary.read();
    expect(second[0].kcal).toBe(303);
  });
});

describe('what counts as an entry', () => {
  it('turns away anything that is not an object', () => {
    expect(isEntry(null)).toBe(false);
    expect(isEntry('porridge')).toBe(false);
    expect(isEntry(undefined)).toBe(false);
  });

  it('turns away a row with no calories on it', () => {
    // Counting this as zero would read as a day further under budget than it
    // was, which is the quiet failure worth guarding.
    const noKcal: Record<string, unknown> = {...entry()};
    delete noKcal.kcal;

    expect(isEntry(noKcal)).toBe(false);
  });

  it('accepts a complete one', () => {
    expect(isEntry(entry())).toBe(true);
  });
});

describe('the memory diary answers without waiting too', () => {
  it('peeks at what is logged', async () => {
    const diary = memoryDiary();
    await diary.add(entry());

    expect(diary.peek?.()).toEqual([entry()]);
  });

  it('can be handed a diary to start from', () => {
    expect(memoryDiary([entry()]).peek?.()).toEqual([entry()]);
  });
});
