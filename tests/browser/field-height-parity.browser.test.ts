import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';

/**
 * 한 줄 필드 넷은 같은 크기 단에서 같은 높이다 — 폼 한 줄에 나란히 놓이고, 높이가 다르면 줄이 어긋난다.
 *
 * 날짜 피커 둘의 글자 칸이 `font: inherit` 로 줄 높이를 `normal` 로 받아, 같은 단의 입력보다 낮게 그려졌다
 * (기본 밀도 md 27px 대 32px). 줄 높이는 글자 칸이 정한다 — 피커 공용 시트가 한 번 선언한다.
 */
const FIELDS = ['u-input', 'u-select', 'u-date-picker', 'u-date-range-picker'];
const SIZES = ['sm', 'md', 'lg'];

async function heights(size: string, density?: string): Promise<Record<string, number>> {
  document.body.innerHTML = `<div style="display:flex;align-items:flex-start;${density ? `--u-density:${density}` : ''}">${FIELDS.map((t) => `<${t} size="${size}"></${t}>`).join('')}</div>`;
  const els = [...document.body.querySelectorAll<HTMLElement & { updateComplete: Promise<unknown> }>(FIELDS.join(','))];
  await Promise.all(els.map((el) => el.updateComplete));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return Object.fromEntries(els.map((el) => [el.localName, el.getBoundingClientRect().height]));
}

describe('한 줄 필드의 높이 대등성', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  for (const density of [undefined, '18px']) {
    for (const size of SIZES) {
      it(`🔴${size}${density ? ` · 밀도 ${density}` : ''} — 넷이 입력과 같은 높이다`, async () => {
        const h = await heights(size, density);
        for (const tag of FIELDS) expect(h[tag], `${tag} ${JSON.stringify(h)}`).toBeCloseTo(h['u-input'], 0);
      });
    }
  }

  it('NEGATIVE 단이 바뀌면 높이도 바뀐다(측정이 살아 있다)', async () => {
    expect((await heights('lg'))['u-input']).toBeGreaterThan((await heights('sm'))['u-input']);
  });
});
