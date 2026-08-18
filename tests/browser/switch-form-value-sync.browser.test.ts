import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/switch/USwitch.js';
import type { USwitch } from '../../src/components/switch/USwitch.js';

function createSwitch(attrs: Record<string, string> = {}): USwitch {
  const el = document.createElement('u-switch') as USwitch;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; el: USwitch } {
  const form = document.createElement('form');
  const el = createSwitch({ name: 'q', ...attrs });
  form.appendChild(el);
  document.body.appendChild(form);
  return { form, el };
}

describe('USwitch — the submitted form value stays in sync across every checked-change path', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('reflects the initial checked attribute alone (no user click) immediately in the submit value', async () => {
    const { form, el } = mountInForm({ checked: '' });
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });

  it('reflects a programmatic .checked= assignment (no user click) immediately in the submit value', async () => {
    const { form, el } = mountInForm();
    await el.updateComplete;
    expect(new FormData(form).get('q')).toBe('false');

    el.checked = true;
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });
});
