import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/icon-button/UIconButton.js';
import '../../src/components/copy-button/UCopyButton.js';
import '../../src/components/breadcrumb-item/UBreadcrumbItem.js';

/**
 * 컨트롤을 감싼 요소의 `.focus()` 는 그 안의 컨트롤로 가야 한다 — `u-button` 과 같은 계약
 * (`button-focus-delegation`). 호스트는 포커스 가능하지 않으므로 위임이 없으면 오류 없이 무동작이다.
 * 대상은 전수 실측(2026-09-24)에서 «안에 컨트롤이 있는데 `.focus()` 가 닿지 않던» 요소 셋이다.
 */
function deepActive(): Element | null {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

async function mount(html: string): Promise<HTMLElement> {
  document.body.innerHTML = html;
  const el = document.body.firstElementChild as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  return el;
}

describe('control wrappers delegate focus', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  const CASES: [string, string, string][] = [
    ['u-icon-button', '<u-icon-button aria-label="Edit"></u-icon-button>', 'BUTTON'],
    ['u-copy-button', '<u-copy-button value="abc"></u-copy-button>', 'BUTTON'],
    ['u-breadcrumb-item (href)', '<u-breadcrumb-item href="#orders">Orders</u-breadcrumb-item>', 'A'],
  ];

  for (const [name, html, innerTag] of CASES) {
    it(`${name}: host.focus() reaches the inner <${innerTag.toLowerCase()}>`, async () => {
      const el = await mount(html);
      el.focus();
      expect(document.activeElement).toBe(el);
      expect(deepActive()?.tagName).toBe(innerTag);
    });
  }
});
