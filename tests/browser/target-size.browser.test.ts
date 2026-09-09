import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/chip/UChip.js';
import '../../src/components/rating/URating.js';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/copy-button/UCopyButton.js';
import '../../src/components/input/UInput.js';
import '../../src/components/radio/URadio.js';

/**
 * **WCAG 2.2 SC 2.5.8 Target Size (Minimum) — 24×24 CSS px** 게이트 (§C-A, cycle-479).
 *
 * ## 왜 브라우저에서 재는가
 *
 * 타깃 크기는 **렌더된 성질**이다 — 토큰·패딩·`font-size`·섀도 DOM 이 함께 정한다. 소스에서
 * `width`/`height` 리터럴을 세는 정적 검사로 흉내 내면 ***정당한 배치 전건에 발화하고 그
 * 순간 검사가 통째로 무시당한다***(이 리포가 반복 기록한 실패 모드). ⇒ 실제 크로미움에서
 * `getBoundingClientRect` 로 잰다. `ROADMAP.md` §C-A 의 원 실측도 같은 방식이었다.
 *
 * ## 🔴 간격 예외를 모델링하는 것이 이 게이트의 절반이다
 *
 * SC 2.5.8 은 «24px 미만»을 곧바로 위반으로 보지 않는다 — **간격 예외**가 있다:
 * *"타깃 중심에 놓인 지름 24px 원이 다른 타깃의 원과 겹치지 않으면 충족"*. 기하로 옮기면
 * ***두 중심 사이 거리가 24px 이상이면 통과***다(반지름 12 + 12). 이 예외를 빼고 켜면
 * 정당한 배치가 전건 위반이 된다.
 *
 * 그 밖의 예외(등가 컨트롤 · 인라인 · UA 컨트롤 · 본질적)는 **모델링하지 않는다** — 문서
 * 문맥이나 디자인 의도를 읽어야 하는 축이라 기계가 판정할 수 없다. ⇒ 이 게이트는
 * **«크기»와 «간격» 두 축만** 재고, 나머지는 사람이 본다.
 *
 * ## ⚠ 이 파일은 «게이트»이자 «재고»다
 *
 * 사람이 채택한 순서는 **⑵게이트 → 위반 확정 → ⑶치수 조정 → ⑴선언 상향** 이다. 지금은
 * ⑵ 단계라 **현재 상태를 그대로 고정**한다 — 통과하는 것은 통과로, 미달인 것은 «미달»로
 * 핀한다. ⇒ ***치수를 고치면 이 파일이 빨개지고, 그때 핀을 옮기는 것이 ⑶의 완료 신호다.***
 * (`icon-only-a11y-check` 가 «재고 → 게이트» 순서를 밟은 것과 같은 형태이며, 다만 그쪽은
 * 위반 0을 먼저 만들고 켰고 여기는 사람이 «게이트 먼저»를 택했다.)
 */

const MIN = 24;

interface Measured {
  w: number;
  h: number;
  cx: number;
  cy: number;
}

