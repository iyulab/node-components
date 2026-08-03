import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/slider/USlider.js';
import '../../src/components/select/USelect.js';

/**
 * **라이브러리가 스스로 그리는 숫자는 고정폭 자릿수다.**
 *
 * 대상은 *"제자리에서 값이 바뀌는"* 자리로 한정했다 — 비례폭 숫자는 그 자리에서
 * 자릿수가 바뀔 때마다 폭이 달라져 주변 레이아웃을 흔든다. 실측으로 확인한 세 곳:
 *
 * ```
 * u-slider  [slot="label-aside"]              show-value 의 값 표시
 * u-slider  u-tooltip[part="thumb-tooltip"]   드래그 중 가장 빠르게 바뀐다
 * u-select  .count                            `n / m`
 * ```
 *
 * ⚠**눈금 라벨(`.mark-label`)은 대상이 아니다** — 값이 바뀌지 않고 각자 제 위치에
 * 가운데 정렬되므로 고정폭이 주는 이득이 없다. 소비자 입력(`u-input[type=number]`)도
 * 대상이 아니다(문서가 `::part(input)` 오버라이드 예시를 이미 안내한다).
 *
 * ## 왜 계산 스타일을 재는가
 *
 * 폭을 재는 쪽이 직관적이지만 **폰트에 의존한다** — 테스트 환경의 대체 서체가 이미
 * 고정폭이면 선언이 없어도 통과한다(위양성). 여기서 지키려는 계약은 *"이 세 자리에
 * 선언이 닿는다"* 이고, ★**툴팁은 슬롯을 건너 상속으로 닿으므로** 그 경로가 실제로
 * 성립하는지가 이 테스트의 진짜 대상이다.
 */

const mount = async <T extends HTMLElement>(tag: string, attrs: Record<string, string>) => {
  const el = document.createElement(tag) as T;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.append(el);
  await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  return el;
};

const numeric = (el: Element | null | undefined) =>
  el ? getComputedStyle(el).fontVariantNumeric : '(요소 없음)';

describe('고정폭 자릿수', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('u-slider 값 표시에 닿는다', async () => {
    const el = await mount('u-slider', { 'show-value': '', value: '7', max: '100' });
    const aside = el.shadowRoot!.querySelector('[slot="label-aside"]');
    expect(aside, 'show-value 표시 요소를 찾지 못했다').toBeTruthy();
    expect(numeric(aside)).toBe('tabular-nums');
  });

  it('★u-slider 썸 툴팁에 상속으로 닿는다 — 슬롯을 건너는 경로', async () => {
    // 이 단언이 이 파일의 존재 이유다. 툴팁 텍스트는 u-tooltip 의 슬롯 콘텐츠라
    // 선언이 닿는 경로가 상속뿐이고, 그 경로는 눈으로 확인할 수 없다.
    const el = await mount('u-slider', { 'show-tooltip': '', value: '7', max: '100' });
    const tip = el.shadowRoot!.querySelector('u-tooltip[part="thumb-tooltip"]');
    expect(tip, '썸 툴팁을 찾지 못했다').toBeTruthy();
    expect(numeric(tip)).toBe('tabular-nums');
  });

  it('u-select 개수 표시(`n / m`)에 닿는다', async () => {
    const el = await mount('u-select', { multiple: '', 'max-count': '10' });
    const count = el.shadowRoot!.querySelector('.count');
    expect(count, '개수 표시 요소를 찾지 못했다').toBeTruthy();
    expect(numeric(count)).toBe('tabular-nums');
  });

  it('NEGATIVE — 값이 바뀌지 않는 눈금 라벨까지 번지지 않았다', async () => {
    // 범위를 넓히는 것이 이 변경의 실패 모드다. 눈금 라벨은 각자 제 위치에 고정돼
    // 있으므로 고정폭이 주는 이득이 없고, 번지면 "숫자는 전부 고정폭"이라는 다른
    // 규칙이 되어 버린다.
    const el = await mount('u-slider', { marks: '', step: '25', max: '100' });
    const label = el.shadowRoot!.querySelector('.mark-label');
    if (label) expect(numeric(label)).not.toBe('tabular-nums');
  });
});
