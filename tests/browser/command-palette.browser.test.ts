import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/command-palette/UCommandPalette.js';
import type { UCommandPalette, CommandSource, CommandItem, UCommandPaletteCommandDetail } from '../../src/components/command-palette/UCommandPalette.js';
import { filterCommands } from '../../src/components/command-palette/UCommandPalette.js';
import { Locale } from '../../src/utilities/Locale.js';
import { axActive } from './ax.js';

/**
 * `u-command-palette` — a search field in a dialog (APG combobox) over a listbox grouped by source. Opening focuses the
 * field and asks every source with the empty query; typing asks again after `debounce`, aborting the previous request;
 * a failing or slow source does not hold back the others. ↑/↓ move, Enter chooses (`command`, cancelable), Escape closes
 * and focus returns to where it was.
 */

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const SCREENS: CommandItem[] = [
  { id: 'orders', label: 'Orders', href: '#orders' },
  { id: 'customers', label: 'Customers', href: '#customers', description: 'Sales' },
  { id: 'invoices', label: 'Invoices', keywords: ['billing'] },
];

function staticSource(id: string, label: string, items: CommandItem[]): CommandSource & { calls: string[] } {
  const calls: string[] = [];
  return { id, label, calls, search: (q) => { calls.push(q); return filterCommands(items, q); } };
}

async function mount(sources: CommandSource[], attrs = ''): Promise<UCommandPalette> {
  document.body.insertAdjacentHTML('beforeend', `<button id="opener">open</button><u-command-palette ${attrs}></u-command-palette>`);
  const el = document.querySelector('u-command-palette') as UCommandPalette;
  el.sources = sources;
  await el.updateComplete;
  return el;
}

async function open(el: UCommandPalette) {
  const opener = document.getElementById('opener') as HTMLButtonElement;
  opener.focus();
  el.show();
  await el.updateComplete;
  await wait(80);
}

const input = (el: UCommandPalette) => el.shadowRoot!.querySelector<HTMLInputElement>('input.input')!;
const labels = (el: UCommandPalette) => [...el.shadowRoot!.querySelectorAll('.option-label')].map(n => n.textContent);
const groups = (el: UCommandPalette) => [...el.shadowRoot!.querySelectorAll('.group-label')].map(n => n.textContent);
const status = (el: UCommandPalette) => el.shadowRoot!.querySelector('.status')!.textContent!.trim();

