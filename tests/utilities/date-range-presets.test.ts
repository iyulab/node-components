import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolvePresets, BUILTIN_PRESETS } from '../../src/components/date-range-picker/presets.js';
import { Locale } from '../../src/utilities/Locale.js';

// 2026-03-18 is a Wednesday. Weeks start on Sunday (the calendar grid's convention).
const TODAY = new Date(2026, 2, 18);
const iso = (name: keyof typeof BUILTIN_PRESETS) => resolvePresets([name], TODAY)[0];

describe('built-in date range presets', () => {
  beforeEach(() => Locale.set('en'));

  it.each([
    ['today', '2026-03-18', '2026-03-18'],
    ['yesterday', '2026-03-17', '2026-03-17'],
    ['last7Days', '2026-03-12', '2026-03-18'],
    ['last30Days', '2026-02-17', '2026-03-18'],
    ['thisWeek', '2026-03-15', '2026-03-21'],
    ['lastWeek', '2026-03-08', '2026-03-14'],
    ['thisMonth', '2026-03-01', '2026-03-31'],
    ['lastMonth', '2026-02-01', '2026-02-28'],
    ['thisYear', '2026-01-01', '2026-12-31'],
  ] as const)('%s → %s … %s (both ends inclusive)', (name, start, end) => {
    expect(iso(name)).toMatchObject({ start, end });
  });

  it('crosses a year boundary: last month in January is the previous December', () => {
    expect(resolvePresets(['lastMonth'], new Date(2026, 0, 10))[0]).toMatchObject({ start: '2025-12-01', end: '2025-12-31' });
    expect(resolvePresets(['lastWeek'], new Date(2026, 0, 2))[0]).toMatchObject({ start: '2025-12-21', end: '2025-12-27' });
  });

  it('a Sunday starts its own week', () => {
    expect(resolvePresets(['thisWeek'], new Date(2026, 2, 15))[0]).toMatchObject({ start: '2026-03-15', end: '2026-03-21' });
  });

  it('labels follow the active locale', () => {
    Locale.set('ko');
    expect(resolvePresets(['today', 'last7Days'], TODAY).map(p => p.label)).toEqual(['오늘', '최근 7일']);
  });
});

describe('app-defined presets', () => {
  beforeEach(() => Locale.set('en'));

  it('accept Date or ISO ends in either order and come out earliest first', () => {
    const [q] = resolvePresets([{ label: 'Q1', range: () => ['2026-03-31', new Date(2026, 0, 1)] }], TODAY);
    expect(q).toEqual({ label: 'Q1', start: '2026-01-01', end: '2026-03-31' });
  });

  it('keep the order they are listed in, mixed with built-ins', () => {
    const list = resolvePresets(['today', { label: 'Custom', range: () => ['2026-01-01', '2026-01-02'] }, 'yesterday'], TODAY);
    expect(list.map(p => p.label)).toEqual(['Today', 'Custom', 'Yesterday']);
  });

  it('⚪NEGATIVE — an unknown name is skipped and reported, not drawn', () => {
    const unknown = vi.fn();
    const list = resolvePresets(['today', 'lastFortnight' as never], TODAY, unknown);
    expect(list).toHaveLength(1);
    expect(unknown).toHaveBeenCalledWith('lastFortnight');
  });
});
