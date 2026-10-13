import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UOption } from '../../src/components/option/UOption.js';
import { compose, commitWithEnter } from './ime.js';
import { axActive } from './ax.js';

/**
 * Enter in a searchable select's search box picks the first match (WAI-ARIA APG «list autocomplete with automatic
 * selection»). Typing «ap» and pressing Enter did nothing — the only way to the match was ArrowDown, then Enter. The
 * first visible option is now the active candidate: shown like a hovered option, announced through the search box's
 * `aria-activedescendant`, and picked by Enter. Keys are real (`userEvent`), composition is a real IME (CDP).
 */

const settle = (ms = 120) => new Promise(r => setTimeout(r, ms));

async function mount(values: string[], attrs: Record<string, string> = {}): Promise<USelect> {
  const select = document.createElement('u-select') as USelect;
  select.setAttribute('searchable', '');
  for (const [k, v] of Object.entries(attrs)) select.setAttribute(k, v);
  for (const v of values) {
    const option = document.createElement('u-option') as UOption;
    option.setAttribute('value', v);
    option.textContent = v;
    select.appendChild(option);
  }
  document.body.appendChild(select);
  await select.updateComplete;
  await settle();
  return select;
}

const searchBox = (s: USelect) => s.shadowRoot!.querySelector<HTMLInputElement>('.search-input input')!;
const option = (s: USelect, v: string) => s.querySelector<UOption>(`u-option[value="${v}"]`)!;
const isOpen = (s: USelect) => s.shadowRoot!.querySelector<HTMLElement & { open: boolean }>('u-popover')!.open;
const active = (s: USelect) => [...s.querySelectorAll<UOption>('u-option[active]')].map(o => o.value);

async function open(s: USelect) {
  await userEvent.click(s.shadowRoot!.querySelector('.container')!);
  await settle(250);
}

describe('u-select searchable — Enter picks the first match', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('typing makes the first match the active candidate, and Enter selects it and closes the list', async () => {
    const select = await mount(['banana', 'apple', 'apricot']);
    const changes: unknown[] = [];
    select.addEventListener('change', () => changes.push(select.value));
    await open(select);
    await userEvent.keyboard('ap');
    await settle();
    expect(active(select)).toEqual(['apple']);

    await userEvent.keyboard('{Enter}');
    await settle(250);
    expect(select.value).toBe('apple');
    expect(changes).toEqual(['apple']);
    expect(isOpen(select)).toBe(false);
    expect(active(select), 'no candidate once the list is closed').toEqual([]);
  });

  it('the candidate follows the query', async () => {
    const select = await mount(['banana', 'apple', 'apricot']);
    await open(select);
    await userEvent.keyboard('apr');
    await settle();
    expect(active(select)).toEqual(['apricot']);
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}b');
    await settle();
    expect(active(select)).toEqual(['banana']);
  });

  it('the search box points at the candidate (aria-activedescendant), and keeps the focus', async () => {
    const select = await mount(['banana', 'apple']);
    await open(select);
    await userEvent.keyboard('ap');
    await settle();
    const box = searchBox(select) as HTMLInputElement & { ariaActiveDescendantElement?: Element | null };
    expect(select.shadowRoot!.activeElement).toBe(box);
    expect(box.ariaActiveDescendantElement).toBe(option(select, 'apple'));
  });

  it('the accessibility tree resolves the search box to the candidate option — what a screen reader reads as current', async () => {
    const select = await mount(['banana', 'apple']);
    await open(select);
    await userEvent.keyboard('ap');
    await settle();
    const current = await axActive();
    expect(current?.role).toBe('option');
    expect(current?.name).toBe('apple');
  });

  it('NEGATIVE with no query there is no candidate, and Enter selects nothing', async () => {
    const select = await mount(['banana', 'apple']);
    await open(select);
    expect(active(select)).toEqual([]);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(select.value ?? '').toBe('');
  });

  it('a disabled option is not the candidate', async () => {
    const select = await mount(['apple', 'apricot']);
    option(select, 'apple').disabled = true;
    await open(select);
    await userEvent.keyboard('ap');
    await settle();
    expect(active(select)).toEqual(['apricot']);
  });

  it('in a multiple select Enter toggles the candidate and the list stays open', async () => {
    const select = await mount(['banana', 'apple'], { multiple: '' });
    await open(select);
    await userEvent.keyboard('ap');
    await settle();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(select.value).toEqual(['apple']);
    expect(isOpen(select)).toBe(true);
  });

  it('the Enter that commits an IME composition does not pick — it belongs to the input method', async () => {
    const select = await mount(['서울', '성남']);
    await open(select);
    searchBox(select).focus();
    await compose(['ㅅ', '서']);
    await settle();
    await commitWithEnter('서');
    await settle();
    expect(select.value ?? '').toBe('');
    expect(isOpen(select)).toBe(true);
    expect(active(select)).toEqual(['서울']);
  });

  it('options replaced by a remote search get a candidate as they arrive', async () => {
    const select = await mount([], { filter: 'none' });
    select.addEventListener('search', (e) => {
      const q = (e as CustomEvent<{ query: string }>).detail.query;
      setTimeout(() => {
        select.replaceChildren(...['north', 'south'].filter(v => v.includes(q)).map(v => {
          const o = document.createElement('u-option') as UOption;
          o.setAttribute('value', v);
          o.textContent = v;
          return o;
        }));
      }, 50);
    });
    await open(select);
    await userEvent.keyboard('so');
    await settle(250);
    expect(active(select)).toEqual(['south']);
    await userEvent.keyboard('{Enter}');
    await settle(250);
    expect(select.value).toBe('south');
  });
});
