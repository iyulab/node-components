import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';

/**
 * 네이티브 `form.reset()` 은 폼 컨트롤을 **비우지 않고 기본값으로 되돌린다**(form-associated 표준 콜백
 * `formResetCallback`). 기본값은 네이티브와 같이 콘텐츠 속성이다.
 *
 * 대상은 `formAssociated` 를 선언한 등록 클래스에서 **도출**한다 — 아래 표는 «대상 목록» 이 아니라
 * 컨트롤마다 유효한 기본값 마크업이라는 **규칙**이다. 도출된 대상이 표에 없으면 시험이 실패한다
 * (새 폼 컨트롤이 이 계약 밖으로 조용히 빠지지 않게).
 */

type Control = HTMLElement & { updateComplete?: Promise<unknown>; value?: unknown; checked?: boolean; invalid?: boolean };

const modules = import.meta.glob('../../src/components/**/U*.ts', { eager: true }) as Record<string, Record<string, unknown>>;
const TAGS = [...new Set(
  Object.values(modules).flatMap((m) => Object.values(m))
    .filter((v): v is CustomElementConstructor => typeof v === 'function' && (v as { formAssociated?: boolean }).formAssociated === true)
    .map((cls) => customElements.getName(cls))
    .filter((t): t is string => !!t),
)].sort();

/** 폼 값을 갖지 않는 form-associated 요소 — 리셋할 상태가 없다. */
const NO_STATE = new Set(['u-button']);

/** [기본값을 준 마크업(`id="c" name="x"` 는 자동), 기본값에서 벗어나게 바꾸는 함수] */
const DEFAULTS: Record<string, [string, (el: Control) => void]> = {
  'u-input': ['value="init"', (el) => { el.value = 'changed'; }],
  'u-textarea': ['value="init"', (el) => { el.value = 'changed'; }],
  'u-select': ['value="b"><u-option value="a">A</u-option><u-option value="b">B</u-option', (el) => { el.value = 'a'; }],
  'u-radio': ['value="b"><u-option value="a">A</u-option><u-option value="b">B</u-option', (el) => { el.value = 'a'; }],
  'u-date-picker': ['value="2026-01-15"', (el) => { el.value = '2026-02-20'; }],
  'u-rating': ['value="3"', (el) => { el.value = 5; }],
  'u-slider': ['value="30"', (el) => { el.value = 70; }],
  'u-checkbox': ['value="yes" checked', (el) => { el.checked = false; }],
  'u-switch': ['checked', (el) => { el.checked = false; }],
  'u-file-input': ['', () => {}], // 파일 입력은 기본값이 없다 — 리셋 = 빈 상태(네이티브와 같다)
};

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as Control[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 60));
  for (const el of all) if (el.updateComplete) await el.updateComplete;
}

async function mount(tag: string, attrs: string): Promise<{ form: HTMLFormElement; el: Control }> {
  document.body.innerHTML = `<form><${tag} id="c" name="x" ${attrs}></${tag}></form>`;
  await settle();
  return { form: document.querySelector('form')!, el: document.getElementById('c') as Control };
}

const state = (form: HTMLFormElement, el: Control) => ({
  value: JSON.stringify(el.value ?? null),
  checked: el.checked ?? null,
  submitted: [...new FormData(form).entries()].map(([k, v]) => [k, String(v)]),
});

const RESETTABLE = TAGS.filter((t) => !NO_STATE.has(t));

describe('네이티브 form.reset() → 기본값(콘텐츠 속성)으로', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('도출된 폼 컨트롤마다 기본값 규칙이 있다', () => {
    expect(RESETTABLE.length).toBeGreaterThanOrEqual(10);
    expect(RESETTABLE.filter((t) => !(t in DEFAULTS))).toEqual([]);
  });

  it.each(RESETTABLE)('%s: 바꾼 뒤 리셋하면 처음 마운트한 상태와 같다', async (tag) => {
    const [attrs, change] = DEFAULTS[tag];
    const fresh = await mount(tag, attrs);
    const expected = state(fresh.form, fresh.el);

    const { form, el } = await mount(tag, attrs);
    change(el);
    await settle();
    if (attrs) expect(state(form, el)).not.toEqual(expected); // 바꾸기가 실제로 바꿨다

    form.reset();
    await settle();
    expect(state(form, el)).toEqual(expected);
  });

  it.each(RESETTABLE)('%s: 리셋은 검증 표시도 지운다', async (tag) => {
    const { form, el } = await mount(tag, DEFAULTS[tag][0]);
    el.invalid = true;
    await settle();
    form.reset();
    await settle();
    expect(el.invalid).toBe(false);
  });

  it('기본값이 없으면 리셋은 비운다 — u-input', async () => {
    const { form, el } = await mount('u-input', '');
    el.value = 'typed';
    await settle();
    form.reset();
    await settle();
    expect(new FormData(form).get('x') ?? '').toBe('');
  });

  it('u-button type="reset" 도 같은 경로다', async () => {
    document.body.innerHTML = `<form><u-input id="c" name="x" value="init"></u-input><u-button id="r" type="reset">Reset</u-button></form>`;
    await settle();
    const el = document.getElementById('c') as Control;
    el.value = 'changed';
    await settle();
    (document.getElementById('r') as HTMLElement).shadowRoot!.querySelector('button')!.click();
    await settle();
    expect(el.value).toBe('init');
  });

  it('공개 reset() 은 종전대로 비운다(u-form 경로)', async () => {
    const { el } = await mount('u-input', 'value="init"');
    (el as unknown as { reset(): void }).reset();
    await settle();
    expect(el.value ?? '').toBe('');
  });
});
