import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/date-picker/UDatePicker.js';
import type { UInput } from '../../src/components/input/UInput.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';

function pressKey(el: Element, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('UInput — suffix u-icon 버튼이 role/tabindex/aria-label을 갖고 Enter·Space로 활성화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function createInput(attrs: Record<string, string> = {}): UInput {
    const input = document.createElement('u-input') as UInput;
    for (const [k, v] of Object.entries(attrs)) input.setAttribute(k, v);
    return input;
  }

  it('clear 아이콘: role=button·tabindex=0·aria-label을 갖고 Enter로 값을 비운다', async () => {
    const input = createInput({ clearable: '', value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    expect(clearIcon.getAttribute('role')).toBe('button');
    expect(clearIcon.getAttribute('tabindex')).toBe('0');
    expect(clearIcon.getAttribute('aria-label')).toBeTruthy();

    pressKey(clearIcon, 'Enter');
    await input.updateComplete;
    expect(input.value).toBe('');
  });

  it('clear 아이콘: Space로도 활성화된다', async () => {
    const input = createInput({ clearable: '', value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    pressKey(clearIcon, ' ');
    await input.updateComplete;
    expect(input.value).toBe('');
  });

  it('비밀번호 토글: Enter로 활성화되고 showPassword/hidePassword 라벨이 상태에 따라 바뀐다', async () => {
    const input = createInput({ type: 'password', value: 'secret' });
    document.body.appendChild(input);
    await input.updateComplete;

    const toggle = input.shadowRoot!.querySelector('u-icon[name="eye"]') as HTMLElement;
    expect(toggle.getAttribute('role')).toBe('button');
    const before = toggle.getAttribute('aria-label');

    pressKey(toggle, 'Enter');
    await input.updateComplete;
    expect(input.showPassword).toBe(true);

    const after = input.shadowRoot!.querySelector('u-icon[name="eye-off"]') as HTMLElement;
    expect(after.getAttribute('aria-label')).not.toBe(before);
  });

  it('스테퍼 +/-: Enter로 활성화되고 role/tabindex/aria-label을 갖는다', async () => {
    const input = createInput({ type: 'number', value: '5' });
    document.body.appendChild(input);
    await input.updateComplete;

    const plus = input.shadowRoot!.querySelector('u-icon[name="plus"]') as HTMLElement;
    expect(plus.getAttribute('role')).toBe('button');
    expect(plus.getAttribute('tabindex')).toBe('0');
    expect(plus.getAttribute('aria-label')).toBeTruthy();

    pressKey(plus, 'Enter');
    await input.updateComplete;
    expect(input.value).toBe('6');
  });

  it('키가 Enter/Space가 아니면 아무 일도 일어나지 않는다', async () => {
    const input = createInput({ clearable: '', value: 'hello' });
    document.body.appendChild(input);
    await input.updateComplete;

    const clearIcon = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    pressKey(clearIcon, 'Tab');
    await input.updateComplete;
    expect(input.value).toBe('hello');
  });
});

describe('USelect — clear 아이콘이 키보드로 활성화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function createSelect(): USelect {
    const select = document.createElement('u-select') as USelect;
    select.setAttribute('clearable', '');
    const option = document.createElement('u-option');
    option.setAttribute('value', 'a');
    option.textContent = 'Option A';
    select.appendChild(option);
    return select;
  }

  it('role=button·tabindex=0·aria-label을 갖고 Enter로 값을 비운다', async () => {
    const select = createSelect();
    document.body.appendChild(select);
    await select.updateComplete;
    select.value = 'a';
    await select.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    await select.updateComplete;

    const clearIcon = select.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    expect(clearIcon.getAttribute('role')).toBe('button');
    expect(clearIcon.getAttribute('tabindex')).toBe('0');
    expect(clearIcon.getAttribute('aria-label')).toBeTruthy();

    pressKey(clearIcon, 'Enter');
    await select.updateComplete;
    expect(select.value).toBe('');
  });
});

describe('UDatePicker — clear 아이콘이 키보드로 활성화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function createDatePicker(attrs: Record<string, string> = {}): UDatePicker {
    const el = document.createElement('u-date-picker') as UDatePicker;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  it('role=button·tabindex=0·aria-label을 갖고 Enter로 값을 비운다', async () => {
    const el = createDatePicker({ clearable: '', value: '2026-01-15' });
    document.body.appendChild(el);
    await el.updateComplete;

    const clearIcon = el.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    expect(clearIcon.getAttribute('role')).toBe('button');
    expect(clearIcon.getAttribute('tabindex')).toBe('0');
    expect(clearIcon.getAttribute('aria-label')).toBeTruthy();

    pressKey(clearIcon, 'Enter');
    await el.updateComplete;
    expect(el.value).toBeUndefined();
  });
});
