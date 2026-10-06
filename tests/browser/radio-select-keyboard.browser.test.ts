import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/radio/URadio.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { URadio } from '../../src/components/radio/URadio.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UOption } from '../../src/components/option/UOption.js';

/**
 * `u-radio` · `u-select` 의 키보드 계약 — 스킬 문서 «Keyboard» 절이 약속한 키를 **실제 키 입력**으로 누른다.
 *
 * 핸들러는 있었지만 그것을 누르는 시험이 없었다 — 문서와 동작이 갈려도 아무것도 실패하지 않는 자리다.
 * 결과는 공개 표면(`value` · `change` · 포커스가 어느 옵션에 있는가 · 팝업이 열렸는가)으로 잰다.
 */

async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function addOptions(host: HTMLElement, values: string[], disabled: string[] = []) {
  for (const v of values) {
    const o = document.createElement('u-option');
    o.setAttribute('value', v);
    if (disabled.includes(v)) o.setAttribute('disabled', '');
    o.textContent = `Option ${v}`;
    host.appendChild(o);
  }
}

const focusedValue = () => (document.activeElement as UOption | null)?.getAttribute?.('value') ?? null;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('u-radio — 키보드', () => {
  async function mountRadio(values: string[], disabled: string[] = [], value?: string) {
    const before = document.createElement('button');
    before.textContent = 'before';
    const radio = document.createElement('u-radio') as URadio;
    radio.setAttribute('label', 'Plan');
    if (value !== undefined) radio.value = value;
    addOptions(radio, values, disabled);
    const after = document.createElement('button');
    after.textContent = 'after';
    document.body.append(before, radio, after);
    await settle(radio);
    const changes: (string | undefined)[] = [];
    radio.addEventListener('change', () => changes.push(radio.value));
    return { radio, before, after, changes };
  }

  it('그룹은 Tab 정지점이 하나다 — 선택된 옵션에 멈추고, 다음 Tab 은 그룹을 떠난다', async () => {
    const { before, after } = await mountRadio(['a', 'b', 'c'], [], 'b');
    before.focus();
    await userEvent.tab();
    expect(focusedValue()).toBe('b');
    await userEvent.tab();
    expect(document.activeElement).toBe(after);
  });

  it('ArrowDown·ArrowRight 는 다음 옵션으로 포커스와 선택을 함께 옮기고 끝에서 처음으로 감는다', async () => {
    const { radio, before, changes } = await mountRadio(['a', 'b', 'c'], [], 'b');
    before.focus();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect([radio.value, focusedValue()]).toEqual(['c', 'c']);
    await userEvent.keyboard('{ArrowRight}');
    expect([radio.value, focusedValue()]).toEqual(['a', 'a']);
    expect(changes).toEqual(['c', 'a']);
  });

  it('ArrowUp·ArrowLeft 는 이전 옵션으로 옮기고 처음에서 끝으로 감는다', async () => {
    const { radio, before, changes } = await mountRadio(['a', 'b', 'c'], [], 'b');
    before.focus();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    expect([radio.value, focusedValue()]).toEqual(['a', 'a']);
    await userEvent.keyboard('{ArrowLeft}');
    expect([radio.value, focusedValue()]).toEqual(['c', 'c']);
    expect(changes).toEqual(['a', 'c']);
  });

  it('Home·End 는 첫/마지막 옵션으로 옮긴다', async () => {
    const { radio, before } = await mountRadio(['a', 'b', 'c', 'd'], [], 'b');
    before.focus();
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    expect([radio.value, focusedValue()]).toEqual(['d', 'd']);
    await userEvent.keyboard('{Home}');
    expect([radio.value, focusedValue()]).toEqual(['a', 'a']);
  });

  it('비활성 옵션은 건너뛴다', async () => {
    const { radio, before } = await mountRadio(['a', 'b', 'c'], ['b'], 'a');
    before.focus();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(radio.value).toBe('c');
  });

  it('선택이 없으면 첫 활성 옵션에 멈추고, Space 가 그것을 고른다', async () => {
    const { radio, before, changes } = await mountRadio(['a', 'b'], ['a']);
    before.focus();
    await userEvent.tab();
    expect(focusedValue()).toBe('b');
    expect(radio.value).toBeFalsy();
    await userEvent.keyboard(' ');
    expect(radio.value).toBe('b');
    expect(changes).toEqual(['b']);
  });
});

