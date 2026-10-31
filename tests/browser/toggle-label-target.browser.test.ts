import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import type { UCheckbox } from '../../src/components/checkbox/UCheckbox.js';
import type { USwitch } from '../../src/components/switch/USwitch.js';

/**
 * **`u-checkbox` · `u-switch` — 보이는 줄 = 눌리는 줄.** 눌림을 받는 것은 안쪽 `<label>` 이다. 호스트의 하한
 * (`--u-target-size`, 터치 밀도 44px)만 키우면 호스트는 44px 인데 label 은 한 줄(19px)이라 위아래 띠가 눌리지 않았다.
 *
 * 재는 것: 그 띠의 한 점이 섀도 안에서 label 에 닿는가(`shadowRoot.elementFromPoint` — 닿는 순서) · 실제 클릭이 값을 바꾸는가.
 */

afterEach(() => document.body.replaceChildren());

async function mount<T extends HTMLElement>(tag: string, target: string): Promise<T> {
  const el = document.createElement(tag) as T & { label: string; updateComplete: Promise<unknown> };
  el.label = 'Accept terms';
  el.style.setProperty('--u-target-size', target);
  // 시험 창 왼쪽 가장자리 띠를 피한다(함정 19).
  el.style.marginInlineStart = '48px';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const wrapper = (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>('label.wrapper')!;

for (const tag of ['u-checkbox', 'u-switch'] as const) {
  describe(`${tag} — 하한 높이 전체가 눌린다`, () => {
    it('🔴터치 하한(44px)이면 label 이 44px 이상 · 호스트 위아래 띠가 label 에 닿는다', async () => {
      const el = await mount<UCheckbox | USwitch>(tag, '44px');
      const host = el.getBoundingClientRect();
      const label = wrapper(el).getBoundingClientRect();
      expect(host.height).toBeGreaterThanOrEqual(44);
      expect(label.height, 'label 이 하한 높이를 갖는다').toBeGreaterThanOrEqual(43.5);
      const x = host.left + 6;
      for (const y of [host.top + 2, host.bottom - 2]) {
        const hit = el.shadowRoot!.elementFromPoint(x, y);
        expect(hit && wrapper(el).contains(hit), `y=${Math.round(y - host.top)} 가 label 에 닿는다`).toBe(true);
      }
    });

    it('🔴위쪽 띠를 실제로 누르면 값이 바뀐다', async () => {
      const el = await mount<UCheckbox | USwitch>(tag, '44px');
      const before = el.checked;
      const host = el.getBoundingClientRect();
      // 위치 지정 클릭은 이 프로젝트에서 조용히 끝난다(함정 6) — 그 자리의 요소를 누른다.
      const hit = el.shadowRoot!.elementFromPoint(host.left + 6, host.top + 2) as HTMLElement;
      // 수정 전에는 이 점이 호스트(섀도 밖)였다 — 호스트를 누르면 가운데(label)가 눌려 값이 바뀌므로, 판별은 이 단언이 한다.
      expect(hit && wrapper(el).contains(hit), '위쪽 띠의 요소가 label 안').toBe(true);
      await userEvent.click(hit);
      expect(el.checked).toBe(!before);
    });

    it('⚪NEGATIVE — 하한이 없으면(기본 24px) 줄 높이는 종전과 같다', async () => {
      const el = await mount<UCheckbox | USwitch>(tag, '0px');
      expect(Math.round(el.getBoundingClientRect().height)).toBeLessThanOrEqual(26);
    });
  });
}
