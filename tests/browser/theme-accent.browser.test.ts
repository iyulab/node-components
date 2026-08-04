import { describe, it, expect, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';
import { contrast } from '../../src/utilities/accent.js';
// ⚠**둘 다 import 해야 한다** — 다크 시트가 없으면 `theme="dark"` 를 걸어도 바탕이 그대로라
//   «다시 계산»이 같은 값을 낸다. 첫 판이 그 상태로 실패했고, 원인은 배선이 아니라 **하니스**였다.
import '../../src/assets/styles/light.css';
import '../../src/assets/styles/dark.css';

/**
 * `Theme.accent(seed)` — **브랜드 색 하나로 `--u-primary-*` 램프를 만든다.**
 *
 * 순수 함수(`deriveAccentRamp`)의 계약은 `tests/build/accent-ramp.test.ts` 가 지킨다.
 * 여기서 재는 것은 **배선**이다: 계산된 값이 실제로 문서에 들어가는가, 테마가 바뀌면 다시
 * 계산되는가, 해제하면 시트 기본값으로 되돌아가는가.
 *
 * ⚠**실브라우저가 필요하다** — `getComputedStyle` 로 시트 값을 읽어 바탕을 정하고, 인라인
 * 스타일이 시트를 이기는지까지 봐야 한다. jsdom 은 커스텀 프로퍼티 캐스케이드를 재현하지 않는다.
 */

const read = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

afterEach(() => {
  Theme.accent(null);
  document.documentElement.removeAttribute('theme');
  document.documentElement.removeAttribute('data-theme');
});

describe('Theme.accent', () => {
  it('시드를 주면 램프 5단 + 면 위 글자색이 문서에 들어간다', () => {
    Theme.accent('#6A1B9A');

    for (const name of [
      '--u-primary-color-weakest',
      '--u-primary-color-weaker',
      '--u-primary-color-weak',
      '--u-primary-color',
      '--u-primary-color-strong',
      '--u-primary-txt-color',
    ])
      expect(read(name), name).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('🔴들어간 값이 대비 계약을 만족한다 (문서에서 읽어 잰다)', () => {
    Theme.accent('#FDD835'); // 밝은 시드 — 고정 비율 파생이 깨지던 그 색
    const bg = read('--u-bg-color');

    expect(contrast(read('--u-primary-color'), read('--u-primary-txt-color'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(read('--u-primary-color-strong'), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(read('--u-primary-color-strong'), read('--u-primary-color'))).toBeGreaterThanOrEqual(1.2);
  });

  it('🔴테마를 바꾸면 램프가 «다시 계산»된다 — 바탕이 달라졌기 때문이다', () => {
    Theme.accent('#1976D2');
    const lightStrong = read('--u-primary-color-strong');

    Theme.set('dark');
    const darkStrong = read('--u-primary-color-strong');

    expect(darkStrong).not.toBe(lightStrong);
    // 다크 바탕에서도 계약을 지킨다(값만 바뀌는 것이 아니라 «맞게» 바뀐다)
    expect(contrast(darkStrong, read('--u-bg-color'))).toBeGreaterThanOrEqual(4.5);
  });

  it('해제하면 시트 기본값으로 되돌아간다', () => {
    const before = read('--u-primary-color');
    Theme.accent('#6A1B9A');
    expect(read('--u-primary-color')).not.toBe(before);

    Theme.accent(null);
    expect(read('--u-primary-color')).toBe(before);
  });
});

/**
 * 🔴**`Theme.accent()` 가 덮는 것은 `primary` 역할 토큰 7종 중 6종이다.**
 *
 * `--u-primary-bg-color` 는 «글자를 얹는 옅은 면»(`u-tag` 의 `--tag-hue-surface`)이라
 * 램프의 어느 단과도 성질이 다르고, 시트는 그 자리를 **5계열 × 2테마 = 10개 값으로 손수**
 * 짝지어 두었다(라이트/다크가 같은 대비비를 쓰지 않는다 — 실측 1.14 대 1.03).
 * ⇒ 도출식으로 바꾸는 것은 팔레트 값 결정이라 **사람 판단**이 필요하고, 그때까지 이 결손은
 * 남는다. 소비앱이 실제로 이 함정에 빠졌다(*"버튼은 브랜드인데 선택된 표 행은 파랑"*).
 *
 * ⚠**이 테스트는 결손을 «고정»하는 것이 아니라 «문서가 참인가»를 잰다.**
 * 값 결정이 내려져 파생이 붙으면 **이 테스트가 뒤집히면서 알려 준다** — 그때 문서
 * (`usage.md` 브랜드 절 · `Theme.accent` JSDoc)도 함께 고쳐야 한다.
 */
describe('Theme.accent — 덮지 않는 한 단 (문서화된 결손)', () => {
  it('🔴시드를 넣어도 `--u-primary-bg-color` 는 시트 기본값 그대로다', () => {
    const sheetDefault = read('--u-primary-bg-color');
    expect(sheetDefault).not.toBe('');

    Theme.accent('#E50112'); // 빨강 시드 — 파랑 기본값과 확실히 다르다
    expect(read('--u-primary-color')).not.toBe('');
    expect(read('--u-primary-bg-color')).toBe(sheetDefault);
  });

  it('그래서 소비자가 한 줄을 더 써야 한다 — 그 경로는 동작한다', () => {
    Theme.accent('#E50112');
    document.documentElement.style.setProperty('--u-primary-bg-color', '#FDE7E9');
    expect(read('--u-primary-bg-color')).toBe('#FDE7E9');
    document.documentElement.style.removeProperty('--u-primary-bg-color');
  });
});
