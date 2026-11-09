import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
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

/** 스위치의 손잡이가 트랙의 시작 가장자리에서 떨어진 거리(전환 없음: `--switch-duration: 0s`). */
async function thumbStart(dir: 'ltr' | 'rtl', checked: boolean): Promise<number> {
  const host = await render(dir, `<u-switch id="h" style="--switch-duration: 0s" ${checked ? 'checked' : ''}></u-switch>`);
  const thumb = host.shadowRoot!.querySelector('.thumb')!;
  const T = box(thumb); const R = box(thumb.parentElement!);
  return dir === 'ltr' ? T.left - R.left : R.right - T.right;
}

/** 불확정 진행 막대가 정해진 시각(400ms)에서 트랙의 시작 가장자리로부터 떨어진 거리를 잉다. */
async function indeterminateStart(dir: 'ltr' | 'rtl'): Promise<number> {
  const host = await render(dir, '<u-progress-bar id="h" indeterminate style="display:block;width:300px"></u-progress-bar>');
  const bars = Array.from(host.shadowRoot!.querySelectorAll('*')).filter((e) => e.getAnimations().some((a) => (a as CSSAnimation).animationName === 'indeterminate-move'));
  expect(bars.length, 'indeterminate-move 애니메이션을 가진 요소').toBeGreaterThan(0);
  const bar = bars[0];
  const anim = bar.getAnimations().find((a) => (a as CSSAnimation).animationName === 'indeterminate-move')!;
  anim.pause();
  anim.currentTime = 400;
  await new Promise((r) => setTimeout(r, 50));
  const B = box(bar); const R = box(bar.parentElement ?? host);
  return dir === 'ltr' ? B.left - R.left : R.right - B.right;
}

describe('RTL — 위치로 서 있는 것의 거울', () => {
  it.each([[false], [true]])('u-switch(checked=%s) 의 손잡이 위치는 두 방향에서 시작 가장자리 기준으로 같다', async (checked) => {
    const ltr = await thumbStart('ltr', checked);
    const rtl = await thumbStart('rtl', checked);
    expect(Math.abs(ltr - rtl), `LTR ${ltr} · RTL ${rtl}`).toBeLessThanOrEqual(0.75);
  });

  it('u-switch 는 켜지면 끝 쪽으로 움직인다(두 방향 모두)', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const off = await thumbStart(dir, false);
      const on = await thumbStart(dir, true);
      expect(on, `${dir}: 꺼짐 ${off} → 켜짐 ${on}`).toBeGreaterThan(off + 4);
    }
  });

  it('u-progress-bar 의 불확정 막대는 시작 가장자리에서 같은 거리를 두고 움직인다', async () => {
    const ltr = await indeterminateStart('ltr');
    const rtl = await indeterminateStart('rtl');
    expect(Math.abs(ltr - rtl), `LTR ${ltr} · RTL ${rtl}`).toBeLessThanOrEqual(1);
  });
});

describe('RTL — 슬라이더는 값이 시작 쪽에서 자란다', () => {
  const SLIDER = '<u-slider id="h" min="0" max="100" step="1" value="25" style="display:block;width:400px"></u-slider>';
  const parts = (host: HTMLElement) => ({
    track: host.shadowRoot!.querySelector('.track')!,
    thumb: host.shadowRoot!.querySelector('.thumb[data-thumb="min"]') as HTMLElement,
    container: host.shadowRoot!.querySelector('.container')!,
  });
  const value = (host: HTMLElement) => Number((host as HTMLElement & { value: unknown }).value);

  it('손잡이 중심은 두 방향에서 트랙의 시작 가장자리로부터 같은 거리다(값 25 → 폭의 25%)', async () => {
    const out: number[] = [];
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, SLIDER);
      const { track, thumb } = parts(host);
      const T = box(track); const B = box(thumb);
      const center = (B.left + B.right) / 2;
      out.push(dir === 'ltr' ? center - T.left : T.right - center);
    }
    expect(Math.abs(out[0] - out[1]), `LTR ${out[0]} · RTL ${out[1]}`).toBeLessThanOrEqual(1);
    expect(out[0]).toBeGreaterThan(50);
    expect(out[0]).toBeLessThan(150);
  });

  it('시작 가장자리에서 75% 지점을 눌러도 값 75 가 된다(두 방향)', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, SLIDER);
      const { track, container } = parts(host);
      const T = track.getBoundingClientRect();
      const x = dir === 'ltr' ? T.left + T.width * 0.75 : T.right - T.width * 0.75;
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: T.top + 2, bubbles: true, composed: true, pointerId: 1 }));
      document.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: T.top + 2, bubbles: true, pointerId: 1 }));
      await settle();
      expect(value(host), `${dir}`).toBe(75);
    }
  });

  it('방향키: LTR 은 오른쪽 키가 값을 올리고 RTL 은 왼쪽 키가 올린다(네이티브 range 와 같다)', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, SLIDER);
      const { thumb } = parts(host);
      thumb.focus();
      await userEvent.keyboard(dir === 'ltr' ? '{ArrowRight}' : '{ArrowLeft}');
      await settle();
      expect(value(host), `${dir}: 증가 키`).toBe(26);
      await userEvent.keyboard(dir === 'ltr' ? '{ArrowLeft}' : '{ArrowRight}');
      await settle();
      expect(value(host), `${dir}: 감소 키`).toBe(25);
    }
  });
});

