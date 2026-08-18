import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UOption } from '../../src/components/option/UOption.js';
import type { UChip } from '../../src/components/chip/UChip.js';

// drains everything from slotchange → options(@state) update → the follow-up update.
async function settle(el: USelect) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function createSelect(values: string[], attrs: Record<string, string> = {}): USelect {
  const select = document.createElement('u-select') as USelect;
  for (const [k, v] of Object.entries(attrs)) select.setAttribute(k, v);
  for (const v of values) {
    const option = document.createElement('u-option');
    option.setAttribute('value', v);
    option.textContent = `Option ${v}`;
    select.appendChild(option);
  }
  return select;
}

function trackChanges(select: USelect): { count: number; values: unknown[] } {
  const seen = { count: 0, values: [] as unknown[] };
  select.addEventListener('change', () => {
    seen.count++;
    seen.values.push(select.value);
  });
  return seen;
}

describe('USelect change event semantics (fires only from user interaction)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('does not fire change during mount / option registration', async () => {
    const select = createSelect(['a', 'b', 'c']);
    const seen = trackChanges(select);
    document.body.appendChild(select);
    await settle(select);

    expect(seen.count).toBe(0);
    expect(select.value).toBeUndefined();
  });

  it('a value set before options register is preserved after registration, and change does not fire', async () => {
    const select = createSelect([]);
    const seen = trackChanges(select);
    select.value = 'b';
    document.body.appendChild(select);
    await select.updateComplete;

    // options register late, after mount (reproduces the React-wrapper scenario)
    for (const v of ['a', 'b', 'c']) {
      const option = document.createElement('u-option');
      option.setAttribute('value', v);
      option.textContent = `Option ${v}`;
      select.appendChild(option);
    }
    await settle(select);

    expect(select.value).toBe('b');
    expect(seen.count).toBe(0);
    const optionB = select.querySelector('u-option[value="b"]') as UOption;
    expect(optionB.selected).toBe(true);
  });

  it('a programmatic value change does not fire change, only syncs selected', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const seen = trackChanges(select);
    select.value = 'a';
    await settle(select);

    expect(seen.count).toBe(0);
    const optionA = select.querySelector('u-option[value="a"]') as UOption;
    expect(optionA.selected).toBe(true);
  });

  it('a user option click fires change exactly once, and value is already updated when the listener runs', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const seen = trackChanges(select);
    (select.querySelector('u-option[value="b"]') as UOption).click();
    await settle(select);

    expect(seen.count).toBe(1);
    expect(seen.values).toEqual(['b']);
    expect(select.value).toBe('b');
  });

  it('re-clicking the same option does not fire change', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const optionB = select.querySelector('u-option[value="b"]') as UOption;
    optionB.click();
    await settle(select);

    const seen = trackChanges(select);
    optionB.click();
    await settle(select);

    expect(seen.count).toBe(0);
    expect(select.value).toBe('b');
  });

  it('multiple: both an option-click toggle and chip removal fire change', async () => {
    const select = createSelect(['a', 'b'], { multiple: '' });
    document.body.appendChild(select);
    await settle(select);

    const seen = trackChanges(select);
    (select.querySelector('u-option[value="a"]') as UOption).click();
    await settle(select);
    (select.querySelector('u-option[value="b"]') as UOption).click();
    await settle(select);

    expect(seen.count).toBe(2);
    expect(select.value).toEqual(['a', 'b']);

    const chip = select.shadowRoot!.querySelector('u-chip[data-value="a"]') as UChip;
    expect(chip).toBeTruthy();
    chip.dispatchEvent(new Event('remove'));
    await settle(select);

    expect(seen.count).toBe(3);
    expect(select.value).toEqual(['b']);
  });

  it('clicking clearable\'s clear icon fires change and resets the value', async () => {
    const select = createSelect(['a', 'b'], { clearable: '' });
    document.body.appendChild(select);
    await settle(select);

    (select.querySelector('u-option[value="a"]') as UOption).click();
    await settle(select);

    const seen = trackChanges(select);
    const clearIcon = select.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(select);

    expect(seen.count).toBe(1);
    expect(select.value).toBe('');
  });
});
