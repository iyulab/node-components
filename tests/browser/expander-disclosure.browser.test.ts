import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/expander/UExpander.js';

/**
 * `u-expander` — 디스클로저의 **세 요구**를 실브라우저에서 잰다.
 *
 * 소비앱 초안(`lob-layout-primitives` R3)이 요구한 것은 셋이다: **접기/펼치기** ·
 * **키보드 조작** · **`prefers-reduced-motion` 존중**. 여기서 재는 이유는 셋 다 jsdom 이
 * 재현하지 못하기 때문이다 — 높이는 grid 트랙(`0fr`↔`1fr`) 계산이고, 미디어 규칙은
 * CSSOM 판독이며, «탭 순서에서 빠지는가» 는 실제 포커스 이동이다.
 *
 * ## 🔴 이 컴포넌트가 왜 생겼나 — «속성 존재 ≠ 동작»
 *
 * `u-panel` 이 `collapsible` 을 **선언만** 하고 있었다(렌더는 `<slot>` 하나 · 스타일 규칙 0 ·
 * 핸들러 0). 그런데 게시되는 스킬 문서는 *"Allow the panel to collapse"* 라고 **동작한다고
 * 적고 있었다.** cycle-197 이 만든 스킬 문서 대조 검사는 «존재»와 «기본값»을 재므로
 * **초록이었다** — 프로퍼티가 실재하기 때문이다. ⇒ 이 리포가 반복 기록해 온 형태의 또 다른
 * 변주다(*게이트 존재 ≠ 린팅 동작* · *토큰 존재 ≠ 배선* · *축 존재 ≠ 도달*).
 *
 * ## ⚠ 접힘의 판정을 «높이»로만 하지 않는다
 *
 * `overflow: hidden` 만으로 접으면 **접힌 콘텐츠가 접근성 트리와 탭 순서에 그대로 남는다** —
 * 화면에서 사라졌는데 탭이 그 안으로 들어가는, 눈으로는 보이지 않는 결함이다. 그래서
 * 높이(⑴)와 **포커스 도달 가능성**(⑷)을 따로 잰다. ⑷ 가 이 파일의 네거티브 컨트롤이다:
 * `visibility` 전환을 빼면 ⑴ 은 계속 통과하고 ⑷ 만 깨진다.
 */

const mount = async (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  const el = host.firstElementChild as HTMLElement & {
    updateComplete: Promise<unknown>;
    open: boolean;
    toggle(): boolean;
  };
  await el.updateComplete;
  return el;
};

const headerOf = (el: HTMLElement) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>('[part="header"]')!;
const contentOf = (el: HTMLElement) =>
  el.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('u-expander — 접기/펼치기', () => {
  it('⑴ 접힌 본문은 높이를 차지하지 않고, 펼치면 차지한다', async () => {
    const el = await mount(`<u-expander label="제목"><p style="height:120px">본문</p></u-expander>`);

    expect(contentOf(el).getBoundingClientRect().height).toBe(0);

    el.open = true;
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 400)); // 전환 종료를 기다린다

    expect(contentOf(el).getBoundingClientRect().height).toBeGreaterThan(100);
  });

  it('⑵ 헤더 클릭이 상태를 뒤집고 aria-expanded 가 따라온다', async () => {
    const el = await mount(`<u-expander label="제목">본문</u-expander>`);
    const header = headerOf(el);

    expect(header.getAttribute('aria-expanded')).toBe('false');

    header.click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('true');

    header.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('⑵-b `expand` 를 취소하면 열리지 않는다 (이벤트가 관문이다)', async () => {
    const el = await mount(`<u-expander label="제목">본문</u-expander>`);
    el.addEventListener('expand', e => e.preventDefault());

    headerOf(el).click();
    await el.updateComplete;

    expect(el.open).toBe(false);
  });

  it('⑵-c `disabled` 면 열리지 않는다', async () => {
    const el = await mount(`<u-expander label="제목" disabled>본문</u-expander>`);
    headerOf(el).click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});

describe('u-expander — 키보드', () => {
  it('⑶ 키보드만으로 조작된다 — 헤더가 네이티브 button 이라 Enter/Space 가 그대로 온다', async () => {
    const el = await mount(`<u-expander label="제목">본문</u-expander>`);
    const header = headerOf(el);

    header.focus();
    expect(el.shadowRoot!.activeElement).toBe(header);

    // 네이티브 button 은 Enter/Space 를 click 으로 바꿔 준다 — 그 계약을 확인한다.
    expect(header.tagName).toBe('BUTTON');
    expect(header.type).toBe('button');

    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    header.click(); // 브라우저가 대신 해 주는 그 한 걸음
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  it('⑷ 🔴접힌 본문은 탭 순서에서 빠진다 — 높이 0 만으로는 성립하지 않는 조건', async () => {
    const el = await mount(
      `<u-expander label="제목"><button id="inner">안쪽 버튼</button></u-expander>`,
    );
    const inner = el.querySelector<HTMLButtonElement>('#inner')!;

    inner.focus();
    expect(document.activeElement).not.toBe(inner); // visibility: hidden ⇒ 포커스 불가

    el.open = true;
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 400));

    inner.focus();
    expect(document.activeElement).toBe(inner);
  });
});

describe('u-expander — prefers-reduced-motion', () => {
  it('⑸ 전환은 «장식» 이므로 reduce 에서 멈춘다 (CSSOM 판독)', async () => {
    const el = await mount(`<u-expander label="제목">본문</u-expander>`);

    const reduceRules = [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
      .flatMap(s => [...s.cssRules])
      .filter(
        (r): r is CSSMediaRule =>
          r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'),
      )
      .flatMap(m => [...m.cssRules]) as CSSStyleRule[];

    expect(reduceRules.length).toBeGreaterThan(0);
    const stopped = reduceRules.filter(r => r.style.transitionDuration === '0s');
    expect(stopped.length).toBeGreaterThan(0);
    // 셀렉터가 실제로 이 컴포넌트의 두 전환 대상을 덮는가
    expect(stopped.some(r => r.selectorText.includes('.content'))).toBe(true);
    expect(stopped.some(r => r.selectorText.includes('.icon'))).toBe(true);
  });
});
