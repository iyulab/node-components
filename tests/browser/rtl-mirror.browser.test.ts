import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 「`dir="rtl"` 에서 배치가 **거울**인가」 — 물리 방향(`margin-left` …)이 아니라 논리 속성(`margin-inline-start` …)으로 선 컴포넌트의 계약.
 *
 * 오라클은 픽셀이 아니라 **상자 대칭**이다. 같은 컴포넌트를 LTR 과 RTL 로 두 번 그려
 *  ① 순서가 뒤집힌다(접두 → 본문 → 접미가 LTR 은 왼쪽→오른쪽, RTL 은 오른쪽→왼쪽)
 *  ② 접두와 본문 사이 · 본문과 접미 사이 간격이 두 방향에서 같다
 *  ③ 호스트의 «시작 가장자리» 에서 접두까지의 거리가 두 방향에서 같다(안쪽 여백 · 들여쓰기)
 * 를 잰다. LTR 쪽이 먼저 서 있어야 «전환이 LTR 을 안 바꿨다» 가 증명되고, RTL 쪽은 물리 속성을 되돌리면 실패한다(네거티브 컨트롤).
 *
 * ⚠**대상 목록은 손으로 쓴다**(`host-aria-label-reach` · `field-name-reach-census` 와 같다) — 어떤 컴포넌트가 접두/접미 슬롯을
 * 가진 «방향에 민감한 상자» 인지는 이 패키지의 지식이다. 방향에 민감한 컴포넌트를 더하면 한 줄을 더한다. 물리 방향이 **의미**인 것
 * (서랍의 `placement="left"` · 기기 안전 영역 `env(safe-area-inset-left)` · 분할 패널의 끌기 좌표 · 탭 줄의 `placement`)은
 * 대상이 아니다 — 그것들은 방향이 아니라 «화면의 어느 쪽» 이다. (계획: RTL 논리 속성 전환)
 */

/** [태그, 호스트 속성(들여쓰기 변수 포함)] — 접두 · 본문 · 접미 슬롯을 가진 상자. */
const AFFIX_BOXES: Array<[string, string]> = [
  ['u-button', ''],
  ['u-badge', ''],
  ['u-tab', ''],
  ['u-breadcrumb-item', 'href="#"'],
  ['u-menu-item', 'style="--menu-item-depth: 2"'],
  ['u-option', 'value="x"'],
  ['u-tree-item', 'style="--tree-item-depth: 2"'],
];

interface Box { left: number; right: number }
const box = (el: Element): Box => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; };

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 120));
}

interface Reading { ordered: boolean; gapPrefix: number; gapSuffix: number; start: number }

/** 한 방향의 읽기 — `mid` 는 본문(가운데) 상자. */
function read(dir: 'ltr' | 'rtl', host: Element, p: Element, mid: Box, s: Element): Reading {
  const P = box(p); const S = box(s); const H = box(host);
  if (dir === 'ltr') {
    return { ordered: P.right <= mid.left + 0.5 && mid.right <= S.left + 0.5, gapPrefix: mid.left - P.right, gapSuffix: S.left - mid.right, start: P.left - H.left };
  }
  return { ordered: mid.right <= P.left + 0.5 && S.right <= mid.left + 0.5, gapPrefix: P.left - mid.right, gapSuffix: mid.left - S.right, start: H.right - P.right };
}

async function render(dir: 'ltr' | 'rtl', markup: string): Promise<HTMLElement> {
  document.documentElement.dir = dir;
  document.body.innerHTML = markup;
  await settle();
  return document.getElementById('h') as HTMLElement;
}

afterEach(() => { document.documentElement.dir = 'ltr'; document.body.innerHTML = ''; });

function expectMirror(label: string, ltr: Reading, rtl: Reading): void {
  expect(ltr.ordered, `${label}: LTR 에서 접두 → 본문 → 접미 순서`).toBe(true);
  expect(rtl.ordered, `${label}: RTL 에서 순서가 뒤집힌다`).toBe(true);
  expect(Math.abs(ltr.gapPrefix - rtl.gapPrefix), `${label}: 접두 간격 LTR ${ltr.gapPrefix} · RTL ${rtl.gapPrefix}`).toBeLessThanOrEqual(0.75);
  expect(Math.abs(ltr.gapSuffix - rtl.gapSuffix), `${label}: 접미 간격 LTR ${ltr.gapSuffix} · RTL ${rtl.gapSuffix}`).toBeLessThanOrEqual(0.75);
  expect(Math.abs(ltr.start - rtl.start), `${label}: 시작 가장자리에서 접두까지 LTR ${ltr.start} · RTL ${rtl.start}`).toBeLessThanOrEqual(0.75);
}

describe('RTL — 접두/접미 상자의 거울', () => {
  it.each(AFFIX_BOXES)('%s %s 는 RTL 에서 좌우가 뒤집힌 같은 배치다', async (tag, attrs) => {
    const markup = `<${tag} id="h" ${attrs}><span slot="prefix" id="p">P</span><span id="m">Middle text</span><span slot="suffix" id="s">S</span></${tag}>`;
    let host = await render('ltr', markup);
    const ltr = read('ltr', host, document.getElementById('p')!, box(document.getElementById('m')!), document.getElementById('s')!);
    host = await render('rtl', markup);
    const rtl = read('rtl', host, document.getElementById('p')!, box(document.getElementById('m')!), document.getElementById('s')!);
    expectMirror(tag, ltr, rtl);
  });

  it('u-input 은 접두 · 접미와 네이티브 입력 사이 간격이 RTL 에서도 같다', async () => {
    const markup = '<u-input id="h"><span slot="prefix" id="p">P</span><span slot="suffix" id="s">S</span></u-input>';
    let host = await render('ltr', markup);
    const ltr = read('ltr', host, document.getElementById('p')!, box(host.shadowRoot!.querySelector('input')!), document.getElementById('s')!);
    host = await render('rtl', markup);
    const rtl = read('rtl', host, document.getElementById('p')!, box(host.shadowRoot!.querySelector('input')!), document.getElementById('s')!);
    expectMirror('u-input', ltr, rtl);
  });
});
