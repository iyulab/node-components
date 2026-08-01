import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// 토큰이 없으면 color-mix() 파생이 전부 무효가 되어 색 검증이 불가능하다.
// (정적 CSS 진입점의 실사용 검증을 겸한다 — Theme.init() 없이 토큰만 얻는 경로다.)
import '../../src/assets/styles/light.css';
import '../../src/components/button/UButton.js';
import '../../src/components/tag/UTag.js';
import '../../src/components/card/UCard.js';
import '../../src/components/badge/UBadge.js';
import '../../src/components/tab/UTab.js';
import '../../src/components/option/UOption.js';
import '../../src/components/menu/UMenu.js';
import '../../src/components/tooltip/UTooltip.js';

/**
 * 컴포넌트 기본 레이아웃이 소비 앱의 CSS 리셋에 지워지면 안 된다.
 *
 * `<u-button>` 은 **문서 요소**이므로 문서의 `* { padding:0; border:0 }` 사정권에 있고,
 * 호스트 요소에 대해서는 **문서 작성자 스타일이 섀도의 `:host` 규칙을 이긴다**. 그래서
 * `:host { padding: .5em }` 이 통째로 지워져 버튼이 글자 높이만 남는다 — 에러는 없다.
 *
 * Tailwind preflight(`*,::before,::after { border:0 solid; margin:0; padding:0 }`)는 특수
 * 케이스가 아니라 **가장 흔한 소비 환경**이고, normalize/reset 계열도 같은 형태다.
 */
describe(':host 레이아웃 vs 문서 CSS 리셋', () => {
  let reset: HTMLStyleElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    reset = document.createElement('style');
    // Tailwind v4 preflight 의 해당 규칙을 그대로 재현한다
    reset.textContent =
      '*, ::after, ::before, ::backdrop { box-sizing: border-box; border: 0 solid; ' +
      'margin: 0; padding: 0; }';
    document.head.appendChild(reset);
  });

  afterEach(() => reset.remove());

  /** 리셋 아래에서 요소가 실제로 차지하는 세로 여백(= 콘텐츠 밖 박스) */
  function verticalBox(el: HTMLElement) {
    const cs = getComputedStyle(el);
    const inner = el.shadowRoot?.querySelector<HTMLElement>('[part]');
    const innerCs = inner ? getComputedStyle(inner) : null;
    return {
      hostPadTop: cs.paddingTop,
      hostBorderTop: cs.borderTopWidth,
      innerPart: inner?.getAttribute('part') ?? null,
      innerPadTop: innerCs?.paddingTop ?? null,
      rendered: Math.round(el.getBoundingClientRect().height),
    };
  }

  it('u-button 이 리셋 아래에서도 기본 여백을 유지한다', async () => {
    const btn = document.createElement('u-button') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    btn.textContent = 'OK';
    document.body.appendChild(btn);
    await btn.updateComplete;

    const box = verticalBox(btn);
    // 14px * 1.5 line-height ≈ 21px. 여백이 살아 있으면 그보다 확실히 커야 한다.
    expect(
      box.rendered,
      `버튼이 글자 높이로 붕괴했다 — ${JSON.stringify(box)}`,
    ).toBeGreaterThan(28);
  });

  it('u-button 의 variant 테두리 색이 내부 요소로 이전된 뒤에도 유지된다', async () => {
    // 테두리를 내부 요소가 그리게 바꿨으므로, :host([variant]) 가 정하는 색이
    // --btn-border-color 를 통해 실제로 도달하는지 확인한다.
    const btn = document.createElement('u-button') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    btn.setAttribute('variant', 'outlined');
    btn.textContent = 'Outlined';
    document.body.appendChild(btn);
    await btn.updateComplete;

    const inner = btn.shadowRoot!.querySelector<HTMLElement>('[part="button"]')!;
    const cs = getComputedStyle(inner);
    expect(cs.borderTopWidth, '내부 요소가 테두리를 그려야 한다').toBe('1px');
    expect(cs.borderTopColor, 'variant 색이 전달돼야 한다').not.toBe('rgba(0, 0, 0, 0)');
  });

  // 래퍼(`part="base"`)를 도입한 컴포넌트들. 리셋 아래에서 여백이 살아 있어야 한다.
  const WRAPPED: Array<[string, string]> = [
    ['u-tag', 'Tag'],
    ['u-badge', '9'],
    ['u-tab', 'Tab'],
    ['u-option', 'Option'],
    ['u-menu', ''],
    ['u-tooltip', 'Tip'],
  ];

  for (const [tag, text] of WRAPPED) {
    it(`${tag} 의 여백이 리셋 아래에서도 내부 래퍼에 살아 있다`, async () => {
      const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
      if (text) el.textContent = text;
      document.body.appendChild(el);
      await el.updateComplete;

      const host = getComputedStyle(el);
      expect(host.paddingTop, `${tag}: 호스트 여백은 리셋에 지워지는 게 정상이다`).toBe('0px');

      const base = el.shadowRoot!.querySelector<HTMLElement>('[part="base"]');
      expect(base, `${tag}: part="base" 래퍼가 없다`).not.toBeNull();

      const cs = getComputedStyle(base!);
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingLeft);
      expect(pad, `${tag}: 래퍼 여백이 0 이다 — 리셋이 내부까지 도달했거나 배선이 끊겼다`)
        .toBeGreaterThan(0);
    });
  }

  it('u-menu 의 테두리가 내부 래퍼로 이전된 뒤에도 유지되고, borderless 는 제거된다', async () => {
    const make = async (borderless: boolean) => {
      const el = document.createElement('u-menu') as HTMLElement & {
        updateComplete: Promise<unknown>;
      };
      if (borderless) el.setAttribute('borderless', '');
      document.body.appendChild(el);
      await el.updateComplete;
      return getComputedStyle(el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!);
    };
    expect((await make(false)).borderTopWidth, '기본 메뉴는 테두리를 그려야 한다').toBe('1px');
    expect((await make(true)).borderTopWidth, 'borderless 는 테두리가 없어야 한다').toBe('0px');
  });

  it('u-badge variant="dot" 은 여백이 0 이다 (래퍼 도입 후에도)', async () => {
    // 네거티브 컨트롤 — 위 루프가 "여백 > 0" 만 보므로, 의도적으로 0인 케이스가
    // 함께 살아 있는지 확인해야 배선이 뭉개지지 않았음을 안다.
    const el = document.createElement('u-badge') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    el.setAttribute('variant', 'dot');
    document.body.appendChild(el);
    await el.updateComplete;

    const base = el.shadowRoot!.querySelector<HTMLElement>('[part="base"]');
    // dot 은 render() 가 nothing 을 반환하므로 래퍼 자체가 없다.
    expect(base, 'dot variant 는 콘텐츠를 렌더하지 않는다').toBeNull();
    expect(Math.round(el.getBoundingClientRect().width), 'dot 크기가 유지돼야 한다')
      .toBeGreaterThan(0);
  });
});
