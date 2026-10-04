import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/textarea/UTextarea.js';

/**
 * `appearance="plain"` 필드는 쉬는 동안 외형이 없다 — 그래도 **포커스는 보여야 한다**(WCAG 2.4.7).
 * 종전(1.x `borderless` 부터)에는 포커스가 들어와도 `box-shadow: none` 이라 깜박이는 캐럿 말고는
 * 아무 표시가 없었다.
 */
const made: HTMLElement[] = [];
afterEach(() => { while (made.length) made.pop()!.remove(); });

for (const tag of ['u-input', 'u-textarea']) {
  describe(`${tag} appearance="plain"`, () => {
    it('🔴draws a focus ring while focused, nothing at rest', async () => {
      const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
      el.setAttribute('appearance', 'plain');
      document.body.appendChild(el);
      made.push(el);
      await el.updateComplete;
      const container = el.shadowRoot!.querySelector<HTMLElement>('.container')!;
      expect(getComputedStyle(container).outlineStyle).toBe('none');

      el.shadowRoot!.querySelector<HTMLElement>('input, textarea')!.focus();
      await new Promise((r) => requestAnimationFrame(r));
      const cs = getComputedStyle(container);
      expect(cs.outlineStyle).toBe('solid');
      expect(cs.outlineWidth).toBe('2px');
    });
  });
}
