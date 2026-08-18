import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UOption } from '../../src/components/option/UOption.js';
import type { UChip } from '../../src/components/chip/UChip.js';

// slotchange → options(@state) 갱신 → 후속 업데이트까지 전부 소화시킨다.
async function settle(el: USelect) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function createSelect(values: string[], attrs: Record<string, string> = {}): USelect {
  const select = document.createElement('u-select') as USelect;
  for (const [k, v] of Object.entries(attrs)) select.setAttribute(k, v);
  for (const v of values) {
    const option = document.createElement('u-option');
    option.setAttribute('value', v);
    option.textContent = `Option ${v}`;
    select.appendChild(option);
  }
  return select;
}

function trackChanges(select: USelect): { count: number; values: unknown[] } {
  const seen = { count: 0, values: [] as unknown[] };
  select.addEventListener('change', () => {
    seen.count++;
    seen.values.push(select.value);
  });
  return seen;
}

describe('USelect change 이벤트 의미론 (사용자 상호작용에서만 발화)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('마운트·옵션 등록 과정에서 change를 발화하지 않는다', async () => {
    const select = createSelect(['a', 'b', 'c']);
    const seen = trackChanges(select);
    document.body.appendChild(select);
    await settle(select);

    expect(seen.count).toBe(0);
    expect(select.value).toBeUndefined();
  });

  it('옵션 등록 전에 세팅한 value가 등록 후에도 보존되고 change는 발화하지 않는다', async () => {
    const select = createSelect([]);
    const seen = trackChanges(select);
    select.value = 'b';
    document.body.appendChild(select);
    await select.updateComplete;

    // 옵션은 마운트 이후에 늦게 등록된다 (React 래퍼 시나리오 재현)
    for (const v of ['a', 'b', 'c']) {
      const option = document.createElement('u-option');
      option.setAttribute('value', v);
      option.textContent = `Option ${v}`;
      select.appendChild(option);
    }
    await settle(select);

    expect(select.value).toBe('b');
    expect(seen.count).toBe(0);
    const optionB = select.querySelector('u-option[value="b"]') as UOption;
    expect(optionB.selected).toBe(true);
  });

  it('프로그램적 value 변경은 change를 발화하지 않고 selected만 동기화한다', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const seen = trackChanges(select);
    select.value = 'a';
    await settle(select);

    expect(seen.count).toBe(0);
    const optionA = select.querySelector('u-option[value="a"]') as UOption;
    expect(optionA.selected).toBe(true);
  });

  it('사용자 옵션 클릭은 change를 정확히 1회 발화하고, 리스너 시점에 value가 반영돼 있다', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const seen = trackChanges(select);
    (select.querySelector('u-option[value="b"]') as UOption).click();
    await settle(select);

    expect(seen.count).toBe(1);
    expect(seen.values).toEqual(['b']);
    expect(select.value).toBe('b');
  });

  it('동일 옵션 재클릭은 change를 발화하지 않는다', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const optionB = select.querySelector('u-option[value="b"]') as UOption;
    optionB.click();
    await settle(select);

    const seen = trackChanges(select);
    optionB.click();
    await settle(select);

    expect(seen.count).toBe(0);
    expect(select.value).toBe('b');
  });

  it('multiple: 옵션 클릭 토글과 칩 제거가 각각 change를 발화한다', async () => {
    const select = createSelect(['a', 'b'], { multiple: '' });
    document.body.appendChild(select);
    await settle(select);

    const seen = trackChanges(select);
    (select.querySelector('u-option[value="a"]') as UOption).click();
    await settle(select);
    (select.querySelector('u-option[value="b"]') as UOption).click();
    await settle(select);

    expect(seen.count).toBe(2);
    expect(select.value).toEqual(['a', 'b']);

    const chip = select.shadowRoot!.querySelector('u-chip[data-value="a"]') as UChip;
    expect(chip).toBeTruthy();
    chip.dispatchEvent(new Event('remove'));
    await settle(select);

    expect(seen.count).toBe(3);
    expect(select.value).toEqual(['b']);
  });

  it('clearable 지우기 클릭은 change를 발화하고 값을 초기화한다', async () => {
    const select = createSelect(['a', 'b'], { clearable: '' });
    document.body.appendChild(select);
    await settle(select);

    (select.querySelector('u-option[value="a"]') as UOption).click();
    await settle(select);

    const seen = trackChanges(select);
    const clearIcon = select.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clearIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(select);

    expect(seen.count).toBe(1);
    expect(select.value).toBe('');
  });
});
