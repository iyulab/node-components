import { describe, it, beforeAll, afterEach, expect } from 'vitest';
import lightCss from '../../src/assets/styles/light.css?raw';
import '../../src/components/tag/UTag.js';
import '../../src/components/badge/UBadge.js';
import { STATUS_ICON } from '../../src/utilities/statusIcon.js';

/**
 * **색 없이 구분되는가** — `u-tag`·`u-badge` 의 상태 아이콘 축.
 *
 * ## 이 축이 왜 생겼나
 *
 * 대비 계약(1.20.0)은 각 상태색이 **자기 바탕에서 읽히는가**를 지킨다. *구별되는가* 는
 * 지키지 않는다 — 색각 이상이나 흑백 인쇄에서는 «성공»과 «실패»가 같은 회색 알약이 된다.
 * 역할 색 충돌 검사가 **색 공간에서**(CIELAB ΔE) 세운 구분을, 이 축은 **모양 공간에서** 세운다.
 *
 * ## 무엇을 재는가
 *
 * ⑴ 네 상태가 **서로 다른 모양**을 갖는다 — 이것이 «색 없이 구분»의 정의다.
 * ⑵ 의미 없는 색(장식 축·`neutral`·`primary`)에는 **그리지 않는다** — 없는 의미를 지어내면
 *    그 아이콘이 잘못된 정보를 나른다.
 * ⑶ `icon` 을 주지 않으면 **종전 렌더 그대로**다(가산 변경).
 */

beforeAll(() => {
  const s = document.createElement('style');
  s.textContent = lightCss;
  document.head.appendChild(s);
});

afterEach(() => document.body.replaceChildren());

type El = HTMLElement & { updateComplete: Promise<unknown> };

const mount = async (tag: 'u-tag' | 'u-badge', attrs: Record<string, string>) => {
  const el = document.createElement(tag) as El;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = '상태';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

const iconName = (el: El) =>
  el.shadowRoot!.querySelector('.icon')?.getAttribute('name') ?? null;

describe('상태 아이콘 축 — 색 없이 구분', () => {
  for (const tag of ['u-tag', 'u-badge'] as const) {
    it(`🔴${tag}: 네 상태가 서로 다른 모양을 갖는다`, async () => {
      const seen: Record<string, string | null> = {};
      for (const role of Object.keys(STATUS_ICON)) {
        seen[role] = iconName(await mount(tag, { icon: '', color: role }));
        document.body.replaceChildren();
      }
      // 모양이 하나라도 겹치면 그 두 상태는 흑백에서 구별되지 않는다.
      expect(new Set(Object.values(seen)).size, `모양이 겹친다: ${JSON.stringify(seen)}`)
        .toBe(Object.keys(STATUS_ICON).length);
      expect(Object.values(seen).every(Boolean), '네 상태 전부 그려져야 한다').toBe(true);
    });

    it(`${tag}: 의미 없는 색에는 그리지 않는다`, async () => {
      for (const color of ['neutral', 'primary', 'blue', 'purple']) {
        expect(iconName(await mount(tag, { icon: '', color })), color).toBeNull();
        document.body.replaceChildren();
      }
    });

    it(`⑶ ${tag}: icon 을 주지 않으면 종전 렌더 그대로다`, async () => {
      expect(iconName(await mount(tag, { color: 'danger' }))).toBeNull();
    });
  }

  it('u-badge: variant="dot" 는 콘텐츠를 렌더하지 않으므로 아이콘도 없다', async () => {
    const el = await mount('u-badge', { icon: '', color: 'danger', variant: 'dot' });
    expect(el.shadowRoot!.querySelector('.icon')).toBeNull();
  });

  it('🔴아이콘이 «보인다» — 내장 번들에서 실제 SVG 가 그려진다', async () => {
    // ⚠이름만 맞고 그려지지 않으면 이 축은 아무 일도 하지 않는다. `u-icon` 의 해석은
    // **비동기**라(`until(...)`) `updateComplete` 시점에는 아직 비어 있다 — 첫 판이 여기서
    // 0 크기로 걸렸다. 그 비동기가 *네트워크*가 아니라 **내장 번들**이라는 것도 함께 잰다
    // (CDN 이면 소비자 화면이 오프라인에서 빈다).
    const el = await mount('u-tag', { icon: '', color: 'success' });
    const icon = el.shadowRoot!.querySelector('.icon') as HTMLElement;
    for (let i = 0; i < 50 && !icon.shadowRoot?.querySelector('svg'); i++)
      await new Promise(r => setTimeout(r, 20));
    expect(icon.shadowRoot?.querySelector('svg'), 'SVG 가 그려지지 않았다').toBeTruthy();
    const rect = icon.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});
