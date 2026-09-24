import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/button/UButton.js';

/**
 * `u-button` 의 `.focus()` 는 내부 네이티브 `<button>`/`<a>` 로 위임돼야 한다.
 *
 * 호스트 자신은 포커스 가능하지 않으므로, 위임이 없으면 `el.focus()` 는 **아무 일도 하지
 * 않는다** — 오류도 없이. 네이티브 버튼을 대체하는 요소가 `.focus()` 계약을 잃으면, 포커스를
 * 옮겨야 하는 모든 호출자(오버레이가 열린 뒤의 초기 포커스, 닫힌 뒤의 복원)가 조용히 실패한다.
 * 정석은 `delegatesFocus` 다 — 호스트가 `:focus` 를 받고, 실제 포커스는 섀도 안의 컨트롤이 쥔다.
 */
describe('u-button focus delegation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(attrs: Record<string, string> = {}): Promise<HTMLElement> {
    const el = document.createElement('u-button');
    el.textContent = 'Save';
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  it('host.focus() focuses the inner native <button>', async () => {
    const el = await mount();
    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('button'));
    expect(el.matches(':focus')).toBe(true);
  });

  it('with href, host.focus() focuses the inner <a>', async () => {
    const el = await mount({ href: '/docs' });
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('a'));
  });

  it('a disabled button still cannot take focus', async () => {
    const el = await mount({ disabled: '' });
    el.focus();
    expect(document.activeElement).not.toBe(el);
  });
});
