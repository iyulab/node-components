import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@iyulab/components/styles/tokens.css';
import '../../src/components/dialog/UDialog.js';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/tab/UTab.js';
import '../../src/components/panel/UPanel.js';

/**
 * **`u-dialog` · `u-tab-panel` 의 크기 계약**(cycle-566).
 *
 * 두 컴포넌트는 **올바르게 만들어져 있었다** — 이 파일이 고정하는 것은 결함 수정이 아니라
 * «게시 참조 문서가 이제 주장하는 계약» 이다(두 문서에 크기 서술이 **0건**이었다).
 *
 * | | 제약이 없을 때 | 제약이 있을 때 |
 * |---|---|---|
 * | `u-dialog` | 패널이 내용 크기(실측 896 뷰포트에서 235px) | **호스트 상자의 90%** 에서 멈추고 **본문만** 스크롤 · 머리글/바닥글은 남는다 |
 * | `u-tab-panel` | 내용 크기(띠 34 + 내용 900 = 935) | **내용 영역**이 스크롤 영역이 되고 탭 띠는 자리를 지킨다 |
 *
 * 🔴**`u-dialog` 의 «크기의 주인» 은 호스트 상자다** — 호스트에 `height` 를 주면 컨테이너가 그 값이 되고
 * 90% 상한도 함께 줄어든다(실측 400 → 패널 360). 크기 프로퍼티는 없다. 이것이 문서에 없던 레버다.
 *
 * ## 왜 브라우저인가
 *
 * 재는 것이 «90% 가 무엇의 90% 인가» 와 «어느 요소가 실제로 스크롤하는가» 다 — jsdom 은 박스를
 * 계산하지 않아 원리적으로 답을 줄 수 없다.
 *
 * ⚠**이 런의 교훈 둘을 적용한다**: ⑴넘침 측정만으로는 스크롤 컨테이너임을 증명하지 못하므로
 * `scrollTop` 이 **실제로 남는지** 함께 잰다(cycle-563) ⑵«제약» 을 어떻게 만드는지가 곧 커버리지라
 * 호스트 높이 축을 별도 사례로 둔다(cycle-565).
 */

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

/** `.panel` 은 320ms 전환을 갖는다 — 전환이 끝난 뒤에 잰다(cycle-559·543 의 함정). */
const settle = async (ms = 420) => {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, ms));
};

const h = (el: Element) => Math.round(el.getBoundingClientRect().height);
const part = <T extends Element = HTMLElement>(host: Element, sel: string) =>
  host.shadowRoot!.querySelector(sel) as unknown as T;

type Opened = HTMLElement & { open?: boolean; updateComplete?: Promise<unknown> };

async function openDialog(hostStyle: string, bodyHeight: number): Promise<Opened> {
  const el = document.createElement('u-dialog') as Opened;
  if (hostStyle) el.setAttribute('style', hostStyle);
  el.setAttribute('closable', '');
  el.innerHTML = `<span slot="header">H</span><div style="height:${bodyHeight}px">body</div><div slot="footer">F</div>`;
  document.body.appendChild(el);
  el.open = true;
  if (el.updateComplete) await el.updateComplete;
  await settle();
  return el;
}

async function mountTabs(hostStyle: string, placement: string, tabCount: number, panelHeight: number): Promise<Opened> {
  const el = document.createElement('u-tab-panel') as Opened;
  el.setAttribute('placement', placement);
  el.setAttribute('value', 't0');
  if (hostStyle) el.setAttribute('style', hostStyle);
  let html = '';
  for (let i = 0; i < tabCount; i++) html += `<u-tab value="t${i}">아주 긴 탭 이름 ${i}</u-tab>`;
  html += `<u-panel value="t0"><div style="height:${panelHeight}px">panel</div></u-panel>`;
  el.innerHTML = html;
  wrap.appendChild(el);
  if (el.updateComplete) await el.updateComplete;
  await settle(200);
  return el;
}

