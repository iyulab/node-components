import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-input type="number"` 은 사람이 그 로케일로 친 수를 읽는다 — 네이티브 숫자 입력은 소수 쉼표를
 * 브라우저에 따라 버리거나(`1,5` → `15`, 열 배 큰 «유효한» 수) 비워 버린다. 값 계약은 그대로다:
 * `value` 는 언제나 점-소수 문자열.
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
  await el.updateComplete;
}

async function blur(el: UInput) {
  inner(el).blur();
  await el.updateComplete;
}

describe('u-input type="number" — 로케일로 읽기', () => {
  beforeEach(() => Locale.set('de'));
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  it('안쪽 입력은 text + inputmode=decimal 이다 (네이티브 숫자 입력이 쉼표를 망가뜨리지 않게)', async () => {
    const el = await mount('<u-input type="number"></u-input>');
    expect(inner(el).type).toBe('text');
    expect(inner(el).inputMode).toBe('decimal');
  });

  it('🔴독일어 화면에서 1,5 → value "1.5" (종전: "15" — 열 배 큰 유효한 수)', async () => {
    const el = await mount('<u-input type="number" step="any"></u-input>');
    await typeInto(el, '1,5');
    expect(el.value).toBe('1.5');
    expect(el.valueAsNumber).toBe(1.5);
    await blur(el);
    expect(inner(el).value).toBe('1,5');
    expect(el.validate()).toBe(true);
  });

  it('묶음과 소수가 함께 오면 마지막 구분자가 소수다 — 블러 뒤에는 묶음 없이 로케일 모양으로', async () => {
    const el = await mount('<u-input type="number" step="any"></u-input>');
    await typeInto(el, '1.234,5');
    expect(el.value).toBe('1234.5');
    await blur(el);
    expect(inner(el).value).toBe('1234,5');
  });

  it('영어 화면: 1,234.5 → 1234.5 · 1,5 → 1.5', async () => {
    Locale.set('en');
    const a = await mount('<u-input type="number" step="any"></u-input>');
    await typeInto(a, '1,234.5');
    expect(a.value).toBe('1234.5');
    const b = await mount('<u-input type="number" step="any"></u-input>');
    await typeInto(b, '1,5');
    expect(b.value).toBe('1.5');
  });

  it('🔴수가 아닌 글자는 값이 비고 badInput 이다 — 글자는 고치도록 그대로 남는다', async () => {
    const el = await mount('<u-input type="number"></u-input>');
    await typeInto(el, '1,5x');
    await blur(el);
    expect(el.value).toBe('');
    expect(Number.isNaN(el.valueAsNumber)).toBe(true);
    expect(el.validity?.badInput).toBe(true);
    expect(el.invalid).toBe(true);
    expect(inner(el).value).toBe('1,5x');
  });

  it('코드가 넣은 값은 로케일 모양으로 보인다 (값은 점-소수 그대로)', async () => {
    const el = await mount('<u-input type="number" value="2.25"></u-input>');
    expect(inner(el).value).toBe('2,25');
    el.value = '10.5';
    await el.updateComplete;
    expect(inner(el).value).toBe('10,5');
    expect(el.value).toBe('10.5');
  });

  it('min/max/step 은 읽은 수로 잰다 — 기본 step 은 1(네이티브와 같다), step="any" 는 재지 않는다', async () => {
    const low = await mount('<u-input type="number" min="1" step="any"></u-input>');
    await typeInto(low, '0,5');
    expect(low.validate()).toBe(false);
    expect(low.validity?.rangeUnderflow).toBe(true);

    const high = await mount('<u-input type="number" max="10" step="any"></u-input>');
    await typeInto(high, '10,5');
    expect(high.validate()).toBe(false);
    expect(high.validity?.rangeOverflow).toBe(true);

    const stepped = await mount('<u-input type="number"></u-input>');
    await typeInto(stepped, '1,5');
    expect(stepped.validate()).toBe(false);
    expect(stepped.validity?.stepMismatch).toBe(true);

    const fine = await mount('<u-input type="number" step="0.5"></u-input>');
    await typeInto(fine, '1,5');
    expect(fine.validate()).toBe(true);
  });

  it('화살표로 증감한다 — 소수 step 에 부동소수 잡음이 없고, change 가 난다', async () => {
    const el = await mount('<u-input type="number" step="0.1" value="0.2"></u-input>');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    inner(el).focus();
    await userEvent.keyboard('{ArrowUp}');
    await el.updateComplete;
    expect(el.value).toBe('0.3');
    expect(inner(el).value).toBe('0,3');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await el.updateComplete;
    expect(el.value).toBe('0.1');
    expect(changes).toBe(3);
  });

  it('증감 버튼도 같은 규칙이고 min/max 에서 멈춘다', async () => {
    const el = await mount('<u-input type="number" min="0" max="2" value="1.5" step="any"></u-input>');
    const plus = el.shadowRoot!.querySelector('.stepper-btn[name="plus"]') as HTMLElement;
    plus.click();
    await el.updateComplete;
    expect(el.value).toBe('2');
    plus.click();
    await el.updateComplete;
    expect(el.value).toBe('2');
  });

  it('폼에는 점-소수 값이 실린다', async () => {
    document.body.innerHTML = '<form><u-input type="number" name="width" step="any"></u-input></form>';
    const el = document.querySelector('u-input') as UInput;
    await el.updateComplete;
    await typeInto(el, '12,75');
    expect(new FormData(document.querySelector('form')!).get('width')).toBe('12.75');
  });

  it('⚪NEGATIVE — 다른 type 은 네이티브 그대로다', async () => {
    const el = await mount('<u-input type="email"></u-input>');
    expect(inner(el).type).toBe('email');
    expect(inner(el).inputMode).toBe('');
  });
});
