import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/carousel/UCarousel.js';
import { Locale } from '../../src/utilities/Locale.js';
import { axTree, axProp } from './ax.js';

/**
 * `u-carousel` 이 보조기기에 내놓는 구조 — WAI-ARIA APG Carousel: 이름 있는 «캐러셀» 영역 + «슬라이드» 그룹마다 «n / 전체» 이름.
 * 종전에는 역할이 없어 슬라이드가 문서 흐름의 낱 요소로 읽혔고, 지금 몇 번째 슬라이드인지 알 길이 없었다.
 */
const mount = async (html: string) => {
  document.body.innerHTML = html;
  const el = document.querySelector('u-carousel') as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 50));
  return el;
};
const nodes = async () => (await axTree()).filter((n) => !n.ignored);
const prop = axProp;

describe('u-carousel 접근성 구조 (APG Carousel)', () => {
  beforeEach(() => Locale.set('en'));
  afterEach(() => Locale.set('en'));

  it('호스트는 «carousel» 역할 설명을 단 이름 있는 영역이다', async () => {
    await mount('<u-carousel aria-label="Featured"><div>A</div><div>B</div><div>C</div></u-carousel>');
    const region = (await nodes()).find((n) => n.role?.value === 'region' && n.name?.value === 'Featured');
    expect(region, '이름 있는 region').toBeTruthy();
    expect(prop(region!, 'roledescription')).toBe('carousel');
  });

  it('슬라이드마다 «slide» 그룹 · «n of 전체» 이름', async () => {
    await mount('<u-carousel aria-label="Featured"><div>A</div><div>B</div><div>C</div></u-carousel>');
    const groups = (await nodes()).filter((n) => n.role?.value === 'group' && prop(n, 'roledescription') === 'slide');
    expect(groups.map((g) => g.name?.value)).toEqual(['1 of 3', '2 of 3', '3 of 3']);
  });

  it('슬라이드를 더하면 이름이 따라오고, 떠난 슬라이드에서 우리 속성을 걷는다', async () => {
    const el = await mount('<u-carousel><div>A</div><div>B</div></u-carousel>');
    const extra = document.createElement('div');
    extra.textContent = 'C';
    el.append(extra);
    await new Promise((r) => setTimeout(r, 50));
    expect(extra.getAttribute('aria-label')).toBe('3 of 3');
    const first = el.firstElementChild!;
    first.remove();
    await new Promise((r) => setTimeout(r, 50));
    expect(first.hasAttribute('role') || first.hasAttribute('aria-label') || first.hasAttribute('aria-roledescription')).toBe(false);
    expect(extra.getAttribute('aria-label')).toBe('2 of 2');
  });

  it('로캘을 따른다', async () => {
    Locale.set('ko');
    await mount('<u-carousel aria-label="추천"><div>A</div><div>B</div></u-carousel>');
    const all = await nodes();
    expect(prop(all.find((n) => n.role?.value === 'region')!, 'roledescription')).toBe('캐러셀');
    expect(all.filter((n) => prop(n, 'roledescription') === '슬라이드').map((g) => g.name?.value)).toEqual(['2개 중 1번째', '2개 중 2번째']);
  });

  it('런타임에 로캘을 바꾸면 역할 설명·슬라이드 이름이 따라온다', async () => {
    await mount('<u-carousel aria-label="Featured"><div>A</div><div>B</div></u-carousel>');
    Locale.set('ko');
    await new Promise((r) => setTimeout(r, 50));
    const all = await nodes();
    expect(prop(all.find((n) => n.role?.value === 'region')!, 'roledescription')).toBe('캐러셀');
    expect(all.filter((n) => prop(n, 'roledescription') === '슬라이드').map((g) => g.name?.value)).toEqual(['2개 중 1번째', '2개 중 2번째']);
  });

  it('소비자가 단 슬라이드 이름·역할은 덮지 않고, 떠나도 걷지 않는다 — 빈 자리만 채운다', async () => {
    const el = await mount('<u-carousel><figure aria-label="Sunrise">A</figure><div role="tabpanel">B</div></u-carousel>');
    const [fig, panel] = Array.from(el.children);
    expect(fig.getAttribute('aria-label')).toBe('Sunrise');
    expect(fig.getAttribute('role')).toBe('group');
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-label')).toBe('2 of 2');
    fig.remove();
    await new Promise((r) => setTimeout(r, 50));
    expect(fig.getAttribute('aria-label')).toBe('Sunrise');
    expect(fig.hasAttribute('role')).toBe(false);
  });
});
