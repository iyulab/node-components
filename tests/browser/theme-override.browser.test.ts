import { describe, it, expect, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';

/**
 * `Theme.override(theme)` — 한 화면이 자기 바탕을 정한다(벽에 거는 보드는 어둡게). 사용자의 선호(`set()`)는 건드리지
 * 않는다: 걸린 동안 `get()` 은 선호 그대로, `resolved()` 와 `<html theme>` 은 걸린 값이고, 걷으면 선호로 돌아간다.
 * 걸린 동안 선호를 바꿔도(다른 탭의 설정 등) 화면은 걸린 값을 지킨다.
 * NEGATIVE: 걸지 않으면 종전대로 `set()` 이 곧 적용 테마다.
 */
const applied = () => document.documentElement.getAttribute('theme');

afterEach(() => {
  Theme.override(null);
  document.documentElement.removeAttribute('theme');
  document.documentElement.removeAttribute('data-theme');
});

describe('Theme.override', () => {
  it('applies a theme without touching the preference, and clearing it returns to the preference', () => {
    Theme.set('light');
    Theme.override('dark');
    expect(applied()).toBe('dark');
    expect(Theme.resolved()).toBe('dark');
    expect(Theme.get()).toBe('light');

    Theme.override(null);
    expect(applied()).toBe('light');
    expect(Theme.resolved()).toBe('light');
  });

  it('a preference set while overridden waits until the override is cleared', () => {
    Theme.set('light');
    Theme.override('dark');
    Theme.set('light');
    expect(applied()).toBe('dark');
    Theme.override(null);
    expect(applied()).toBe('light');
  });

  it('clearing under a system preference returns to the OS value', () => {
    Theme.set('system');
    const os = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    Theme.override(os === 'dark' ? 'light' : 'dark');
    expect(applied()).not.toBe(os);
    Theme.override(null);
    expect(applied()).toBe(os);
  });

  it('NEGATIVE — without an override, set() is the applied theme', () => {
    Theme.set('dark');
    expect(applied()).toBe('dark');
    Theme.set('light');
    expect(applied()).toBe('light');
  });
});
