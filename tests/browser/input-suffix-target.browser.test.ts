import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';

/**
 * 접미 아이콘 버튼(지우기 · 비밀번호 토글 · 스테퍼)의 «받는 영역» — WCAG 2.2 SC 2.5.8 (cycle-550).
 *
 * 타깃 크기 게이트는 «24 이상인가»만 잰다. 이 결정(글리프는 그대로, 받는 영역만 넓힌다)은 두 축을 함께 재지
 * 않으면 검증되지 않는다 — 영역만 재면 «글리프까지 커졌다/움직였다» 를, 글리프만 재면 «영역이 안 커졌다» 를
 * 통과시킨다. 그리고 `getBoundingClientRect` 는 조상의 `overflow` 가 자른 부분도 그대로 보고하므로, 가장자리가
 * 실제로 눌리는지는 **hit-test** 로 따로 잰다.
 */

const GAP = 4; // 0.25em @ 16px — 접미 아이콘 사이·입력과의 간격

function rect(el: Element) {
  return el.getBoundingClientRect();
}

/** 패딩을 뺀 영역 = 보이는 글리프가 놓이는 자리. */
function glyph(el: Element) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const pl = parseFloat(cs.paddingLeft);
  const pr = parseFloat(cs.paddingRight);
  const pt = parseFloat(cs.paddingTop);
  const pb = parseFloat(cs.paddingBottom);
  return { left: r.left + pl, right: r.right - pr, width: r.width - pl - pr, height: r.height - pt - pb };
}

/** 컨테이너 안쪽(테두리·여백 제외) 오른쪽 끝. */
function contentRight(el: Element) {
  const cs = getComputedStyle(el);
  return rect(el).right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
}

async function mount(html: string): Promise<void> {
  document.body.innerHTML = `<div style="padding:40px">${html}</div>`;
  await new Promise((r) => setTimeout(r, 80));
}

function shadow(host: Element): ShadowRoot {
  return (host as HTMLElement).shadowRoot!;
}

function buttons(host: Element): HTMLElement[] {
  return Array.from(shadow(host).querySelectorAll<HTMLElement>('.suffix-item[role="button"]')).filter((el) => !el.hidden);
}

/** 그 점을 누르면 이 요소가 받는가 — 조상의 overflow 가 자른 영역은 여기서 드러난다. */
function hits(host: Element, el: Element, x: number, y: number): boolean {
  return shadow(host).elementFromPoint(x, y) === el;
}

function edgesHit(host: Element, el: Element): boolean[] {
  const r = rect(el);
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  return [
    hits(host, el, r.left + 1, cy),
    hits(host, el, r.right - 1, cy),
    hits(host, el, cx, r.top + 1),
    hits(host, el, cx, r.bottom - 1),
  ];
}

