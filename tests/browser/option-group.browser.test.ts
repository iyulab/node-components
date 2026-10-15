import { describe, it, expect, beforeEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/input/UInput.js';
import '../../src/components/option/UOption.js';
import '../../src/components/option-group/UOptionGroup.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UInput } from '../../src/components/input/UInput.js';
import type { UOption } from '../../src/components/option/UOption.js';
import type { UOptionGroup } from '../../src/components/option-group/UOptionGroup.js';

/**
 * `u-option-group` — the native `<optgroup>` for `u-select` and the `u-input` combobox. The heading is not an option:
 * it takes no focus and cannot be picked, the keyboard goes from the last option of one group to the first of the next,
 * the group is `role="group"` named by its label, and a group whose options a search filtered out disappears, heading
 * and all. Keys are real (`userEvent`).
 */

const settle = (ms = 120) => new Promise(r => setTimeout(r, ms));

const MARKUP = `
  <u-option value="all">Everything</u-option>
  <u-option-group label="Workspaces">
    <u-option value="w-north">North plant</u-option>
    <u-option value="w-south">South plant</u-option>
  </u-option-group>
  <u-option-group label="Monitors">
    <u-option value="m-press">Press line</u-option>
    <u-option value="m-oven">Curing oven</u-option>
  </u-option-group>`;

async function mountSelect(attrs = ''): Promise<USelect> {
  document.body.innerHTML = `<button id="before">before</button><u-select label="Context" ${attrs}>${MARKUP}</u-select>`;
  const select = document.querySelector('u-select') as USelect;
  await select.updateComplete;
  await settle();
  return select;
}

const group = (label: string) => document.querySelector<UOptionGroup>(`u-option-group[label="${label}"]`)!;
const shown = (el: Element) => getComputedStyle(el).display !== 'none';
const focusedValue = () => (document.activeElement as UOption | null)?.value;

/** Opens with the keyboard (Tab in, Enter) — the select focuses the first option, or the search box when searchable. */
async function open(_s: USelect) {
  (document.getElementById('before') as HTMLElement).focus();
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  await settle(250);
}

describe('u-option-group in u-select', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('is a group named by its label, the heading is not focusable, and the options are selectable', async () => {
    const select = await mountSelect();
    await open(select);
    const g = group('Monitors');
    expect(g.getAttribute('role')).toBe('group');
    expect(g.getAttribute('aria-label')).toBe('Monitors');
    await expect.element(page.getByRole('group', { name: 'Monitors' })).toBeInTheDocument();
    const heading = g.shadowRoot!.querySelector<HTMLElement>('[part="label"]')!;
    expect(heading.textContent).toBe('Monitors');
    expect(heading.tabIndex).toBe(-1);
    await userEvent.click(document.querySelector('u-option[value="m-oven"]')!);
    await settle();
    expect(select.value).toBe('m-oven');
  });

  it('the keyboard moves across groups option to option — headings are never a stop', async () => {
    const select = await mountSelect();
    await open(select);
    expect(focusedValue()).toBe('all');
    const visited: (string | undefined)[] = [];
    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard('{ArrowDown}');
      visited.push(focusedValue());
    }
    expect(visited).toEqual(['w-north', 'w-south', 'm-press', 'm-oven']);
  });

  it('a search that leaves no option in a group hides the group, heading included', async () => {
    const select = await mountSelect('searchable');
    await open(select);
    await userEvent.keyboard('oven');
    await settle(200);
    expect(shown(group('Workspaces'))).toBe(false);
    expect(shown(group('Monitors'))).toBe(true);
    expect([...document.querySelectorAll<UOption>('u-option')].filter((o) => !o.hidden).map((o) => o.value)).toEqual(['m-oven']);
    await userEvent.keyboard('{Backspace>4/}');
    await settle(200);
    expect(shown(group('Workspaces'))).toBe(true);
  });

  it('the heading takes no part in the search — a query matching only a label finds nothing', async () => {
    const select = await mountSelect('searchable');
    await open(select);
    await userEvent.keyboard('Monitors');
    await settle(200);
    expect(shown(group('Monitors'))).toBe(false);
    expect(shown(group('Workspaces'))).toBe(false);
  });

  it('options added to a group later are selectable too', async () => {
    const select = await mountSelect();
    const added = document.createElement('u-option') as UOption;
    added.value = 'm-cooler';
    added.textContent = 'Cooler';
    group('Monitors').appendChild(added);
    await settle();
    await open(select);
    await userEvent.click(added);
    await settle();
    expect(select.value).toBe('m-cooler');
  });
});

describe('u-option-group in the u-input combobox', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('an option inside a group picks its value', async () => {
    document.body.innerHTML = `<u-input>${MARKUP}</u-input>`;
    const input = document.querySelector('u-input') as UInput;
    await input.updateComplete;
    await settle();
    // trigger="focus" — entering the input opens the suggestions.
    input.shadowRoot!.querySelector('input')!.focus();
    await settle(250);
    await userEvent.click(document.querySelector('u-option[value="w-south"]')!);
    await settle();
    expect(input.value).toBe('w-south');
  });
});
