import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/alert/UAlert.js';
import '../../src/components/button/UButton.js';
import '../../src/components/progress-bar/UProgressBar.js';
import '../../src/components/tag/UTag.js';

/**
 * 소스가 규약에 맞는 것과 **브라우저에서 체인이 실제로 해석되는 것**은 다르다.
 *
 * `--u-danger-color-strong` 을 `-strongg` 로 오타내면 `var()` 가 미정의가 되어
 * **선언 전체가 조용히 무효**가 된다 — 에러도 경고도 없다. 소스 대조 테스트
 * (`tests/build/role-token-layer.test.ts`)는 이 부류를 잡지 못하므로 여기서 실측한다.
 *
 * 동시에 이 층의 존재 이유 — *역할 토큰 하나를 덮으면 전 컴포넌트가 따라온다* — 도
 * 실제 렌더로 확인한다.
 */

const px = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop).trim();
const tokenOf = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount<T extends HTMLElement>(tag: string, attrs: Record<string, string> = {}) {
  const el = document.createElement(tag) as T & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('역할 토큰 브라우저 해석', () => {
  beforeAll(() => {
    expect(tokenOf('--u-blue-600'), '이 테스트는 토큰 시트를 전제한다').not.toBe('');
  });

  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.style.cssText = '';
  });

  it('역할 토큰 25개가 전부 빈 값이 아니게 해석된다', () => {
    const empty: string[] = [];
    for (const role of ['primary', 'info', 'success', 'warning', 'danger']) {
      for (const step of ['-weakest', '-weaker', '-weak', '', '-strong']) {
        const name = `--u-${role}-color${step}`;
        if (!tokenOf(name)) empty.push(name);
      }
    }
    expect(empty).toEqual([]);
  });

  it('역할 토큰이 시트가 선언한 팔레트 단으로 브라우저에서 해석된다', () => {
    // ★제목이 원래 *"(배선 전 시각 보존)"* 이었고 값도 그때의 단이었다. Cycle 141 이
    //   `-color`/`-strong` 을 **대비로 다시 골랐기 때문에** 그 전제는 더 이상 성립하지
    //   않는다 — 라이트 blue-600 위의 흰 글자는 3.68 로 AA 미달이었다.
    //   이 검사가 지키는 것은 이제 *"값이 옛날과 같다"* 가 아니라 **체인이 브라우저에서
    //   실제로 풀린다**는 것이다(시트의 var() 체인은 정적 파싱으로는 검증되지 않는다).
    //   값 자체의 정당성은 tests/build/token-contrast.test.ts 가 대비로 판정한다.
    const expected: Array<[string, string]> = [
      ['--u-primary-color-weak', '--u-blue-500'],
      ['--u-primary-color', '--u-blue-700'],
      ['--u-primary-color-strong', '--u-blue-800'],
      ['--u-danger-color', '--u-red-700'],
      ['--u-danger-color-strong', '--u-red-800'],
      ['--u-warning-color-weak', '--u-yellow-500'],
      ['--u-success-color-weakest', '--u-green-200'],
      ['--u-info-color-weaker', '--u-blue-300'],
    ];
    for (const [role, palette] of expected) {
      expect(tokenOf(role), `${role} 은 ${palette} 와 같아야 한다`).toBe(tokenOf(palette));
    }
  });

  it('u-alert 의 status 배경이 면 토큰으로 실제로 칠해진다 (체인이 끊기면 빈 값)', async () => {
    // ★1.17.0 에서 배경이 `-weakest`(shade-200) → 면 토큰(--u-*-bg-color)으로 바뀌었다.
    //   shade-200 은 라이트에서 면으로 쓰기엔 진해 그 위의 아이콘이 4/4 미달이었다.
    //   warning 만 단이 200 인 것은 노랑 램프의 세기가 다른 계열과 어긋나기 때문이다
    //   (light.css 의 면 토큰 주석 참조).
    for (const [status, palette] of [
      ['error', '--u-red-0'],
      ['warning', '--u-yellow-200'],
      ['info', '--u-blue-0'],
      ['success', '--u-green-0'],
    ] as const) {
      const el = await mount('u-alert', { status });
      const bg = px(el, '--alert-background-color');
      expect(bg, `status=${status} 의 배경이 해석되지 않았다`).not.toBe('');
      expect(bg, `status=${status} 의 배경이 시트가 선언한 면 토큰과 다르다`).toBe(tokenOf(palette));
      el.remove();
    }
  });

  it('--u-primary-color 를 덮으면 여러 컴포넌트가 함께 따라온다', async () => {
    const BRAND = 'rgb(255, 0, 128)';
    const btn = await mount('u-button');
    const bar = await mount('u-progress-bar');

    expect(px(btn, '--btn-color')).toBe(tokenOf('--u-blue-700'));

    document.documentElement.style.setProperty('--u-primary-color', BRAND);

    expect(px(btn, '--btn-color'), 'u-button 이 브랜드색을 따르지 않았다').toBe(BRAND);
    expect(px(bar, '--progress-bar-color'), 'u-progress-bar 가 브랜드색을 따르지 않았다').toBe(BRAND);

    // ★**리브랜딩은 역할당 한 단이 아니라 5단 전부다** — 시트가 그렇게 적어 놓았다
    // ("아래 25개만 재정의하면"). `-color` 는 **면**의 단이고, 바탕/면 위에 서는 자리
    // (링크·hover 텍스트·아이콘·상태 테두리)는 `-strong` 을 경유한다. 그래서 `-color`
    // 하나만 덮은 상태에서 상태 테두리가 안 따라오는 것은 **결함이 아니라 계약**이다.
    // 이 단언이 그 계약을 지킨다 — 여기서 깨지면 두 단 중 하나가 층을 건너뛴 것이다.
    const BRAND_STRONG = 'rgb(153, 0, 77)';
    const semantic = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    expect(semantic('--u-input-border-color-focus'), '`-color` 만 덮었는데 상태 테두리가 움직였다')
      .not.toBe(BRAND);

    document.documentElement.style.setProperty('--u-primary-color-strong', BRAND_STRONG);
    for (const token of ['--u-input-border-color-focus', '--u-link-txt-color', '--u-icon-color-hover'])
      expect(semantic(token), `${token} 이 역할 층(-strong)을 경유하지 않았다`).toBe(BRAND_STRONG);
  });

  it('--u-primary-color 오버라이드가 장식 축(color=X)에는 침범하지 않는다', async () => {
    // 네거티브 컨트롤 — 브랜딩이 `color="green"` 까지 물들이면 장식 API 가 깨진 것이다.
    // (`--tag-fill-color` 는 `color=` 미지정 시의 브랜드 경로이므로 primary 를 따르는 게 정상.
    //  장식 축이 실제로 세팅하는 것은 `--tag-bg-color`/`--tag-border-color` 다.)
    const tag = await mount('u-tag', { color: 'green', variant: 'solid' });
    const before = px(tag, '--tag-bg-color');
    expect(before, '장식 축 값이 비어 있다 — 이 테스트가 공허하게 통과하고 있다').not.toBe('');
    expect(before, 'color="green" 이 green 팔레트를 쓰지 않는다').toBe(tokenOf('--u-green-500'));
    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(px(tag, '--tag-bg-color'), '장식 축이 브랜드색에 오염됐다').toBe(before);
  });
});