describe('u-input 접미 아이콘 — 받는 영역만 넓히고 보이는 것은 그대로', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('지우기: 받는 영역 24×24 · 글리프 16×16 · 네 가장자리가 전부 눌린다', async () => {
    await mount('<u-input clearable value="abc" style="width:200px"></u-input>');
    const host = document.querySelector('u-input')!;
    const [clear] = buttons(host);
    const r = rect(clear);
    const g = glyph(clear);
    expect(`${Math.round(r.width)}x${Math.round(r.height)}`).toBe('24x24');
    expect(`${Math.round(g.width)}x${Math.round(g.height)}`, '글리프가 커졌다면 시각 계약이 바뀐 것이다').toBe('16x16');
    expect(edgesHit(host, clear), '좌·우·위·아래').toEqual([true, true, true, true]);
  });

  it('지우기: 글리프 위치 불변 — 입력과 0.25em 떨어져 컨테이너 안쪽 끝에 붙고, 영역은 입력과 겹치지 않는다', async () => {
    await mount('<u-input clearable value="abc" style="width:200px"></u-input>');
    const host = document.querySelector('u-input')!;
    const [clear] = buttons(host);
    const input = rect(shadow(host).querySelector('input')!);
    const container = shadow(host).querySelector('.container')!;
    const g = glyph(clear);
    expect(Math.abs(g.left - input.right - GAP)).toBeLessThan(0.5);
    expect(Math.abs(g.right - contentRight(container))).toBeLessThan(0.5);
    expect(rect(clear).left).toBeGreaterThanOrEqual(input.right - 0.5);
  });

  it('🔴좁은 필드에서도 접미 아이콘이 컨테이너 밖으로 밀려나지 않는다 — 입력이 줄어든다', async () => {
    // 종전: 입력이 `flex-shrink: 0` 이라 고유 폭(194px) 아래로 줄지 않아, 200px 필드의 지우기가 호스트 밖에
    // 그려지고 overflow 에 잘렸다(보이지도 눌리지도 않았다 — 크기 게이트는 사각형만 재서 통과시켰다).
    for (const html of [
      '<u-input clearable value="abc" style="width:200px"></u-input>',
      '<u-input type="password" clearable value="abc" style="width:160px"></u-input>',
      '<u-input type="number" value="1" style="width:120px"></u-input>',
    ]) {
      await mount(html);
      const host = document.querySelector('u-input')!;
      const hostRect = rect(host);
      for (const b of buttons(host)) {
        const r = rect(b);
        expect(r.right, html).toBeLessThanOrEqual(hostRect.right + 0.5);
        expect(hits(host, b, r.left + r.width / 2, r.top + r.height / 2), html).toBe(true);
      }
    }
  });

  it('지우기가 있어도 컨테이너 높이는 접미 아이콘이 없는 입력과 같다', async () => {
    await mount('<u-input clearable value="abc" style="width:200px"></u-input><u-input style="width:200px"></u-input>');
    const [a, b] = Array.from(document.querySelectorAll('u-input'));
    const ha = rect(shadow(a).querySelector('.container')!).height;
    const hb = rect(shadow(b).querySelector('.container')!).height;
    expect(ha).toBe(hb);
  });

  it('비밀번호 토글 혼자면 맨 뒤라 24×24 이고 네 가장자리가 눌린다', async () => {
    await mount('<u-input type="password" value="abc" style="width:200px"></u-input>');
    const host = document.querySelector('u-input')!;
    const [toggle] = buttons(host);
    const r = rect(toggle);
    expect(`${Math.round(r.width)}x${Math.round(r.height)}`).toBe('24x24');
    expect(edgesHit(host, toggle)).toEqual([true, true, true, true]);
  });

  it('🔴나란히 놓인 둘(토글 + 지우기)은 서로의 영역을 먹지 않고, 글리프 간격도 그대로다', async () => {
    await mount('<u-input type="password" clearable value="abc" style="width:200px"></u-input>');
    const host = document.querySelector('u-input')!;
    const [toggle, clear] = buttons(host);
    expect(rect(toggle).right).toBeLessThanOrEqual(rect(clear).left + 0.5);
    expect(Math.abs(glyph(clear).left - glyph(toggle).right - GAP)).toBeLessThan(0.5);
    // 맨 뒤(지우기)만 오른쪽으로 넓어진다.
    expect(Math.round(rect(clear).width)).toBe(24);
    expect(Math.round(rect(toggle).width)).toBe(20);
  });

  it('🔴스테퍼 둘도 서로 겹치지 않고, 글리프(0.85em)와 간격은 그대로다', async () => {
    await mount('<u-input type="number" value="1" style="width:200px"></u-input>');
    const host = document.querySelector('u-input')!;
    const [minus, plus] = buttons(host);
    expect(rect(minus).right).toBeLessThanOrEqual(rect(plus).left + 0.5);
    expect(Math.round(glyph(minus).width * 10) / 10).toBe(13.6);
    expect(Math.abs(glyph(plus).left - glyph(minus).right - GAP * 0.85)).toBeLessThan(0.5);
  });

  it('⚪NEGATIVE — 좌우 여백이 0 인 변형은 오른쪽으로 넓히지 않는다(넓히면 잘려 «거짓 24» 가 된다)', async () => {
    for (const variant of ['underlined', 'borderless']) {
      await mount(`<u-input variant="${variant}" clearable value="abc" style="width:200px"></u-input>`);
      const host = document.querySelector('u-input')!;
      const [clear] = buttons(host);
      const container = shadow(host).querySelector('.container')!;
      expect(rect(clear).right, variant).toBeLessThanOrEqual(contentRight(container) + 0.5);
      expect(Math.round(glyph(clear).width), variant).toBe(16);
      expect(edgesHit(host, clear), variant).toEqual([true, true, true, true]);
    }
  });
});

describe('u-select 지우기 — 받는 영역만 넓히고 보이는 것은 그대로', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('받는 영역 24×24 · 글리프 16×16 · 네 가장자리가 눌린다', async () => {
    await mount('<u-select clearable value="a" style="width:200px"><u-option value="a">A</u-option></u-select>');
    const host = document.querySelector('u-select')!;
    const [clear] = buttons(host);
    const r = rect(clear);
    expect(`${Math.round(r.width)}x${Math.round(r.height)}`).toBe('24x24');
    expect(`${Math.round(glyph(clear).width)}x${Math.round(glyph(clear).height)}`).toBe('16x16');
    expect(edgesHit(host, clear)).toEqual([true, true, true, true]);
  });

  it('펼침 화살표와의 글리프 간격 · 컨테이너 높이가 그대로다', async () => {
    // 대조군은 «같은 값 · clearable 만 없는» 선택 상자다 — 값이 없으면 트리거가 옵션 내용 대신 빈 placeholder 를
    // 그려 높이가 달라지므로, 그것과 비교하면 지우기와 무관한 차이를 잰다(첫 판이 그렇게 8px 를 잘못 짚었다).
    await mount(
      '<u-select clearable value="a" style="width:200px"><u-option value="a">A</u-option></u-select>' +
      '<u-select value="a" style="width:200px"><u-option value="a">A</u-option></u-select>',
    );
    const [a, b] = Array.from(document.querySelectorAll('u-select'));
    const [clear] = buttons(a);
    const chevron = shadow(a).querySelector('u-icon[name="chevron-down"]')!;
    expect(Math.abs(rect(chevron).left - glyph(clear).right - GAP)).toBeLessThan(0.5);
    expect(rect(shadow(a).querySelector('.container')!).height)
      .toBe(rect(shadow(b).querySelector('.container')!).height);
  });

  it('가장자리를 눌러도 값이 지워진다(트리거를 열지 않는다)', async () => {
    await mount('<u-select clearable value="a" style="width:200px"><u-option value="a">A</u-option></u-select>');
    const host = document.querySelector('u-select') as HTMLElement & { value: unknown };
    const [clear] = buttons(host);
    const r = rect(clear);
    const edge = shadow(host).elementFromPoint(r.left + 1, r.top + r.height / 2) as HTMLElement;
    edge.click();
    await new Promise((res) => setTimeout(res, 50));
    expect(host.value).toBe('');
  });
});
