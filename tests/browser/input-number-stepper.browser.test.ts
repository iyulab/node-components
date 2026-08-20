import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

function createInput(attrs: Record<string, string> = {}): UInput {
  const input = document.createElement('u-input') as UInput;
  input.setAttribute('type', 'number');
  for (const [k, v] of Object.entries(attrs)) input.setAttribute(k, v);
  return input;
}

function click(el: Element) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function trackEvents(el: UInput, name: string): { count: number; values: unknown[] } {
  const seen = { count: 0, values: [] as unknown[] };
  el.addEventListener(name, () => {
    seen.count++;
    seen.values.push(el.value);
  });
  return seen;
}

describe('UInput[type=number] — 스테퍼 버튼이 min/max/step을 존중하며 값을 조정한다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('+ 클릭은 step 없이도 기본값(1)만큼 증가하고 input·change를 정확히 1회씩 낸다', async () => {
    const input = createInput({ value: '5' });
    document.body.appendChild(input);
    await input.updateComplete;

    const inputSeen = trackEvents(input, 'input');
    const changeSeen = trackEvents(input, 'change');
    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    click(plus);
    await input.updateComplete;

    expect(input.value).toBe('6');
    expect(inputSeen.count).toBe(1);
    expect(changeSeen.count).toBe(1);
  });

  it('− 클릭은 값을 감소시킨다', async () => {
    const input = createInput({ value: '5' });
    document.body.appendChild(input);
    await input.updateComplete;

    const minus = input.shadowRoot!.querySelector('u-icon[name="minus"]') as HTMLElement;
    click(minus);
    await input.updateComplete;

    expect(input.value).toBe('4');
  });

  it('step="1000"이면 그 단위로 증감한다(금액 필드 용례)', async () => {
    const input = createInput({ value: '5000', step: '1000' });
    document.body.appendChild(input);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    click(plus);
    await input.updateComplete;

    expect(input.value).toBe('6000');
  });

  it('max 경계에서 + 클릭은 값을 더 늘리지 않고, 버튼이 aria-disabled="true"가 된다', async () => {
    const input = createInput({ value: '10', max: '10' });
    document.body.appendChild(input);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    expect(plus.getAttribute('aria-disabled')).toBe('true');

    click(plus);
    await input.updateComplete;
    expect(input.value).toBe('10');
  });

  it('min 경계에서 − 클릭은 값을 더 줄이지 않고, 버튼이 aria-disabled="true"가 된다', async () => {
    const input = createInput({ value: '0', min: '0' });
    document.body.appendChild(input);
    await input.updateComplete;

    const minus = input.shadowRoot!.querySelector('u-icon[name="minus"]') as HTMLElement;
    expect(minus.getAttribute('aria-disabled')).toBe('true');

    click(minus);
    await input.updateComplete;
    expect(input.value).toBe('0');
  });

  it('경계 안에서는 aria-disabled="false"다', async () => {
    const input = createInput({ value: '5', min: '0', max: '10' });
    document.body.appendChild(input);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    const minus = input.shadowRoot!.querySelector('u-icon[name="minus"]') as HTMLElement;
    expect(plus.getAttribute('aria-disabled')).toBe('false');
    expect(minus.getAttribute('aria-disabled')).toBe('false');
  });

  it('type이 number가 아니면 스테퍼 버튼이 렌더되지 않는다(hidden)', async () => {
    const input = document.createElement('u-input') as UInput;
    input.setAttribute('type', 'text');
    input.setAttribute('value', '5');
    document.body.appendChild(input);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    expect(plus.hasAttribute('hidden')).toBe(true);
  });

  it('disabled·readonly면 스테퍼 버튼이 숨겨진다', async () => {
    const disabled = createInput({ value: '5', disabled: '' });
    const readonly = createInput({ value: '5', readonly: '' });
    document.body.append(disabled, readonly);
    await Promise.all([disabled.updateComplete, readonly.updateComplete]);

    expect((disabled.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement).hasAttribute('hidden')).toBe(true);
    expect((readonly.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement).hasAttribute('hidden')).toBe(true);
  });

  it('+ 클릭은(blur 없이) 즉시 폼 제출값을 갱신한다', async () => {
    const form = document.createElement('form');
    const input = createInput({ name: 'qty', value: '1' });
    form.appendChild(input);
    document.body.appendChild(form);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    click(plus);
    await input.updateComplete;

    expect(new FormData(form).get('qty')).toBe('2');
  });

  it('값이 step 기준선을 벗어나 stepUp/stepDown이 던지는 경우에도 클릭 핸들러가 예외 없이 무시한다', async () => {
    // min=1, step=4 → 허용값은 1, 5, 9 ... ; value=3은 정렬 안 됨(네이티브가 InvalidStateError를 던지는 경우)
    const input = createInput({ value: '3', min: '1', step: '4' });
    document.body.appendChild(input);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    expect(() => click(plus)).not.toThrow();
  });
});
