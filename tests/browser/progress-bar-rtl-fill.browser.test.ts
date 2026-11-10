import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 「확정 진행 막대의 채움이 `dir="rtl"` 에서 **시작 쪽**(오른쪽)에서 자라는가」 — 채움은 `scaleX(비율)` 로 그려지므로 변환의 기준점
 * (`transform-origin`)이 «왼쪽» 이면 RTL 에서도 왼쪽에서 자란다(선언 이름이 물리가 아니라 값이 물리라 `margin-left` 류 게이트가 못 본다).
 * 같은 막대를 LTR · RTL 로 그려 채움 · 버퍼 상자의 **시작 가장자리 거리**와 폭이 두 방향에서 같음을 잰다.
 */

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 600)); // 채움 전환(--u-duration-slow)이 끝나기를 기다린다
}

interface Reading { startGap: number; width: number }

async function read(dir: 'ltr' | 'rtl', part: 'indicator' | 'buffer'): Promise<Reading> {
  document.documentElement.dir = dir;
  document.body.innerHTML = '<u-progress-bar id="h" value="40" buffer="70" style="display:block;width:300px"></u-progress-bar>';
  await settle();
  const host = document.getElementById('h') as HTMLElement;
  const H = host.getBoundingClientRect();
  const B = host.shadowRoot!.querySelector(`.${part}`)!.getBoundingClientRect();
  return { startGap: dir === 'ltr' ? B.left - H.left : H.right - B.right, width: B.width };
}

afterEach(() => { document.documentElement.dir = 'ltr'; document.body.innerHTML = ''; });

describe('RTL — 확정 진행 막대의 채움', () => {
  for (const [part, expected] of [['indicator', 120], ['buffer', 210]] as const) {
    it(`${part}: 시작 가장자리에서 자라 같은 폭이다`, async () => {
      const ltr = await read('ltr', part);
      const rtl = await read('rtl', part);
      expect(Math.abs(ltr.width - expected), `LTR ${part} 폭 ${ltr.width}`).toBeLessThanOrEqual(1);
      expect(Math.abs(ltr.startGap), `LTR ${part} 시작 거리 ${ltr.startGap}`).toBeLessThanOrEqual(0.75);
      expect(Math.abs(rtl.width - ltr.width), `${part} 폭 LTR ${ltr.width} · RTL ${rtl.width}`).toBeLessThanOrEqual(0.75);
      expect(Math.abs(rtl.startGap - ltr.startGap), `${part} 시작 거리 LTR ${ltr.startGap} · RTL ${rtl.startGap}`).toBeLessThanOrEqual(0.75);
    });
  }
});
