import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

function createInput(attrs: Record<string, string> = {}): UInput {
  const input = document.createElement('u-input') as UInput;
  for (const [k, v] of Object.entries(attrs)) input.setAttribute(k, v);
  return input;
}

function trackChanges(el: UInput): { count: number; values: unknown[] } {
  const seen = { count: 0, values: [] as unknown[] };
  el.addEventListener('change', () => {
    seen.count++;
    seen.values.push(el.value);
  });
  return seen;
}

describe('UInput clearable — the clear button fires change and syncs the form value', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clicking the clear icon fires change exactly once and empties value', async () => {
    const input = createInput({ clearable: '', value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const seen = trackChanges(input);
    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await input.updateComplete;

    expect(seen.count).toBe(1);
    expect(seen.values).toEqual(['']);
    expect(input.value).toBe('');
  });

  it('without clearable, the clear icon itself does not render', async () => {
    const input = createInput({ value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    expect(clearIcon.hasAttribute('hidden')).toBe(true);
  });
});

describe('UInput — the submitted form value stays in sync across every value-change path', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; input: UInput } {
    const form = document.createElement('form');
    const input = createInput({ name: 'q', ...attrs });
    form.appendChild(input);
    document.body.appendChild(form);
    return { form, input };
  }

  it('reflects the initial value attribute alone (no blur) immediately in the submit value', async () => {
    const { form, input } = mountInForm({ value: 'hello' });
    await input.updateComplete;

    expect(new FormData(form).get('q')).toBe('hello');
  });

  it('reflects a programmatic .value= assignment (no blur) immediately in the submit value', async () => {
    const { form, input } = mountInForm();
    await input.updateComplete;

    input.value = 'typed via API';
    await input.updateComplete;

    expect(new FormData(form).get('q')).toBe('typed via API');
  });

  it('clicking the clear button also (no blur) immediately empties the submit value', async () => {
    const { form, input } = mountInForm({ clearable: '', value: 'hello' });
    await input.updateComplete;
    expect(new FormData(form).get('q')).toBe('hello');

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await input.updateComplete;

    expect(new FormData(form).get('q')).toBe('');
  });
});
