import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';
import type { UForm } from '../../src/components/form/UForm.js';

/**
 * `u-form.validate()` 의 계약 — 네이티브 `form.reportValidity()` 와 같은 관계다.
 *
 *   ⑴ 대상은 위치와 무관하다 — `u-field`·배치용 요소 안의 컨트롤도 이 폼의 것이다(`form.elements`).
 *      감싸개 안 컨트롤을 못 보면 빈 필수 칸이 있어도 `[].every()` 가 참이라 «유효» 로 보고된다.
 *   ⑵ 전부 검증한다 — 첫 오류에서 멈추면 사용자는 오류를 하나씩만 본다.
 *   ⑶ 첫 무효 컨트롤로 포커스를 옮긴다. `validate(false)` 는 화면을 건드리지 않는다.
 *   ⑷ 안쪽 `u-form` 의 컨트롤은 그 폼의 것이다.
 */

type Control = HTMLElement & { updateComplete?: Promise<unknown>; value?: unknown; invalid?: boolean };

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    for (const el of Array.from(document.body.querySelectorAll('*')) as Control[]) {
      if (el.updateComplete) await el.updateComplete;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}

async function mount(markup: string): Promise<{ form: UForm; inputs: Control[] }> {
  document.body.innerHTML = `<button id="before">before</button>${markup}`;
  await settle();
  (document.getElementById('before') as HTMLButtonElement).focus();
  const form = document.getElementById('f') as UForm;
  return { form, inputs: Array.from(form.querySelectorAll('u-input')) as Control[] };
}

const invalidOf = (inputs: Control[]) => inputs.map((el) => el.invalid);

describe('u-form validate()', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('직속 컨트롤 — 둘 다 오류를 보이고 첫 무효로 포커스가 간다', async () => {
    const { form, inputs } = await mount(
      `<u-form id="f"><u-input name="a" required></u-input><u-input name="b" required></u-input></u-form>`,
    );
    expect(form.validate()).toBe(false);
    await settle();
    expect(invalidOf(inputs)).toEqual([true, true]);
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('감싸개 안 컨트롤 — «유효» 로 보고하지 않는다', async () => {
    const { form, inputs } = await mount(
      `<u-form id="f"><u-field label="A"><u-input name="a" required></u-input></u-field>`
      + `<div><u-input name="b" required></u-input></div></u-form>`,
    );
    expect(form.validate()).toBe(false);
    await settle();
    expect(invalidOf(inputs)).toEqual([true, true]);
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('첫 무효는 문서 순서로 정한다 — 앞 칸이 유효하면 뒤 칸으로 간다', async () => {
    const { form, inputs } = await mount(
      `<u-form id="f"><div><u-input name="a" required value="ok"></u-input></div>`
      + `<u-field label="B"><u-input name="b" required></u-input></u-field></u-form>`,
    );
    expect(form.validate()).toBe(false);
    await settle();
    expect(invalidOf(inputs)).toEqual([false, true]);
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('validate(false) 는 오류 표시도 포커스도 건드리지 않는다', async () => {
    const { form, inputs } = await mount(
      `<u-form id="f"><u-field label="A"><u-input name="a" required></u-input></u-field></u-form>`,
    );
    expect(form.validate(false)).toBe(false);
    await settle();
    expect(invalidOf(inputs)).toEqual([false]);
    expect(document.activeElement?.id).toBe('before');
  });

  it('모델 동기화와 reset() 도 감싸개 안 컨트롤에 닿는다', async () => {
    const { form, inputs } = await mount(
      `<u-form id="f"><u-field label="A"><u-input name="a"></u-input></u-field><div><u-input name="b"></u-input></div></u-form>`,
    );
    form.model = { a: 'x', b: 'y' };
    await settle();
    expect(inputs.map((el) => el.value)).toEqual(['x', 'y']);

    inputs[0].value = 'changed';
    form.reset();
    await settle();
    expect(inputs.map((el) => el.value)).toEqual(['x', 'y']);
  });

  it('안쪽 u-form 의 컨트롤은 바깥 폼의 대상이 아니다', async () => {
    const { form, inputs } = await mount(
      `<u-form id="f"><u-input name="a" value="ok" required></u-input>`
      + `<u-form id="inner"><u-input name="b" required></u-input></u-form></u-form>`,
    );
    expect(form.validate()).toBe(true);
    await settle();
    expect(invalidOf(inputs)).toEqual([false, false]);
    expect((document.getElementById('inner') as UForm).validate()).toBe(false);
  });
});
