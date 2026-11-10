import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 「필드 끝의 지우기 단추가 `dir="rtl"` 에서 LTR 의 거울인가」 — 받는 영역을 넓히는 음수 여백(`margin: -P -P -P P`)이 «왼쪽/오른쪽» 이
 * 아니라 «시작/끝» 에 서야 한다. 같은 필드를 LTR · RTL 로 두 번 그려 지우기 단추 상자의 **끝 가장자리에서 호스트 끝까지의 거리**와
 * 단추 상자의 폭이 두 방향에서 같음을 잰다(물리 여백이면 RTL 에서 단추가 반대쪽 여백만큼 안쪽으로 밀린다).
 */

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 120));
}

interface Reading { endGap: number; width: number }

async function read(dir: 'ltr' | 'rtl', markup: string, pick: (host: HTMLElement) => Element | null): Promise<Reading> {
  document.documentElement.dir = dir;
  document.body.innerHTML = markup;
  await settle();
  const host = document.getElementById('h') as HTMLElement;
  const btn = pick(host);
  expect(btn, '지우기 단추를 찾는다').not.toBeNull();
  const H = host.getBoundingClientRect();
  const B = btn!.getBoundingClientRect();
  return { endGap: dir === 'ltr' ? H.right - B.right : B.left - H.left, width: B.width };
}

const CASES: Array<[string, string, (h: HTMLElement) => Element | null]> = [
  ['u-input', '<u-input id="h" clearable value="x" style="display:block;width:240px"></u-input>',
    (h) => h.shadowRoot!.querySelector('.suffix-item[role="button"]:not([hidden])')],
  ['u-select', '<u-select id="h" clearable value="a" style="display:block;width:240px"><u-option value="a">A</u-option><u-option value="b">B</u-option></u-select>',
    (h) => h.shadowRoot!.querySelector('.suffix-item[role="button"]:not([hidden])')],
];

afterEach(() => { document.documentElement.dir = 'ltr'; document.body.innerHTML = ''; });

describe('RTL — 필드 끝의 지우기 단추', () => {
  for (const [label, markup, pick] of CASES) {
    it(`${label}: 끝 가장자리 거리와 상자 폭이 LTR 과 같다`, async () => {
      const ltr = await read('ltr', markup, pick);
      const rtl = await read('rtl', markup, pick);
      expect(ltr.width, `${label}: 단추 상자가 잡힌다`).toBeGreaterThan(0);
      expect(Math.abs(rtl.width - ltr.width), `${label}: 폭 LTR ${ltr.width} · RTL ${rtl.width}`).toBeLessThanOrEqual(0.75);
      expect(Math.abs(rtl.endGap - ltr.endGap), `${label}: 끝 가장자리 거리 LTR ${ltr.endGap} · RTL ${rtl.endGap}`).toBeLessThanOrEqual(0.75);
    });
  }
});
