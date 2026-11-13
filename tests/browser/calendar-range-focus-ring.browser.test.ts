/// <reference types="@vitest/browser-playwright" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '../../src/components/calendar/UCalendar.js';
import type { UCalendar } from '../../src/components/calendar/UCalendar.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * **범위 안의 키보드 초점 링이 네 변 다 보인다** — 픽셀로 잰다(WCAG 2.4.7).
 *
 * 초점 링은 날 버튼의 `box-shadow: 0 0 0 2px` 라 버튼 상자 **바깥**에 그려진다. 범위의 띠(`data-in-range`)는 이웃 날의
 * 배경이라, 이웃이 문서 순서에서 뒤에 있으면 그 배경이 링 위에 덮여 한 변이 띠 색으로 보였다(시작 날의 오른쪽 변).
 * 계산된 스타일은 «링이 있다» 고 말하므로 **링이 있어야 할 자리의 칠해진 픽셀**을 읽는다.
 */
async function shot(): Promise<{ data: Uint8ClampedArray; width: number; scale: number }> {
  const raw = (await page.screenshot({ save: false, base64: true } as never)) as unknown as { base64: string } | string;
  const base64 = typeof raw === 'string' ? raw : raw.base64;
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, img.width, img.height).data, width: img.width, scale: img.width / window.innerWidth };
}

const pixelAt = (s: Awaited<ReturnType<typeof shot>>, cssX: number, cssY: number): [number, number, number] => {
  const i = (Math.round(cssY * s.scale) * s.width + Math.round(cssX * s.scale)) * 4;
  return [s.data[i], s.data[i + 1], s.data[i + 2]];
};
const dist = (a: [number, number, number], b: [number, number, number]) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

const RING: [number, number, number] = [21, 101, 192]; // --u-focus-ring-color 의 대체값 #1565C0
const BAND: [number, number, number] = [227, 242, 253]; // --u-primary-bg-color 의 대체값 #E3F2FD

let stage: HTMLElement;
beforeEach(() => {
  window.scrollTo(0, 0);
  Locale.set('en');
  stage = document.createElement('div');
  stage.style.cssText = 'padding:24px;width:360px;background:#fff';
  document.body.append(stage);
});
afterEach(() => stage.remove());

async function mountRange(): Promise<UCalendar> {
  stage.innerHTML = '<button id="before">before</button><u-calendar selection="range" style="display:block;margin-top:16px"></u-calendar>';
  const el = stage.querySelector('u-calendar') as UCalendar;
  el.start = '2026-11-08';
  el.end = '2026-11-14';
  el.showDate('2026-11-08');
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 50));
  return el;
}

const day = (el: UCalendar, iso: string) => el.shadowRoot!.querySelector<HTMLElement>(`button.day[data-iso="${iso}"]`)!;

describe('u-calendar range — keyboard focus ring', () => {
  it('시작 날에 초점이 있으면 띠 쪽(오른쪽) 변의 링도 칠해진다', async () => {
    const el = await mountRange();
    (stage.querySelector('#before') as HTMLButtonElement).focus();
    await userEvent.tab(); // 키보드 모달리티를 만든다(첫 Tab 은 «이전 달» 단추로 간다)
    await el.focusDay(); // roving tabindex 의 날 — 시작 날
    await new Promise((r) => setTimeout(r, 100));
    const start = day(el, '2026-11-08');
    expect(start.matches(':focus-visible'), '초점이 시작 날에 있고 :focus-visible').toBe(true);
    expect(start.hasAttribute('data-range-start')).toBe(true);
    const r = start.getBoundingClientRect();
    const s = await shot();
    // 링은 버튼 상자 바깥 2px — 오른쪽 변 한가운데에서 1px 바깥이 링 색이어야 하고, 띠 색이면 이웃 날이 링을 덮은 것이다.
    const right = pixelAt(s, r.right + 1, r.top + r.height / 2);
    expect(dist(right, RING), `오른쪽 변의 픽셀 rgb(${right}) 는 링 색이어야 한다(띠 색 rgb(${BAND}) 이면 덮임)`).toBeLessThan(dist(right, BAND));
    // 반대 변(왼쪽)은 처음부터 보였다 — 비교 기준.
    const left = pixelAt(s, r.left - 1, r.top + r.height / 2);
    expect(dist(left, RING), `왼쪽 변의 픽셀 rgb(${left})`).toBeLessThan(120);
  });

  it('띠 한가운데 날에 초점이 있어도 오른쪽 변의 링이 칠해진다', async () => {
    const el = await mountRange();
    (stage.querySelector('#before') as HTMLButtonElement).focus();
    await userEvent.tab();
    await el.focusDay();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}'); // 11-10
    await new Promise((r) => setTimeout(r, 100));
    const mid = day(el, '2026-11-10');
    expect(mid.matches(':focus-visible')).toBe(true);
    const r = mid.getBoundingClientRect();
    const s = await shot();
    const right = pixelAt(s, r.right + 1, r.top + r.height / 2);
    expect(dist(right, RING), `오른쪽 변의 픽셀 rgb(${right})`).toBeLessThan(dist(right, BAND));
  });
});
