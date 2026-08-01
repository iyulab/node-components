import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tag/UTag.js';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * 매트릭스를 접을 때 두 가지 방법이 있었고, **관측 가능한 차이**가 있다.
 *
 *  - `u-tag`      — 색 규칙이 **별도 슬롯**(`--tag-hue-solid`)을 채우고, variant 가
 *                   `var(--tag-hue-solid, var(--tag-fill-color))` 로 읽는다.
 *                   슬롯이 있으면 폴백은 발화하지 않으므로 **`color=` 가 최종 권한**이다.
 *  - `u-checkbox` — 같은 방식(`--checkbox-hue`).
 *
 * ⚠**처음에는 달랐다.** `u-checkbox` 를 접을 때 색 규칙이 채움색 훅 자체를 덮게 했더니,
 * 그 훅이 공개 `@cssprop` 이고 **호스트 요소에 대해서는 문서 작성자 스타일이 `:host()` 를
 * 이기므로**(이 페이즈 전체가 딛고 있는 비대칭), 소비자 CSS 가 `color=` 를 이겨 버렸다.
 * 리팩터 **전**에는 색 규칙이 훅이 아니라 소비되는 프로퍼티를 직접 세팅했으므로 그렇지
 * 않았다 — 즉 그것은 의미론 회귀였다. 슬롯 방식으로 되돌려 원래 동작과 `u-tag` 를 함께
 * 맞췄다. 이 테스트가 그 회귀를 막는다.
 */
describe('채움색 훅 오버라이드 vs color= (두 붕괴 방식의 차이)', () => {
  let sheet: HTMLStyleElement;

  beforeEach(() => {
    document.body.replaceChildren();
    sheet = document.createElement('style');
    document.head.appendChild(sheet);
  });
  afterEach(() => sheet.remove());

  const token = (n: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  async function mount(tag: string, attrs: Record<string, string>) {
    const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('u-tag: 소비자가 --tag-fill-color 를 덮어도 color= 가 이긴다 (슬롯 방식)', async () => {
    sheet.textContent = 'u-tag { --tag-fill-color: rgb(255, 0, 128); }';
    const el = await mount('u-tag', { color: 'green', variant: 'solid' });
    expect(
      getComputedStyle(el).getPropertyValue('--tag-bg-color').trim(),
      'color="green" 이 유지돼야 한다 — 슬롯이 채워져 폴백이 발화하지 않는다',
    ).toBe(token('--u-green-500'));
  });

  it('u-checkbox: 소비자가 --checkbox-fill-color 를 덮어도 color= 가 이긴다 (u-tag 와 동일)', async () => {
    sheet.textContent = 'u-checkbox { --checkbox-fill-color: rgb(255, 0, 128); }';
    const el = await mount('u-checkbox', { color: 'green', variant: 'filled', checked: '' });
    expect(
      getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(),
      'color="green" 이 유지돼야 한다 — 슬롯이 채워져 폴백이 발화하지 않는다',
    ).toBe(token('--u-green-600'));
  });

  it('color 를 지정하지 않은(기본 blue) 경우에는 채움색 훅이 먹는다', async () => {
    // 슬롯 방식의 반대 방향 확인 — 슬롯이 비면 폴백이 발화해야 한다.
    sheet.textContent =
      'u-tag { --tag-fill-color: rgb(255, 0, 128); } u-checkbox { --checkbox-fill-color: rgb(255, 0, 128); }';
    const tag = await mount('u-tag', { variant: 'solid' });            // color 미지정 = neutral
    const cb = await mount('u-checkbox', { variant: 'filled', checked: '' }); // color 기본 = blue
    expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim()).toBe('rgb(255, 0, 128)');
    expect(getComputedStyle(cb).getPropertyValue('--checkbox-border-color').trim()).toBe('rgb(255, 0, 128)');
  });

  it('훅을 덮지 않으면 둘 다 color= 를 따른다', async () => {
    const tag = await mount('u-tag', { color: 'green', variant: 'solid' });
    const cb = await mount('u-checkbox', { color: 'green', variant: 'filled', checked: '' });
    expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim())
      .toBe(token('--u-green-500'));
    expect(getComputedStyle(cb).getPropertyValue('--checkbox-border-color').trim())
      .toBe(token('--u-green-600'));
  });
});
