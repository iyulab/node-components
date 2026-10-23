import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';

/**
 * 검색 가능한 선택의 트리거 배치 — 검색 입력이 트리거 안에 서므로(편집 가능한 콤보박스), 단일 선택은 표시 글자 위에 겹치고
 * 다중 선택은 칩 뒤에 이어 선다. 칩 묶음과 입력이 폭을 나누면 칩 묶음이 0 쪽으로 줄어 칩이 한 줄에 하나씩 쌓였다.
 */

const settle = (el: USelect) => el.updateComplete.then(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));

afterEach(() => { document.body.innerHTML = ''; });

describe('u-select searchable — 트리거 배치', () => {
  it('🔴다중 선택: 넓은 트리거에서 칩 둘은 한 줄에 선다', async () => {
    document.body.innerHTML = `<u-select searchable multiple value='["a","c"]' style="--u-select-display:block;width:320px">
      <u-option value="a">Apple</u-option><u-option value="b">Banana</u-option><u-option value="c">Cherry</u-option></u-select>`;
    const el = document.querySelector('u-select') as USelect;
    await settle(el);
    const chips = [...el.shadowRoot!.querySelectorAll('u-chip')].map((c) => c.getBoundingClientRect());
    expect(chips).toHaveLength(2);
    expect(Math.round(chips[1].top)).toBe(Math.round(chips[0].top));
  });

  it('단일 선택: 치는 동안 고른 값은 가려지고 친 글자만 보인다 · 닫으면 값이 돌아온다', async () => {
    document.body.innerHTML = `<u-select searchable value="b" style="--u-select-display:block;width:240px">
      <u-option value="a">Apple</u-option><u-option value="b">Banana</u-option></u-select>`;
    const el = document.querySelector('u-select') as USelect;
    await settle(el);
    const text = el.shadowRoot!.querySelector('.text-content') as HTMLElement;
    expect(getComputedStyle(text).visibility).toBe('visible');
    await userEvent.click(el);
    await userEvent.keyboard('ap');
    await settle(el);
    expect(getComputedStyle(text).visibility).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await settle(el);
    await new Promise((r) => setTimeout(r, 50));
    expect(getComputedStyle(text).visibility).toBe('visible');
  });
});
