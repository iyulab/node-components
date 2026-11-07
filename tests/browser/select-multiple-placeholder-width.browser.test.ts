import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';

/**
 * 값이 없는 다중 선택(검색 가능)의 자리표시 — 자리표시와 검색 입력이 한 줄의 폭을 반씩 나누면(`flex: 1` 끼리) 폭이 남아도
 * 자리표시가 절반만 보이고 «…» 로 잘렸다. 자리표시가 서 있는 동안 검색 입력은 그 위에 겹쳐 서고(단일 선택과 같은 모양),
 * 자리표시가 폭을 모두 쓴다. 글자를 치기 시작하면 자리표시는 사라진다.
 */

const settle = (el: USelect) => el.updateComplete.then(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));

afterEach(() => { document.body.innerHTML = ''; });

const PLACEHOLDER = '코드·이름으로 찾기 (여러 개 선택)';

function mount(attrs: string, width = 417) {
  document.body.innerHTML = `<u-select ${attrs} placeholder="${PLACEHOLDER}" style="--u-select-display:block;width:${width}px">
    <u-option value="a">Apple</u-option><u-option value="b">Banana</u-option></u-select>`;
  return document.querySelector('u-select') as USelect;
}

/** 자리표시 글자가 잘렸는가 — 보이는 폭보다 글자가 더 넓으면 «…» 로 끝난다. */
const clipped = (el: USelect) => {
  const ph = el.shadowRoot!.querySelector('.text-content.placeholder') as HTMLElement;
  return { clientWidth: ph.clientWidth, scrollWidth: ph.scrollWidth, clipped: ph.scrollWidth > ph.clientWidth + 1 };
};

describe('u-select[multiple][searchable] — 값이 없을 때 자리표시', () => {
  it('🔴폭이 넉넉하면 자리표시가 잘리지 않는다', async () => {
    const el = mount('searchable multiple');
    await settle(el);
    const m = clipped(el);
    expect(m, `자리표시 ${m.clientWidth}px 안에 글자 ${m.scrollWidth}px`).toMatchObject({ clipped: false });
  });

  it('검색 입력은 자리표시 위에 겹쳐 서서 컨트롤 전체가 편집 칸이다(높이는 한 줄)', async () => {
    const el = mount('searchable multiple');
    await settle(el);
    const root = el.shadowRoot!;
    const input = root.querySelector('input.search') as HTMLElement;
    const area = root.querySelector('.value-area') as HTMLElement;
    const ir = input.getBoundingClientRect();
    const ar = area.getBoundingClientRect();
    expect(Math.round(ir.width), '입력이 값 영역 폭 전체를 쓴다').toBe(Math.round(ar.width));
    expect(Math.round(ar.height), '한 줄 높이').toBeLessThan(40);
  });

  it('글자를 치면 자리표시가 사라지고 입력이 글자를 받는다', async () => {
    const el = mount('searchable multiple');
    await settle(el);
    await userEvent.click(el);
    await userEvent.keyboard('ap');
    await settle(el);
    const ph = el.shadowRoot!.querySelector('.text-content.placeholder') as HTMLElement;
    expect(getComputedStyle(ph).visibility, '가리되 자리는 지킨다(값 영역이 접히지 않는다)').toBe('hidden');
    expect((el.shadowRoot!.querySelector('input.search') as HTMLInputElement).value).toBe('ap');
  });

  it('칩이 있을 때는 종전 배치 그대로 — 칩 뒤에 입력이 이어 선다', async () => {
    const el = mount(`searchable multiple value='["a"]'`);
    await settle(el);
    const root = el.shadowRoot!;
    const chip = root.querySelector('u-chip') as HTMLElement;
    const input = root.querySelector('input.search') as HTMLElement;
    const cr = chip.getBoundingClientRect();
    const ir = input.getBoundingClientRect();
    expect(ir.left, '입력은 칩의 오른쪽').toBeGreaterThanOrEqual(cr.right - 1);
  });

  it('검색 불가 다중 선택의 자리표시는 그대로 전부 보인다', async () => {
    const el = mount('multiple');
    await settle(el);
    expect(clipped(el).clipped).toBe(false);
  });
});
