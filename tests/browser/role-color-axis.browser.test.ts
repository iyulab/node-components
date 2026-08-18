import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/button/UButton.js';
import '../../src/components/tag/UTag.js';
import '../../src/components/badge/UBadge.js';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * `color` 속성의 **역할 축**(`primary`·`info`·`success`·`warning`·`danger`).
 *
 * 장식 축과 정확히 반대되는 두 성질을 지킨다:
 *   ⑴ **리브랜딩을 따라온다** — 소비자가 역할 토큰을 덮으면 색이 함께 움직인다.
 *   ⑵ **대비 짝을 물려받는다** — 면과 그 위 글자가 쌍으로 온다.
 *
 * ★⑵ 가 이 축의 존재 이유다. 역할 값을 장식 램프(shade-600)로 해석하면 라이트에서
 * 흰 글자가 8색 중 6색 AA 미달이 되는데(green 3.30 · orange 2.37 · cyan 2.74),
 * 그러면 *의미 이름*을 얻는 대가로 가독성을 잃는다. `warning` 이 그 시금석이다 —
 * 노란 면 위의 흰 글자는 어떤 단으로도 읽히지 않으므로, 전경이 **함께** 와야 한다.
 *
 * 장식 축이 변하지 않았다는 것은 이 파일이 아니라 `tag-color-matrix` ·
 * `checkbox-color-matrix` 가 증명한다(리팩터 전 캡처한 계산색).
 */

const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(tag: string, attrs: Record<string, string>) {
  const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** `rgb(a, b, c)` 로 정규화 — 토큰은 hex, 계산값은 rgb 라 직접 비교되지 않는다. */
function normalize(color: string): string {
  const probe = document.createElement('div');
  probe.style.color = color;
  document.body.appendChild(probe);
  const out = getComputedStyle(probe).color;
  probe.remove();
  return out;
}

describe('color 역할 축', () => {
  beforeAll(() => {
    expect(token('--u-danger-color'), '이 테스트는 토큰 시트를 전제한다').not.toBe('');
  });
  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.style.removeProperty('--u-danger-color');
  });

  it('u-button solid — 면은 -color, 그 위 글자는 -txt-color 를 받는다', async () => {
    const wrong: string[] = [];
    for (const role of ROLES) {
      const el = await mount('u-button', { variant: 'solid', color: role });
      const s = getComputedStyle(el);
      const bg = normalize(token(`--u-${role}-color`));
      const fg = normalize(token(`--u-${role}-txt-color`));
      if (s.backgroundColor !== bg) wrong.push(`${role} 면: ${s.backgroundColor} ≠ ${bg}`);
      if (s.color !== fg) wrong.push(`${role} 글자: ${s.color} ≠ ${fg}`);
    }
    expect(wrong).toEqual([]);
  });

  it('★warning solid 의 글자는 흰색이 아니다 — 이 축이 존재하는 이유', async () => {
    // 장식 축은 어떤 색이든 면 위 글자가 흰색 고정이다. 역할 축이 그것을 물려받았다면
    // 노란 면 위의 흰 글자가 되어 읽히지 않는다. 이 단언이 그 회귀를 막는다.
    const el = await mount('u-button', { variant: 'solid', color: 'warning' });
    const fg = getComputedStyle(el).color;
    expect(fg).not.toBe('rgb(255, 255, 255)');
    expect(fg).toBe(normalize(token('--u-warning-txt-color')));
  });

  it('u-button link — 바탕 위의 글자는 면 단이 아니라 -strong 을 받는다', async () => {
    // 다크에서 면 단(-color)을 바탕 위 글자로 쓰면 3.07 로 미달한다(Cycle 141).
    // 두 자리가 슬롯을 공유하지 않는다는 것을 계산값으로 못박는다.
    const wrong: string[] = [];
    for (const role of ROLES) {
      const el = await mount('u-button', { variant: 'link', color: role });
      const fg = getComputedStyle(el).color;
      const strong = normalize(token(`--u-${role}-color-strong`));
      const surface = normalize(token(`--u-${role}-color`));
      if (fg !== strong) wrong.push(`${role}: ${fg} ≠ -strong ${strong}`);
      if (fg === surface && strong !== surface) wrong.push(`${role}: 면 단을 글자로 쓰고 있다`);
    }
    expect(wrong).toEqual([]);
  });

  it('u-tag solid / u-badge — 면과 전경이 쌍으로 온다', async () => {
    const wrong: string[] = [];
    for (const role of ROLES) {
      const tag = await mount('u-tag', { variant: 'solid', color: role });
      const ts = getComputedStyle(tag);
      if (ts.backgroundColor !== normalize(token(`--u-${role}-color`)))
        wrong.push(`u-tag ${role} 면`);
      if (ts.color !== normalize(token(`--u-${role}-txt-color`)))
        wrong.push(`u-tag ${role} 글자`);

      const badge = await mount('u-badge', { color: role });
      const bs = getComputedStyle(badge);
      if (bs.backgroundColor !== normalize(token(`--u-${role}-color`)))
        wrong.push(`u-badge ${role} 면`);
      if (bs.color !== normalize(token(`--u-${role}-txt-color`)))
        wrong.push(`u-badge ${role} 글자`);
    }
    expect(wrong).toEqual([]);
  });

  it('★리브랜딩을 따라온다 — 역할 토큰을 덮으면 색이 함께 움직인다', async () => {
    // 장식 축과 갈리는 지점. `color="red"` 는 이 오버라이드에 면역이어야 하고
    // `color="danger"` 는 따라와야 한다.
    document.documentElement.style.setProperty('--u-danger-color', 'rgb(1, 2, 3)');

    const role = await mount('u-button', { variant: 'solid', color: 'danger' });
    const decorative = await mount('u-button', { variant: 'solid', color: 'red' });

    expect(getComputedStyle(role).backgroundColor, '역할 값이 브랜드를 따라오지 않는다')
      .toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(decorative).backgroundColor, '장식 값이 브랜드에 오염됐다')
      .not.toBe('rgb(1, 2, 3)');
  });

  it('u-checkbox — 같은 체크 표시가 면 위(filled)와 바탕 위(outline)에서 다른 단을 받는다', async () => {
    const wrong: string[] = [];
    for (const role of ROLES) {
      const filled = await mount('u-checkbox', { variant: 'filled', color: role, checked: '' });
      const outline = await mount('u-checkbox', { variant: 'outline', color: role, checked: '' });
      const box = (el: HTMLElement) =>
        getComputedStyle(el.shadowRoot!.querySelector('.checkbox') as Element);

      if (box(filled).color !== normalize(token(`--u-${role}-txt-color`)))
        wrong.push(`${role} filled 표시가 on-color 가 아니다`);
      if (box(outline).color !== normalize(token(`--u-${role}-color-strong`)))
        wrong.push(`${role} outline 표시가 -strong 이 아니다`);
    }
    expect(wrong).toEqual([]);
  });
});
