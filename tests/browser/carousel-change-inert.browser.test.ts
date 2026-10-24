import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/carousel/UCarousel.js';
import type { UCarousel, UCarouselChangeDetail } from '../../src/components/carousel/UCarousel.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-carousel` tells the page which slide is shown (`change`, like its sibling `u-tab-panel`) — a wall screen whose
 * heading follows each slide had no way to know — and keeps slides out of view `inert`, so their links and buttons leave
 * the Tab order and reading order (APG Carousel). With several slides in view only those outside the range are inert, and
 * an `inert` the page put on a slide is left alone.
 */

const tick = () => new Promise(r => setTimeout(r, 0));

async function mount(attrs: Record<string, string> = {}, count = 4, extra?: (slide: HTMLElement, i: number) => void): Promise<UCarousel> {
  const el = document.createElement('u-carousel') as UCarousel;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (let i = 0; i < count; i++) {
    const slide = document.createElement('div');
    slide.innerHTML = `<a href="#s${i}">slide ${i}</a>`;
    extra?.(slide, i);
    el.appendChild(slide);
  }
  document.body.appendChild(el);
  await el.updateComplete;
  await tick();
  await el.updateComplete;
  return el;
}

const slides = (el: UCarousel) => [...el.children] as HTMLElement[];
const inertFlags = (el: UCarousel) => slides(el).map(s => s.hasAttribute('inert'));
const button = (el: UCarousel, part: string) =>
  el.shadowRoot!.querySelector(`[part="${part}"]`)!.shadowRoot?.querySelector('button')
  ?? el.shadowRoot!.querySelector<HTMLElement>(`[part="${part}"]`)!;

describe('u-carousel — change and inert slides', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Locale.set('en');
  });

  it('only the shown slide is reachable; the rest are inert', async () => {
    const el = await mount();
    expect(inertFlags(el)).toEqual([false, true, true, true]);
    el.index = 2;
    await el.updateComplete;
    expect(inertFlags(el)).toEqual([true, true, false, true]);
  });

  it('with several slides in view, only those outside the range are inert', async () => {
    const el = await mount({ 'slides-per-view': '2' });
    expect(inertFlags(el)).toEqual([false, false, true, true]);
  });

  it('an inert the page put on a slide is left alone', async () => {
    const el = await mount({}, 3, (s, i) => { if (i === 0) s.setAttribute('inert', ''); });
    expect(inertFlags(el)).toEqual([true, true, true]);
    el.index = 1;
    await el.updateComplete;
    expect(inertFlags(el)).toEqual([true, false, true]);
  });

  it('a slide that leaves the carousel loses the inert we put on it', async () => {
    const el = await mount();
    const second = slides(el)[1];
    expect(second.hasAttribute('inert')).toBe(true);
    second.remove();
    await tick();
    await el.updateComplete;
    expect(second.hasAttribute('inert')).toBe(false);
  });

  it('a person moving it fires change with the new and previous index', async () => {
    const el = await mount({ navigation: '' });
    const seen: UCarouselChangeDetail[] = [];
    el.addEventListener('change', (e) => seen.push(e.detail));
    await userEvent.click(button(el, 'next-button'));
    await el.updateComplete;
    expect(seen).toEqual([{ index: 1, previousIndex: 0, cause: 'user' }]);
    el.goTo(3);
    expect(seen.at(-1)).toEqual({ index: 3, previousIndex: 1, cause: 'user' });
  });

  it('autoplay fires change with cause autoplay', async () => {
    const el = await mount({ autoplay: '', 'autoplay-interval': '150', unattended: '' });
    const seen: UCarouselChangeDetail[] = [];
    el.addEventListener('change', (e) => seen.push(e.detail));
    await new Promise(r => setTimeout(r, 400));
    expect(seen.length).toBeGreaterThanOrEqual(1);
    expect(seen[0]).toEqual({ index: 1, previousIndex: 0, cause: 'autoplay' });
  });

  it('NEGATIVE: setting index does not fire change, and change does not bubble', async () => {
    const el = await mount();
    let fired = 0;
    let bubbled = 0;
    el.addEventListener('change', () => fired++);
    document.body.addEventListener('change', () => bubbled++);
    el.index = 2;
    await el.updateComplete;
    expect(fired).toBe(0);
    el.next();
    expect(fired).toBe(1);
    expect(bubbled).toBe(0);
  });
});
