import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/textarea/UTextarea.js';
import type { UTextarea } from '../../src/components/textarea/UTextarea.js';

function createTextarea(attrs: Record<string, string> = {}): UTextarea {
  const textarea = document.createElement('u-textarea') as UTextarea;
  for (const [k, v] of Object.entries(attrs)) textarea.setAttribute(k, v);
  return textarea;
}

function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; textarea: UTextarea } {
  const form = document.createElement('form');
  const textarea = createTextarea({ name: 'q', ...attrs });
  form.appendChild(textarea);
  document.body.appendChild(form);
  return { form, textarea };
}

describe('UTextarea — the submitted form value stays in sync across every value-change path', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('reflects the initial value attribute alone (no change event) immediately in the submit value', async () => {
    const { form, textarea } = mountInForm({ value: 'hello' });
    await textarea.updateComplete;

    expect(new FormData(form).get('q')).toBe('hello');
  });

  it('reflects a programmatic .value= assignment (no change event) immediately in the submit value', async () => {
    const { form, textarea } = mountInForm();
    await textarea.updateComplete;

    textarea.value = 'typed via API';
    await textarea.updateComplete;

    expect(new FormData(form).get('q')).toBe('typed via API');
  });
});
