import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UOption } from '../../src/components/option/UOption.js';
import { axTree, axString } from './ax.js';

/**
 * A searchable select's combobox is the edit field in its trigger (APG «editable combobox with list autocomplete»). In
 * that pattern the field's value *is* the combobox's value: closed, it holds the chosen option's text. It was always empty
 * — the chosen text was drawn by a sibling element over it — so the accessibility tree read «label, combobox, blank»
 * (WCAG 4.1.2). Typing replaces the text and becomes the query; closing or Escape puts the chosen text back.
 */

const settle = (ms = 120) => new Promise(r => setTimeout(r, ms));

async function mount(attrs: Record<string, string>, options: [string, string][]): Promise<USelect> {
  const select = document.createElement('u-select') as USelect;
  select.setAttribute('searchable', '');
  for (const [k, v] of Object.entries(attrs)) select.setAttribute(k, v);
  for (const [value, text] of options) {
    const option = document.createElement('u-option') as UOption;
    option.setAttribute('value', value);
    option.textContent = text;
    select.appendChild(option);
  }
  document.body.appendChild(select);
  await select.updateComplete;
  await settle();
  return select;
}

const LEVELS: [string, string][] = [['low', '낮음'], ['high', '높음'], ['urgent', '긴급']];
const field = (s: USelect) => s.shadowRoot!.querySelector<HTMLInputElement>('input.search')!;
const isOpen = (s: USelect) => s.shadowRoot!.querySelector<HTMLElement & { open: boolean }>('u-popover')!.open;

async function axCombobox(name: string) {
  const node = (await axTree()).find(n => !n.ignored && n.role?.value === 'combobox' && n.name?.value === name);
  return { value: axString(node?.value?.value), description: node?.description?.value ?? '' };
}

describe('u-select searchable — the closed combobox carries the chosen value', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('closed, the field holds the chosen option text and the accessibility tree reads it as the value', async () => {
    const select = await mount({ label: '보전 중요도', value: 'high' }, LEVELS);
    expect(field(select).value).toBe('높음');
    expect((await axCombobox('보전 중요도')).value).toBe('높음');
  });

  it('with nothing chosen the field is empty', async () => {
    const select = await mount({ label: '보전 중요도' }, LEVELS);
    expect(field(select).value).toBe('');
  });

  it('typing replaces the chosen text and searches only what was typed; Escape puts the chosen text back', async () => {
    const select = await mount({ label: '보전 중요도', value: 'high' }, LEVELS);
    const queries: string[] = [];
    select.addEventListener('search', (e) => queries.push((e as CustomEvent<{ query: string }>).detail.query));
    field(select).focus();
    await userEvent.keyboard('긴');
    await settle();
    expect(field(select).value).toBe('긴');
    expect(isOpen(select)).toBe(true);
    expect(queries.at(-1)).toBe('긴');
    expect(select.querySelector<UOption>('u-option[value="low"]')!.hidden).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle(250);
    expect(isOpen(select)).toBe(false);
    expect(field(select).value).toBe('높음');
    expect(select.value).toBe('high');
    expect(queries.at(-1)).toBe('');
  });

  it('picking an option leaves its text in the field', async () => {
    const select = await mount({ label: '보전 중요도', value: 'high' }, LEVELS);
    field(select).focus();
    await userEvent.keyboard('긴');
    await settle();
    await userEvent.keyboard('{Enter}');
    await settle(250);
    expect(select.value).toBe('urgent');
    expect(field(select).value).toBe('긴급');
    expect((await axCombobox('보전 중요도')).value).toBe('긴급');
  });

  it('a value set from code shows in the field, and a reset empties it', async () => {
    const select = await mount({ label: '보전 중요도', value: 'high' }, LEVELS);
    select.value = 'low';
    await select.updateComplete;
    expect(field(select).value).toBe('낮음');
    select.value = '';
    await select.updateComplete;
    expect(field(select).value).toBe('');
  });

  it('multiple: the field stays the search box and the chosen chips describe it', async () => {
    const select = await mount({ label: '담당', multiple: '' }, [['a', '김철수'], ['b', '이영희']]);
    select.value = ['a', 'b'];
    await select.updateComplete;
    await settle();
    expect(field(select).value).toBe('');
    const { description } = await axCombobox('담당');
    expect(description).toContain('김철수');
    expect(description).toContain('이영희');
  });
});
