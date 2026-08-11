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

describe('USwitch — 폼 제출값이 checked 변경 경로 전부와 동기화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('초기 checked 속성만으로도(사용자 클릭 없이) 즉시 제출값에 반영된다', async () => {
    const { form, el } = mountInForm({ checked: '' });
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });

  it('프로그램적 .checked= 대입도(사용자 클릭 없이) 즉시 제출값에 반영된다', async () => {
    const { form, el } = mountInForm();
    await el.updateComplete;
    expect(new FormData(form).get('q')).toBe('false');

    el.checked = true;
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('true');
  });
});
