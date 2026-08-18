import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/radio/URadio.js';
import '../../src/components/rating/URating.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/option/UOption.js';
import type { URadio } from '../../src/components/radio/URadio.js';
import type { URating } from '../../src/components/rating/URating.js';
import type { USlider } from '../../src/components/slider/USlider.js';
import type { UOption } from '../../src/components/option/UOption.js';

// drains everything from slotchange → @state update → the follow-up update.
async function settle(el: HTMLElement & { updateComplete: Promise<boolean> }) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function trackChanges(el: HTMLElement): { count: number } {
  const seen = { count: 0 };
  el.addEventListener('change', () => seen.count++);
  return seen;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('URadio change event semantics (fires only from user interaction)', () => {
  function createRadio(values: string[]): URadio {
    const radio = document.createElement('u-radio') as URadio;
    for (const v of values) {
      const option = document.createElement('u-option');
      option.setAttribute('value', v);
      option.textContent = `Option ${v}`;
      radio.appendChild(option);
    }
    return radio;
  }

  it('mount, option registration, and a programmatic value set do not fire change', async () => {
    const radio = createRadio(['a', 'b']);
    const seen = trackChanges(radio);
    radio.value = 'b';
    document.body.appendChild(radio);
    await settle(radio);

    expect(seen.count).toBe(0);
    expect(radio.value).toBe('b');
    expect((radio.querySelector('u-option[value="b"]') as UOption).selected).toBe(true);
  });

  it('a user option click fires change once, and re-clicking the selected option does not', async () => {
    const radio = createRadio(['a', 'b']);
    document.body.appendChild(radio);
    await settle(radio);

    const seen = trackChanges(radio);
    const optionA = radio.querySelector('u-option[value="a"]') as UOption;
    optionA.click();
    await settle(radio);
    expect(seen.count).toBe(1);
    expect(radio.value).toBe('a');

    optionA.click();
    await settle(radio);
    expect(seen.count).toBe(1);
  });
});

describe('URating change event semantics (fires only from user interaction)', () => {
  it('a programmatic value set does not fire change', async () => {
    const rating = document.createElement('u-rating') as URating;
    const seen = trackChanges(rating);
    document.body.appendChild(rating);
    rating.value = 3;
    await settle(rating);

    expect(seen.count).toBe(0);
    expect(rating.value).toBe(3);
  });

  it('clicking a symbol fires change (re-clicking the same symbol toggles it to 0, which also fires)', async () => {
    const rating = document.createElement('u-rating') as URating;
    document.body.appendChild(rating);
    await settle(rating);

    const seen = trackChanges(rating);
    const symbol3 = rating.shadowRoot!.querySelector('.symbol[data-score="3"]') as HTMLElement;
    symbol3.click();
    await settle(rating);
    expect(seen.count).toBe(1);
    expect(rating.value).toBe(3);

    symbol3.click();
    await settle(rating);
    expect(seen.count).toBe(2);
    expect(rating.value).toBe(0);
  });
});

describe('USlider change event semantics (fires only from user interaction)', () => {
  function createSlider(): USlider {
    const slider = document.createElement('u-slider') as USlider;
    slider.style.width = '200px';
    slider.style.display = 'block';
    return slider;
  }

  it('mount and a programmatic value set do not fire change', async () => {
    const slider = createSlider();
    const seen = trackChanges(slider);
    document.body.appendChild(slider);
    await settle(slider);

    slider.value = 42;
    await settle(slider);

    expect(seen.count).toBe(0);
    expect(slider.value).toBe(42);
  });

  it('each keyboard action fires change once', async () => {
    const slider = createSlider();
    slider.value = 50;
    document.body.appendChild(slider);
    await settle(slider);

    const seen = trackChanges(slider);
    const thumb = slider.shadowRoot!.querySelector('.thumb[data-thumb="min"]') as HTMLElement;
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle(slider);

    expect(seen.count).toBe(1);
    expect(slider.value).toBe(51);
  });

  it('a drag fires change exactly once, at pointerup (not during the drag)', async () => {
    const slider = createSlider();
    slider.value = 0;
    document.body.appendChild(slider);
    await settle(slider);

    const seen = trackChanges(slider);
    const container = slider.shadowRoot!.querySelector('.container') as HTMLElement;
    const track = slider.shadowRoot!.querySelector('.track') as HTMLElement;
    const rect = track.getBoundingClientRect();

    container.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: rect.left + rect.width * 0.3, bubbles: true,
    }));
    await settle(slider);
    document.dispatchEvent(new PointerEvent('pointermove', {
      clientX: rect.left + rect.width * 0.6, bubbles: true,
    }));
    await settle(slider);
    expect(seen.count).toBe(0); // does not fire during the drag

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await settle(slider);

    expect(seen.count).toBe(1);
    expect(slider.value).toBe(60);
  });
});
