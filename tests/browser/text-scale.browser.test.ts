import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import '../../src/assets/styles/light.css';
import '../../src/components/text/UText.js';

/**
 * **`u-text` 의 수용 기준** — 값을 박지 않고 *관계*를 고정한다.
 *
 * 이 컴포넌트의 존재 이유는 «시트의 7단 스케일을 마크업에서 쓸 자리»이므로,
 * 지켜야 할 것은 «어떤 크기인가»가 아니라 ***«시트가 말한 그 값을 쓰는가»*** 다.
 * 값을 그대로 적으면 디자인 조정 때마다 테스트를 고쳐야 하고, 그러면 테스트가
 * 아무것도 지키지 않는다(이 리포가 `flex-table` 폴백에서 이미 치른 대가다).
 *
 * 넷을 잰다:
 *   ⑴ 7단이 각자 **시트의 4속성**을 그대로 읽는다 (두 번째 정의처가 되지 않는다)
 *   ⑵ `level` 이 **heading 으로 읽힌다** — 섀도 루트의 h1~h6 + 슬롯 텍스트가 이름
 *   ⑶ 시각 축과 의미 축이 **독립**이다
 *   ⑷ `tone` 은 **중립 강조 축**이다 (역할색이 아니다)
 */

const VARIANTS = ['display', 'title', 'subtitle', 'body', 'label', 'caption', 'overline'] as const;

