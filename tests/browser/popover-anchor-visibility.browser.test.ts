import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/popover/UPopover.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * 앵커가 클리핑 영역 밖으로 나갔을 때 팝오버 가시성.
 *
 * cycle-09 에서 `scroll` dismiss 가 실앵커를 더 이상 닫지 않게 되면서 드러난 케이스다.
 * `strategy="fixed"` 팝오버는 overflow 조상에 클립되지 않으므로(그것이 fixed 를 쓰는 이유 —
 * select-popover-strategy.browser.test.ts 참조), 앵커가 스크롤 패널 밖으로 나가도 팝오버만
 * 화면에 남아 무관한 콘텐츠 위를 덮을 수 있다. floating-ui `hide` middleware 로 숨기되
 * **닫지는 않아** 되돌려 스크롤하면 열린 상태 그대로 복귀한다.
 */

async function settle(ms = 200): Promise<void> {
  await new Promise(r => setTimeout(r, ms));
}

/** 스크롤 패널 안에 u-select 를 넣고 열어 반환한다. */
async function mountInScrollPanel(): Promise<{
  panel: HTMLElement;
  select: USelect;
  popover: UPopover;
}> {
  const panel = document.createElement('div');
  panel.style.height = '150px';
  panel.style.overflow = 'auto';
  panel.style.border = '1px solid gray';

  const select = document.createElement('u-select') as USelect;
  for (let i = 0; i < 3; i++) {
    const option = document.createElement('u-option');
    option.setAttribute('value', `v${i}`);
    option.textContent = `옵션 ${i}`;
    select.appendChild(option);
  }
  panel.appendChild(select);

  // 앵커를 패널 밖으로 밀어낼 수 있도록 아래에 여유 콘텐츠를 둔다
  const filler = document.createElement('div');
  filler.style.height = '1200px';
  panel.appendChild(filler);

  document.body.appendChild(panel);
  await select.updateComplete;

  const popover = select.shadowRoot!.querySelector('u-popover') as UPopover;
  (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(100);

  return { panel, select, popover };
}

describe('앵커 가시성에 따른 팝오버 숨김', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);
    await settle(150);
  });

  it('앵커가 스크롤 패널 밖으로 나가면 숨기고, 되돌아오면 열린 채 복귀한다', async () => {
    const { panel, popover } = await mountInScrollPanel();
    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('anchor-hidden')).toBe(false);

    // 앵커를 패널의 클리핑 영역 밖으로 완전히 밀어낸다
    panel.scrollTop = 600;
    await settle();

    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`)
      .toBe('open=true hidden=true');
    expect(getComputedStyle(popover).visibility).toBe('hidden');

    // 되돌리면 닫히지 않고 그대로 복귀해야 한다
    panel.scrollTop = 0;
    await settle();

    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`)
      .toBe('open=true hidden=false');
    expect(getComputedStyle(popover).visibility).toBe('visible');
  });

  it('앵커가 보이는 동안에는 anchor-hidden 이 붙지 않는다 — 회귀 방지', async () => {
    const { popover } = await mountInScrollPanel();

    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('anchor-hidden')).toBe(false);
    expect(getComputedStyle(popover).visibility).toBe('visible');
  });
});
