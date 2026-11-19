import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * 가려진 채 잰 `anchor-hidden` 이 낡아 열린 팝업이 보이지 않은 채 남지 않아야 한다.
 *
 * 조상 크기 변화(`floating-anchor-clip-reveal`)가 아니라 **앵커만** 클리핑 영역 안으로 들어오는 길 —
 * 라우트가 바뀐 직후 절이 아직 채워지는 중에 select 가 열렸다가, 위쪽 내용이 줄어 앵커가 드러난다.
 * 조상(클리핑 상자)의 크기도 앵커 자신의 크기도 변하지 않으므로 `autoUpdate` · 조상 `ResizeObserver` 어느 쪽도 신호가 없다.
 */

const settle = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms));

/** 고정 높이 클리핑 상자 안에, 위쪽 채움 + select 를 둔다. 열면 앵커는 상자 밖(채움 아래)에 있다. */
async function openBehindFiller(): Promise<{ clip: HTMLElement; filler: HTMLElement; popover: UPopover }> {
  const clip = document.createElement('div');
  clip.style.cssText = 'height:100px;overflow:hidden';
  const filler = document.createElement('div');
  filler.style.height = '300px';
  clip.appendChild(filler);

  const select = document.createElement('u-select') as USelect;
  for (let i = 0; i < 3; i++) {
    const option = document.createElement('u-option');
    option.setAttribute('value', `v${i}`);
    option.textContent = `옵션 ${i}`;
    select.appendChild(option);
  }
  clip.appendChild(select);
  document.body.appendChild(clip);
  await select.updateComplete;

  // 보이지 않는 앵커를 «방금 클릭한 것» 으로 흉내낸다 — 열기만 요구한다.
  (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(150);
  return { clip, filler, popover: select.shadowRoot!.querySelector('u-popover') as UPopover };
}

describe('낡은 anchor-hidden 의 자가 회복', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);
    await settle(100);
  });

  it('앵커만 클리핑 영역 안으로 들어오면(조상 크기 불변) 열린 채 보인다', async () => {
    const { clip, filler, popover } = await openBehindFiller();
    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('anchor-hidden')).toBe(true);
    const clipHeight = clip.getBoundingClientRect().height;

    filler.style.height = '0px';
    await settle(300);

    expect(clip.getBoundingClientRect().height).toBe(clipHeight);
    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`).toBe('open=true hidden=false');
    expect(getComputedStyle(popover).visibility).toBe('visible');
  });
});
