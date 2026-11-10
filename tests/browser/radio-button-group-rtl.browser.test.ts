import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 「단추형 라디오(`type="button"`) 묶음이 `dir="rtl"` 에서 LTR 의 거울인가」 — 묶음의 바깥 모서리(첫 칸의 시작 쪽 · 마지막 칸의 끝 쪽)와
 * 칸 사이 구분선은 «왼쪽/오른쪽» 이 아니라 «시작/끝» 에 선다. 같은 묶음을 LTR · RTL 로 두 번 그려 각 칸의 네 모서리 반지름과 좌우 테두리
 * 폭이 정확히 **좌우 반전**(왼쪽 위 ↔ 오른쪽 위 · 왼쪽 아래 ↔ 오른쪽 아래 · 왼쪽 테두리 ↔ 오른쪽 테두리)인지 잰다. LTR 쪽이 먼저 서
 * 있어야 «전환이 LTR 을 안 바꿨다» 가 증명된다. 세로 묶음은 위/아래만 쓰므로 RTL 에서도 그대로여야 한다.
 */

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 120));
}

interface Edges { tl: number; tr: number; br: number; bl: number; left: number; right: number; top: number; bottom: number }

/** 한 칸의 모서리 반지름(호스트)과 테두리 폭(칸 구분선을 그리는 `.base`). */
function read(option: Element): Edges {
  const host = getComputedStyle(option);
  const base = getComputedStyle(option.shadowRoot!.querySelector('.base')!);
  const px = (v: string) => parseFloat(v) || 0;
  return {
    tl: px(host.borderTopLeftRadius), tr: px(host.borderTopRightRadius), br: px(host.borderBottomRightRadius), bl: px(host.borderBottomLeftRadius),
    left: px(base.borderLeftWidth), right: px(base.borderRightWidth), top: px(base.borderTopWidth), bottom: px(base.borderBottomWidth),
  };
}

async function readGroup(dir: 'ltr' | 'rtl', orientation: string): Promise<Edges[]> {
  document.documentElement.dir = dir;
  document.body.innerHTML = `<u-radio id="h" type="button" appearance="outlined" orientation="${orientation}" name="g">` +
    '<u-option value="a">A</u-option><u-option value="b">B</u-option><u-option value="c">C</u-option></u-radio>';
  await settle();
  return Array.from(document.querySelectorAll('u-option')).map(read);
}

afterEach(() => { document.documentElement.dir = 'ltr'; document.body.innerHTML = ''; });

describe('RTL — 단추형 라디오 묶음', () => {
  it('가로 묶음: 모서리 반지름과 칸 구분선이 LTR 의 좌우 반전이다', async () => {
    const ltr = await readGroup('ltr', 'horizontal');
    const rtl = await readGroup('rtl', 'horizontal');
    expect(ltr.length).toBe(3);
    // LTR 기준선 — 첫 칸은 왼쪽 모서리가 둥글고 마지막 칸은 오른쪽이 둥글며, 처음 둘은 오른쪽에 구분선이 있다.
    expect(ltr[0].tl, 'LTR 첫 칸 왼쪽 위 모서리').toBeGreaterThan(0);
    expect(ltr[0].tr, 'LTR 첫 칸 오른쪽 위 모서리').toBe(0);
    expect(ltr[2].tr, 'LTR 마지막 칸 오른쪽 위 모서리').toBeGreaterThan(0);
    expect(ltr[2].tl, 'LTR 마지막 칸 왼쪽 위 모서리').toBe(0);
    expect(ltr[0].right, 'LTR 첫 칸 오른쪽 구분선').toBeGreaterThan(0);
    expect(ltr[2].right, 'LTR 마지막 칸은 구분선이 없다').toBe(0);
    ltr.forEach((l, i) => {
      const r = rtl[i];
      expect(r.tl, `칸 ${i}: RTL 왼쪽 위 = LTR 오른쪽 위`).toBeCloseTo(l.tr, 1);
      expect(r.tr, `칸 ${i}: RTL 오른쪽 위 = LTR 왼쪽 위`).toBeCloseTo(l.tl, 1);
      expect(r.bl, `칸 ${i}: RTL 왼쪽 아래 = LTR 오른쪽 아래`).toBeCloseTo(l.br, 1);
      expect(r.br, `칸 ${i}: RTL 오른쪽 아래 = LTR 왼쪽 아래`).toBeCloseTo(l.bl, 1);
      expect(r.left, `칸 ${i}: RTL 왼쪽 테두리 = LTR 오른쪽 테두리`).toBeCloseTo(l.right, 1);
      expect(r.right, `칸 ${i}: RTL 오른쪽 테두리 = LTR 왼쪽 테두리`).toBeCloseTo(l.left, 1);
    });
  });

  it('세로 묶음: 위/아래만 쓰므로 RTL 에서도 그대로다', async () => {
    const ltr = await readGroup('ltr', 'vertical');
    const rtl = await readGroup('rtl', 'vertical');
    expect(ltr[0].tl, 'LTR 첫 칸 위 모서리').toBeGreaterThan(0);
    expect(ltr[0].bottom, 'LTR 첫 칸 아래 구분선').toBeGreaterThan(0);
    ltr.forEach((l, i) => {
      expect(rtl[i], `칸 ${i}: 세로 묶음은 방향과 무관`).toEqual(l);
    });
  });
});
