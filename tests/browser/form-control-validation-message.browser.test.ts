import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/select/USelect.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import '../../src/components/file-input/UFileInput.js';
import '../../src/components/radio/URadio.js';
import '../../src/components/rating/URating.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/field/UField.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * 폼 컨트롤의 `validationMessage` 는 **설정할 수 있는 속성**이다(`u-field` 의 `validation-message` 와 같은 뜻 — `invalid` 일 때 보이는 오류 문구).
 * 문서의 속성표가 오래 그렇게 적었는데 기반 클래스에는 getter 만 있어, Lit 템플릿의 `.validationMessage=${text}` 가
 * `TypeError: Cannot set property … which has only a getter` 를 렌더마다 던졌다. 유효성(제출 차단)은 건드리지 않는다 — 그것은 `setCustomValidity()`.
 */
type Control = HTMLElement & {
  updateComplete: Promise<unknown>;
  validationMessage: string;
  invalid: boolean;
  setCustomValidity(m: string): void;
  validity?: ValidityState;
  validate(report?: boolean): boolean;
};

/** 컨트롤 자신 안의 `u-field` 가 그리는 오류 줄(`::part(footer)`). */
const ownFooter = (el: HTMLElement) =>
  el.shadowRoot!.querySelector('u-field')?.shadowRoot?.querySelector('.footer')?.textContent?.trim() ?? '';

async function mount(html: string): Promise<HTMLElement> {
  document.body.innerHTML = html;
  const el = document.body.firstElementChild as HTMLElement;
  await (el as Control).updateComplete;
  await new Promise((r) => setTimeout(r, 30));
  return el;
}

describe('폼 컨트롤 — validationMessage 는 설정할 수 있다', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

  it.each(['u-input', 'u-textarea', 'u-select', 'u-date-picker', 'u-date-range-picker', 'u-file-input', 'u-radio', 'u-rating', 'u-slider'])('%s: 프로퍼티로 넣으면 던지지 않고 invalid 일 때 그 문구가 보인다', async (tag) => {
    const el = (await mount(`<${tag} label="Name"></${tag}>`)) as Control;
    expect(() => { el.validationMessage = 'Required by server'; }).not.toThrow();
    el.invalid = true;
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 30));
    expect(el.validationMessage).toBe('Required by server');
    expect(ownFooter(el)).toBe('Required by server');
  });

  it('속성 validation-message 도 같다 — 선언형 템플릿에서 invalid 와 함께', async () => {
    const el = (await mount('<u-input label="Name" invalid validation-message="Already taken"></u-input>')) as Control;
    expect(el.validationMessage).toBe('Already taken');
    expect(ownFooter(el)).toBe('Already taken');
  });

  it('비우면 계산된 문구로 돌아간다 (렌더마다 서버 오류를 다시 그리는 화면)', async () => {
    const el = (await mount('<u-input label="Name" required></u-input>')) as Control;
    el.validationMessage = 'Taken';
    el.invalid = true;
    await el.updateComplete;
    expect(el.validationMessage).toBe('Taken');
    el.validationMessage = '';
    await el.updateComplete;
    // 필수인데 비어 있으니 브라우저가 계산한 문구(비어 있지 않다)가 다시 보인다
    expect(el.validationMessage).not.toBe('Taken');
    expect(el.validationMessage.length).toBeGreaterThan(0);
  });

  it('문구만 바꾼다 — 유효성에는 영향이 없다 (제출을 막지 않고 invalid 를 켜지 않는다)', async () => {
    const el = (await mount('<u-input label="Name" value="ok"></u-input>')) as Control;
    el.validationMessage = 'Taken';
    await el.updateComplete;
    expect(el.validity?.valid).toBe(true);
    expect(el.invalid).toBe(false);
    expect(ownFooter(el)).toBe(''); // invalid 가 아니므로 보이지 않는다
  });

  it.each(['u-checkbox', 'u-switch'])('%s: 설명 줄에 그 문구가 보인다', async (tag) => {
    const el = (await mount(`<${tag} label="Agree"></${tag}>`)) as Control;
    el.validationMessage = 'You must agree';
    el.invalid = true;
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 30));
    expect(el.shadowRoot!.querySelector('.description')?.textContent?.trim()).toBe('You must agree');
  });
});

