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

// Checks that a value declared as a markup attribute is parsed into the right value type
// for each control. (When the base was type: Object, JSON.parse failures silently turned
// everything into null — that gap is what this guards.)
describe('form control value attribute declared in markup', () => {
  it('u-input: a plain string value attribute is reflected as-is', async () => {
    const input = document.createElement('u-input') as UInput;
    input.setAttribute('value', 'hello');
    document.body.appendChild(input);
    await settle(input);

    expect(input.value).toBe('hello');
  });

  it('u-select: a single string value attribute is reflected and that option becomes selected', async () => {
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

  it('u-select multiple: a JSON array value attribute is parsed into an array', async () => {
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

  it('u-rating: a numeric value attribute is parsed into a number', async () => {
    const rating = document.createElement('u-rating') as URating;
    rating.setAttribute('value', '3');
    document.body.appendChild(rating);
    await settle(rating);

    expect(rating.value).toBe(3);
  });

  it('u-slider: a numeric value attribute becomes a number, and a JSON array becomes a range array', async () => {
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
