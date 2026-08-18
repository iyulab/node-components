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

describe('UCheckbox — 폼 제출값이 checked 변경 경로 전부와 동기화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('초기 checked 속성만으로도(사용자 클릭 없이) 즉시 제출값에 반영된다', async () => {
    const { form, checkbox } = mountInForm({ checked: '' });
    await checkbox.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });

  it('프로그램적 .checked= 대입도(사용자 클릭 없이) 즉시 제출값에 반영된다', async () => {
    const { form, checkbox } = mountInForm();
    await checkbox.updateComplete;
    expect(new FormData(form).get('q')).toBe('false');

    checkbox.checked = true;
    await checkbox.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });
});