describe('u-select — 키보드', () => {
  async function mountSelect(values: string[], attrs: Record<string, string> = {}) {
    const before = document.createElement('button');
    before.textContent = 'before';
    const select = document.createElement('u-select') as USelect;
    select.setAttribute('label', 'Fruit');
    for (const [k, v] of Object.entries(attrs)) select.setAttribute(k, v);
    addOptions(select, values);
    document.body.append(before, select);
    await settle(select);
    const changes: unknown[] = [];
    select.addEventListener('change', () => changes.push(select.value));
    const container = select.shadowRoot!.querySelector('.container') as HTMLElement;
    const popover = select.shadowRoot!.querySelector('u-popover') as HTMLElement & { open: boolean };
    return { select, before, container, popover, changes };
  }

  /** 팝오버의 열기·자동 포커스는 다음 프레임 뒤에 끝난다. */
  const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  async function openWithKey(before: HTMLElement, key = '{Enter}') {
    before.focus();
    await userEvent.tab();
    await userEvent.keyboard(key);
    await frames();
  }

  it('콤보박스에서 Enter 가 목록을 열고 첫 옵션에 포커스한다', async () => {
    const { before, popover } = await mountSelect(['a', 'b', 'c']);
    await openWithKey(before);
    expect(popover.open).toBe(true);
    expect(focusedValue()).toBe('a');
  });

  it('옵션 위 ArrowDown·ArrowUp 은 감으며 이동하고 Home·End 는 양 끝으로 간다 — 값은 바뀌지 않는다', async () => {
    const { select, before, changes } = await mountSelect(['a', 'b', 'c']);
    await openWithKey(before);
    await userEvent.keyboard('{ArrowDown}');
    expect(focusedValue()).toBe('b');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(focusedValue()).toBe('c');
    await userEvent.keyboard('{Home}');
    expect(focusedValue()).toBe('a');
    await userEvent.keyboard('{End}');
    expect(focusedValue()).toBe('c');
    expect(select.value).toBeFalsy();
    expect(changes).toEqual([]);
  });

  it('Enter 가 옵션을 고르고 닫으며 포커스를 콤보박스로 되돌린다', async () => {
    const { select, before, container, popover, changes } = await mountSelect(['a', 'b', 'c']);
    await openWithKey(before);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await frames();
    expect(select.value).toBe('b');
    expect(changes).toEqual(['b']);
    expect(popover.open).toBe(false);
    expect(select.shadowRoot!.activeElement).toBe(container);
  });

  it('Space 도 옵션을 고르고 닫는다', async () => {
    const { select, before, popover, changes } = await mountSelect(['a', 'b', 'c']);
    await openWithKey(before);
    await userEvent.keyboard('{End} ');
    await frames();
    expect(select.value).toBe('c');
    expect(changes).toEqual(['c']);
    expect(popover.open).toBe(false);
  });

  it('multiple — Space 는 한 번 누를 때 한 번만 토글하고 목록을 닫지 않는다', async () => {
    const { select, before, popover, changes } = await mountSelect(['a', 'b', 'c'], { multiple: '' });
    await openWithKey(before);
    await userEvent.keyboard(' ');
    expect(select.value).toEqual(['a']);
    await userEvent.keyboard('{ArrowDown} ');
    expect(select.value).toEqual(['a', 'b']);
    await userEvent.keyboard(' ');
    expect(select.value).toEqual(['a']);
    expect(changes.length).toBe(3);
    expect(popover.open).toBe(true);
  });

  it('multiple — 긴 목록에서 Space 는 토글만 하고 목록을 스크롤하지 않는다', async () => {
    const values = Array.from({ length: 40 }, (_, i) => `v${i}`);
    const { select, before, popover } = await mountSelect(values, { multiple: '' });
    await openWithKey(before);
    const scrollers = [popover, ...popover.shadowRoot!.querySelectorAll<HTMLElement>('*')]
      .filter(el => el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflowY !== 'visible');
    expect(scrollers.length).toBeGreaterThan(0);
    const tops = () => scrollers.map(el => el.scrollTop);
    const start = tops();
    await userEvent.keyboard(' ');
    await frames();
    expect(select.value).toEqual(['v0']);
    expect(tops()).toEqual(start);
  });

  it('Escape 는 고르지 않고 닫으며 포커스를 콤보박스로 되돌린다', async () => {
    const { select, before, container, popover, changes } = await mountSelect(['a', 'b', 'c']);
    await openWithKey(before);
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await frames();
    expect(popover.open).toBe(false);
    expect(select.value).toBeFalsy();
    expect(changes).toEqual([]);
    expect(select.shadowRoot!.activeElement).toBe(container);
  });

  describe('searchable', () => {
    const searchInput = (select: USelect) =>
      select.shadowRoot!.querySelector('.search-input input') as HTMLInputElement;

    it('열면 검색칸에 포커스한다 — ArrowDown 은 첫 옵션, ArrowUp 은 마지막 옵션으로', async () => {
      const { select, before } = await mountSelect(['a', 'b', 'c'], { searchable: '' });
      await openWithKey(before);
      expect(select.shadowRoot!.activeElement).toBe(searchInput(select));
      await userEvent.keyboard('{ArrowUp}');
      expect(focusedValue()).toBe('c');

      searchInput(select).focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(focusedValue()).toBe('a');
    });

    it('걸러진 목록에서는 보이는 옵션만 오간다', async () => {
      const { select, before } = await mountSelect(['apple', 'banana', 'apricot'], { searchable: '' });
      await openWithKey(before);
      await userEvent.keyboard('ap');
      await userEvent.keyboard('{ArrowDown}');
      expect(focusedValue()).toBe('apple');
      await userEvent.keyboard('{ArrowDown}');
      expect(focusedValue()).toBe('apricot');
      await userEvent.keyboard('{Enter}');
      await frames();
      expect(select.value).toBe('apricot');
    });

    it('검색칸의 Escape 는 닫고 콤보박스로 돌아간다', async () => {
      const { select, before, container, popover } = await mountSelect(['a', 'b'], { searchable: '' });
      await openWithKey(before);
      await userEvent.keyboard('{Escape}');
      await frames();
      expect(popover.open).toBe(false);
      expect(select.shadowRoot!.activeElement).toBe(container);
    });
  });
});
