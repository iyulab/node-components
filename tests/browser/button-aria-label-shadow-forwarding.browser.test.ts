import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/button/UButton.js';

/**
 * `<u-button aria-label="...">`는 호스트 속성으로는 정확히 붙지만, 실제 접근성
 * 트리에 노출되는 노드는 호스트가 아니라 shadow DOM 안의 네이티브 `<button>`/`<a>`다
 * — 섀도우 경계를 넘지 않으므로 호스트의 `aria-label`은 스크린리더에 닿지 않았다
 * (docket #75 실측, Playwright 접근성 스냅샷으로 재현: 속성은 있는데 접근 가능한
 * 이름이 빈 채로 `- button`만 나옴). `render()`가 이제 호스트의 `aria-label`을 읽어
 * 내부 네이티브 엘리먼트에 직접 옮긴다.
 */
describe('u-button aria-label shadow forwarding', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(attrs: Record<string, string> = {}): Promise<HTMLElement> {
    const el = document.createElement('u-button');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  it('호스트의 aria-label이 내부 네이티브 <button>에 그대로 옮겨진다', async () => {
    const el = await mount({ 'aria-label': 'Toggle sidebar' });
    const inner = el.shadowRoot!.querySelector('button');
    expect(inner).not.toBeNull();
    expect(inner!.getAttribute('aria-label')).toBe('Toggle sidebar');
  });

  it('href가 있으면(앵커 렌더) 내부 네이티브 <a>로 옮겨진다', async () => {
    const el = await mount({ 'aria-label': 'External docs', href: '/docs' });
    const inner = el.shadowRoot!.querySelector('a');
    expect(inner).not.toBeNull();
    expect(inner!.getAttribute('aria-label')).toBe('External docs');
  });

  it('aria-label 미지정 시 내부 엘리먼트에 빈 속성을 만들지 않는다', async () => {
    const el = await mount();
    const inner = el.shadowRoot!.querySelector('button');
    expect(inner!.hasAttribute('aria-label')).toBe(false);
  });

  it('연결 후 aria-label을 동적으로 세팅해도 반영된다(attributeChangedCallback 경유)', async () => {
    const el = await mount() as HTMLElement & { updateComplete: Promise<unknown> };
    el.setAttribute('aria-label', 'Added later');
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector('button');
    expect(inner!.getAttribute('aria-label')).toBe('Added later');
  });
});
