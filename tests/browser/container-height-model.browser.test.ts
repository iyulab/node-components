import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/panel/UPanel.js';
import '../../src/components/split-panel/USplitPanel.js';

/**
 * **컨테이너 프리미티브의 높이 계약 — 둘이 서로 다르다**(cycle-565).
 *
 * | | 제약이 없을 때 | 제약이 있을 때 |
 * |---|---|---|
 * | `u-panel` | 내용 크기로 자란다(정상) | 진짜 스크롤 컨테이너가 된다 |
 * | `u-split-panel` | 🔴**18px 로 붕괴하고 `overflow: hidden` 이라 패널 내용이 보이지 않는다** | 패널이 그 높이를 나눠 갖는다 |
 *
 * ## 왜 이 파일이 생겼는가
 *
 * `u-split-panel` 은 `:host { height: 100%; overflow: hidden }` 인 **셸**이다. 제약 없는 부모 안에서
 * `height: 100%` 는 걸릴 곳이 없고, `overflow: hidden` 때문에 넘친 내용에 **도달할 방법도 없다**
 * (실측: 900px 자식 둘이 각각 18px 로 눌렸다). 오류도 콘솔 경고도 없다.
 *
 * 게시 문서는 예제에서 `style="height: 400px"` 를 **보여주기만** 하고 그것이 **필수**라고 말하지
 * 않았다 — 예제를 줄이거나 다른 컨테이너에 중첩한 소비자가 18px 띠를 얻는다.
 *
 * `u-panel` 쪽은 **결함이 아니다**: 두 동작이 모두 유용하고, 다만 어느 쪽인지 문서에 없었다.
 * 그 «정상» 을 함께 고정해 두는 이유는, 나중에 `u-panel` 에 높이 폴백을 넣으려는 변경이
 * 조용히 지나가지 않게 하기 위해서다.
 *
 * ## 왜 브라우저인가
 *
 * `height: 100%` 가 무효가 되는지, `overflow: auto` 가 실제로 스크롤하는지는 **계산된 레이아웃**
 * 으로만 갈린다. jsdom 은 박스를 계산하지 않아 원리적으로 답을 줄 수 없다.
 */

const TALL = 900;
const FIXED = 200;
const SPLIT = 400;

let wrap: HTMLDivElement;

beforeEach(() => {
  wrap = document.createElement('div');
  wrap.style.width = '600px';
  document.body.appendChild(wrap);
});
afterEach(() => {
  wrap.remove();
  document.body.replaceChildren();
});

const settle = async () => {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, 80));
};

async function mount(tag: string, hostStyle: string, inner: string): Promise<HTMLElement> {
  const el = document.createElement(tag) as HTMLElement & { updateComplete?: Promise<unknown> };
  if (hostStyle) el.setAttribute('style', hostStyle);
  el.innerHTML = inner;
  wrap.appendChild(el);
  if (el.updateComplete) await el.updateComplete;
  await settle();
  return el;
}

const h = (el: Element) => Math.round(el.getBoundingClientRect().height);
const tall = `<div style="height:${TALL}px">content</div>`;
const two = `<div style="height:${TALL}px">A</div><div style="height:${TALL}px">B</div>`;

describe('u-panel — 높이를 주면 스크롤 컨테이너, 주지 않으면 내용 크기', () => {
  it('높이가 없으면 내용 크기로 자란다 — 잘리지 않는다', async () => {
    const el = await mount('u-panel', '', tall);
    expect(h(el)).toBe(TALL);
    expect(el.scrollHeight - el.clientHeight, '넘칠 것이 없으므로 스크롤바도 없다').toBeLessThanOrEqual(1);
  });

  it('🔴높이를 주면 «실제로» 스크롤한다 — overflow:auto 가 선언만 되어 있는 것이 아니다', async () => {
    const el = await mount('u-panel', `height:${FIXED}px`, tall);
    expect(h(el)).toBe(FIXED);
    expect(el.scrollHeight - el.clientHeight, '내용이 넘쳐야 의미가 있다').toBeGreaterThan(0);
    el.scrollTop = 100;
    await new Promise((r) => setTimeout(r, 60));
    expect(el.scrollTop, '스크롤 컨테이너가 아니면 0 으로 남는다').toBeGreaterThan(0);
  });
});

describe('u-split-panel — 높이는 부모가 정한다(셸)', () => {
  it('부모가 높이를 주면 패널이 그 높이를 나눠 갖는다', async () => {
    const el = await mount('u-split-panel', `height:${SPLIT}px`, two);
    expect(h(el)).toBe(SPLIT);
    for (const kid of Array.from(el.children)) {
      expect(h(kid), '각 패널이 호스트 높이를 받는다').toBe(SPLIT);
    }
  });

  /**
   * 🔴이 사례가 없으면 이 파일은 `:host { height: 100% }` 가 사라진 것을 **보지 못한다**(cycle-565 실측).
   *
   * 네거티브 컨트롤로 그 선언을 걷었는데 **5건 전부 통과**했다 — 위아래 사례들이 호스트를
   * 인라인 `height` 나 `flex: 1 1 auto` 로 **직접** 크기 지정하거나(그러면 시트 선언과 무관하다),
   * 부모에 높이가 아예 없어(붕괴 사례) 역시 무관하기 때문이다. `height: 100%` 가 실제로 일하는
   * 경로는 **«부모가 높이를 갖고 호스트에는 아무 스타일도 없을 때»** 뿐이고, 그것이 소비자가
   * 가장 흔히 쓰는 모양이다.
   */
  it('🔴부모가 높이를 주면 호스트는 아무 스타일 없이도 그 높이를 채운다 — :host{height:100%} 가 하는 일', async () => {
    wrap.style.height = `${SPLIT}px`;
    const el = await mount('u-split-panel', '', two);   // 호스트에 인라인 크기를 주지 않는다
    expect(h(el), '부모 높이를 상속해야 한다 — 이것이 height:100% 의 유일한 관측 경로다').toBe(SPLIT);
    for (const kid of Array.from(el.children)) {
      expect(h(kid)).toBe(SPLIT);
    }
  });

  it('제약된 조상(flex 부모 + min-height:0)으로도 성립한다 — 이 레시피를 문서에 싣기 전에 잰다', async () => {
    wrap.style.height = `${SPLIT}px`;
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    const el = await mount('u-split-panel', 'flex:1 1 auto;min-height:0', two);
    expect(h(el), '부모 높이 안에 들어와야 한다').toBe(SPLIT);
    for (const kid of Array.from(el.children)) {
      expect(h(kid)).toBe(SPLIT);
    }
  });

  it('🔴높이 제약이 없으면 붕괴하고 내용이 보이지 않는다 — 계약이라 고정한다(호스트에 높이를 줄 것)', async () => {
    const el = await mount('u-split-panel', '', two);
    // 정확한 px 는 셸 자신의 최소 크기라 고정하지 않는다(판이 바뀌면 달라진다).
    // 고정하는 것은 계약이다: 내용(900px)을 담지 못하고, overflow:hidden 이라 도달할 수도 없다.
    expect(h(el), '제약이 없으면 내용 높이를 갖지 못한다').toBeLessThan(TALL / 4);
    expect(getComputedStyle(el).overflowY, '넘친 부분은 잘린다 — 그래서 도달할 수 없다').toBe('hidden');
    expect(el.scrollHeight - el.clientHeight, '스크롤로도 닿을 수 없다').toBe(0);
  });
});
