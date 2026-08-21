import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/chip/UChip.js';
import '../../src/components/tab/UTab.js';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/panel/UPanel.js';
import type { UChip } from '../../src/components/chip/UChip.js';
import type { UTab } from '../../src/components/tab/UTab.js';
import type { UTabPanel } from '../../src/components/tab-panel/UTabPanel.js';

afterEach(() => {
  document.body.innerHTML = '';
});

/** `document.activeElement`는 중첩 shadow DOM을 뚫고 내려가지 않고 가장 바깥쪽
 *  호스트에서 멈춘다 — 실제 포커스된 리프 엘리먼트를 보려면 `shadowRoot.activeElement`를
 *  재귀적으로 따라가야 한다. */
function deepActiveElement(): Element | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) {
    el = el.shadowRoot.activeElement;
  }
  return el;
}

/**
 * `tabindex="-1"`가 안쪽 네이티브 `<button>`의 `tabIndex` 프로퍼티(값은 여전히 `0`)와
 * 무관하게 실제 브라우저 Tab 순회에서는 그 버튼을 완전히 건너뛴다(cycle-328 실측) —
 * 마우스로만 지울 수 있고, 대체 컨테이너 레벨 키보드 경로도 없었다(순수 갭, 의도된
 * 설계 아님).
 */
describe('UChip — removable 버튼이 키보드로 도달·활성화된다', () => {
  it('Tab으로 remove 버튼에 도달하고 Enter로 remove 이벤트가 발생한다', async () => {
    document.body.innerHTML = `<input id="before" /><u-chip removable id="chip">Label</u-chip>`;
    const chip = document.getElementById('chip') as UChip;
    await chip.updateComplete;

    let removed = false;
    chip.addEventListener('remove', () => { removed = true; });

    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.tab();

    const removeBtnHost = chip.shadowRoot!.querySelector('.remove-btn') as HTMLElement;
    const removeBtnInner = removeBtnHost.shadowRoot!.querySelector('button');
    expect(deepActiveElement()).toBe(removeBtnInner);

    await userEvent.keyboard('{Enter}');
    expect(removed).toBe(true);
  });
});

describe('UTab — removable 닫기 버튼이 키보드로 도달·활성화된다', () => {
  function createPanel(): UTabPanel {
    document.body.innerHTML = `
      <u-tab-panel id="panel">
        <u-tab slot="tab" value="a" removable id="tab-a">Tab A</u-tab>
        <u-panel value="a">Content A</u-panel>
      </u-tab-panel>
    `;
    return document.getElementById('panel') as UTabPanel;
  }

  it('탭에 포커스된 상태에서 Tab을 누르면 닫기 버튼에 도달한다', async () => {
    const panel = createPanel();
    await panel.updateComplete;
    const tab = document.getElementById('tab-a') as UTab;
    tab.focus();
    expect(document.activeElement).toBe(tab);

    await userEvent.tab();

    const closeBtnHost = tab.shadowRoot!.querySelector('.remove-btn') as HTMLElement;
    const closeBtnInner = closeBtnHost.shadowRoot!.querySelector('button');
    expect(deepActiveElement()).toBe(closeBtnInner);
  });

  it('닫기 버튼에서 Enter를 누르면 remove 이벤트가 발생하고 탭이 제거된다', async () => {
    const panel = createPanel();
    await panel.updateComplete;
    const tab = document.getElementById('tab-a') as UTab;

    let removed = false;
    tab.addEventListener('remove', () => { removed = true; });

    tab.focus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(removed).toBe(true);
  });
});
