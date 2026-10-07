import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';

/**
 * `chars` 칸은 **그려지는 N자** 를 담는다.
 *
 * CSS `ch` 는 글꼴 기능·자간을 뺀 `0` 하나의 폭이라, 숫자를 고정폭(`tabular-nums`)으로 그리거나 자간을 준 화면에서
 * `Nch` 칸이 N자리를 다 담지 못하고 마지막 글자를 잘랐다(Pretendard 14px · tabular-nums · 6자리 → 2px 넘침).
 * 이 시험은 같은 부류를 자간으로 재현한다 — 어느 글꼴에서나 결정적이다.
 */
const settle = async (el: HTMLElement & { updateComplete: Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }
};

async function mount<T extends HTMLElement>(html: string, style = 'letter-spacing:3px'): Promise<T & { updateComplete: Promise<unknown> }> {
  document.body.innerHTML = `<div style="font-size:14px;${style}">${html}</div>`;
  const el = document.body.firstElementChild!.firstElementChild as T & { updateComplete: Promise<unknown> };
  await settle(el);
  return el;
}

/** 글자 요소가 자기 내용을 잘라 그리는가 — 넘침이 없어야 한다. */
const clipped = (el: HTMLElement, sel: string) => {
  const t = el.shadowRoot!.querySelector(sel) as HTMLElement;
  return t.scrollWidth - t.clientWidth;
};

describe('chars — 그려지는 N자', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('🔴u-input number chars=6 — 자간이 있어도 여섯 자리가 잘리지 않는다', async () => {
    const el = await mount('<u-input type="number" chars="6" value="888888"></u-input>');
    expect(clipped(el, 'input')).toBeLessThanOrEqual(0);
  });

  it('🔴u-select chars=6 — 여섯 자 값이 말줄임 없이 보인다', async () => {
    const el = await mount('<u-select chars="6" value="a"><u-option value="a">888888</u-option></u-select>');
    expect(clipped(el, '.text-content')).toBeLessThanOrEqual(0);
  });

  // 날짜 피커의 입력은 브라우저 기본 스타일이 자간을 `normal` 로 되돌려 상속이 끊긴다 — 그래서 자간을 `::part(input)` 에
  // 직접 건다. 측정이 컨테이너가 아니라 «글자 요소의 계산된 스타일» 을 옮기는 이유가 이 자리다.
  const PART_SPACING = '<style>::part(input) { letter-spacing: 3px; }</style>';

  it('🔴u-date-picker chars=10 — 날짜 열 자가 잘리지 않는다(입력에 건 자간)', async () => {
    document.head.insertAdjacentHTML('beforeend', PART_SPACING);
    try {
      const el = await mount('<u-date-picker chars="10" value="2026-10-07"></u-date-picker>', '');
      expect(clipped(el, '.text-input')).toBeLessThanOrEqual(0);
    } finally {
      document.head.lastElementChild!.remove();
    }
  });

  it('🔴u-date-range-picker chars=23 — 두 날짜와 구분자가 잘리지 않는다(입력에 건 자간)', async () => {
    document.head.insertAdjacentHTML('beforeend', PART_SPACING);
    try {
      const el = await mount('<u-date-range-picker chars="23" value="2026-10-07/2026-10-31"></u-date-range-picker>', '');
      expect(clipped(el, '.text-input')).toBeLessThanOrEqual(0);
    } finally {
      document.head.lastElementChild!.remove();
    }
  });

  it('글꼴 크기가 바뀌면(크기 단) 다시 잰다', async () => {
    const el = await mount('<u-input type="number" chars="6" value="888888"></u-input>');
    const before = (el.shadowRoot!.querySelector('input') as HTMLElement).getBoundingClientRect().width;
    el.setAttribute('size', 'lg');
    await settle(el);
    const after = (el.shadowRoot!.querySelector('input') as HTMLElement).getBoundingClientRect().width;
    expect(after).toBeGreaterThan(before);
    expect(clipped(el, 'input')).toBeLessThanOrEqual(0);
  });

  // 호스트 밖에서 상속된 글꼴이 런타임에 바뀌는 경우 — 루트 속성 하나로 밀도·글자 크기 단을 바꾸는 호스트.
  // 호스트는 다시 그려지지 않으므로 «그려질 때 잰다» 만으로는 옛 폭에 남는다.
  const inputWidth = (el: HTMLElement) => (el.shadowRoot!.querySelector('input') as HTMLElement).getBoundingClientRect().width;
  const fresh = async (style: string) => {
    const el = await mount('<u-input type="number" chars="6" value="888888"></u-input>', style);
    const w = inputWidth(el);
    document.body.innerHTML = '';
    return w;
  };

  for (const [from, to] of [['14px', '18px'], ['18px', '14px']] as const) {
    it(`🔴상속된 밀도가 런타임에 ${from} → ${to} 로 바뀌면 그 크기로 처음 연 칸과 같다`, async () => {
      const expected = await fresh(`letter-spacing:3px;--u-density:${to}`);
      const el = await mount('<u-input type="number" chars="6" value="888888"></u-input>', `letter-spacing:3px;--u-density:${from}`);
      expect(inputWidth(el)).not.toBe(expected);
      (el.parentElement as HTMLElement).style.setProperty('--u-density', to);
      await settle(el);
      expect(inputWidth(el)).toBe(expected);
      expect(clipped(el, 'input')).toBeLessThanOrEqual(0);
    });
  }

  it('🔴상속된 자간이 런타임에 바뀌어도 다시 잰다', async () => {
    const expected = await fresh('letter-spacing:3px');
    const el = await mount('<u-input type="number" chars="6" value="888888"></u-input>', 'letter-spacing:0px');
    (el.parentElement as HTMLElement).style.letterSpacing = '3px';
    await settle(el);
    expect(inputWidth(el)).toBe(expected);
    expect(clipped(el, 'input')).toBeLessThanOrEqual(0);
  });

  it('NEGATIVE 측정 요소는 스크롤 넘침에 보태지 않고, chars 를 걷으면 사라진다', async () => {
    const el = await mount('<u-input type="number" chars="40" value="1" style="position:absolute;right:0"></u-input>');
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    el.removeAttribute('chars');
    await settle(el);
    expect(el.shadowRoot!.querySelector('.container > span[aria-hidden]')).toBeNull();
  });
});
