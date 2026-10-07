import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/button/UButton.js';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import '../../src/components/icon-button/UIconButton.js';
import '../../src/components/copy-button/UCopyButton.js';
import '../../src/components/alert/UAlert.js';

/**
 * 크기 단 `sm`·`lg` 는 밀도 단(`--u-density`)에 비례한다(× 6/7 · × 8/7).
 *
 * 종전에는 12px·16px 리터럴이라, 밀도를 키운 화면(현장·터치 모드)에서 기본 크기만 커지고 작은 컨트롤은 12px 에 남았다.
 * 기본 밀도(14px)에서는 12·16px 그대로다 — 기본 외형은 바뀌지 않는다.
 */
const TAGS = ['u-button', 'u-input', 'u-select', 'u-textarea', 'u-date-picker', 'u-date-range-picker'];

async function fontSize(tag: string, size: string, density?: string): Promise<number> {
  document.body.innerHTML = `<div style="${density ? `--u-density:${density}` : ''}"><${tag} size="${size}"></${tag}></div>`;
  const el = document.body.querySelector(tag) as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  return parseFloat(getComputedStyle(el).fontSize);
}

describe('크기 단 × 밀도 단', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  for (const tag of TAGS) {
    it(`🔴${tag} — 밀도 16px 에서 sm·lg 가 함께 커진다`, async () => {
      expect(await fontSize(tag, 'sm', '16px')).toBeCloseTo((16 * 6) / 7, 1);
      expect(await fontSize(tag, 'lg', '16px')).toBeCloseTo((16 * 8) / 7, 1);
    });

    it(`NEGATIVE ${tag} — 기본 밀도에서는 12·16px 그대로다`, async () => {
      expect(await fontSize(tag, 'sm')).toBeCloseTo(12, 2);
      expect(await fontSize(tag, 'lg')).toBeCloseTo(16, 2);
    });
  }

  // 밀도는 런타임에 바뀐다 — sm 칸이 글꼴을 따라가면 `chars` 폭도 따라가야 한다(호스트는 다시 그려지지 않는다).
  it('🔴런타임 밀도 전환 뒤 sm `chars` 칸이 그 밀도로 처음 연 칸과 같다', async () => {
    const settle = async (el: HTMLElement & { updateComplete: Promise<unknown> }) => {
      for (let i = 0; i < 3; i++) {
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
    };
    const open = async (density: string) => {
      document.body.innerHTML = `<div style="--u-density:${density}"><u-input size="sm" type="number" chars="6" value="888888"></u-input></div>`;
      const el = document.body.querySelector('u-input') as HTMLElement & { updateComplete: Promise<unknown> };
      await settle(el);
      return el;
    };
    const width = (el: HTMLElement) => (el.shadowRoot!.querySelector('input') as HTMLElement).getBoundingClientRect().width;
    const expected = width(await open('18px'));
    const el = await open('14px');
    expect(width(el)).toBeLessThan(expected);
    (el.parentElement as HTMLElement).style.setProperty('--u-density', '18px');
    await settle(el);
    expect(width(el)).toBe(expected);
  });

});

/**
 * 아이콘만 있는 컨트롤의 글리프(`u-icon-button` 20px · `u-copy-button` 18px)도 밀도 단에 비례한다 — 같은 줄의 `u-button` 글자가
 * 밀도를 따라 커질 때 아이콘 버튼만 그대로 남았다. 기본 밀도에서는 종전 값이다.
 */
describe('아이콘 컨트롤 × 밀도 단', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  async function hostSize(markup: string, density?: string): Promise<number> {
    document.body.innerHTML = `<div style="${density ? `--u-density:${density}` : ''}">${markup}</div>`;
    const el = document.body.firstElementChild!.firstElementChild as HTMLElement & { updateComplete: Promise<unknown> };
    await el.updateComplete;
    return parseFloat(getComputedStyle(el).fontSize);
  }

  for (const [tag, base] of [['u-icon-button', 20], ['u-copy-button', 18]] as const) {
    it(`🔴${tag} — 밀도 16px 에서 글리프가 비례해 커진다`, async () => {
      expect(await hostSize(`<${tag}></${tag}>`, '16px')).toBeCloseTo((base * 16) / 14, 1);
    });
    it(`NEGATIVE ${tag} — 기본 밀도에서는 ${base}px 그대로다`, async () => {
      expect(await hostSize(`<${tag}></${tag}>`)).toBeCloseTo(base, 2);
    });
  }
});

/** 경보의 본문은 타입 단(`--u-text-body-size`)을 읽는다 — 제목(`--u-text-subtitle-size`)과 같은 축이다. 종전 본문만 14px 리터럴이었다. */
describe('u-alert 본문 × 타입 단', () => {
  it('🔴--u-text-body-size 를 바꾸면 본문이 따른다 · NEGATIVE 기본은 14px', async () => {
    document.body.innerHTML = '<div style="--u-text-body-size:17px"><u-alert open>Body</u-alert></div><u-alert open>Body</u-alert>';
    const [themed, plain] = [...document.querySelectorAll('u-alert')] as Array<HTMLElement & { updateComplete: Promise<unknown> }>;
    await themed.updateComplete; await plain.updateComplete;
    const content = (el: HTMLElement) => parseFloat(getComputedStyle(el.shadowRoot!.querySelector('.content')!).fontSize);
    expect(content(themed)).toBe(17);
    expect(content(plain)).toBe(14);
  });
});
