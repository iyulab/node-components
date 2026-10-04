import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/button/UButton.js';
import '../../src/components/icon-button/UIconButton.js';
import type { UButton } from '../../src/components/button/UButton.js';
import type { UIconButton } from '../../src/components/icon-button/UIconButton.js';

/**
 * 버튼의 상태 ARIA 가 **포커스 대상**에 닿는가.
 *
 * `u-button` 은 호스트의 `aria-label` 만 안쪽 `<button>` 으로 옮기고 있었다. 호스트에
 * `aria-pressed`·`aria-expanded`·`aria-controls`·`aria-haspopup` 를 달아도 포커스가 가는 안쪽
 * 버튼에는 없어, 토글·접기 버튼의 상태가 보조기기에 전해지지 않았다(WCAG 4.1.2).
 */
const made: HTMLElement[] = [];
afterEach(() => { while (made.length) made.pop()!.remove(); });

async function mount<T extends HTMLElement>(html: string): Promise<T> {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  made.push(host);
  const el = host.firstElementChild as T & { updateComplete?: Promise<unknown> };
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

const innerOf = (el: UButton) => el.shadowRoot!.querySelector<HTMLElement>('button, a')!;

describe('u-button — state ARIA reaches the focus target', () => {
  it('🔴aria-pressed · aria-expanded · aria-haspopup are on the inner <button>', async () => {
    const el = await mount<UButton>('<u-button aria-pressed="true" aria-expanded="false" aria-haspopup="menu">Bold</u-button>');
    const inner = innerOf(el);
    expect(inner.getAttribute('aria-pressed')).toBe('true');
    expect(inner.getAttribute('aria-expanded')).toBe('false');
    expect(inner.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('🔴follows changes after connection, and removal', async () => {
    const el = await mount<UButton>('<u-button aria-expanded="false">Section</u-button>');
    el.setAttribute('aria-expanded', 'true');
    await el.updateComplete;
    expect(innerOf(el).getAttribute('aria-expanded')).toBe('true');
    el.removeAttribute('aria-expanded');
    await el.updateComplete;
    expect(innerOf(el).hasAttribute('aria-expanded')).toBe(false);
  });

  it('🔴aria-controls crosses the shadow boundary as an element reference', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<u-button aria-controls="sec-1" aria-expanded="true">Section</u-button><div id="sec-1">body</div>';
    document.body.appendChild(host);
    made.push(host);
    const el = host.querySelector('u-button') as UButton;
    await el.updateComplete;
    const inner = innerOf(el) as HTMLElement & { ariaControlsElements?: Element[] | null };
    if (!('ariaControlsElements' in inner)) return; // 요소 참조가 없는 엔진 — 옮기지 않는 것이 계약이다
    expect(inner.ariaControlsElements).toEqual([host.querySelector('#sec-1')]);
  });

  it('a link button gets expanded/haspopup but not aria-pressed (not allowed on links)', async () => {
    const el = await mount<UButton>('<u-button href="#x" aria-pressed="true" aria-expanded="true">Go</u-button>');
    const inner = innerOf(el);
    expect(inner.tagName).toBe('A');
    expect(inner.getAttribute('aria-expanded')).toBe('true');
    expect(inner.hasAttribute('aria-pressed')).toBe(false);
  });
});

describe('u-icon-button — the same states pass through to its button', () => {
  it('🔴aria-pressed and aria-controls reach the innermost <button>', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<u-icon-button name="star" aria-label="Star" aria-pressed="true" aria-controls="p1"></u-icon-button><div id="p1"></div>';
    document.body.appendChild(host);
    made.push(host);
    const el = host.querySelector('u-icon-button') as UIconButton;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('u-button') as UButton;
    await btn.updateComplete;
    const inner = innerOf(btn) as HTMLElement & { ariaControlsElements?: Element[] | null };
    expect(inner.getAttribute('aria-pressed')).toBe('true');
    expect(inner.getAttribute('aria-label')).toBe('Star');
    if ('ariaControlsElements' in inner) expect(inner.ariaControlsElements).toEqual([host.querySelector('#p1')]);
  });
});