describe('u-dialog — 패널은 내용 크기, 호스트 상자의 90% 가 상한', () => {
  it('내용이 짧으면 패널이 내용 크기다 — 상한에 닿지 않는다', async () => {
    const el = await openDialog('', 80);
    const container = part(el, '.container');
    const panel = part(el, '.panel');
    const body = part(el, '.body');
    expect(h(panel), '상한(90%)보다 훨씬 작아야 한다').toBeLessThan(h(container) * 0.5);
    expect(body.scrollHeight - body.clientHeight, '넘칠 것이 없으므로 스크롤바도 없다').toBeLessThanOrEqual(1);
  });

  it('🔴내용이 길면 패널이 호스트 상자의 90% 에서 멈추고 «본문만» 스크롤한다 — 머리글은 남는다', async () => {
    const el = await openDialog('', 3000);
    const container = part(el, '.container');
    const panel = part(el, '.panel');
    const body = part(el, '.body');
    const header = part(el, '.header');
    expect(Math.round((h(panel) / h(container)) * 100), '패널은 컨테이너의 90% 다').toBe(90);
    expect(body.scrollHeight - body.clientHeight, '본문이 스크롤 영역이어야 한다').toBeGreaterThan(0);
    // 🔴넘침 측정만으로는 스크롤 컨테이너임을 증명하지 못한다(cycle-563).
    body.scrollTop = 200;
    await new Promise((r) => setTimeout(r, 60));
    expect(body.scrollTop, '본문이 실제로 스크롤되어야 한다').toBeGreaterThan(0);
    expect(h(header), '머리글은 flex-shrink:0 이라 사라지지 않는다').toBeGreaterThan(0);
    expect(Math.round(part(el, '.panel').getBoundingClientRect().bottom - container.getBoundingClientRect().bottom))
      .toBeLessThanOrEqual(1);
  });

  it('🔴크기의 주인은 «호스트 상자» 다 — 호스트에 높이를 주면 90% 상한이 함께 줄어든다', async () => {
    const el = await openDialog('height:400px', 3000);
    const container = part(el, '.container');
    const panel = part(el, '.panel');
    expect(h(container), '컨테이너가 호스트 높이를 따른다').toBe(400);
    expect(Math.round((h(panel) / 400) * 100), '패널은 그 90% 다').toBe(90);
  });
});

describe('u-tab-panel — 높이를 주면 내용 영역이 스크롤한다', () => {
  it('높이가 없으면 내용 크기로 자란다 — 잘리지 않는다', async () => {
    const el = await mountTabs('', 'top', 3, 900);
    const content = part(el, '.content');
    const nav = part(el, '.nav');
    expect(h(el), '띠 + 내용 만큼 커진다').toBeGreaterThanOrEqual(900 + h(nav) - 1);
    expect(content.scrollHeight - content.clientHeight).toBeLessThanOrEqual(1);
  });

  it('🔴높이를 주면 «내용 영역» 이 스크롤하고 탭 띠는 자리를 지킨다', async () => {
    const el = await mountTabs('height:300px', 'top', 3, 900);
    const content = part(el, '.content');
    const nav = part(el, '.nav');
    expect(h(el)).toBe(300);
    expect(content.scrollHeight - content.clientHeight, '내용이 넘쳐야 의미가 있다').toBeGreaterThan(0);
    content.scrollTop = 100;
    await new Promise((r) => setTimeout(r, 60));
    expect(content.scrollTop, '내용 영역이 실제로 스크롤되어야 한다').toBeGreaterThan(0);
    expect(Math.round(nav.getBoundingClientRect().top - el.getBoundingClientRect().top), '띠는 맨 위에 남는다')
      .toBeLessThanOrEqual(1);
    expect(Math.round(content.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom), '내용이 상자 밖으로 나가지 않는다')
      .toBeLessThanOrEqual(1);
  });

  it('세로 배치(`placement="left"`)도 같은 규칙이다', async () => {
    const el = await mountTabs('height:300px', 'left', 3, 900);
    const content = part(el, '.content');
    expect(h(el)).toBe(300);
    expect(content.scrollHeight - content.clientHeight).toBeGreaterThan(0);
  });

  it('탭이 많으면 «띠» 가 자기 축으로 스크롤한다 — 내용을 밀어내지 않는다', async () => {
    const el = await mountTabs('height:300px', 'top', 20, 900);
    const nav = part(el, '.nav');
    const content = part(el, '.content');
    expect(nav.scrollWidth - nav.clientWidth, '띠가 가로로 스크롤되어야 한다').toBeGreaterThan(0);
    expect(Math.round(content.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom))
      .toBeLessThanOrEqual(1);
  });
});