describe('u-command-palette', () => {
  beforeEach(() => { document.body.innerHTML = ''; Locale.set('en'); });
  afterEach(() => { document.body.innerHTML = ''; });

  it('opening focuses the field and lists every source for the empty query, grouped in source order', async () => {
    const screens = staticSource('screens', 'Screens', SCREENS);
    const actions = staticSource('actions', 'Actions', [{ id: 'new', label: 'New order' }]);
    const el = await mount([screens, actions]);
    await open(el);
    expect(el.shadowRoot!.activeElement).toBe(input(el));
    expect(screens.calls).toEqual(['']);
    expect(groups(el)).toEqual(['Screens', 'Actions']);
    expect(labels(el)).toEqual(['Orders', 'Customers', 'Invoices', 'New order']);
  });

  it('typing filters after the debounce (label, description, keywords) and the first match is the candidate', async () => {
    const screens = staticSource('screens', 'Screens', SCREENS);
    const el = await mount([screens], 'debounce="60"');
    await open(el);
    await userEvent.keyboard('bill');
    expect(screens.calls).toEqual(['']);
    await wait(150);
    expect(screens.calls.at(-1)).toBe('bill');
    expect(labels(el)).toEqual(['Invoices']);
    const current = await axActive();
    expect(current?.role).toBe('option');
    expect(current?.name).toContain('Invoices');
  });

  it('a new query aborts the previous request', async () => {
    const signals: AbortSignal[] = [];
    const slow: CommandSource = {
      id: 'records', label: 'Records',
      search: (q, { signal }) => { signals.push(signal); return new Promise(r => setTimeout(() => r(q ? [{ id: q, label: `Order ${q}` }] : []), 200)); },
    };
    const el = await mount([slow], 'debounce="0"');
    await open(el);
    input(el).value = 'a';
    input(el).dispatchEvent(new Event('input'));
    await wait(20);
    input(el).value = 'ab';
    input(el).dispatchEvent(new Event('input'));
    await wait(300);
    expect(signals.slice(0, -1).every(s => s.aborted)).toBe(true);
    expect(signals.at(-1)!.aborted).toBe(false);
    expect(labels(el)).toEqual(['Order ab']);
  });

  it('a failing source says so in its place; the other source still shows its results', async () => {
    const failing: CommandSource = { id: 'records', label: 'Records', search: () => Promise.reject(new Error('503')) };
    const screens = staticSource('screens', 'Screens', SCREENS);
    const el = await mount([failing, screens]);
    await open(el);
    await wait(50);
    expect(el.shadowRoot!.querySelector('.error')!.textContent).toBe("Couldn't search Records");
    expect(labels(el)).toEqual(['Orders', 'Customers', 'Invoices']);
  });

  it('nothing found says so', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)], 'debounce="0"');
    await open(el);
    await userEvent.keyboard('zzz');
    await wait(60);
    expect(labels(el)).toEqual([]);
    expect(status(el)).toBe('No matches');
  });

  it('arrows move the candidate (wrapping) and Enter chooses it: command fires, the palette closes, focus returns', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)]);
    const chosen: UCommandPaletteCommandDetail[] = [];
    el.addEventListener('command', (e) => { e.preventDefault(); chosen.push(e.detail); });
    await open(el);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect((await axActive())?.name).toContain('Invoices');
    await userEvent.keyboard('{ArrowDown}');
    expect((await axActive())?.name).toContain('Orders');
    await userEvent.keyboard('{ArrowUp}{Enter}');
    await wait(80);
    expect(chosen.map(d => [d.source, d.item.id])).toEqual([['screens', 'invoices']]);
    expect(el.open).toBe(false);
    expect(document.activeElement?.id).toBe('opener');
  });

  it('a click chooses the item under the pointer', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)]);
    const chosen: string[] = [];
    el.addEventListener('command', (e) => { e.preventDefault(); chosen.push(e.detail.item.id); });
    await open(el);
    const options = el.shadowRoot!.querySelectorAll<HTMLElement>('.option');
    await userEvent.click(options[1]);
    expect(chosen).toEqual(['customers']);
  });

  it('Escape closes without choosing', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)]);
    let fired = 0;
    el.addEventListener('command', () => fired++);
    await open(el);
    await userEvent.keyboard('{Escape}');
    await wait(80);
    expect(el.open).toBe(false);
    expect(fired).toBe(0);
    expect(document.activeElement?.id).toBe('opener');
  });

  it('the field is a named combobox controlling the listbox; the dialog is named', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)], 'label="Find anything"');
    await open(el);
    const field = input(el);
    expect(field.getAttribute('role')).toBe('combobox');
    expect(field.getAttribute('aria-label')).toBe('Find anything');
    expect(el.shadowRoot!.getElementById(field.getAttribute('aria-controls')!)?.getAttribute('role')).toBe('listbox');
    expect(el.getAttribute('role')).toBe('dialog');
    expect(el.getAttribute('aria-label')).toBe('Find anything');
  });

  it('IME: the Enter that commits a composition does not choose', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)]);
    let fired = 0;
    el.addEventListener('command', (e) => { e.preventDefault(); fired++; });
    await open(el);
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, composed: true }));
    expect(fired).toBe(0);
  });

  it('reopening starts from an empty field', async () => {
    const el = await mount([staticSource('screens', 'Screens', SCREENS)], 'debounce="0"');
    await open(el);
    await userEvent.keyboard('ord');
    el.hide();
    await el.updateComplete;
    await open(el);
    expect(input(el).value).toBe('');
    expect(labels(el)).toEqual(['Orders', 'Customers', 'Invoices']);
  });
});
