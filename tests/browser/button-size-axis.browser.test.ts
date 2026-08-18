import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/button/UButton.js';

/**
 * **크기 축의 수용 기준** — 값의 취향이 아니라 *관계*를 고정한다.
 *
 * 값을 그대로 박아 두면 디자인 조정 때마다 테스트를 함께 고쳐야 하고, 그러면 테스트가
 * 아무것도 지키지 않는다. 여기서 지키는 것은 셋이다:
 *
 *   ⑴ 같은 size 의 **아이콘 버튼과 글자 버튼이 같은 높이**다 (툴바 정렬)
 *   ⑵ 가로 여백이 세로보다 **넓다** (글자가 테두리에 붙지 않는다)
 *   ⑶ 크기 축이 **font-size 하나로** 움직인다 (여백·높이가 비례로 따라온다)
 */
const SIZES = ['sm', '', 'lg'] as const;

const mount = async (attrs: Record<string, string>, html: string) => {
  const el = document.createElement('u-button');
  for (const [k, v] of Object.entries(attrs)) if (v) el.setAttribute(k, v);
  el.innerHTML = html;
  document.body.append(el);
  await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  return el;
};

const ICON = '<span style="width:16px;height:16px;display:block"></span>';

describe('u-button 크기 축', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
  });
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('★같은 size 에서 아이콘 버튼과 글자 버튼의 높이가 같다', async () => {
    // 1.20.0 이전에는 어긋났다 — 실측 md 아이콘 32 vs 글자 37(5px). 그리고 아이콘 쪽
    // 계단(30/32/34)이 글자 쪽(32/37/42)과 기울기가 달라 size 를 올릴수록 벌어졌다.
    const diffs: Record<string, number> = {};
    for (const size of SIZES) {
      const text = await mount({ size }, '저장');
      const icon = await mount({ size }, ICON);
      diffs[size || 'md'] = Math.round(
        icon.getBoundingClientRect().height - text.getBoundingClientRect().height,
      );
    }
    expect(diffs, '아이콘 버튼과 글자 버튼의 높이 차 (px)').toEqual({ sm: 0, md: 0, lg: 0 });
  });

  it('★가로 여백이 세로보다 넓다', async () => {
    for (const size of SIZES) {
      const el = await mount({ size }, '저장');
      const cs = getComputedStyle(el.shadowRoot!.querySelector('button')!);
      const [block, inline] = [parseFloat(cs.paddingTop), parseFloat(cs.paddingLeft)];
      expect(inline, `size=${size || 'md'} 의 가로 여백(${inline})이 세로(${block}) 이하다`)
        .toBeGreaterThan(block);
    }
  });

  it('크기 축이 font-size 하나로 움직인다 (여백·높이가 비례한다)', async () => {
    // sm→md→lg 는 12→14→16px 이므로, em 파생이 살아 있다면 여백도 같은 비로 커진다.
    const pad: number[] = [];
    const height: number[] = [];
    for (const size of SIZES) {
      const el = await mount({ size }, '저장');
      pad.push(parseFloat(getComputedStyle(el.shadowRoot!.querySelector('button')!).paddingLeft));
      height.push(el.getBoundingClientRect().height);
    }
    expect(pad[0] < pad[1] && pad[1] < pad[2], `여백이 단조 증가하지 않는다: ${pad}`).toBe(true);
    expect(height[0] < height[1] && height[1] < height[2], `높이가 단조 증가하지 않는다: ${height}`)
      .toBe(true);
    // 여백 비 = font-size 비 (em 파생의 직접 증거). 소수 오차를 감안해 반올림 비교.
    expect((pad[2] / pad[0]).toFixed(2), '여백 비가 font-size 비(16/12)와 다르다')
      .toBe((16 / 12).toFixed(2));
  });

  it('상하 여백을 덮어도 아이콘·글자 높이는 함께 움직인다', async () => {
    // 최소높이가 상수였다면 여기서 갈라진다 — 파생식이라 함께 움직인다.
    const text = await mount({ style: '--btn-padding-block: 1em' }, '저장');
    const icon = await mount({ style: '--btn-padding-block: 1em' }, ICON);
    expect(
      Math.round(icon.getBoundingClientRect().height - text.getBoundingClientRect().height),
    ).toBe(0);
  });
});
