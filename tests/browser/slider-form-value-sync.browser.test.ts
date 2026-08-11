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

describe('USlider — 폼 제출값이 value 변경 경로 전부와 동기화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('초기 value 속성만으로도(드래그 없이) 즉시 제출값에 반영된다', async () => {
    const { form, el } = mountInForm({ value: '30' });
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('30');
  });

  it('프로그램적 .value= 대입도(드래그 없이) 즉시 제출값에 반영된다', async () => {
    const { form, el } = mountInForm();
    await el.updateComplete;

    el.value = 42;
    await el.updateComplete;

    expect(new FormData(form).get('q')).toBe('42');
  });
});
