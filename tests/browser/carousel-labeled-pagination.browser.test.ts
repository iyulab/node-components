import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/carousel/UCarousel.js';
import type { UCarousel } from '../../src/components/carousel/UCarousel.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `pagination-style="labels"` — 벽걸이 화면의 순서 표시. 멀리서 «지금 어느 장, 다음은 무엇, 언제 넘어가나» 가 읽혀야 한다:
 * - 칸마다 슬라이드에 단 `aria-label` 이 보이는 이름이다(없으면 순번).
 * - 넘기는 동안 현재 칸의 막대가 `autoplay-interval` 만큼 차오르고, 지나온 칸은 찬 막대다.
 * - 줄은 슬라이드 위에 겹치지 않고 아래에 놓인다(겹치면 목록의 마지막 행을 가린다).
 * NEGATIVE: 기본(`dots`)은 종전대로 겹친 점이다.
 */
describe('u-carousel labeled pagination', () => {
  const INTERVAL = 600;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  beforeEach(() => {
    document.body.innerHTML = '';
    Locale.set('en');
  });

  async function mount(attrs: string, labelled = true): Promise<UCarousel> {
    const slide = (n: string) => (labelled ? `<div aria-label="${n}" style="height:100%">${n}</div>` : `<div style="height:100%">${n}</div>`);
    document.body.innerHTML =
      `<button id="before">before</button>` +
      `<u-carousel ${attrs} autoplay-interval="${INTERVAL}" style="width:600px;height:300px">` +
      ['Late', 'Stages', 'Batches'].map(slide).join('') + `</u-carousel>`;
    await userEvent.hover(document.getElementById('before')!);
    const el = document.querySelector('u-carousel') as UCarousel;
    await el.updateComplete;
    await wait(0);
    await el.updateComplete;
    return el;
  }

  const tabs = (el: UCarousel) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="dot"]')];
  const fillWidth = (tab: HTMLElement) => tab.querySelector<HTMLElement>('[part~="dot-progress"]')!.getBoundingClientRect().width;

  it('shows each slide’s name, below the slides', async () => {
    const el = await mount('pagination pagination-style="labels" autoplay');
    expect(tabs(el).map((t) => t.textContent!.trim())).toEqual(['Late', 'Stages', 'Batches']);
    expect(tabs(el)[0].getAttribute('aria-current')).toBe('true');
    const slides = el.shadowRoot!.querySelector('.slides-wrapper')!.getBoundingClientRect();
    const indicator = el.shadowRoot!.querySelector('[part="indicator"]')!.getBoundingClientRect();
    expect(indicator.top).toBeGreaterThanOrEqual(slides.bottom - 0.5);
    expect(indicator.bottom).toBeLessThanOrEqual(el.getBoundingClientRect().bottom + 0.5);
  });

  it('fills the current tab over the interval, and the passed tab stays full', async () => {
    const el = await mount('pagination pagination-style="labels" autoplay');
    const track = tabs(el)[0].querySelector<HTMLElement>('[part~="dot-track"]')!.getBoundingClientRect().width;
    await wait(INTERVAL / 2);
    const half = fillWidth(tabs(el)[0]);
    expect(half).toBeGreaterThan(track * 0.2);
    expect(half).toBeLessThan(track * 0.9);
    await wait(INTERVAL / 2 + 150);
    await el.updateComplete;
    expect(el.index).toBe(1);
    expect(tabs(el)[1].getAttribute('aria-current')).toBe('true');
    expect(Math.round(fillWidth(tabs(el)[0]))).toBe(Math.round(track));
  });

  it('falls back to the position when a slide has no name', async () => {
    const el = await mount('pagination pagination-style="labels"', false);
    expect(tabs(el).map((t) => t.textContent!.trim())).toEqual(['1', '2', '3']);
  });

  it('NEGATIVE — the default dots stay over the slides', async () => {
    const el = await mount('pagination');
    const indicator = el.shadowRoot!.querySelector('[part="indicator"]')!;
    expect(getComputedStyle(indicator).position).toBe('absolute');
    expect(tabs(el)[0].textContent!.trim()).toBe('');
  });
});