describe('RTL — 별점은 시작 쪽에서 채워진다', () => {
  const RATING = '<u-rating id="h" max="5" precision="0.5" value="3.5"></u-rating>';
  const symbols = (host: HTMLElement) => Array.from(host.shadowRoot!.querySelectorAll<HTMLElement>('.symbol'));
  const value = (host: HTMLElement) => Number((host as HTMLElement & { value: unknown }).value);

  it('반채움 별의 채운 부분은 두 방향 모두 별의 시작 가장자리에서 시작한다', async () => {
    const reads: Array<{ gap: number; width: number }> = [];
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, RATING);
      const sym = symbols(host)[3];
      const fg = sym.querySelector('.symbol-fg')!;
      const S = box(sym); const F = box(fg);
      reads.push({ gap: dir === 'ltr' ? F.left - S.left : S.right - F.right, width: F.right - F.left });
    }
    expect(Math.abs(reads[0].gap - reads[1].gap), `시작 가장자리 간격 LTR ${reads[0].gap} · RTL ${reads[1].gap}`).toBeLessThanOrEqual(1);
    expect(Math.abs(reads[0].width - reads[1].width)).toBeLessThanOrEqual(1);
    expect(reads[0].width).toBeGreaterThan(2);
  });

  it('별의 시작 쪽 90% 지점을 눌러도 같은 값(3)이 된다(두 방향 — 70% 는 반대 쪽과 같은 값으로 반올림되어 구별이 안 된다)', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, '<u-rating id="h" max="5" precision="0.5"></u-rating>');
      const sym = symbols(host)[2];
      const R = sym.getBoundingClientRect();
      const x = dir === 'ltr' ? R.left + R.width * 0.9 : R.right - R.width * 0.9;
      sym.dispatchEvent(new MouseEvent('click', { clientX: x, clientY: R.top + R.height / 2, bubbles: true, composed: true }));
      await settle();
      expect(value(host), dir).toBe(3);
    }
  });

  it('방향키: LTR 은 오른쪽 키가 다음 별이고 RTL 은 왼쪽 키가 다음 별이다', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, '<u-rating id="h" max="5" value="2"></u-rating>');
      const tab = symbols(host).find((e) => e.getAttribute('tabindex') === '0')!;
      tab.focus();
      await userEvent.keyboard(dir === 'ltr' ? '{ArrowRight}' : '{ArrowLeft}');
      await settle();
      expect(value(host), `${dir}: 다음`).toBe(3);
      await userEvent.keyboard(dir === 'ltr' ? '{ArrowLeft}' : '{ArrowRight}');
      await settle();
      expect(value(host), `${dir}: 이전`).toBe(2);
    }
  });
});

describe('RTL — 캐러셀은 첫 장이 시작 쪽에 서고 다음으로 가면 끝 쪽으로 밀린다', () => {
  const CAROUSEL = `<style>u-carousel::part(slides) { transition: none !important; }</style>
    <u-carousel id="h" navigation style="display:block;width:400px;height:120px">
      <div id="s0" style="height:120px">A</div><div id="s1" style="height:120px">B</div><div id="s2" style="height:120px">C</div>
    </u-carousel>`;
  type Carousel = HTMLElement & { index: number; next(): void; updateComplete: Promise<unknown> };

  it('현재 장은 두 방향 모두 호스트 폭을 채운다(처음 · 다음 후)', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, CAROUSEL) as Carousel;
      const H = box(host);
      expect(Math.abs(box(document.getElementById('s0')!).left - H.left), `${dir}: 첫 장`).toBeLessThanOrEqual(1);
      host.next();
      await settle();
      const S1 = box(document.getElementById('s1')!);
      expect(Math.abs(S1.left - H.left), `${dir}: 다음 장이 호스트를 채움 (${S1.left} vs ${H.left})`).toBeLessThanOrEqual(1);
    }
  });

  it('이전 단추는 시작 쪽 가장자리에, 다음 단추는 끝 쪽 가장자리에 있다', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, CAROUSEL) as Carousel;
      host.next();
      await settle();
      const H = box(host);
      const prev = box(host.shadowRoot!.querySelector('.nav-button.prev')!);
      const next = box(host.shadowRoot!.querySelector('.nav-button.next')!);
      const prevStart = dir === 'ltr' ? prev.left - H.left : H.right - prev.right;
      const nextEnd = dir === 'ltr' ? H.right - next.right : next.left - H.left;
      expect(Math.abs(prevStart - 12), `${dir}: 이전 단추의 시작 간격 ${prevStart}`).toBeLessThanOrEqual(1.5);
      expect(Math.abs(nextEnd - 12), `${dir}: 다음 단추의 끝 간격 ${nextEnd}`).toBeLessThanOrEqual(1.5);
    }
  });

  it('방향 화살표(chevron)는 RTL 에서 뒤집힌다 — 이전 단추가 시작 쪽을 가리킨다', async () => {
    const flips: boolean[] = [];
    for (const dir of ['ltr', 'rtl'] as const) {
      const host = await render(dir, CAROUSEL) as Carousel;
      host.next();
      await settle();
      const icon = host.shadowRoot!.querySelector('.nav-button.prev u-icon') as HTMLElement;
      flips.push(getComputedStyle(icon).transform.startsWith('matrix(-1'));
    }
    expect(flips).toEqual([false, true]);
  });
});

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
