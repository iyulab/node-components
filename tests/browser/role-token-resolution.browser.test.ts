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

  it('역할 토큰이 대응 팔레트 단과 같은 값으로 해석된다 (배선 전 시각 보존)', () => {
    const expected: Array<[string, string]> = [
      ['--u-primary-color-weak', '--u-blue-500'],
      ['--u-primary-color', '--u-blue-600'],
      ['--u-primary-color-strong', '--u-blue-700'],
      ['--u-danger-color', '--u-red-600'],
      ['--u-danger-color-strong', '--u-red-700'],
      ['--u-warning-color-weak', '--u-yellow-500'],
      ['--u-success-color-weakest', '--u-green-200'],
      ['--u-info-color-weaker', '--u-blue-300'],
    ];
    for (const [role, palette] of expected) {
      expect(tokenOf(role), `${role} 은 ${palette} 와 같아야 한다`).toBe(tokenOf(palette));
    }
  });

  it('u-alert 의 status 색이 실제로 칠해진다 (체인이 끊기면 빈 값)', async () => {
    for (const [status, palette] of [
      ['error', '--u-red-200'],
      ['warning', '--u-yellow-200'],
      ['info', '--u-blue-200'],
      ['success', '--u-green-200'],
    ] as const) {
      const el = await mount('u-alert', { status });
      const bg = px(el, '--alert-background-color');
      expect(bg, `status=${status} 의 배경이 해석되지 않았다`).not.toBe('');
      expect(bg, `status=${status} 의 배경이 이전 팔레트 값과 달라졌다`).toBe(tokenOf(palette));
      el.remove();
    }
  });

  it('--u-primary-color 를 덮으면 여러 컴포넌트가 함께 따라온다', async () => {
    const BRAND = 'rgb(255, 0, 128)';
    const btn = await mount('u-button');
    const bar = await mount('u-progress-bar');

    expect(px(btn, '--btn-color')).toBe(tokenOf('--u-blue-600'));

    document.documentElement.style.setProperty('--u-primary-color', BRAND);

    expect(px(btn, '--btn-color'), 'u-button 이 브랜드색을 따르지 않았다').toBe(BRAND);
    expect(px(bar, '--progress-bar-color'), 'u-progress-bar 가 브랜드색을 따르지 않았다').toBe(BRAND);
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--u-input-border-color-focus').trim(),
      '시맨틱 층이 역할 층을 경유하지 않았다',
    ).toBe(BRAND);
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
