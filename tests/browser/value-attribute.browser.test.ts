import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/rating/URating.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/option/UOption.js';
import type { UInput } from '../../src/components/input/UInput.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { URating } from '../../src/components/rating/URating.js';
import type { USlider } from '../../src/components/slider/USlider.js';
import type { UOption } from '../../src/components/option/UOption.js';

async function settle(el: HTMLElement & { updateComplete: Promise<boolean> }) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

// 마크업 attribute로 선언한 value가 각 컨트롤의 값 타입으로 올바르게 해석되는지 검증한다.
// (base가 type: Object였을 때는 JSON.parse 실패로 전부 null이 되는 갭이 있었다)
describe('폼 컨트롤 value attribute 마크업 선언', () => {
  it('u-input: 일반 문자열 value attribute가 그대로 반영된다', async () => {
    const input = document.createElement('u-input') as UInput;
    input.setAttribute('value', 'hello');
    document.body.appendChild(input);
    await settle(input);

    expect(input.value).toBe('hello');
  });

  it('u-select: 단일 문자열 value attribute가 반영되고 해당 옵션이 selected 된다', async () => {
    const select = document.createElement('u-select') as USelect;
    select.setAttribute('value', 'b');
    for (const v of ['a', 'b']) {
      const option = document.createElement('u-option');
      option.setAttribute('value', v);
      option.textContent = v;
      select.appendChild(option);
    }
    document.body.appendChild(select);
    await settle(select);

    expect(select.value).toBe('b');
    expect((select.querySelector('u-option[value="b"]') as UOption).selected).toBe(true);
  });

  it('u-select multiple: JSON 배열 value attribute가 배열로 해석된다', async () => {
    const select = document.createElement('u-select') as USelect;
    select.setAttribute('multiple', '');
    select.setAttribute('value', '["a","b"]');
    for (const v of ['a', 'b', 'c']) {
      const option = document.createElement('u-option');
      option.setAttribute('value', v);
      option.textContent = v;
      select.appendChild(option);
    }
    document.body.appendChild(select);
    await settle(select);

    expect(select.value).toEqual(['a', 'b']);
  });

  it('u-rating: 숫자 value attribute가 number로 해석된다', async () => {
    const rating = document.createElement('u-rating') as URating;
    rating.setAttribute('value', '3');
    document.body.appendChild(rating);
    await settle(rating);

    expect(rating.value).toBe(3);
  });

  it('u-slider: 숫자 value attribute가 number로, JSON 배열은 range 배열로 해석된다', async () => {
    const slider = document.createElement('u-slider') as USlider;
    slider.setAttribute('value', '42');
    document.body.appendChild(slider);
    await settle(slider);
    expect(slider.value).toBe(42);

    const range = document.createElement('u-slider') as USlider;
    range.setAttribute('range', '');
    range.setAttribute('value', '[10,20]');
    document.body.appendChild(range);
    await settle(range);
    expect(range.value).toEqual([10, 20]);
  });
});
