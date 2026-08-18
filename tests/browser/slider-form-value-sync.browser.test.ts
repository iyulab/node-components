import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/slider/USlider.js';
import type { USlider } from '../../src/components/slider/USlider.js';

function createSlider(attrs: Record<string, string> = {}): USlider {
  const el = document.createElement('u-slider') as USlider;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; el: USlider } {
  const form = document.createElement('form');
  const el = createSlider({ name: 'q', ...attrs });
  form.appendChild(el);
  document.body.appendChild(form);
  return { form, el };
}

describe('USlider — the submitted form value stays in sync across every value-change path', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('reflects the initial value attribute alone (no drag) immediately in the submit value', async () => {
    const { form, el } = mountInForm({ value: '30' });
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('30');
  });

  it('reflects a programmatic .value= assignment (no drag) immediately in the submit value', async () => {
    const { form, el } = mountInForm();
    await el.updateComplete;

    el.value = 42;
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('42');
  });
});
