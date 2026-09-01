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

function trackInputs(el: UInput): { count: number; values: unknown[] } {
  const seen = { count: 0, values: [] as unknown[] };
  el.addEventListener('input', () => {
    seen.count++;
    seen.values.push(el.value);
  });
  return seen;
}

describe('UInput clearable — clear 버튼이 change를 발화하고 폼 값을 동기화한다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clear 아이콘 클릭은 change를 정확히 1회 발화하고 value를 비운다', async () => {
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

  it('clearable이 아니면 clear 아이콘 자체가 렌더되지 않는다', async () => {
    const input = createInput({ value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    expect(clearIcon.hasAttribute('hidden')).toBe(true);
  });

  // docket #163: 타이핑은 input 이벤트로 값 변경을 알리는데 clear 버튼은 change만
  // 쐈다 — input 하나만 구독하는 소비자(React 커스텀 바인딩 훅 등)는 클리어를
  // 놓쳤다. 타이핑과 동일하게 input도 함께 발화해야 한다.
  it('clear 아이콘 클릭은 input도 정확히 1회 발화한다 (docket #163)', async () => {
    const input = createInput({ clearable: '', value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const inputs = trackInputs(input);
    const changes = trackChanges(input);
    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await input.updateComplete;

    expect(inputs.count).toBe(1);
    expect(inputs.values).toEqual(['']);
    expect(changes.count).toBe(1);
  });

  it('input 이벤트만 구독하는 소비자도 클리어를 감지한다 (타이핑 경로와 대칭)', async () => {
    const input = createInput({ clearable: '', value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    let detectedByInputOnly = false;
    input.addEventListener('input', () => { detectedByInputOnly = true; });

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await input.updateComplete;

    expect(detectedByInputOnly).toBe(true);
  });
});

describe('UInput — 폼 제출값이 value 변경 경로 전부와 동기화된다', () => {
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

  it('초기 value 속성만으로도(blur 없이) 즉시 제출값에 반영된다', async () => {
    const { form, input } = mountInForm({ value: 'hello' });
    await input.updateComplete;

    expect(new FormData(form).get('q')).toBe('hello');
  });

  it('프로그램적 .value= 대입도(blur 없이) 즉시 제출값에 반영된다', async () => {
    const { form, input } = mountInForm();
    await input.updateComplete;

    input.value = 'typed via API';
    await input.updateComplete;

    expect(new FormData(form).get('q')).toBe('typed via API');
  });

  it('clear 버튼 클릭도(blur 없이) 즉시 제출값을 비운다', async () => {
    const { form, input } = mountInForm({ clearable: '', value: 'hello' });
    await input.updateComplete;
    expect(new FormData(form).get('q')).toBe('hello');

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await input.updateComplete;

    expect(new FormData(form).get('q')).toBe('');
  });
});
