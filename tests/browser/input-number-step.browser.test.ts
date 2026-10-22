import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

/**
 * `u-input type="number"` 의 step 검사는 부동소수 나눗셈 오차에 흔들리지 않는다 — 몫의 오차는 몫의 크기에
 * 비례해 자라므로 작은 step 에서 정상 값이 «배수 아님» 이 되면 안 된다. 그리고 오류를 보이는 동안 코드가
 * 값을 바꾸면 보이는 오류도 새 값을 따른다.
 */

async function mount(html: string): Promise<UInput> {
  document.body.innerHTML = html;
  const el = document.querySelector('u-input') as UInput;
  await el.updateComplete;
  return el;
}

const inner = (el: UInput) => el.shadowRoot!.querySelector('input') as HTMLInputElement;

async function typeInto(el: UInput, text: string) {
  inner(el).focus();
  await userEvent.type(inner(el), text);
  inner(el).blur();
  await el.updateComplete;
}

describe('u-input type="number" — step 검사', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('🔴step 0.000001 에서 49.7 은 배수다 (종전: 몫의 소수부 7e-9 > 1e-9 로 거짓 stepMismatch)', async () => {
    const el = await mount('<u-input type="number" step="0.000001"></u-input>');
    await typeInto(el, '49.7');
    expect(el.value).toBe('49.7');
    expect(el.validity?.stepMismatch).toBe(false);
    expect(el.validate()).toBe(true);
  });

  it('여러 값이 작은 step 의 배수로 읽힌다', async () => {
    const el = await mount('<u-input type="number" step="0.000001"></u-input>');
    for (const v of ['50.3', '50.05', '50.6', '10.03', '123456.789012']) {
      el.value = v;
      expect(el.validate(false), v).toBe(true);
    }
  });

  it('진짜 배수가 아닌 값은 여전히 stepMismatch 다', async () => {
    const el = await mount('<u-input type="number" step="0.000001"></u-input>');
    el.value = '49.7000005';
    await el.updateComplete;
    expect(el.validate(false)).toBe(false);
    expect(el.validity?.stepMismatch).toBe(true);
    const half = await mount('<u-input type="number" step="0.5" min="1"></u-input>');
    half.value = '2.25';
    expect(half.validate(false)).toBe(false);
    half.value = '2.5';
    expect(half.validate(false)).toBe(true);
  });

  it('🔴오류를 보이는 동안 코드가 값을 비우면 보이는 오류도 사라진다 (종전: 빈 칸 아래에 문구가 남았다)', async () => {
    const el = await mount('<u-input type="number" step="0.5"></u-input>');
    await typeInto(el, '2.25');
    expect(el.invalid).toBe(true);
    el.value = '';
    await el.updateComplete;
    await el.updateComplete;
    expect(el.invalid).toBe(false);
  });

  it('필수 칸을 코드가 비우면 오류는 그대로 남는다(해제만 하고 새로 보이지는 않는다)', async () => {
    const el = await mount('<u-input type="number" required value="3"></u-input>');
    el.invalid = true;
    el.value = '';
    await el.updateComplete;
    await el.updateComplete;
    expect(el.invalid).toBe(true);
  });
});
