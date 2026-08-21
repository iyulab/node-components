import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/field/UField.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/slider/USlider.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UField } from '../../src/components/field/UField.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import type { UTextarea } from '../../src/components/textarea/UTextarea.js';
import type { UCheckbox } from '../../src/components/checkbox/UCheckbox.js';
import type { USwitch } from '../../src/components/switch/USwitch.js';
import type { USlider } from '../../src/components/slider/USlider.js';

describe('폼 컨트롤 host.focus()/.blur() 위임 — UInput.focus()와 같은 계약을 나머지 폼 컨트롤로 확장', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('USelect — host.focus()가 .container로 위임되고 .blur()로 해제된다', async () => {
    const select = document.createElement('u-select') as USelect;
    const option = document.createElement('u-option');
    option.setAttribute('value', 'a');
    option.textContent = 'A';
    select.appendChild(option);
    document.body.appendChild(select);
    await select.updateComplete;

    select.focus();
    expect(document.activeElement).toBe(select);
    expect(select.shadowRoot?.activeElement).toBe(select.shadowRoot!.querySelector('.container'));

    select.blur();
    expect(select.shadowRoot?.activeElement).toBeNull();
  });

  it('UField — host.focus()가 슬롯의 첫 포커스 가능 자식으로 위임된다(임의 네이티브 컨트롤 포함)', async () => {
    const field = document.createElement('u-field') as UField;
    const input = document.createElement('input');
    field.appendChild(input);
    document.body.appendChild(field);
    await field.updateComplete;

    field.focus();
    expect(document.activeElement).toBe(input);
  });

  it('UDatePicker — host.focus()가 .container로 위임되고 .blur()로 해제된다', async () => {
    const el = document.createElement('u-date-picker') as UDatePicker;
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot?.activeElement).toBe(el.shadowRoot!.querySelector('.container'));

    el.blur();
    expect(el.shadowRoot?.activeElement).toBeNull();
  });

  it('UTextarea — host.focus()가 내부 <textarea>로 위임되고 .blur()로 해제된다', async () => {
    const el = document.createElement('u-textarea') as UTextarea;
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot?.activeElement).toBe(el.shadowRoot!.querySelector('textarea'));

    el.blur();
    expect(el.shadowRoot?.activeElement).toBeNull();
  });

  it('UCheckbox — host.focus()가 내부 <input>으로 위임되고 .blur()로 해제된다', async () => {
    const el = document.createElement('u-checkbox') as UCheckbox;
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot?.activeElement).toBe(el.shadowRoot!.querySelector('input'));

    el.blur();
    expect(el.shadowRoot?.activeElement).toBeNull();
  });

  it('USwitch — host.focus()가 내부 <input>으로 위임되고 .blur()로 해제된다', async () => {
    const el = document.createElement('u-switch') as USwitch;
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot?.activeElement).toBe(el.shadowRoot!.querySelector('input'));

    el.blur();
    expect(el.shadowRoot?.activeElement).toBeNull();
  });

  it('USlider — host.focus()가 min thumb로 위임된다(.container는 tabindex가 없어 위임 대상이 될 수 없다)', async () => {
    const el = document.createElement('u-slider') as USlider;
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot?.activeElement).toBe(el.shadowRoot!.querySelector('.thumb[data-thumb="min"]'));

    el.blur();
    expect(el.shadowRoot?.activeElement).toBeNull();
  });

  it('USlider range 모드 — host.focus()가 여전히 min thumb(시작값)로 위임된다', async () => {
    const el = document.createElement('u-slider') as USlider;
    el.setAttribute('range', '');
    el.setAttribute('value', '[20,80]');
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(el.shadowRoot?.activeElement).toBe(el.shadowRoot!.querySelector('.thumb[data-thumb="min"]'));
  });

  // USelect/UDatePicker/USlider의 위임 대상(.container·thumb)은 div라 네이티브
  // disabled가 없다 — disabled=true일 때 tabindex="-1"만으로는 프로그램적 focus()를
  // 막지 못해, UInput(네이티브 disabled <input>이 자동으로 막아 준다)과 다르게
  // focus()가 실제로 포커스를 이동시키는 결함이 있었다(negative control).
  it('USelect — disabled 상태에서는 host.focus()가 no-op이다', async () => {
    const select = document.createElement('u-select') as USelect;
    select.setAttribute('disabled', '');
    document.body.appendChild(select);
    await select.updateComplete;

    select.focus();
    expect(document.activeElement).not.toBe(select);
  });

  it('UDatePicker — disabled 상태에서는 host.focus()가 no-op이다', async () => {
    const el = document.createElement('u-date-picker') as UDatePicker;
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).not.toBe(el);
  });

  it('USlider — disabled 상태에서는 host.focus()가 no-op이다', async () => {
    const el = document.createElement('u-slider') as USlider;
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    await el.updateComplete;

    el.focus();
    expect(document.activeElement).not.toBe(el);
  });
});
