import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/split-panel/USplitPanel.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-split-panel` 분할 핸들 — **포인터 영역(24px)과 보이는 선(4px)을 가른다** (HD-55 ⑷).
 *
 * ⚠**두 축을 함께 재지 않으면 이 결정을 검증할 수 없다**(u-slider 와 같은 이유). 핸들 박스만
 * 재면 «선까지 굵어졌다» 를 통과시키고, 선만 재면 «영역이 안 넓어졌다» 를 통과시킨다.
 *
 * 🔴**그리고 이 결정의 핵심은 «넓힌 영역이 패널을 덮지 않는다» 다.** 컴포넌트가 모든 패널에
 * `overflow: auto` 를 강제하므로 앞 패널의 스크롤바는 항상 핸들에 붙어 있다 — 포인터 영역을
 * 패널 위로 겹쳐 넓혔다면(기각된 ⑴안) 그 스크롤바를 핸들이 가로챈다. 그래서 핸들은 레이아웃
 * 공간을 차지하고, 아래 테스트가 «겹치지 않는다» 와 «스크롤바가 패널에 남는다» 를 직접 잰다.
 *
 * 보이는 선은 `::before` 라 `getBoundingClientRect` 로 잴 수 없다 — `getComputedStyle(el,
 * '::before')` 가 돌려주는 사용값(`left`·`width`)으로 잰다.
 */

async function mount(html: string): Promise<HTMLElement> {
  document.body.innerHTML = `<div style="padding:40px">${html}</div>`;
  await new Promise((r) => setTimeout(r, 80));
  return document.querySelector('u-split-panel') as HTMLElement;
}

function handle(host: HTMLElement): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>('[part~="splitter"]')!;
}

/** 보이는 선의 위치·두께 — 핸들 박스 기준 오프셋을 뷰포트 좌표로 옮긴다. */
function line(host: HTMLElement): { start: number; size: number; center: number } {
  const h = handle(host);
  const box = h.getBoundingClientRect();
  const cs = getComputedStyle(h, '::before');
  const vertical = host.getAttribute('orientation') === 'vertical';
  const offset = parseFloat(vertical ? cs.top : cs.left);
  const size = parseFloat(vertical ? cs.height : cs.width);
  const start = (vertical ? box.top : box.left) + offset;
  return { start, size, center: start + size / 2 };
}

const panels = (host: HTMLElement) => Array.from(host.children) as HTMLElement[];

describe('u-split-panel — 분할 핸들: 24px 포인터 영역 · 4px 보이는 선 (HD-55 ⑷)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('가로: 핸들 박스는 24px 이고, 보이는 선은 그대로 4px 이며 박스 가운데에 있다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const box = handle(host).getBoundingClientRect();
    expect(Math.round(box.width)).toBe(24);
    const l = line(host);
    expect(Math.round(l.size), '선이 굵어졌다면 시각 계약이 바뀐 것이다').toBe(4);
    expect(Math.abs(l.center - (box.left + box.width / 2))).toBeLessThan(0.5);
  });

  it('세로: 같은 규칙이 높이 축으로 선다', async () => {
    const host = await mount('<u-split-panel orientation="vertical" style="width:300px;height:300px"><div>A</div><div>B</div></u-split-panel>');
    const box = handle(host).getBoundingClientRect();
    expect(Math.round(box.height)).toBe(24);
    const l = line(host);
    expect(Math.round(l.size)).toBe(4);
    expect(Math.abs(l.center - (box.top + box.height / 2))).toBeLessThan(0.5);
  });

  it('핸들은 레이아웃 공간을 차지한다 — 어느 패널과도 겹치지 않고, 셋의 합이 호스트 폭이다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const [a, b] = panels(host).map((p) => p.getBoundingClientRect());
    const h = handle(host).getBoundingClientRect();
    expect(a.right).toBeLessThanOrEqual(h.left + 0.5);
    expect(h.right).toBeLessThanOrEqual(b.left + 0.5);
    expect(Math.abs(a.width + h.width + b.width - host.getBoundingClientRect().width)).toBeLessThan(1);
    // 비율 계산이 새 핸들 두께를 쓰는가 — 기본 50:50 이면 두 패널이 같다.
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  });

  it('핸들 세 개(패널 넷)에서도 합이 맞는다 — 핸들 두께를 패널 수로 나눠 빼는 계산', async () => {
    const host = await mount('<u-split-panel style="width:600px;height:120px"><div>A</div><div>B</div><div>C</div><div>D</div></u-split-panel>');
    const widths = panels(host).map((p) => p.getBoundingClientRect().width);
    const handles = Array.from(host.shadowRoot!.querySelectorAll('[part~="splitter"]'));
    expect(handles).toHaveLength(3);
    const total = widths.reduce((s, w) => s + w, 0) + handles.reduce((s, el) => s + el.getBoundingClientRect().width, 0);
    expect(Math.abs(total - 600)).toBeLessThan(1);
  });

  it('🔴비율은 «핸들을 뺀 나머지 공간»의 몫이다 — 균등하지 않은 비율에서도', async () => {
    /* 종전 식(`p% - 핸들합/n`)은 비율이 균등할 때만 이 값과 같다. 30:70 이면 두 패널이 핸들 몫을
       똑같이 12px 씩 떼어 내 30:70 이 아니게 된다(78:198 → 실제 비는 28.3:71.7). */
    const host = await mount('<u-split-panel default-ratio="30,70" style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const [a, b] = panels(host).map((p) => p.getBoundingClientRect().width);
    expect(Math.abs(a - 276 * 0.3)).toBeLessThan(0.5);
    expect(Math.abs(b - 276 * 0.7)).toBeLessThan(0.5);
  });

  it('읽을 수 없는 비율은 균등 분할로 물러난다 — 레이아웃이 무너지지 않는다', async () => {
    /* 속성은 쉼표 구분(`30,70`)이다 — 반영(reflect)도 그 형태로 쓴다. 대괄호를 붙이면 첫 값이
       `parseFloat('[30')` = NaN 이 된다. 게시된 스킬 문서가 한동안 그 형태를 가르쳤다. */
    const host = await mount('<u-split-panel default-ratio="[30,70]" style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const [a, b] = panels(host).map((p) => p.getBoundingClientRect().width);
    expect(Math.abs(a - 138)).toBeLessThan(0.5);
    expect(Math.abs(b - 138)).toBeLessThan(0.5);
  });

  it('🔴앞 패널의 스크롤바는 패널에 남는다 — 핸들이 가로채지 않는다', async () => {
    const host = await mount(
      '<u-split-panel style="width:300px;height:120px">' +
        '<div><div style="height:600px">A</div></div><div>B</div>' +
      '</u-split-panel>',
    );
    const a = panels(host)[0];
    expect(a.scrollHeight, '스크롤바가 생기는 픽스처여야 이 판정이 의미를 갖는다').toBeGreaterThan(a.clientHeight);
    const r = a.getBoundingClientRect();
    const scrollbar = r.width - a.clientWidth;
    // 스크롤바가 없는 환경(오버레이 스크롤바)이면 패널 오른쪽 가장자리 2px 을 잰다.
    const x = r.right - Math.max(2, scrollbar / 2);
    const hit = document.elementFromPoint(x, r.top + r.height / 2);
    expect(hit === a || a.contains(hit), `가장자리의 포인터가 ${hit?.tagName} 로 갔다`).toBe(true);
  });

  it('소비자는 --splitter-hit-size 로 종전(선과 같은 두께) 핸들을 되찾는다', async () => {
    const host = await mount(
      '<u-split-panel style="width:300px;height:120px;--splitter-hit-size:var(--splitter-size)"><div>A</div><div>B</div></u-split-panel>',
    );
    expect(Math.round(handle(host).getBoundingClientRect().width)).toBe(4);
    const [a, b] = panels(host).map((p) => p.getBoundingClientRect());
    expect(Math.abs(a.width + 4 + b.width - 300)).toBeLessThan(1);
  });

  it('선이 영역보다 굵으면 핸들은 선의 두께를 따른다 (둘 중 큰 쪽)', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px;--splitter-size:32px"><div>A</div><div>B</div></u-split-panel>');
    expect(Math.round(handle(host).getBoundingClientRect().width)).toBe(32);
    expect(Math.round(line(host).size)).toBe(32);
  });

  /** 포인터 캡처는 실제 활성 포인터를 요구한다 — 합성 이벤트로 드래그 계산만 재기 위해 막는다. */
  function drag(host: HTMLElement, dx: number, stopBeforeUp = false): () => void {
    const h = handle(host);
    h.setPointerCapture = () => {};
    h.releasePointerCapture = () => {};
    const box = h.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const init = { bubbles: true, composed: true, pointerId: 1, button: 0, clientY: y };
    h.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientX: x }));
    h.dispatchEvent(new PointerEvent('pointermove', { ...init, clientX: x + dx }));
    const up = () => h.dispatchEvent(new PointerEvent('pointerup', { ...init, clientX: x + dx }));
    if (!stopBeforeUp) up();
    return up;
  }

  it('🔴드래그한 만큼만 앞 패널이 커진다 — 패널이 포인터보다 앞서 가지 않는다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const before = panels(host)[0].getBoundingClientRect().width;
    drag(host, 30);
    await new Promise((r) => setTimeout(r, 30));
    const [a, b] = panels(host).map((p) => p.getBoundingClientRect());
    expect(Math.abs(a.width - (before + 30))).toBeLessThan(1);
    expect(Math.abs(a.width + 24 + b.width - 300)).toBeLessThan(1);
  });

  it('lazy: 미리보기 막대는 핸들 박스의 앞 가장자리가 아니라 «선» 위에 선다', async () => {
    const host = await mount('<u-split-panel lazy style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const l = line(host);
    const up = drag(host, 0, true);
    const ghost = host.shadowRoot!.querySelector<HTMLElement>('.splitter-ghost')!;
    const g = ghost.getBoundingClientRect();
    expect(Math.round(g.width)).toBe(4);
    expect(Math.abs(g.left + g.width / 2 - l.center), '막대가 선에서 어긋났다').toBeLessThan(0.5);
    up();
  });
});

/**
 * 키보드 경로 — WAI-ARIA APG «Window Splitter» (§D-59).
 *
 * 분할 크기를 바꾸는 경로가 포인터 드래그뿐이면 키보드 사용자는 레이아웃을 바꿀 수 없다
 * (SC 2.1.1 · 드래그의 대체 수단 SC 2.5.7). 핸들은 명령형으로 만들어 Lit 템플릿 밖에 있으므로
 * «비율이 바뀐 뒤에도 값이 따라오는가» 를 매번 함께 잰다.
 */
describe('u-split-panel — 키보드 경로 (APG Window Splitter, §D-59)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // ⚠브라우저 프로젝트의 기본 로케일은 OS 를 따른다(이 머신은 ko) — 이름 단언은 명시한다.
    Locale.set('en');
  });

  const attrs = (el: HTMLElement) => ({
    now: el.getAttribute('aria-valuenow'),
    min: el.getAttribute('aria-valuemin'),
    max: el.getAttribute('aria-valuemax'),
  });

  it('핸들은 이름·값·방향을 가진 포커스 가능한 separator 다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const h = handle(host);
    expect(h.getAttribute('role')).toBe('separator');
    expect(h.tabIndex).toBe(0);
    expect(h.getAttribute('aria-label')).toBe('Resize panels');
    // 나란히 놓인 패널 사이의 선은 세로다.
    expect(h.getAttribute('aria-orientation')).toBe('vertical');
    expect(attrs(h)).toEqual({ now: '50', min: '0', max: '100' });
    const reflect = h as HTMLElement & { ariaControlsElements?: Element[] | null };
    if ('ariaControlsElements' in reflect) {
      expect(reflect.ariaControlsElements?.[0]).toBe(panels(host)[0]);
    }
  });

  it('세로 배치의 선은 가로다', async () => {
    const host = await mount('<u-split-panel orientation="vertical" style="width:300px;height:300px"><div>A</div><div>B</div></u-split-panel>');
    expect(handle(host).getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('Tab 으로 도달하고 포커스 표시가 보인다', async () => {
    // 탭 시작점을 고정한다 — 러너 문서의 포커스 위치에 기대지 않는다.
    const host = await mount('<button id="before">before</button><u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    const h = handle(host);
    expect(host.shadowRoot!.activeElement).toBe(h);
    expect(getComputedStyle(h).outlineStyle, '키보드 포커스가 보이지 않는다').not.toBe('none');
  });

  it('←/→ 가 앞 패널을 줄이고 늘리며, 값과 레이아웃이 함께 따라온다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const h = handle(host);
    h.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(attrs(h).now).toBe('55');
    expect(Math.abs(panels(host)[0].getBoundingClientRect().width - 276 * 0.55)).toBeLessThan(0.5);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(attrs(h).now).toBe('45');
    expect(host.getAttribute('ratio')).toBe('45,55');
  });

  it('세로 배치는 ↑/↓ 이고, 가로 방향키에는 반응하지 않는다', async () => {
    const host = await mount('<u-split-panel orientation="vertical" style="width:300px;height:300px"><div>A</div><div>B</div></u-split-panel>');
    const h = handle(host);
    h.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(attrs(h).now).toBe('50');
    await userEvent.keyboard('{ArrowDown}');
    expect(attrs(h).now).toBe('55');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(attrs(h).now).toBe('45');
  });

  it('Home/End 는 앞 패널을 최소/최대로 — 경계 밖으로 넘지 않는다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const h = handle(host);
    h.focus();
    await userEvent.keyboard('{Home}');
    expect(attrs(h).now).toBe('0');
    expect(Math.round(panels(host)[0].getBoundingClientRect().width)).toBe(0);
    await userEvent.keyboard('{ArrowLeft}');
    expect(attrs(h).now).toBe('0');
    await userEvent.keyboard('{End}');
    expect(attrs(h).now).toBe('100');
    expect(Math.round(panels(host)[1].getBoundingClientRect().width)).toBe(0);
  });

  it('Enter 는 앞 패널을 접고, 다시 Enter 는 접기 전 크기로 되돌린다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const h = handle(host);
    h.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(attrs(h).now).toBe('60');
    await userEvent.keyboard('{Enter}');
    expect(attrs(h).now).toBe('0');
    await userEvent.keyboard('{Enter}');
    expect(attrs(h).now).toBe('60');
  });

  it('키 한 번이 shift-start · shift · shift-end 를 한 번씩 낸다 — 저장하는 소비자는 shift-end 만 들으면 된다', async () => {
    const host = await mount('<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const seen: string[] = [];
    let last: number[] = [];
    for (const name of ['shift-start', 'shift', 'shift-end']) {
      host.addEventListener(name, (e) => {
        seen.push(name);
        if (name === 'shift-end') last = (e as CustomEvent<{ ratio: number[] }>).detail.ratio;
      });
    }
    handle(host).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(seen).toEqual(['shift-start', 'shift', 'shift-end']);
    expect(last).toEqual([55, 45]);
  });

  it('패널이 셋이면 가운데 핸들의 최대값은 이웃한 두 패널의 몫의 합이다', async () => {
    const host = await mount('<u-split-panel default-ratio="20,30,50" style="width:600px;height:120px"><div>A</div><div>B</div><div>C</div></u-split-panel>');
    const hs = Array.from(host.shadowRoot!.querySelectorAll<HTMLElement>('[part~="splitter"]'));
    expect(hs.map(attrs)).toEqual([
      { now: '20', min: '0', max: '50' },
      { now: '30', min: '0', max: '80' },
    ]);
    hs[1].focus();
    await userEvent.keyboard('{End}');
    // 가운데 핸들은 B·C 사이만 옮긴다 — A 는 그대로다.
    expect(host.getAttribute('ratio')).toBe('20,80,0');
    expect(attrs(hs[0])).toEqual({ now: '20', min: '0', max: '100' });
  });

  it('RTL 가로 배치에서도 «←» 는 선을 왼쪽으로 옮긴다 — 오른쪽에 있는 앞 패널이 커진다', async () => {
    const host = await mount('<div dir="rtl"><u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel></div>');
    const h = handle(host);
    const before = h.getBoundingClientRect().left;
    h.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(attrs(h).now).toBe('55');
    expect(h.getBoundingClientRect().left).toBeLessThan(before);
  });

  it('disabled 면 포커스 순서에서 빠지고 키에 반응하지 않는다', async () => {
    const host = await mount('<u-split-panel disabled style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>');
    const h = handle(host);
    expect(h.tabIndex).toBe(-1);
    expect(h.getAttribute('aria-disabled')).toBe('true');
    h.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(attrs(h).now).toBe('50');
    host.removeAttribute('disabled');
    await (host as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
    expect(h.tabIndex).toBe(0);
    expect(h.hasAttribute('aria-disabled')).toBe(false);
  });
});
