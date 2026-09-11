import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/option/UOption.js';

/**
 * `u-input` 콤보박스 목록은 **사용자가 입력에 있을 때만** 열린다.
 *
 * 종전에는 옵션 슬롯이 바뀔 때마다(`slotchange`) 목록을 열었다. 자동완성 결과가 타이핑 중에
 * 도착하는 경우에는 맞는 동작이지만, **정적 옵션**(스킬 문서의 예제가 정확히 그 형태다)으로
 * 처음 그려질 때도 열려서 — 포커스가 다른 곳에 있는데 — 목록이 페이지 위에 떠 있었다.
 * `trigger="focus"` 라 입력에 들렀다 나가기 전까지 닫히지도 않았다.
 */

const settle = (ms = 150) => new Promise((r) => setTimeout(r, ms));

async function mount(options: string[]): Promise<HTMLElement & { updateComplete: Promise<boolean> }> {
  const opts = options.map((v) => `<u-option value="${v}">${v}</u-option>`).join('');
  document.body.innerHTML = `<button id="elsewhere">x</button><u-input style="width:200px">${opts}</u-input>`;
  (document.getElementById('elsewhere') as HTMLButtonElement).focus();
  const input = document.querySelector('u-input') as HTMLElement & { updateComplete: Promise<boolean> };
  await input.updateComplete;
  await settle();
  return input;
}

const popover = (host: HTMLElement) => host.shadowRoot!.querySelector('u-popover') as HTMLElement & { open: boolean };
const field = (host: HTMLElement) => host.shadowRoot!.querySelector('input') as HTMLInputElement;

describe('u-input 콤보박스 — 목록은 사용자가 입력에 있을 때만 열린다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('🔴정적 옵션으로 처음 그려질 때 목록은 닫혀 있다 (포커스는 다른 곳)', async () => {
    const host = await mount(['apple', 'banana']);
    expect(document.activeElement?.id).toBe('elsewhere');
    expect(popover(host).open).toBe(false);
  });

  it('입력에 포커스하면 열린다', async () => {
    const host = await mount(['apple', 'banana']);
    field(host).focus();
    await settle();
    expect(popover(host).open).toBe(true);
  });

  it('입력에 있는 동안 옵션이 도착하면 열린다 — 자동완성은 그대로다', async () => {
    const host = await mount([]);
    field(host).focus();
    await settle();
    expect(popover(host).open, '옵션이 없으면 열리지 않는다').toBe(false);
    const option = document.createElement('u-option');
    option.setAttribute('value', 'cherry');
    option.textContent = 'cherry';
    host.appendChild(option);
    await settle();
    expect(popover(host).open).toBe(true);
  });

  it('입력에 없을 때 옵션이 도착해도 열리지 않는다', async () => {
    const host = await mount([]);
    const option = document.createElement('u-option');
    option.setAttribute('value', 'cherry');
    option.textContent = 'cherry';
    host.appendChild(option);
    await settle();
    expect(popover(host).open).toBe(false);
  });

  it('열린 목록에서 옵션이 모두 사라지면 닫힌다', async () => {
    const host = await mount(['apple']);
    field(host).focus();
    await settle();
    expect(popover(host).open).toBe(true);
    host.querySelectorAll('u-option').forEach((o) => o.remove());
    await settle();
    expect(popover(host).open).toBe(false);
  });
});
