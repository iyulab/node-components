import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/input/UInput.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';

/**
 * 달력 시간칸(`.time-input`)의 포커스 표시 — **형제 텍스트 입력과 같은 규약이고, 잘리지 않는다** (cycle-559).
 *
 * 인계된 관찰은 «기본 포커스 링을 지우고 1px 그림자로 대신한다» 였다. 판독하면 그것은 이 라이브러리 텍스트 입력의 포커스 규약
 * 그대로다 — `u-input`·`u-date-picker` 컨테이너의 `:focus-within` 도 포커스 색 1px 링이다(2px 는 달력 날짜 칸만). 포커스 색은
 * 흰 패널 대비 3:1 을 넘는다(SC 1.4.11). ⇒ 결함이 되는 경우는 «그 1px 이 보이지 않을 때» 뿐이고, 이 파일은 그것을 잰다:
 * ⑴ 링이 형제 입력(`u-input`)의 포커스 링과 **같은 값**이다 — 한쪽만 바뀌면 규약이 갈라진다.
 * ⑵ 링까지 포함한 상자가 `overflow` 를 가진 어떤 조상(섀도 경계를 넘는 평탄 트리)에게도 **잘리지 않는다**.
 */

async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
}

async function openDatetime(): Promise<HTMLInputElement> {
  const el = document.createElement('u-date-picker') as UDatePicker;
  el.setAttribute('mode', 'datetime');
  document.body.appendChild(el);
  await settle(el);
  (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(el);
  const input = el.shadowRoot!.querySelector('.time-input') as HTMLInputElement | null;
  if (!input) throw new Error('datetime 달력의 시간칸이 나타나지 않았다');
  await new Promise((r) => setTimeout(r, 60));
  return input;
}

/** 평탄 트리의 부모 — 슬롯에 꽂혔으면 그 슬롯, 섀도 루트면 그 호스트. */
function flatParent(node: Node): Element | null {
  const slot = (node as Element).assignedSlot;
  if (slot) return slot;
  const parent = node.parentNode;
  if (parent instanceof ShadowRoot) return parent.host;
  return parent instanceof Element ? parent : null;
}

describe('u-date-picker 시간칸 — 포커스 표시', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('포커스 링은 형제 텍스트 입력(u-input)의 포커스 링과 같은 값이다', async () => {
    const time = await openDatetime();
    time.focus();
    expect(time.matches(':focus-visible'), '포커스 표시 상태여야 이 비교가 의미를 가진다').toBe(true);
    const timeRing = getComputedStyle(time).boxShadow;

    const field = document.createElement('u-input') as HTMLElement & { updateComplete: Promise<unknown> };
    document.body.appendChild(field);
    await settle(field);
    field.shadowRoot!.querySelector('input')!.focus();
    // ⚠`u-input` 컨테이너는 box-shadow 에 전환(`--u-duration-normal`, 220ms)이 걸려 있다 — 포커스 직후에 읽으면 전환의
    //   시작값(투명 0px)이 나온다(첫 판이 그렇게 틀렸다 · cycle-543 과 같은 함정). 끝난 뒤에 읽는다.
    await new Promise((r) => setTimeout(r, 350));
    const inputRing = getComputedStyle(field.shadowRoot!.querySelector('.container')!).boxShadow;

    expect(timeRing, '시간칸에 포커스 링이 없다').not.toBe('none');
    expect(timeRing).toBe(inputRing);
  });

  it('🔴링까지 포함한 상자가 overflow 를 가진 어떤 조상에게도 잘리지 않는다', async () => {
    const time = await openDatetime();
    time.focus();
    const ring = parseFloat(getComputedStyle(time).boxShadow.match(/(\d+(?:\.\d+)?)px\s*$/)?.[1] ?? '0')
      || 1;
    const r = time.getBoundingClientRect();
    const clipped: string[] = [];
    for (let a = flatParent(time); a && a !== document.documentElement; a = flatParent(a)) {
      const cs = getComputedStyle(a);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const box = a.getBoundingClientRect();
      const left = box.left + a.clientLeft;
      const top = box.top + a.clientTop;
      const right = left + a.clientWidth;
      const bottom = top + a.clientHeight;
      if (r.left - ring < left - 0.5 || r.right + ring > right + 0.5 || r.top - ring < top - 0.5 || r.bottom + ring > bottom + 0.5) {
        clipped.push(`${a.localName}${a.getAttribute('class') ? `.${a.getAttribute('class')!.split(' ')[0]}` : ''} (${cs.overflowX}/${cs.overflowY})`);
      }
    }
    expect(clipped).toEqual([]);
  });
});
