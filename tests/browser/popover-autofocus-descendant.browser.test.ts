import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/popover/UPopover.js';

/**
 * `u-popover[autofocus]` 는 «열릴 때 **내부의** 첫 번째 포커스 가능한 요소» 에 포커스한다.
 *
 * 종전 구현은 슬롯에 꽂힌 요소 **자신**만 봐서, 콘텐츠를 감싼 요소(`<div>`) 안의 입력은 찾지 못하고 팝오버 자신에
 * 포커스했다 — 문서가 약속한 것과 달랐다. 이제 자손(안쪽 `<slot>` 에 다시 꽂힌 요소까지)을 문서 순서로 찾는다.
 */

async function openWith(content: string): Promise<HTMLElement> {
  document.body.innerHTML =
    `<button id="anchor">Open</button><u-popover for="#anchor" autofocus>${content}</u-popover>`;
  const popover = document.querySelector('u-popover') as HTMLElement & { updateComplete: Promise<unknown> };
  await popover.updateComplete;
  await new Promise((r) => setTimeout(r, 30));
  (document.getElementById('anchor') as HTMLElement).click();
  for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) await new Promise((r) => setTimeout(r, 20));
  if (!popover.hasAttribute('open')) throw new Error('팝오버가 열리지 않았다');
  await new Promise((r) => setTimeout(r, 30));
  return popover;
}

describe('u-popover autofocus — 내부의 첫 포커스 가능 요소', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('감싼 요소 안의 입력에 포커스한다', async () => {
    await openWith('<div class="wrap"><label>Name <input id="inner"></label></div>');
    expect(document.activeElement?.id).toBe('inner');
  });

  it('꽂힌 요소 자신이 포커스 가능하면 종전처럼 그것이다', async () => {
    await openWith('<button id="first">A</button><button id="second">B</button>');
    expect(document.activeElement?.id).toBe('first');
  });

  it('⚪NEGATIVE — hidden 인 요소의 하위는 건너뛴다', async () => {
    await openWith('<div hidden><input id="skipped"></div><div><input id="taken"></div>');
    expect(document.activeElement?.id).toBe('taken');
  });

  it('⚪NEGATIVE — disabled 인 컨트롤과 tabindex=-1 은 건너뛴다', async () => {
    await openWith('<input id="d" disabled><span tabindex="-1" id="m">x</span><input id="ok">');
    expect(document.activeElement?.id).toBe('ok');
  });

  it('⚪NEGATIVE — 포커스 가능한 것이 없으면 콘텐츠 안으로 옮기지 않는다(종전과 같다 · 오류 없이)', async () => {
    // 이때 팝오버는 자기 자신에 `focus()` 를 부르지만 팝오버는 포커스 가능한 요소가 아니라 아무 일도 없다 —
    // 포커스는 연 쪽에 그대로 남는다.
    const popover = await openWith('<div><p>Just text</p></div>');
    expect(popover.contains(document.activeElement)).toBe(false);
  });
});
