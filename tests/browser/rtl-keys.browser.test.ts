import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/index.js';

/**
 * 「`dir="rtl"` 에서 가로 화살표 키는 **화면 방향**을 따른다」 — 네이티브 라디오 묶음 · WAI-ARIA APG 와 같다. 가로로 늘어선 것은 RTL 에서
 * 시작이 오른쪽이므로 왼쪽 키가 «다음» 이고, 트리/메뉴의 펼침은 «끝 쪽» 화살표(RTL 은 왼쪽)다. 세로 키(↑/↓)는 방향과 무관하다.
 *
 * 합성 `keydown` 은 포커스가 어디에 있는지를 건너뛰므로(실제로 누르는 키는 포커스된 요소에서 출발한다) 실제 `userEvent.keyboard` 로 누르고
 * 섀도 안까지 따라가 포커스를 읽는다.
 */

afterEach(() => { document.documentElement.dir = 'ltr'; document.body.innerHTML = ''; });

const deep = (): Element | null => {
  let a = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function render(dir: 'ltr' | 'rtl', markup: string): Promise<void> {
  document.documentElement.dir = dir;
  document.body.innerHTML = `<div style="width:500px">${markup}</div>`;
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await sleep(120);
}

describe('RTL — 가로 이동 키는 화면 방향이다', () => {
  it.each([['ltr', 'ArrowRight', 'b'], ['ltr', 'ArrowLeft', 'c'], ['rtl', 'ArrowLeft', 'b'], ['rtl', 'ArrowRight', 'c']] as const)(
    'u-tab-panel · %s: 탭 a 에서 %s 를 누르면 탭 %s 로 간다',
    async (dir, key, expected) => {
      await render(dir, `<u-tab-panel><u-tab slot="tab" value="a">A</u-tab><u-tab slot="tab" value="b">B</u-tab><u-tab slot="tab" value="c">C</u-tab>
        <u-panel value="a">a</u-panel><u-panel value="b">b</u-panel><u-panel value="c">c</u-panel></u-tab-panel>`);
      (document.querySelector('u-tab[value="a"]') as HTMLElement).focus();
      await userEvent.keyboard(`{${key}}`);
      await sleep(60);
      const active = deep();
      const tab = active?.closest('u-tab') ?? (active?.getRootNode() as ShadowRoot | undefined)?.host;
      expect(tab?.getAttribute('value'), `${dir} ${key}`).toBe(expected);
    });

  it.each([['ltr', 'ArrowRight', 'b'], ['ltr', 'ArrowLeft', 'c'], ['rtl', 'ArrowLeft', 'b'], ['rtl', 'ArrowRight', 'c']] as const)(
    'u-radio(가로) · %s: 옵션 a 에서 %s 를 누르면 옵션 %s 로 간다',
    async (dir, key, expected) => {
      await render(dir, `<u-radio orientation="horizontal" value="a"><u-option value="a">A</u-option><u-option value="b">B</u-option><u-option value="c">C</u-option></u-radio>`);
      (document.querySelector('u-option[value="a"]') as HTMLElement).focus();
      await userEvent.keyboard(`{${key}}`);
      await sleep(60);
      const a = deep();
      const opt = a?.closest('u-option') ?? (a?.getRootNode() as ShadowRoot | undefined)?.host;
      expect(opt?.getAttribute('value'), `${dir} ${key}`).toBe(expected);
    });

  // 트리: «끝 쪽» 화살표가 펼침 · «시작 쪽» 이 접기/부모. LTR 은 → / ← , RTL 은 ← / → .
  it.each([['ltr', 'ArrowRight', 'ArrowLeft'], ['rtl', 'ArrowLeft', 'ArrowRight']] as const)(
    'u-tree · %s: %s 가 접힌 항목을 펼치고 %s 가 접는다',
    async (dir, expand, collapse) => {
      await render(dir, '<u-tree><u-tree-item id="r" value="r">Root<u-tree-item value="c">Child</u-tree-item></u-tree-item></u-tree>');
      const root = document.getElementById('r') as HTMLElement & { expanded: boolean };
      root.focus();
      expect(root.expanded, '처음에는 접혀 있다').toBeFalsy();
      await userEvent.keyboard(`{${expand}}`);
      await sleep(60);
      expect(root.expanded, `${dir}: ${expand} 로 펼침`).toBe(true);
      await userEvent.keyboard(`{${collapse}}`);
      await sleep(60);
      expect(root.expanded, `${dir}: ${collapse} 로 접힘`).toBe(false);
    });

  // 달력: 격자가 RTL 로 흐르므로 «다음 날» 은 화면의 왼쪽이다.
  it.each([['ltr', 'ArrowRight', '2026-11-16'], ['ltr', 'ArrowLeft', '2026-11-14'], ['rtl', 'ArrowLeft', '2026-11-16'], ['rtl', 'ArrowRight', '2026-11-14']] as const)(
    'u-calendar · %s: 15일에서 %s 를 누르면 %s 에 포커스가 간다',
    async (dir, key, expected) => {
      await render(dir, '<u-calendar value="2026-11-15"></u-calendar>');
      const cal = document.querySelector('u-calendar')!;
      (cal.shadowRoot!.querySelector('[data-iso="2026-11-15"]') as HTMLElement).focus();
      await userEvent.keyboard(`{${key}}`);
      await sleep(80);
      expect((deep() as HTMLElement | null)?.getAttribute('data-iso'), `${dir} ${key}`).toBe(expected);
    });
});

describe('RTL — 메뉴 · 달력 격자 · 하위 팝오버', () => {
  it.each([['ltr', 'ArrowRight', 'ArrowLeft'], ['rtl', 'ArrowLeft', 'ArrowRight']] as const)(
    'u-menu · %s: %s 가 하위 메뉴를 펼치고 %s 가 접는다',
    async (dir, expand, collapse) => {
      await render(dir, '<u-menu><u-menu-item id="m1">One</u-menu-item><u-menu-item id="m2">Two<u-menu-item slot="children">Sub</u-menu-item></u-menu-item></u-menu>');
      const two = document.getElementById('m2') as HTMLElement & { expanded: boolean };
      two.focus();
      await userEvent.keyboard(`{${expand}}`);
      await sleep(60);
      expect(two.expanded, `${dir}: ${expand} 로 펼침`).toBe(true);
      await userEvent.keyboard(`{${collapse}}`);
      await sleep(60);
      expect(two.expanded, `${dir}: ${collapse} 로 접힘`).toBe(false);
    });

  it('u-calendar 의 격자는 RTL 에서 다음 날이 왼쪽에 놓인다(키가 화면을 따라가는 근거)', async () => {
    await render('rtl', '<u-calendar value="2026-11-15"></u-calendar>');
    const root = document.querySelector('u-calendar')!.shadowRoot!;
    const d15 = root.querySelector('[data-iso="2026-11-15"]')!.getBoundingClientRect();
    const d16 = root.querySelector('[data-iso="2026-11-16"]')!.getBoundingClientRect();
    expect(d16.left, '16일은 15일의 왼쪽').toBeLessThan(d15.left);
  });

  it.each([['ltr', 'right-start'], ['rtl', 'left-start']] as const)(
    'u-menu-item · %s: 하위 메뉴 팝오버는 %s 로 열린다',
    async (dir, expected) => {
      await render(dir, '<u-menu><u-menu-item id="m2">Two<u-menu-item slot="children">Sub</u-menu-item></u-menu-item></u-menu>');
      const popover = document.getElementById('m2')!.shadowRoot!.querySelector('u-popover')!;
      expect(popover.getAttribute('placement')).toBe(expected);
    });
});
