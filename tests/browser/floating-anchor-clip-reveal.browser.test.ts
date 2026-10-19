import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * 열린 팝업의 앵커를 가리던 클리핑 조상이 변해 앵커가 드러나면 `anchor-hidden` 이 풀려야 한다.
 *
 * `autoUpdate` 는 앵커·상자의 크기와 스크롤만 보므로, 앵커가 움직이지 않은 채 조상만 커지면 신호가 없다 —
 * 접힌 절이 펼쳐지는 동안 열린 `u-select` 가 앵커가 다 보이는데도 `visibility: hidden` 에 머물렀다.
 */

const settle = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms));

async function openSelectIn(parent: HTMLElement): Promise<{ select: USelect; popover: UPopover }> {
  const select = document.createElement('u-select') as USelect;
  for (let i = 0; i < 3; i++) {
    const option = document.createElement('u-option');
    option.setAttribute('value', `v${i}`);
    option.textContent = `옵션 ${i}`;
    select.appendChild(option);
  }
  parent.appendChild(select);
  document.body.appendChild(parent);
  await select.updateComplete;
  (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(150);
  return { select, popover: select.shadowRoot!.querySelector('u-popover') as UPopover };
}

describe('앵커를 가리던 조상이 변할 때의 anchor-hidden', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);
    await settle(100);
  });

  it('클리핑 조상이 커져 앵커가 드러나면 열린 채 보인다', async () => {
    const clip = document.createElement('div');
    clip.style.cssText = 'height:0;overflow:hidden';
    const { popover } = await openSelectIn(clip);
    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('anchor-hidden')).toBe(true);

    clip.style.height = '200px';
    await settle(300);

    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`).toBe('open=true hidden=false');
    expect(getComputedStyle(popover).visibility).toBe('visible');
  });

  it('클리핑 조상이 줄어 앵커를 다시 가리면 숨긴다 — 닫지는 않는다', async () => {
    const clip = document.createElement('div');
    clip.style.cssText = 'height:200px;overflow:hidden';
    const { popover } = await openSelectIn(clip);
    expect(popover.hasAttribute('anchor-hidden')).toBe(false);

    clip.style.height = '0px';
    await settle(300);

    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`).toBe('open=true hidden=true');
  });
});
