import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/rating/URating.js';
import '../../src/components/radio/URadio.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';

/**
 * ISSUE-20260723-uinput-label-a11y: u-field 합성 컴포넌트의 라벨은 u-field 의 별도
 * 섀도 스코프에 렌더되어 네이티브/role 컨트롤과 label[for] 로 연결될 수 없었다. 섀도 경계
 * 탓에 cross-root `aria-labelledby` 도 현 브라우저에서 신뢰성 있게 배송되지 않으므로, 각
 * 컴포넌트가 자신의 접근 가능한 이름 호스트(네이티브 input/textarea, role=radiogroup)에
 * `aria-label` 을 미러링하는 것이 근본 해법이다. 이 테스트는 `getByLabel`/스크린리더가
 * 컨트롤을 이름으로 찾을 수 있음을 회귀 방지로 고정한다.
 */
describe('u-field 합성 컴포넌트 접근 가능한 이름', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(tag: string, attrs: Record<string, string>): Promise<HTMLElement> {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  it('u-input: 네이티브 input 에 라벨이 aria-label 로 미러링된다', async () => {
    const el = await mount('u-input', { label: '자산명', description: '고유 명칭' });
    const input = el.shadowRoot!.querySelector('input[part="input"]')!;
    expect(input.getAttribute('aria-label')).toBe('자산명');
    expect(input.getAttribute('aria-description')).toBe('고유 명칭');
  });

  it('u-input: label 미지정 시 aria-label 속성이 렌더되지 않는다 (ifDefined)', async () => {
    const el = await mount('u-input', {});
    const input = el.shadowRoot!.querySelector('input[part="input"]')!;
    expect(input.hasAttribute('aria-label')).toBe(false);
  });

  it('u-textarea: 네이티브 textarea 에 라벨이 aria-label 로 미러링된다', async () => {
    const el = await mount('u-textarea', { label: '비고', description: '선택 입력' });
    const ta = el.shadowRoot!.querySelector('textarea[part="textarea"]')!;
    expect(ta.getAttribute('aria-label')).toBe('비고');
    expect(ta.getAttribute('aria-description')).toBe('선택 입력');
  });

  it('u-rating: role=radiogroup 에 라벨이 aria-label 로 미러링된다', async () => {
    const el = await mount('u-rating', { label: '만족도' });
    const group = el.shadowRoot!.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute('aria-label')).toBe('만족도');
  });

  it('u-rating: 심볼(role=radio)이 커밋 값 기준 aria-checked 를 노출한다', async () => {
    const el = await mount('u-rating', { label: '만족도', max: '5', value: '3' });
    const radios = el.shadowRoot!.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(5);
    // 3번째(score=3)만 checked
    expect(radios[2].getAttribute('aria-checked')).toBe('true');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
    expect(radios[4].getAttribute('aria-checked')).toBe('false');
  });

  it('u-radio: 컨테이너가 role=radiogroup 이며 라벨이 aria-label 로 미러링된다', async () => {
    const el = await mount('u-radio', { label: '우선순위' });
    const group = el.shadowRoot!.querySelector('[role="radiogroup"]')!;
    expect(group).toBeTruthy();
    expect(group.getAttribute('aria-label')).toBe('우선순위');
  });

  it('u-slider: thumb 가 role=slider 이며 라벨·값 ARIA 를 노출한다', async () => {
    const el = await mount('u-slider', { label: '음량', min: '0', max: '10', value: '3' });
    const thumb = el.shadowRoot!.querySelector('[role="slider"]')!;
    expect(thumb.getAttribute('aria-label')).toBe('음량');
    expect(thumb.getAttribute('aria-valuenow')).toBe('3');
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('10');
    // aria-valuetext 는 포매터를 거친 표시 문자열 (기본은 값 그대로)
    expect(thumb.getAttribute('aria-valuetext')).toBe('3');
  });

  it('u-select: 트리거가 role=combobox 이며 이름·팝업 ARIA 를 노출한다', async () => {
    const el = await mount('u-select', { label: '분류' });
    const trigger = el.shadowRoot!.querySelector('[role="combobox"]')!;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-label')).toBe('분류');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    // 초기 상태는 닫힘
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    // aria-controls 는 role=listbox 팝오버의 실제 id 를 가리킨다
    const listbox = el.shadowRoot!.querySelector('[role="listbox"]')!;
    expect(listbox.id).toBeTruthy();
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('u-option: 맥락에 따라 role/상태 ARIA 가 바뀐다 (radiogroup↔listbox 짝 맞춤)', async () => {
    const opt = document.createElement('u-option') as HTMLElement & {
      selected: boolean; updateComplete: Promise<unknown>;
    };
    opt.setAttribute('value', 'a');
    document.body.appendChild(opt);
    await opt.updateComplete;

    // 기본(listbox): role=option + aria-selected
    expect(opt.getAttribute('role')).toBe('option');
    expect(opt.getAttribute('aria-selected')).toBe('false');
    expect(opt.hasAttribute('aria-checked')).toBe(false);

    // marker=radio(radiogroup 맥락): role=radio + aria-checked, 반대 속성은 제거
    opt.setAttribute('marker', 'radio');
    opt.selected = true;
    await opt.updateComplete;
    expect(opt.getAttribute('role')).toBe('radio');
    expect(opt.getAttribute('aria-checked')).toBe('true');
    expect(opt.hasAttribute('aria-selected')).toBe(false);

    opt.remove();
  });
});
