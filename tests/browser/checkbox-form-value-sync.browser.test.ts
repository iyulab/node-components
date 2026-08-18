import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/checkbox/UCheckbox.js';
import type { UCheckbox } from '../../src/components/checkbox/UCheckbox.js';

function createCheckbox(attrs: Record<string, string> = {}): UCheckbox {
  const checkbox = document.createElement('u-checkbox') as UCheckbox;
  for (const [k, v] of Object.entries(attrs)) checkbox.setAttribute(k, v);
  return checkbox;
}

function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; checkbox: UCheckbox } {
  const form = document.createElement('form');
  const checkbox = createCheckbox({ name: 'q', ...attrs });
  form.appendChild(checkbox);
  document.body.appendChild(form);
  return { form, checkbox };
}

describe('UCheckbox — the submitted form value stays in sync across every checked-change path', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('reflects the initial checked attribute alone (no user click) immediately in the submit value', async () => {
    const { form, checkbox } = mountInForm({ checked: '' });
    await checkbox.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });

  it('reflects a programmatic .checked= assignment (no user click) immediately in the submit value', async () => {
    const { form, checkbox } = mountInForm();
    await checkbox.updateComplete;
    expect(new FormData(form).get('q')).toBe('false');

    checkbox.checked = true;
    await checkbox.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });
});
