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

  // 후속 실측(요청자 재검증, 2026-09-01): 아이콘을 고쳐도 부모 `.checkbox` span
  // 자체가 여전히 hit-test 최상단을 차지해 좌표 기반 클릭(Playwright actionability
  // check 등)이 막혔다. `.checkbox`도 pointer-events:none이라야 `<label>`까지
  // 히트테스트가 투과한다.
  it('.checkbox span 자체도 pointer-events:none 이다 — checked 여부와 무관', async () => {
    const checked = createCheckbox({ checked: '' });
    const unchecked = createCheckbox();
    document.body.append(checked, unchecked);
    await Promise.all([checked.updateComplete, unchecked.updateComplete]);

    for (const el of [checked, unchecked]) {
      const box = el.shadowRoot!.querySelector('.checkbox') as HTMLElement;
      expect(getComputedStyle(box).pointerEvents).toBe('none');
    }
  });

  it('.checkbox 중앙 좌표의 실제 히트테스트가 label(.wrapper)까지 투과한다', async () => {
    const checkbox = createCheckbox();
    document.body.appendChild(checkbox);
    await checkbox.updateComplete;

    const box = checkbox.shadowRoot!.querySelector('.checkbox') as HTMLElement;
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const hit = checkbox.shadowRoot!.elementFromPoint(cx, cy);
    expect(hit).not.toBe(box);
    expect(hit?.closest('label.wrapper')).not.toBeNull();
  });

  it('label(.wrapper) 클릭이 여전히 checked를 토글한다 — 위임 경로 회귀 없음', async () => {
    const checkbox = createCheckbox();
    document.body.appendChild(checkbox);
    await checkbox.updateComplete;

    const label = checkbox.shadowRoot!.querySelector('label.wrapper') as HTMLElement;
    label.click();
    await checkbox.updateComplete;

    expect(checkbox.hasAttribute('checked')).toBe(true);
  });
});
