import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tag/UTag.js';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * 색 슬롯 — `color=` 가 **언제나** 최종 권한이다.
 *
 * `u-tag`(`--tag-hue-*`)·`u-checkbox`(`--checkbox-hue*`)는 색 규칙이 슬롯을 채우고 외형 규칙이
 * 슬롯을 읽는다. 2.0 전에는 «슬롯이 빈» 경로가 있었다 — 태그의 기본 `neutral`·체크박스의 기본
 * `blue` 는 규칙이 없어 채움 훅(`--tag-fill-color`·`--checkbox-fill-color`)을 거쳐 **브랜드**로
 * 칠해졌다. 즉 낱말(`neutral`·`blue`)이 제 뜻이 아니라 «색 미지정»을 뜻했다.
 * 이제 모든 값이 슬롯을 채우고 그 훅은 폐지됐다. 이 파일이 «빈 슬롯 경로가 되살아나지 않는다»를 지킨다.
 */
describe('색 슬롯 — 빈 슬롯 경로가 없다', () => {
  beforeEach(() => document.body.replaceChildren());

  const token = (n: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  async function mount(tag: string, attrs: Record<string, string>) {
    const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('맨 태그(기본 neutral)도 슬롯을 채운다 — 무채색이지 브랜드가 아니다', async () => {
    const tag = await mount('u-tag', { appearance: 'solid' });
    expect(getComputedStyle(tag).getPropertyValue('--tag-hue-solid').trim()).not.toBe('');
    expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim()).toBe(token('--u-neutral-700'));
  });

  it('맨 체크박스(기본 primary)는 브랜드를, blue 는 파랑을 칠한다', async () => {
    const bare = await mount('u-checkbox', { checked: '' });
    expect(bare.getAttribute('color')).toBe('primary');
    expect(getComputedStyle(bare).getPropertyValue('--checkbox-border-color').trim()).toBe(token('--u-primary-color'));
    const blue = await mount('u-checkbox', { color: 'blue', checked: '' });
    expect(getComputedStyle(blue).getPropertyValue('--checkbox-border-color').trim()).toBe(token('--u-blue-600'));
  });

  it('폐지된 채움 훅을 덮어도 아무것도 바뀌지 않는다', async () => {
    const sheet = document.createElement('style');
    sheet.textContent = 'u-tag { --tag-fill-color: rgb(255, 0, 128); } u-checkbox { --checkbox-fill-color: rgb(255, 0, 128); }';
    document.head.appendChild(sheet);
    try {
      const tag = await mount('u-tag', { appearance: 'solid' });
      const cb = await mount('u-checkbox', { checked: '' });
      expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim()).not.toBe('rgb(255, 0, 128)');
      expect(getComputedStyle(cb).getPropertyValue('--checkbox-border-color').trim()).not.toBe('rgb(255, 0, 128)');
    } finally {
      sheet.remove();
    }
  });

  it('색을 주면 둘 다 color= 를 따른다', async () => {
    const tag = await mount('u-tag', { color: 'green', appearance: 'solid' });
    const cb = await mount('u-checkbox', { color: 'green', appearance: 'solid', checked: '' });
    expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim()).toBe(token('--u-green-500'));
    expect(getComputedStyle(cb).getPropertyValue('--checkbox-border-color').trim()).toBe(token('--u-green-600'));
  });
});
