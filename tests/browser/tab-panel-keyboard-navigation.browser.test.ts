import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/tab/UTab.js';
import type { UTabPanel } from '../../src/components/tab-panel/UTabPanel.js';
import type { UTab } from '../../src/components/tab/UTab.js';

/**
 * `u-tab-panel` 의 탭 키보드 내비게이션 회귀.
 *
 * ★**이 표면에는 회귀가 0건이었다**(cycle-474 실측 — `tests/**` 어디에도 `u-tab-panel` 의
 *   키 처리를 보는 것이 없었다). ESLint 10 의 신규 규칙 `no-useless-assignment` 가
 *   `handleTabKeydown` 의 죽은 초기화(`let targetIndex = -1`)를 지목해 그 자리를 고치면서,
 *   ***고치는 코드에 회귀가 없다는 사실이 함께 드러났다.***
 *
 * ⚠**이 파일이 고정하는 불변식**: `switch` 를 «빠져나가는» 모든 경로는 `return` 하고
 *   (`Enter`/` ` 와 `default`), 그 아래로 내려오는 모든 경로는 `targetIndex` 를 대입한다.
 *   그래서 초기값이 필요 없다 — 새 `case` 가 대입을 빠뜨리면 TS 의 확정 대입 분석이 막지만,
 *   ***`default` 를 지우는 변경은 TS 가 막지 못한다***(그러면 대입 없이 아래로 내려온다).
 *   아래 「모르는 키」 케이스가 그것을 잡는다.
 */

function pressKey(el: Element, key: string): KeyboardEvent {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e;
}

async function mount(placement: string, values: string[], disabled: string[] = []): Promise<{ panel: UTabPanel; tabs: UTab[] }> {
  const panel = document.createElement('u-tab-panel') as UTabPanel;
  if (placement) panel.setAttribute('placement', placement);
  for (const v of values) {
    const tab = document.createElement('u-tab') as UTab;
    tab.setAttribute('slot', 'tab');
    tab.setAttribute('value', v);
    if (disabled.includes(v)) tab.setAttribute('disabled', '');
    tab.textContent = v;
    panel.appendChild(tab);
  }
  document.body.appendChild(panel);
  await panel.updateComplete;
  // slotchange 는 마이크로태스크 뒤에 온다 — 그것이 탭 목록과 리스너를 만든다.
  await new Promise((r) => setTimeout(r, 0));
  await panel.updateComplete;
  const tabs = Array.from(panel.querySelectorAll('u-tab')) as UTab[];
  return { panel, tabs };
}

describe('u-tab-panel — 탭 키보드 내비게이션', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('첫 탭이 기본 선택된다 (슬롯이 채워질 때)', async () => {
    const { panel } = await mount('top', ['a', 'b', 'c']);
    expect(panel.value).toBe('a');
  });

  describe('가로 배치(top) — ArrowRight/ArrowLeft', () => {
    it('ArrowRight 가 다음 탭으로 옮긴다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      const e = pressKey(tabs[0], 'ArrowRight');
      await panel.updateComplete;
      expect(panel.value).toBe('b');
      expect(e.defaultPrevented).toBe(true);
    });

    it('ArrowLeft 가 이전 탭으로 옮긴다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[2], 'ArrowLeft');
      await panel.updateComplete;
      expect(panel.value).toBe('b');
    });

    it('마지막에서 ArrowRight 는 처음으로 순환한다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[2], 'ArrowRight');
      await panel.updateComplete;
      expect(panel.value).toBe('a');
    });

    it('처음에서 ArrowLeft 는 마지막으로 순환한다 — 음수 인덱스가 나오지 않는다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[0], 'ArrowLeft');
      await panel.updateComplete;
      expect(panel.value).toBe('c');
    });

    it('가로 배치에서 ArrowDown/ArrowUp 은 아무 일도 하지 않는다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      const e = pressKey(tabs[0], 'ArrowDown');
      await panel.updateComplete;
      expect(panel.value).toBe('a');
      expect(e.defaultPrevented).toBe(false);
    });
  });

  describe('세로 배치(left) — ArrowDown/ArrowUp', () => {
    it('ArrowDown 이 다음 탭으로 옮긴다', async () => {
      const { panel, tabs } = await mount('left', ['a', 'b', 'c']);
      pressKey(tabs[0], 'ArrowDown');
      await panel.updateComplete;
      expect(panel.value).toBe('b');
    });

    it('ArrowUp 이 이전 탭으로 옮긴다', async () => {
      const { panel, tabs } = await mount('left', ['a', 'b', 'c']);
      pressKey(tabs[1], 'ArrowUp');
      await panel.updateComplete;
      expect(panel.value).toBe('a');
    });

    it('세로 배치에서 ArrowRight/ArrowLeft 는 아무 일도 하지 않는다', async () => {
      const { panel, tabs } = await mount('left', ['a', 'b', 'c']);
      const e = pressKey(tabs[0], 'ArrowRight');
      await panel.updateComplete;
      expect(panel.value).toBe('a');
      expect(e.defaultPrevented).toBe(false);
    });
  });

  describe('Home / End', () => {
    it('Home 이 첫 탭으로 간다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[2], 'Home');
      await panel.updateComplete;
      expect(panel.value).toBe('a');
    });

    it('End 가 마지막 탭으로 간다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[0], 'End');
      await panel.updateComplete;
      expect(panel.value).toBe('c');
    });
  });

  describe('Enter / Space — 옮기지 않고 «지금 탭»을 고른다', () => {
    it('Enter 가 현재 탭을 선택한다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[2], 'Enter');
      await panel.updateComplete;
      expect(panel.value).toBe('c');
    });

    it('Space 가 현재 탭을 선택한다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      pressKey(tabs[1], ' ');
      await panel.updateComplete;
      expect(panel.value).toBe('b');
    });
  });

  describe('비활성 탭은 «건너뛰는» 것이 아니라 «목록에 없다»', () => {
    it('disabled 탭은 이동 대상에서 빠진다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c'], ['b']);
      pressKey(tabs[0], 'ArrowRight');
      await panel.updateComplete;
      expect(panel.value).toBe('c');
    });

    it('disabled 탭에서 누른 키는 무시된다 — 그 탭은 enabled 목록에 없다', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c'], ['b']);
      const e = pressKey(tabs[1], 'ArrowRight');
      await panel.updateComplete;
      expect(panel.value).toBe('a');
      expect(e.defaultPrevented).toBe(false);
    });
  });

  describe('⚪NEGATIVE — 다루지 않는 키는 통과시킨다', () => {
    it('모르는 키는 값을 바꾸지도 preventDefault 하지도 않는다 (switch 의 default: return)', async () => {
      const { panel, tabs } = await mount('top', ['a', 'b', 'c']);
      for (const key of ['a', 'Tab', 'Escape', 'PageDown']) {
        const e = pressKey(tabs[0], key);
        await panel.updateComplete;
        expect(panel.value, `«${key}» 가 값을 바꿨다`).toBe('a');
        expect(e.defaultPrevented, `«${key}» 가 preventDefault 됐다`).toBe(false);
      }
    });
  });
});
