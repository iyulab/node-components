import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import '../../src/components/file-input/UFileInput.js';
import '../../src/components/field/UField.js';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/radio/URadio.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/button/UButton.js';

/**
 * **`:state(field)` — 입력 상자를 가진 컨트롤의 공개 표지.** 줄 배치(목록 화면의 검색 조건 줄)가 태그 목록을 손으로 들지 않고
 * «칸은 아래 끝, 나머지는 글자 줄» 로 가를 수 있게 한다. 재는 것은 소비자 시트의 선택자가 실제로 맞는가다 — 소스에 이름이 있는가가 아니라.
 * 라벨을 단 토글(`u-switch label`)이 칸으로 읽히지 않는 것도 함께 잰다 — 종전 소비자 규칙(`[label]`)이 그것을 칸으로 잘못 셌다.
 *
 * ⚠규칙은 긍정형으로 쓴다(`::slotted(*)` 기본 + `::slotted(:state(field))` 덮기). Chromium 151 실측: 연결 때 붙는 상태에
 * `:not(:state(field))` 규칙이 다시 계산되지 않아 `matches()` 는 거짓인데 스타일은 맞은 채로 남았다(긍정형은 따라온다).
 */
afterEach(() => document.body.replaceChildren());

const FIELDS = ['u-input', 'u-select', 'u-textarea', 'u-date-picker', 'u-date-range-picker', 'u-file-input', 'u-field'];
const NOT_FIELDS = ['u-checkbox', 'u-switch', 'u-radio', 'u-slider', 'u-button'];

async function mount(tag: string): Promise<HTMLElement> {
  document.body.innerHTML = `<${tag} label="Label"></${tag}>`;
  const el = document.body.firstElementChild as HTMLElement & { updateComplete?: Promise<unknown> };
  await customElements.whenDefined(tag);
  await el.updateComplete;
  return el;
}

describe(':state(field)', () => {
  it.each(FIELDS)('%s 는 칸이다', async (tag) => {
    expect((await mount(tag)).matches(':state(field)')).toBe(true);
  });

  it.each(NOT_FIELDS)('%s 는 칸이 아니다(라벨을 달아도)', async (tag) => {
    expect((await mount(tag)).matches(':state(field)')).toBe(false);
  });

  it('섀도 경계 너머의 슬롯 규칙이 그 표지로 가른다', async () => {
    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        ::slotted(*) { outline: 3px solid rgb(1, 2, 3); }
        ::slotted(:state(field)) { outline-width: 0; }
      </style><slot></slot>`;
    host.innerHTML = '<u-input></u-input><u-switch label="Archived"></u-switch>';
    document.body.append(host);
    await customElements.whenDefined('u-switch');
    const [input, toggle] = [...host.children] as HTMLElement[];
    expect(getComputedStyle(input).outlineWidth).toBe('0px');
    expect(getComputedStyle(toggle).outlineWidth).toBe('3px');
  });
});
