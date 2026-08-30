import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/checkbox/UCheckbox.js';
import type { UCheckbox } from '../../src/components/checkbox/UCheckbox.js';

function createCheckbox(attrs: Record<string, string> = {}): UCheckbox {
  const checkbox = document.createElement('u-checkbox') as UCheckbox;
  for (const [k, v] of Object.entries(attrs)) checkbox.setAttribute(k, v);
  return checkbox;
}

describe('UCheckbox — 체크 상태 아이콘이 클릭을 가로채지 않는다 (docket #147)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('checked 상태에서 .checkbox u-icon 은 pointer-events:none 이다', async () => {
    const checkbox = createCheckbox({ checked: '' });
    document.body.appendChild(checkbox);
    await checkbox.updateComplete;

    const icon = checkbox.shadowRoot!.querySelector('.checkbox u-icon') as HTMLElement;
    expect(getComputedStyle(icon).pointerEvents).toBe('none');
  });

  it('indeterminate 상태에서도 아이콘은 pointer-events:none 이다', async () => {
    const checkbox = createCheckbox({ indeterminate: '' });
    document.body.appendChild(checkbox);
    await checkbox.updateComplete;

    const icon = checkbox.shadowRoot!.querySelector('.checkbox u-icon') as HTMLElement;
    expect(getComputedStyle(icon).pointerEvents).toBe('none');
  });
});
