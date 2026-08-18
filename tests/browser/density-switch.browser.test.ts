import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/button/UButton.js';
import '../../src/components/form/UForm.js';
import '../../src/components/button-group/UButtonGroup.js';

/**
 * --u-density 밀도 스위치의 수용 기준.
 *
 *   ⑴ 값을 지정하지 않으면 종전 렌더(14px)와 동일하다 (additive — 회귀 없음)
 *   ⑵ 지정하면 u-form/u-button-group/단독 u-button 이 전부 그 값을 font-size 로 받는다
 *   ⑶ u-button 의 size=sm/lg 명시값은 밀도 스위치의 영향을 받지 않는다(별도 축, 의도적)
 */
describe('--u-density 밀도 스위치', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
  });
  afterEach(() => {
    document.body.replaceChildren();
  });

  const fontSizeOf = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

  it('지정하지 않으면 u-button 기본값이 14px 그대로다', async () => {
    const el = document.createElement('u-button');
    el.textContent = '저장';
    document.body.append(el);
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(el)).toBe(14);
  });

  it('--u-density 를 걸면 u-form 아래 자식들이 함께 움직인다', async () => {
    const form = document.createElement('u-form');
    form.setAttribute('style', '--u-density: 13px');
    const btn = document.createElement('u-button');
    btn.textContent = '저장';
    form.append(btn);
    document.body.append(form);
    await (form as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    await (btn as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(form)).toBe(13);
    // u-button 은 font-size: inherit 가 아니라 자기 :host 에서 var(--u-density, 14px) 를
    // 직접 읽는다 — u-form 의 상속 경로와 무관하게 같은 커스텀 프로퍼티를 봐야 한다.
    expect(fontSizeOf(btn)).toBe(13);
  });

  it('--u-density 를 걸면 u-button-group 도 함께 움직인다', async () => {
    const group = document.createElement('u-button-group');
    group.setAttribute('style', '--u-density: 16px');
    const btn = document.createElement('u-button');
    btn.textContent = '저장';
    group.append(btn);
    document.body.append(group);
    await (group as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    await (btn as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(group)).toBe(16);
    expect(fontSizeOf(btn)).toBe(16);
  });

  it('size=sm/lg 명시값은 --u-density 의 영향을 받지 않는다(별도 축)', async () => {
    const wrap = document.createElement('div');
    wrap.setAttribute('style', '--u-density: 20px');
    const sm = document.createElement('u-button');
    sm.setAttribute('size', 'sm');
    sm.textContent = '저장';
    wrap.append(sm);
    document.body.append(wrap);
    await (sm as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(sm)).toBe(12);
  });
});
