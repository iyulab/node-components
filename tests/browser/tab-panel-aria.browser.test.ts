import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/tab/UTab.js';
import '../../src/components/panel/UPanel.js';
import type { UTabPanel } from '../../src/components/tab-panel/UTabPanel.js';
import type { UTab } from '../../src/components/tab/UTab.js';
import type { UPanel } from '../../src/components/panel/UPanel.js';

/**
 * `u-tab-panel` 이 선택 상태를 보조기기 표면에 싣는가 — WAI-ARIA APG Tabs.
 *
 * 선택은 `active` 속성(스타일용)으로만 토글되고 있었다. 스크린리더는 «탭 목록 · 탭 둘» 까지만
 * 말하고 **어느 탭이 선택됐는지**, 아래 내용이 **어느 탭의 것인지**를 말하지 못했다(WCAG 4.1.2).
 * 모든 탭이 `tabindex=0` 이라 Tab 키도 탭마다 멈췄다.
 */
async function mount(selected = 'b', disabled: string[] = []): Promise<{ el: UTabPanel; tabs: UTab[]; panels: UPanel[] }> {
  const el = document.createElement('u-tab-panel') as UTabPanel;
  for (const v of ['a', 'b', 'c']) {
    const tab = document.createElement('u-tab') as UTab;
    tab.setAttribute('value', v);
    if (disabled.includes(v)) tab.setAttribute('disabled', '');
    tab.textContent = v.toUpperCase();
    el.appendChild(tab);
    const panel = document.createElement('u-panel') as UPanel;
    panel.setAttribute('value', v);
    panel.textContent = `panel ${v}`;
    el.appendChild(panel);
  }
  if (selected) el.value = selected;
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
  return {
    el,
    tabs: Array.from(el.querySelectorAll('u-tab')) as UTab[],
    panels: Array.from(el.querySelectorAll('u-panel')) as UPanel[],
  };
}

describe('u-tab-panel — ARIA', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('🔴the selected tab carries aria-selected="true", the others "false"', async () => {
    const { tabs } = await mount('b');
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
  });

  it('🔴roving tabindex — only the selected tab is a tab stop', async () => {
    const { tabs } = await mount('b');
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('a disabled selected tab hands the tab stop to the first enabled tab', async () => {
    const { tabs } = await mount('b', ['a', 'b']);
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
  });

  it('🔴panels are tabpanels linked both ways to their tab', async () => {
    const { tabs, panels } = await mount('b');
    tabs.forEach((tab, i) => {
      const panel = panels[i];
      expect(panel.getAttribute('role')).toBe('tabpanel');
      expect(tab.id).not.toBe('');
      expect(panel.id).not.toBe('');
      expect(tab.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    });
  });

  it('keeps ids the consumer gave', async () => {
    const el = document.createElement('u-tab-panel') as UTabPanel;
    el.innerHTML = '<u-tab value="x" id="my-tab">X</u-tab><u-panel value="x" id="my-panel">x</u-panel>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(el.querySelector('u-tab')!.getAttribute('aria-controls')).toBe('my-panel');
    expect(el.querySelector('u-panel')!.getAttribute('aria-labelledby')).toBe('my-tab');
  });

  it('🔴arrow keys move selection, aria-selected and the tab stop together; Tab leaves the list', async () => {
    const { el, tabs } = await mount('a');
    const before = document.createElement('button');
    before.textContent = 'before';
    document.body.insertBefore(before, el);
    const after = document.createElement('button');
    after.textContent = 'after';
    document.body.appendChild(after);

    before.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(tabs[0]);
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    // 한 번의 Tab 으로 탭 목록을 떠난다 — 나머지 탭에 멈추지 않는다(패널의 텍스트는 포커스 대상이 아니다).
    await userEvent.tab();
    expect(document.activeElement).toBe(after);
  });
});
