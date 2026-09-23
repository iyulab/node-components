import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/popover/UPopover.js';
import '../../src/components/select/USelect.js';
import '../../src/components/input/UInput.js';
import '../../src/components/option/UOption.js';
import '../../src/components/dialog/UDialog.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UInput } from '../../src/components/input/UInput.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';

/**
 * Escape 는 «그것을 실제로 처리한 쪽» 만 소비한다.
 *
 * `defaultPrevented` 는 *"위에서 누가 이 키를 먹었나"* 를 가리는 표준 신호다. 소비자가
 * 자기 패널을 Escape 로 닫을 때, 그 안에서 열린 목록·팝오버가 먼저 먹었으면 비켜서려고
 * 이 신호를 본다. 그 신호가 거짓말을 하면 우선순위를 가릴 방법이 없다.
 *
 * 결함: `UPopover` 는 `dismiss` 에 `escape` 가 있으면 **연결 시점에** document keydown
 * 리스너를 붙이고, 그 핸들러가 **열림 여부를 보지 않고** `preventDefault()` 했다. 팝오버
 * 인스턴스는 폼 컨트롤마다 하나씩 있으므로(select·input 제안·date-picker…), 화면에 팝오버가
 * 하나라도 **존재하기만** 하면 document 버블 시점의 Escape 는 언제나 `defaultPrevented` 였다.
 * 같은 형태가 `UInput` 에도 있었다 — 제안 목록이 닫혀 있어도 입력칸의 Escape 를 소비했다.
 *
 * 그리고 이 신호가 항상 참이었던 동안 우리 오버레이는 그것을 볼 수 없었다(보면 다이얼로그가
 * 영영 안 닫힌다). 그래서 다이얼로그 안의 열린 목록에서 Escape 를 누르면 **목록과 다이얼로그가
 * 함께** 닫혔다. 신호가 정직해지면 오버레이도 그것을 존중할 수 있다 — 한 번의 Escape 는 한 층만 닫는다.
 */

async function settle(ms = 150): Promise<void> {
  await new Promise(r => setTimeout(r, ms));
}

/** document 버블 단계에서 — 즉 라이브러리 리스너들이 다 돈 «뒤» 에 — Escape 가 소비됐는지 기록한다. */
function recordBubble(): { last: () => boolean | undefined; dispose: () => void } {
  let seen: boolean | undefined;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') seen = e.defaultPrevented;
  };
  window.addEventListener('keydown', onKey);
  return { last: () => seen, dispose: () => window.removeEventListener('keydown', onKey) };
}

function makeSelect(n = 3): USelect {
  const select = document.createElement('u-select') as USelect;
  for (let i = 0; i < n; i++) {
    const option = document.createElement('u-option');
    option.setAttribute('value', `v${i}`);
    option.textContent = `option ${i}`;
    select.appendChild(option);
  }
  return select;
}

describe('Escape 소비 — 처리한 쪽만 preventDefault 한다', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    await settle(50);
  });

  it('닫힌 팝오버가 여럿 있어도 Escape 는 소비되지 않는다', async () => {
    for (let i = 0; i < 5; i++) {
      const anchor = document.createElement('button');
      anchor.id = `anchor-${i}`;
      anchor.textContent = `anchor ${i}`;
      const popover = document.createElement('u-popover') as UPopover;
      popover.setAttribute('for', `#${anchor.id}`);
      popover.textContent = 'content';
      document.body.append(anchor, popover);
      await popover.updateComplete;
    }
    const probe = document.createElement('button');
    probe.textContent = 'probe';
    document.body.appendChild(probe);
    probe.focus();

    const rec = recordBubble();
    await userEvent.keyboard('{Escape}');
    rec.dispose();

    expect(rec.last()).toBe(false);
  });

  it('열린 팝오버는 Escape 를 소비하고 닫힌다', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'anchor-open';
    anchor.textContent = 'anchor';
    const popover = document.createElement('u-popover') as UPopover;
    popover.setAttribute('for', `#${anchor.id}`);
    popover.textContent = 'content';
    document.body.append(anchor, popover);
    await popover.updateComplete;

    anchor.click();
    await settle();
    expect(popover.open).toBe(true);

    const rec = recordBubble();
    await userEvent.keyboard('{Escape}');
    rec.dispose();
    await settle();

    expect(rec.last()).toBe(true);
    expect(popover.open).toBe(false);
  });

  it('u-input: 열린 제안 목록은 Escape 를 소비하고, 닫힌 뒤의 Escape 는 소비하지 않는다', async () => {
    const input = document.createElement('u-input') as UInput;
    for (let i = 0; i < 3; i++) {
      const option = document.createElement('u-option');
      option.setAttribute('value', `s${i}`);
      option.textContent = `suggestion ${i}`;
      input.appendChild(option);
    }
    document.body.appendChild(input);
    await input.updateComplete;
    await settle();

    // trigger="focus" — 입력에 들어가면 제안 목록이 열린다.
    const inner = input.shadowRoot!.querySelector('input') as HTMLInputElement;
    inner.focus();
    await settle();
    const popover = input.shadowRoot!.querySelector('u-popover') as UPopover;
    expect(popover.open).toBe(true);

    const rec = recordBubble();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(rec.last()).toBe(true);
    expect(popover.open).toBe(false);

    await userEvent.keyboard('{Escape}');
    rec.dispose();
    expect(rec.last()).toBe(false);
  });

  it('다이얼로그 안의 열린 목록: 첫 Escape 는 목록만, 두 번째가 다이얼로그를 닫는다', async () => {
    const dialog = document.createElement('u-dialog') as UDialog;
    const select = makeSelect();
    dialog.appendChild(select);
    document.body.appendChild(dialog);
    await dialog.updateComplete;
    dialog.show();
    await settle();
    expect(dialog.open).toBe(true);

    (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
    await settle();
    const popover = select.shadowRoot!.querySelector('u-popover') as UPopover;
    expect(popover.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(popover.open).toBe(false);
    expect(dialog.open).toBe(true);
    // 포커스는 숨은 목록 안이 아니라 콤보박스로 돌아와 있어야 한다.
    expect(select.matches(':focus-within')).toBe(true);
    expect(popover.matches(':focus-within')).toBe(false);

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog.open).toBe(false);
  });
});
