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

describe('UTextarea — 폼 제출값이 value 변경 경로 전부와 동기화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('초기 value 속성만으로도(change 없이) 즉시 제출값에 반영된다', async () => {
    const { form, textarea } = mountInForm({ value: 'hello' });
    await textarea.updateComplete;

    expect(new FormData(form).get('q')).toBe('hello');
  });

  it('프로그램적 .value= 대입도(change 없이) 즉시 제출값에 반영된다', async () => {
    const { form, textarea } = mountInForm();
    await textarea.updateComplete;

    textarea.value = 'typed via API';
    await textarea.updateComplete;

    expect(new FormData(form).get('q')).toBe('typed via API');
  });
});