describe('폼 컨트롤 — setCustomValidity 는 첫 렌더 전에 불러도 된다', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

  it('경고가 없고, 붙은 뒤 customError 로 반영된다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('u-input') as Control;
    el.setCustomValidity('Not available'); // 아직 붙지도 그려지지도 않았다
    document.body.append(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 30));
    const text = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(text, 'before the first update 경고').not.toMatch(/before the first update/);
    expect(el.validity?.customError).toBe(true);
    expect(el.validationMessage).toBe('Not available');
  });

  it('이미 그려진 뒤의 호출은 종전대로 바로 반영된다 (NEGATIVE — 늦추면 안 된다)', async () => {
    const el = (await mount('<u-input label="Name"></u-input>')) as Control;
    el.setCustomValidity('Nope');
    expect(el.validity?.customError).toBe(true);
    el.setCustomValidity('');
    expect(el.validity?.valid).toBe(true);
  });
});

describe('u-field 로 감싼 컨트롤 — 오류 문구가 몇 번 보이는가 (실측)', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  async function wrapped(inputAttrs: string): Promise<{ outer: string; inner: string; derived: string; input: Control }> {
    document.body.innerHTML = `<u-field label="Name" invalid validation-message="Required"><u-input ${inputAttrs}></u-input></u-field>`;
    const field = document.querySelector('u-field') as HTMLElement & { updateComplete: Promise<unknown> };
    const input = document.querySelector('u-input') as Control;
    await field.updateComplete; await input.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    return { outer: field.shadowRoot!.querySelector('.footer')?.textContent?.trim() ?? '', inner: ownFooter(input), derived: input.validationMessage, input };
  }

  it('감싸개에만 문구를 주면 한 번만 보인다 (소비자의 최소 재현)', async () => {
    const r = await wrapped('invalid');
    expect({ outer: r.outer, inner: r.inner }).toEqual({ outer: 'Required', inner: '' });
  });

  it('문서가 가르치는 두 모양은 각각 한 번만 보인다 — 컨트롤에 문구를 주거나, 자기 문구가 없는 네이티브 컨트롤을 u-field 로 감싼다', async () => {
    // ⑴ 컨트롤에 준다 — 컨트롤 안의 u-field 가 한 번
    document.body.innerHTML = '<u-input label="Name" invalid validation-message="Already taken"></u-input>';
    const own = document.querySelector('u-input') as Control;
    await own.updateComplete; await new Promise((r) => setTimeout(r, 30));
    expect(ownFooter(own)).toBe('Already taken');
    // ⑵ 네이티브 컨트롤을 u-field 로 감싼다 — 바깥 u-field 가 한 번(안쪽에는 그릴 것이 없다)
    document.body.innerHTML = '<u-field label="Notes" invalid validation-message="Too long"><textarea name="notes"></textarea></u-field>';
    const field = document.querySelector('u-field') as HTMLElement & { updateComplete: Promise<unknown> };
    await field.updateComplete; await new Promise((r) => setTimeout(r, 30));
    expect(field.shadowRoot!.querySelectorAll('.footer')).toHaveLength(1);
    expect(field.shadowRoot!.querySelector('.footer')?.textContent?.trim()).toBe('Too long');
  });

  it('두 곳에 주면 두 줄이다 — 그래서 문서는 «한 곳에만» 이라고 적는다 (특성 고정)', async () => {
    const r = await wrapped('required');
    r.input.validate(true); // 필수인데 비었다 → 컨트롤이 자기 계산 문구를 그린다
    await r.input.updateComplete;
    await new Promise((x) => setTimeout(x, 50));
    expect({ outer: r.outer, inner: ownFooter(r.input) }).toEqual({ outer: 'Required', inner: 'This field is required' });
  });
});
