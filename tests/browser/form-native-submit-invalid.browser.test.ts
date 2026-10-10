import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/index.js';
import type { UForm } from '../../src/components/form/UForm.js';

/**
 * 네이티브 `<form>` 의 제출 시도가 우리 컨트롤의 오류를 켠다 — 제출은 막히는데 어느 칸이 틀렸는지 화면에
 * 아무것도 없으면 사용자는 «눌러도 아무 일이 없다» 를 본다(WCAG 3.3.1 오류 식별).
 *
 * UA 는 제출 시도·`form.reportValidity()` 에서 무효 컨트롤마다 `invalid` 를 보낸다. 같은 이벤트가 조용한
 * 확인(`checkValidity()`)에서도 오므로, 컨트롤 자신의 `validate(false)` 경로는 화면을 건드리지 않아야 한다.
 */

type Control = HTMLElement & { updateComplete?: Promise<unknown>; value?: unknown; invalid?: boolean; validate(report?: boolean): boolean };

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    for (const el of Array.from(document.body.querySelectorAll('*')) as Control[]) {
      if (el.updateComplete) await el.updateComplete;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}

/** `required` 를 받는 컨트롤 — 값이 없으면 무효인 마크업. */
const REQUIRED: Record<string, string> = {
  'u-input': '<u-input name="x" required></u-input>',
  'u-textarea': '<u-textarea name="x" required></u-textarea>',
  'u-select': '<u-select name="x" required><u-option value="a">A</u-option></u-select>',
  'u-checkbox': '<u-checkbox name="x" required>agree</u-checkbox>',
  'u-date-picker': '<u-date-picker name="x" required></u-date-picker>',
};

async function mountForm(inner: string): Promise<{ form: HTMLFormElement; submitted: () => boolean }> {
  document.body.innerHTML = `<form id="f">${inner}<button>Submit</button></form>`;
  await settle();
  const form = document.getElementById('f') as HTMLFormElement;
  let submitted = false;
  form.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
  return { form, submitted: () => submitted };
}

const controls = (root: ParentNode) => Array.from(root.querySelectorAll('[name]')) as Control[];

describe('네이티브 제출 시도가 오류를 켠다', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('requestSubmit() — 감싸개 안 무효 컨트롤 전부가 오류를 보이고 제출은 막힌다', async () => {
    const { form, submitted } = await mountForm(
      '<u-field label="A"><u-input name="a" required></u-input></u-field>'
      + '<u-field label="B"><u-input name="b" required></u-input></u-field>',
    );
    form.requestSubmit();
    await settle();
    expect(submitted()).toBe(false);
    expect(controls(form).map((el) => el.invalid)).toEqual([true, true]);
  });

  it('제출 버튼 클릭도 같은 경로다', async () => {
    const { form } = await mountForm('<u-input name="a" required></u-input>');
    await userEvent.click(form.querySelector('button')!);
    await settle();
    expect(controls(form)[0].invalid).toBe(true);
  });

  it('form.reportValidity() 도 오류를 켠다', async () => {
    const { form } = await mountForm('<u-input name="a" required></u-input>');
    expect(form.reportValidity()).toBe(false);
    await settle();
    expect(controls(form)[0].invalid).toBe(true);
  });

  for (const [tag, markup] of Object.entries(REQUIRED)) {
    it(`${tag} — 제출 시도에서 오류를 보인다`, async () => {
      const { form } = await mountForm(markup);
      form.requestSubmit();
      await settle();
      expect(controls(form)[0].invalid).toBe(true);
    });
  }

  it('고친 뒤에는 종전 경로가 오류를 걷는다', async () => {
    const { form } = await mountForm('<u-input name="a" required></u-input>');
    form.requestSubmit();
    await settle();
    const input = controls(form)[0];
    expect(input.invalid).toBe(true);
    // 사람이 고치는 경로 — 입력하고 칸을 떠난다(컨트롤 자신의 change 경로가 다시 검증한다).
    await userEvent.click(input);
    await userEvent.keyboard('ok');
    await userEvent.tab();
    await settle();
    expect(input.invalid).toBe(false);
  });
});

describe('조용한 확인은 화면을 건드리지 않는다', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('컨트롤 validate(false)', async () => {
    const { form } = await mountForm('<u-input name="a" required></u-input>');
    const input = controls(form)[0];
    expect(input.validate(false)).toBe(false);
    await settle();
    expect(input.invalid).toBe(false);
  });

  it('u-form validate(false) — 네이티브 <form> 안에 있어도', async () => {
    const { form } = await mountForm('<u-form id="uf"><u-input name="a" required></u-input></u-form>');
    expect((document.getElementById('uf') as UForm).validate(false)).toBe(false);
    await settle();
    expect(controls(form)[0].invalid).toBe(false);
  });

  it('합성 invalid 이벤트는 무시한다', async () => {
    const { form } = await mountForm('<u-input name="a" required></u-input>');
    const input = controls(form)[0];
    input.dispatchEvent(new Event('invalid', { cancelable: true }));
    await settle();
    expect(input.invalid).toBe(false);
  });
});
