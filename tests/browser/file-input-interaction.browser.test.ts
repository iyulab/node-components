import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/file-input/UFileInput.js';
import type { UFileInput } from '../../src/components/file-input/UFileInput.js';

function mount(attrs: Record<string, string> = {}): UFileInput {
  const el = document.createElement('u-file-input') as UFileInput;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

describe('UFileInput — 트리거/지우기 상호작용', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('트리거 버튼 클릭이 숨겨진 네이티브 file input의 클릭을 연다', async () => {
    const el = mount();
    await el.updateComplete;

    const nativeInput = el.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
    let opened = false;
    // 실제 OS 파일 선택창은 자동화에서 열 수 없으므로, 네이티브 input이 클릭을
    // 받는지(=트리거가 그 input을 위임 클릭하는지)만 실측한다.
    nativeInput.addEventListener('click', () => { opened = true; }, { once: true });

    const trigger = el.shadowRoot!.querySelector('.trigger') as HTMLButtonElement;
    await userEvent.click(trigger);

    expect(opened).toBe(true);
  });

  it('disabled 상태에서는 트리거 클릭이 네이티브 input을 열지 않는다', async () => {
    const el = mount({ disabled: '' });
    await el.updateComplete;

    const nativeInput = el.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
    let opened = false;
    nativeInput.addEventListener('click', () => { opened = true; }, { once: true });

    const trigger = el.shadowRoot!.querySelector('.trigger') as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);

    trigger.click();
    expect(opened).toBe(false);
  });

  it('focus()/blur()는 트리거 버튼으로 위임된다', async () => {
    const el = mount();
    await el.updateComplete;

    el.focus();
    const trigger = el.shadowRoot!.querySelector('.trigger') as HTMLButtonElement;
    expect(el.shadowRoot!.activeElement).toBe(trigger);

    el.blur();
    expect(el.shadowRoot!.activeElement).toBeNull();
  });

  it('선택 후 지우기 버튼은 role=button + tabindex=0으로 키보드 활성화 가능하다', async () => {
    const el = mount();
    await el.updateComplete;

    const nativeInput = el.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'x.txt'));
    nativeInput.files = dt.files;
    nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;

    const clearBtn = el.shadowRoot!.querySelector('.clear-btn') as HTMLElement;
    expect(clearBtn.getAttribute('role')).toBe('button');
    expect(clearBtn.getAttribute('tabindex')).toBe('0');
    expect(clearBtn.hasAttribute('hidden')).toBe(false);

    clearBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;

    expect(el.value).toBeNull();
  });
});