function measure(el: Element): Measured {
  const r = el.getBoundingClientRect();
  return { w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

/** SC 2.5.8 «간격 예외» — 중심 간 거리가 24px 이상이면 24px 원이 겹치지 않는다. */
function spacingSatisfied(target: Measured, others: Measured[]): boolean {
  return others.every((o) => Math.hypot(target.cx - o.cx, target.cy - o.cy) >= MIN);
}

type Verdict = 'meets-size' | 'exempt-by-spacing' | 'undersized';

function judge(target: Measured, others: Measured[]): Verdict {
  if (target.w >= MIN && target.h >= MIN) return 'meets-size';
  return spacingSatisfied(target, others) ? 'exempt-by-spacing' : 'undersized';
}

/** 한 호스트 안의 «타깃»을 잰다. 섀도 DOM 안쪽까지 본다. */
function targetsIn(host: Element, selector: string): Measured[] {
  const root = (host as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot ?? host;
  return Array.from(root.querySelectorAll(selector)).map(measure);
}

async function mount(html: string): Promise<void> {
  document.body.innerHTML = `<div style="padding:40px">${html}</div>`;
  await new Promise((r) => setTimeout(r, 80));
}

describe('WCAG 2.2 SC 2.5.8 — 타깃 크기(최소) 게이트', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('규칙 자체 — 간격 예외 모델링', () => {
    it('24×24 이상이면 간격과 무관하게 통과한다', () => {
      const t = { w: 24, h: 24, cx: 0, cy: 0 };
      expect(judge(t, [{ w: 24, h: 24, cx: 1, cy: 0 }])).toBe('meets-size');
    });

    it('🔴미달이어도 중심 간 24px 이상이면 «간격 예외»로 통과한다', () => {
      const t = { w: 16, h: 16, cx: 0, cy: 0 };
      expect(judge(t, [{ w: 16, h: 16, cx: 24, cy: 0 }])).toBe('exempt-by-spacing');
    });

    it('🔴미달이고 중심 간 24px 미만이면 위반이다', () => {
      const t = { w: 16, h: 16, cx: 0, cy: 0 };
      expect(judge(t, [{ w: 16, h: 16, cx: 23.9, cy: 0 }])).toBe('undersized');
    });

    it('⚪NEGATIVE — 이웃이 없으면 미달이어도 «간격 예외»다 (혼자 있는 타깃)', () => {
      expect(judge({ w: 10, h: 10, cx: 0, cy: 0 }, [])).toBe('exempt-by-spacing');
    });

    it('⚪NEGATIVE — 대각선 거리도 유클리드로 잰다 (축별로 재면 틀린다)', () => {
      // (17,17) 은 축별로는 둘 다 24 미만이지만 유클리드 거리는 24.04 다.
      expect(judge({ w: 16, h: 16, cx: 0, cy: 0 }, [{ w: 16, h: 16, cx: 17, cy: 17 }]))
        .toBe('exempt-by-spacing');
    });
  });

  describe('실측 재고 — 현재 상태를 그대로 고정한다 (⑵ 단계)', () => {
    it('u-copy-button: 크기로 통과한다', async () => {
      await mount('<u-copy-button value="x"></u-copy-button>');
      const host = document.querySelector('u-copy-button')!;
      const m = measure(host);
      expect(judge(m, []), `실측 ${Math.round(m.w)}x${Math.round(m.h)}`).toBe('meets-size');
    });

    it('u-input: 크기로 통과한다', async () => {
      await mount('<u-input style="width:200px"></u-input>');
      const m = measure(document.querySelector('u-input')!);
      expect(judge(m, []), `실측 ${Math.round(m.w)}x${Math.round(m.h)}`).toBe('meets-size');
    });

    it('📌미달 재고 — u-checkbox·u-switch 는 높이가 24 미만이다 (⑶ 이 고칠 자리)', async () => {
      await mount('<u-checkbox></u-checkbox><u-switch></u-switch>');
      const cb = measure(document.querySelector('u-checkbox')!);
      const sw = measure(document.querySelector('u-switch')!);
      // ⚠**핀이다** — ⑶이 치수를 올리면 이 단언이 빨개지고, 그것이 완료 신호다.
      expect(cb.h < MIN || cb.w < MIN, `u-checkbox 실측 ${Math.round(cb.w)}x${Math.round(cb.h)}`).toBe(true);
      expect(sw.h < MIN || sw.w < MIN, `u-switch 실측 ${Math.round(sw.w)}x${Math.round(sw.h)}`).toBe(true);
    });

    it('📌미달 재고 — u-rating 의 별들은 인접해 있어 «간격 예외»를 받지 못한다', async () => {
      await mount('<u-rating value="3"></u-rating>');
      const host = document.querySelector('u-rating')!;
      // ⚠**타깃 단위를 «part="symbol"» 로 고른다.** 첫 판은 `svg, u-icon` 까지 셌는데
      // 그것들은 심볼 «안»에 있어 중심이 같다 ⇒ 거리 0 이 되어 **중첩을 위반으로 오인**했다.
      // 판정은 맞았지만 근거가 틀렸고, 그것이 이 부류 검사의 실패 모드다.
      const stars = targetsIn(host, '[part="symbol"]');
      expect(stars.length, '별을 하나도 못 찾으면 이 판정은 무의미하다').toBe(5);

      const gaps = stars.slice(1).map((s, i) => Math.round(s.cx - stars[i].cx));
      // 실측(2026-09-09): 19x19 · 중심 간 22px — 24 미만이라 간격 예외를 받지 못한다.
      expect(gaps.every((g) => g < MIN), `중심 간 간격 ${gaps.join(' ')}`).toBe(true);

      const verdicts = stars.map((s, i) => judge(s, stars.filter((_, j) => j !== i)));
      expect(verdicts.every((v) => v === 'undersized'),
        `실측 ${stars.map((s) => `${Math.round(s.w)}x${Math.round(s.h)}`).join(' ')} · 판정 ${verdicts.join(' ')}`,
      ).toBe(true);
    });

    it('📌미판정 — u-radio 는 기본 상태에서 0x0 이라 잴 수 없다', async () => {
      await mount('<u-radio></u-radio>');
      const m = measure(document.querySelector('u-radio')!);
      // `ROADMAP.md` §C-A 의 원 실측도 «프로브가 타깃 미검출» 로 같은 결론이었다.
      // ⚠**«통과»가 아니라 «미판정»** 이다 — 값·라벨을 주는 픽스처를 만들면 판정된다.
      expect(m.w === 0 && m.h === 0, `실측 ${Math.round(m.w)}x${Math.round(m.h)}`).toBe(true);
    });
  });
});
