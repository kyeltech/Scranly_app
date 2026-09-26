import {
  addMonths,
  daysInMonth,
  isoDate,
  monthGrid,
  monthLabel,
  weekdayOf,
} from './calendar';

describe('month lengths', () => {
  it('knows the short months', () => {
    expect(daysInMonth(2026, 8)).toBe(30); // September
    expect(daysInMonth(2026, 3)).toBe(30); // April
  });

  it('knows February in a common year, a leap year, and a century', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2000, 1)).toBe(29); // divisible by 400
    expect(daysInMonth(1900, 1)).toBe(28); // divisible by 100 but not 400
  });
});

describe('where the first of the month falls', () => {
  it('counts from Monday, because the boards are labelled M T W T F S S', () => {
    // 1 September 2026 is a Tuesday.
    expect(weekdayOf(2026, 8, 1)).toBe(1);
    // 1 February 2026 is a Sunday — the far end of the row.
    expect(weekdayOf(2026, 1, 1)).toBe(6);
    // 1 October 2026 is a Thursday.
    expect(weekdayOf(2026, 9, 1)).toBe(3);
  });
});

describe('stepping months', () => {
  it('rolls the year over backwards and forwards', () => {
    expect(addMonths(2026, 0, -1)).toEqual({year: 2025, month: 11});
    expect(addMonths(2026, 11, 1)).toEqual({year: 2027, month: 0});
    expect(addMonths(2026, 8, -14)).toEqual({year: 2025, month: 6});
  });
});

describe('a month as a grid', () => {
  const today = new Date(2026, 8, 26); // Saturday 26 September 2026

  it('lays out the real month, not thirty cells', () => {
    const grid = monthGrid(2026, 8, {today});

    expect(grid.label).toBe('September 2026');
    expect(grid.days).toHaveLength(30);
    expect(grid.startsOn).toBe(1);
    expect(grid.days[0].iso).toBe('2026-09-01');
  });

  it('marks tomorrow onwards as future, and today as not', () => {
    const grid = monthGrid(2026, 8, {today});

    expect(grid.days[25].date).toBe(26);
    expect(grid.days[25].future).toBeFalsy();
    expect(grid.days[26].future).toBe(true);
    expect(grid.days[29].future).toBe(true);
  });

  it('treats a day with no entry as nothing logged', () => {
    const grid = monthGrid(2026, 8, {
      today,
      marks: {'2026-09-02': 'over', '2026-09-03': 'under'},
    });

    expect(grid.days[1].mark).toBe('over');
    expect(grid.days[2].mark).toBe('under');
    expect(grid.days[0].mark).toBe('empty');
  });

  it('will not go forward out of the month containing today', () => {
    expect(monthGrid(2026, 8, {today}).canGoForward).toBe(false);
    expect(monthGrid(2026, 7, {today}).canGoForward).toBe(true);
    expect(monthGrid(2025, 11, {today}).canGoForward).toBe(true);
  });

  it('shows a past month whole, with nothing in it to come', () => {
    const grid = monthGrid(2026, 1, {today}); // February 2026

    expect(grid.days).toHaveLength(28);
    expect(grid.startsOn).toBe(6);
    expect(grid.days.every(d => !d.future)).toBe(true);
  });

  it('pads ISO dates so they sort and compare as strings', () => {
    expect(isoDate(2026, 8, 5)).toBe('2026-09-05');
    expect(isoDate(2026, 11, 25)).toBe('2026-12-25');
    expect('2026-09-05' < '2026-09-26').toBe(true);
    expect(monthLabel(2027, 0)).toBe('January 2027');
  });
});
