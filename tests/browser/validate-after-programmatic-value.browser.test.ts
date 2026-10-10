import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';
import type { UForm } from '../../src/components/form/UForm.js';

/**
 * 값을 코드로 바꾼 **같은 틱**의 `validate()` 가 바뀐 값으로 판정한다.
 *
 * 몇 컨트롤은 판정 근거로 안쪽 네이티브 요소의 `validity` 를 읽는데, 그 요소는 렌더가 값을 내려보낸 뒤에야
 * 바뀐다 — 그래서 `el.value = x; el.validate()` 가 바꾸기 전 값으로 판정하고 오류를 켰다(렌더 뒤 `internals` 는
 * 바로잡히지만 `invalid` 표시는 `validate()` 만 걷는다). `u-form` 의 `form.model = …; form.validate()` 도 같다 —
 * 모델 동기화가 폼의 렌더 뒤에 일어난다.
 */

type Control = HTMLElement & {
  updateComplete?: Promise<unknown>;
  value?: unknown;
  checked?: boolean;
  invalid?: boolean;
  validate(report?: boolean): boolean;
};

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    for (const el of Array.from(document.body.querySelectorAll('*')) as Control[]) {
      if (el.updateComplete) await el.updateComplete;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}

/** [빈 필수 마크업, 같은 틱에 유효하게 만드는 변경] — 안쪽 요소의 `validity` 를 읽는 컨트롤들. */
const CASES: Record<string, [string, (el: Control) => void]> = {
  'u-input': ['<u-input id="c" required></u-input>', (el) => { el.value = 'ok'; }],
  'u-textarea': ['<u-textarea id="c" required></u-textarea>', (el) => { el.value = 'ok'; }],
  'u-checkbox': ['<u-checkbox id="c" required>agree</u-checkbox>', (el) => { el.checked = true; }],
  'u-switch': ['<u-switch id="c" required>on</u-switch>', (el) => { el.checked = true; }],
};

describe('값을 코드로 바꾼 직후의 validate()', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  for (const [tag, [markup, makeValid]] of Object.entries(CASES)) {
    it(`${tag} — 무효였다가 같은 틱에 고치면 유효로 판정하고 오류를 걷는다`, async () => {
      document.body.innerHTML = markup;
      await settle();
      const el = document.getElementById('c') as Control;
      expect(el.validate()).toBe(false);
      await settle();
      expect(el.invalid).toBe(true);

      makeValid(el);
      expect(el.validate()).toBe(true);
      await settle();
      expect(el.invalid).toBe(false);
    });
  }

  it('u-form — model 을 넣은 같은 틱의 validate() 가 그 값으로 판정한다', async () => {
    document.body.innerHTML = '<u-form id="f"><u-field label="A"><u-input name="a" required></u-input></u-field></u-form>';
    await settle();
    const form = document.getElementById('f') as UForm;
    form.model = { a: 'x' };
    expect(form.validate()).toBe(true);
    await settle();
    expect((form.querySelector('u-input') as Control).invalid).toBe(false);
  });
});
