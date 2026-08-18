import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/radio/URadio.js';
import '../../src/components/rating/URating.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/option/UOption.js';
import type { URadio } from '../../src/components/radio/URadio.js';
import type { URating } from '../../src/components/rating/URating.js';
import type { USlider } from '../../src/components/slider/USlider.js';
import type { UOption } from '../../src/components/option/UOption.js';

// slotchange → @state 갱신 → 후속 업데이트까지 전부 소화시킨다.
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

describe('URadio change 이벤트 의미론 (사용자 상호작용에서만 발화)', () => {
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

  it('마운트·옵션 등록·프로그램적 value 세팅은 change를 발화하지 않는다', async () => {
    const radio = createRadio(['a', 'b']);
    const seen = trackChanges(radio);
    radio.value = 'b';
    document.body.appendChild(radio);
    await settle(radio);

    expect(seen.count).toBe(0);
    expect(radio.value).toBe('b');
    expect((radio.querySelector('u-option[value="b"]') as UOption).selected).toBe(true);
  });

  it('사용자 옵션 클릭은 change를 1회 발화하고, 선택된 옵션 재클릭은 발화하지 않는다', async () => {
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

describe('URating change 이벤트 의미론 (사용자 상호작용에서만 발화)', () => {
  it('프로그램적 value 세팅은 change를 발화하지 않는다', async () => {
    const rating = document.createElement('u-rating') as URating;
    const seen = trackChanges(rating);
    document.body.appendChild(rating);
    rating.value = 3;
    await settle(rating);

    expect(seen.count).toBe(0);
    expect(rating.value).toBe(3);
  });

  it('심볼 클릭은 change를 발화한다 (같은 심볼 재클릭은 0으로 토글되며 역시 발화)', async () => {
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

describe('USlider change 이벤트 의미론 (사용자 상호작용에서만 발화)', () => {
  function createSlider(): USlider {
    const slider = document.createElement('u-slider') as USlider;
    slider.style.width = '200px';
    slider.style.display = 'block';
    return slider;
  }

  it('마운트·프로그램적 value 세팅은 change를 발화하지 않는다', async () => {
    const slider = createSlider();
    const seen = trackChanges(slider);
    document.body.appendChild(slider);
    await settle(slider);

    slider.value = 42;
    await settle(slider);

    expect(seen.count).toBe(0);
    expect(slider.value).toBe(42);
  });

  it('키보드 조작은 조작마다 change를 1회 발화한다', async () => {
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

  it('드래그는 pointerup 시점에 change를 1회만 발화한다 (드래그 중 미발화)', async () => {
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
    expect(seen.count).toBe(0); // 드래그 중에는 발화하지 않는다

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await settle(slider);

    expect(seen.count).toBe(1);
    expect(slider.value).toBe(60);
  });
});
