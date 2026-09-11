import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-select` 팝업의 ARIA 구조 (WAI-ARIA 1.2 · APG combobox).
 *
 * 종전 팝오버 자체가 `role="listbox"` 였고 검색 가능이면 그 안에 **검색 입력**이 있었다 — listbox 는 option(과
 * group)만 담는다. 이제 목록은 슬롯을 감싼 `div[role=listbox]` 이고, 검색 가능이면 입력과 목록을 함께 담는 팝업이
 * `role="dialog"` 다(«combobox with dialog popup»). 검색 불가 모드의 공개 계약(트리거 `aria-haspopup="listbox"`
 * · `aria-controls` → listbox)은 그대로다(`field-accessible-name.browser.test.ts`).
 */

type Select = HTMLElement & { updateComplete: Promise<unknown> };

async function mount(attrs = ''): Promise<Select> {
  document.body.innerHTML =
    `<u-select ${attrs} style="width:200px"><u-option value="a">A</u-option><u-option value="b">B</u-option></u-select>`;
  const el = document.querySelector('u-select') as Select;
  await el.updateComplete;
  return el;
}

async function open(el: Select): Promise<void> {
  (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
  const popover = el.shadowRoot!.querySelector('u-popover')!;
  for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) await new Promise((r) => setTimeout(r, 20));
  if (!popover.hasAttribute('open')) throw new Error('팝업이 열리지 않았다');
  await new Promise((r) => setTimeout(r, 30));
}

/** listbox 의 평탄화된 자식 — 안쪽 슬롯에 꽂힌 요소까지 펼친다. */
function flatChildren(listbox: Element): Element[] {
  return Array.from(listbox.children).flatMap((c) =>
    c instanceof HTMLSlotElement ? c.assignedElements({ flatten: true }) : [c]);
}

describe('u-select 팝업 구조', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Locale.set('en');
  });
  afterEach(() => Locale.set('en'));

  it('검색 불가: 트리거 → listbox · listbox 는 option 만 담는다 · 팝업 자체는 역할이 없다', async () => {
    const el = await mount('label="Fruit"');
    const trigger = el.shadowRoot!.querySelector('[role="combobox"]')!;
    const listbox = el.shadowRoot!.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(listbox.getAttribute('role')).toBe('listbox');
    expect(flatChildren(listbox).map((c) => c.getAttribute('role'))).toEqual(['option', 'option']);
    expect(el.shadowRoot!.querySelector('u-popover')!.hasAttribute('role')).toBe(false);
  });

  it('🔴검색 가능: 트리거 → dialog(이름 있음) · 그 안에 검색 입력과 listbox · listbox 는 option 만 담는다', async () => {
    const el = await mount('searchable label="Fruit"');
    const trigger = el.shadowRoot!.querySelector('[role="combobox"]')!;
    const dialog = el.shadowRoot!.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Fruit');

    const input = dialog.querySelector('.search-input input')!;
    const listbox = dialog.querySelector('[role="listbox"]')!;
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    expect(listbox.contains(input), '입력이 listbox 밖에 있어야 한다').toBe(false);
    expect(flatChildren(listbox).map((c) => c.getAttribute('role'))).toEqual(['option', 'option']);
  });

  it('검색 가능 · 레이블 없음: dialog 이름은 로케일의 «Search»', async () => {
    const el = await mount('searchable');
    expect(el.shadowRoot!.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe('Search');
  });

  it('다중 선택이면 listbox 가 aria-multiselectable 을 밝힌다', async () => {
    const single = await mount();
    expect(single.shadowRoot!.querySelector('[role="listbox"]')!.hasAttribute('aria-multiselectable')).toBe(false);
    const multi = await mount('multiple');
    expect(multi.shadowRoot!.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('true');
  });

  it('검색 불가: 열면 포커스가 첫 옵션으로 간다(종전과 같다)', async () => {
    const el = await mount();
    await open(el);
    expect(document.activeElement).toBe(el.querySelector('u-option'));
  });

  it('🔴검색 가능: 열면 포커스가 dialog 의 첫 컨트롤인 검색 입력으로 간다 · ↓ 로 첫 옵션 · Esc 로 닫힌다', async () => {
    const el = await mount('searchable');
    await open(el);
    const input = el.shadowRoot!.querySelector('.search-input input');
    expect(el.shadowRoot!.activeElement).toBe(input);

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(el.querySelector('u-option'));

    await userEvent.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 60));
    expect(el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open')).toBe(false);
  });

  it('검색 가능: 열자마자 타이핑하면 목록이 걸러진다', async () => {
    const el = await mount('searchable');
    await open(el);
    await userEvent.keyboard('b');
    const [a, b] = Array.from(el.querySelectorAll('u-option'));
    expect(a.hidden).toBe(true);
    expect(b.hidden).toBe(false);
  });
});
