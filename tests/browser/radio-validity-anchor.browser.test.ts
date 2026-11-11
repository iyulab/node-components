import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/radio/URadio.js';
import '../../src/components/option/UOption.js';
import type { URadio } from '../../src/components/radio/URadio.js';

/**
 * `u-radio` 의 `setValidity` 앵커 — 명세상 앵커는 호스트의 **shadow-including 자손**이어야 한다.
 *
 * 최신 Chromium 은 호스트 자신을 앵커로 받아 주지만 구형(120 대)은 `NotFoundError` 를 던지고, 그 예외가
 * `emitChange()` 의 `validate()` 를 끊어 `change` 가 발화하지 않았다(소비앱 보고). 실제 브라우저 판이 달라 이
 * 시험 환경에서는 재현되지 않으므로, 구형 브라우저의 검사를 `ElementInternals.setValidity` 대역으로 재현한다 —
 * 앵커가 자손이 아니면 던진다.
 */

afterEach(() => {
  document.body.innerHTML = '';
});

async function settle(el: URadio) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

describe('u-radio — setValidity 앵커', () => {
  it('앵커가 호스트의 shadow-including 자손이라 구형 Chromium 의 검사에서도 선택이 change 를 낸다', async () => {
    const el = document.createElement('u-radio') as URadio;
    for (const v of ['1', '2']) {
      const o = document.createElement('u-option');
      o.setAttribute('value', v);
      o.textContent = `Option ${v}`;
      el.appendChild(o);
    }
    document.body.appendChild(el);
    await settle(el);

    const internals = (el as unknown as { internals: ElementInternals }).internals;
    const anchors: Array<Element | undefined> = [];
    const original = internals.setValidity.bind(internals);
    internals.setValidity = (flags, message, anchor) => {
      anchors.push(anchor);
      if (anchor && !el.shadowRoot!.contains(anchor)) {
        throw new DOMException(
          "The Element argument should be a shadow-including descendant of the target element.",
          'NotFoundError',
        );
      }
      original(flags, message, anchor);
    };

    const changes: unknown[] = [];
    el.addEventListener('change', () => changes.push(el.value));

    await userEvent.click(el.querySelector('u-option[value="2"]') as HTMLElement);
    await settle(el);

    expect(changes).toEqual(['2']);
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) expect(a === undefined || el.shadowRoot!.contains(a)).toBe(true);
  });
});