const tokenOf = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(attrs: Record<string, string> = {}, text = '문서 제목') {
  const el = document.createElement('u-text') as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = text;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const partBase = (el: HTMLElement) => el.shadowRoot!.querySelector('[part="base"]')!;

describe('u-text — 의미 타이포그래피 스케일', () => {
  beforeAll(() => {
    expect(tokenOf('--u-text-body-size'), '이 테스트는 토큰 시트를 전제한다').not.toBe('');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('★7단이 각자 시트의 크기·굵기·행간·자간을 그대로 읽는다', async () => {
    for (const variant of VARIANTS) {
      const el = await mount({ variant });
      const cs = getComputedStyle(partBase(el));

      expect(cs.fontSize, `${variant} size`).toBe(tokenOf(`--u-text-${variant}-size`));
      expect(cs.fontWeight, `${variant} weight`).toBe(tokenOf(`--u-text-${variant}-weight`));

      // leading·tracking 은 계산값이 px 로 나오므로 시트의 배수/em 과 직접 비교할 수 없다.
      // 대신 **크기에 대한 비율**로 확인한다 — 그것이 이 토큰들의 의미다.
      const size = parseFloat(cs.fontSize);
      const leading = parseFloat(tokenOf(`--u-text-${variant}-leading`));
      expect(parseFloat(cs.lineHeight) / size, `${variant} leading`).toBeCloseTo(leading, 2);

      const tracking = tokenOf(`--u-text-${variant}-tracking`);
      const expectedTracking = tracking === '0' ? 0 : parseFloat(tracking) * size;
      const actualTracking = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
      expect(actualTracking, `${variant} tracking`).toBeCloseTo(expectedTracking, 1);

      el.remove();
    }
  });

  it('단들이 서로 다른 크기를 갖고 순서가 단조 감소한다', async () => {
    const sizes: number[] = [];
    for (const variant of VARIANTS) {
      const el = await mount({ variant });
      sizes.push(parseFloat(getComputedStyle(partBase(el)).fontSize));
      el.remove();
    }
    // display > title > subtitle > body > label > caption > overline
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i], `${VARIANTS[i]} < ${VARIANTS[i - 1]}`).toBeLessThan(sizes[i - 1]);
    }
  });

  it('variant 를 주지 않으면 body 다', async () => {
    const bare = await mount();
    const body = await mount({ variant: 'body' });
    expect(getComputedStyle(partBase(bare)).fontSize)
      .toBe(getComputedStyle(partBase(body)).fontSize);
  });

  it('알 수 없는 variant 는 조용히 폰트를 잃지 않고 body 로 흐른다', async () => {
    const junk = await mount({ variant: 'gigantic' });
    expect(getComputedStyle(partBase(junk)).fontSize).toBe(tokenOf('--u-text-body-size'));
  });

  it('★level 을 주면 heading 으로 읽히고 슬롯 텍스트가 접근가능 이름이 된다', async () => {
    await mount({ level: '2', variant: 'title' }, '설정 요약');
    expect(page.getByRole('heading', { level: 2, name: '설정 요약' }).elements().length).toBe(1);
  });

  it('NEGATIVE — level 이 없으면 heading 이 아니다 (p 로 렌더된다)', async () => {
    const el = await mount({ variant: 'title' }, '설정 요약');
    expect(page.getByRole('heading').elements().length).toBe(0);
    expect(partBase(el).tagName).toBe('P');
  });

  it('1~6 이 각각 그 단계로 읽힌다', async () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const el = await mount({ level: String(level) }, `제목 ${level}`);
      expect(partBase(el).tagName).toBe(`H${level}`);
      expect(page.getByRole('heading', { level, name: `제목 ${level}` }).elements().length).toBe(1);
      el.remove();
    }
  });

  it('NEGATIVE — 범위 밖 level 은 heading 을 만들지 않는다', async () => {
    const el = await mount({ level: '9' }, '범위 밖');
    expect(partBase(el).tagName).toBe('P');
    expect(page.getByRole('heading').elements().length).toBe(0);
  });

  it('★시각 축과 의미 축이 독립이다 — 2단 제목이 가장 큰 글자일 수 있다', async () => {
    const el = await mount({ level: '2', variant: 'display' }, '큰 2단 제목');
    expect(partBase(el).tagName).toBe('H2');
    expect(getComputedStyle(partBase(el)).fontSize).toBe(tokenOf('--u-text-display-size'));
  });

  it('★tone 은 중립 강조 축이다 — 기본/약함/강함/반전이 시트 값을 읽는다', async () => {
    const cases: Array<[string, string]> = [
      ['default', '--u-txt-color'],
      ['weak', '--u-txt-color-weak'],
      ['strong', '--u-txt-color-strong'],
      ['inverse', '--u-txt-color-inverse'],
    ];
    const seen = new Set<string>();
    for (const [tone, token] of cases) {
      const el = await mount({ tone });
      const probe = document.createElement('div');
      probe.style.color = `var(${token})`;
      document.body.appendChild(probe);

      const actual = getComputedStyle(partBase(el)).color;
      expect(actual, `tone=${tone}`).toBe(getComputedStyle(probe).color);
      seen.add(actual);
      probe.remove();
      el.remove();
    }
    expect(seen.size, '네 tone 이 서로 다른 색이다').toBe(4);
  });

  it('🔴NEGATIVE — 어떤 단도 소비자가 쓴 글자를 바꾸지 않는다', async () => {
    // overline 에 uppercase 를 붙이고 싶은 충동이 있었고, 실제로 한 번 붙였다가 걷었다.
    // 시트가 정의하는 것은 네 속성뿐이므로 다섯 번째를 여기서 정하면 이 컴포넌트가
    // «두 번째 정의처»가 된다. 그리고 CJK 에는 효과가 없어 **같은 단이 언어에 따라
    // 다르게 보인다** — 로케일 표준을 채택한 리포에서 그것은 결함이다.
    for (const variant of VARIANTS) {
      const el = await mount({ variant }, 'section');
      expect(getComputedStyle(partBase(el)).textTransform, variant).toBe('none');
      el.remove();
    }
  });

  it('블록 요소이고 UA 마진을 남기지 않는다 — 간격은 소비자의 레이아웃이 정한다', async () => {
    const el = await mount({ level: '1' });
    expect(getComputedStyle(el).display).toBe('block');
    const cs = getComputedStyle(partBase(el));
    expect([cs.marginTop, cs.marginBottom]).toEqual(['0px', '0px']);
  });
});
