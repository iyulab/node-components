import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/index.js';
import type { UCommandPalette, CommandSource } from '../../src/components/command-palette/UCommandPalette.js';

/**
 * **우리 요소는 소비자의 개발 콘솔에 Lit «갱신 뒤 갱신» 경고를 남기지 않는다.**
 *
 * `updated()` 가 반응형 상태를 쓰면 갱신이 한 번 더 예약되고 Lit 개발 빌드는 요소 이름과 함께 경고를 낸다. 일반 사용 시나리오 —
 * 팔레트 열기 · 오류가 보이는 동안 값이 유효해짐 · 별점 호버 뒤 클릭 — 에서 실제로 나는지는 값이 바뀌는지에 달려 있어 소스만으로는 모른다.
 * 브라우저 시험의 `console.warn` 은 러너 출력에 오지 않는다 — 스파이로 직접 단언한다. Lit 은 같은 글을 페이지당 한 번만 내므로
 * 시험마다 `globalThis.litIssuedWarnings` 를 비운다.
 */
beforeEach(() => { (globalThis as unknown as { litIssuedWarnings?: Set<string> }).litIssuedWarnings?.clear(); });
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const litWarnings = (warn: { mock: { calls: unknown[][] } }) =>
  warn.mock.calls.map(([m]) => String(m)).filter((m) => m.includes('scheduled an update')).map((m) => m.slice(0, 60));

describe('u-command-palette', () => {
  it('🔴열기(검색어 초기화 · 출처 검색)가 «갱신 뒤 갱신» 경고를 내지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.insertAdjacentHTML('beforeend', '<button id="opener">open</button><u-command-palette></u-command-palette>');
    const el = document.querySelector('u-command-palette') as UCommandPalette;
    const source: CommandSource = { id: 's', label: 'Screens', search: () => [{ id: 'orders', label: 'Orders' }] };
    el.sources = [source];
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    await wait(80);
    expect(litWarnings(warn)).toEqual([]);
  });
});

describe('폼 컨트롤', () => {
  type Input = HTMLElement & { value: string; invalid: boolean; validate(report?: boolean): boolean; updateComplete: Promise<unknown> };

  it('🔴오류가 보이는 동안 값이 유효해져 오류가 걷히는 경로가 경고를 내지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<u-input id="c" required></u-input>';
    const el = document.getElementById('c') as unknown as Input;
    await el.updateComplete;
    el.validate(true);
    await el.updateComplete;
    expect(el.invalid, '오류가 보인다').toBe(true);
    el.value = 'ok';
    await el.updateComplete;
    await wait(60);
    expect(el.invalid, '값이 유효해지면 오류가 걷힌다').toBe(false);
    expect(litWarnings(warn)).toEqual([]);
  });

  it('🔴첫 렌더 전의 setCustomValidity 를 붙인 뒤 반영하는 경로가 경고를 내지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('u-input') as unknown as Input & { setCustomValidity(m: string): void; validity: ValidityState };
    el.setCustomValidity('taken');
    document.body.appendChild(el);
    await el.updateComplete;
    await wait(60);
    expect(el.validity.customError, '문구가 반영됐다').toBe(true);
    expect(litWarnings(warn)).toEqual([]);
  });
});

describe('u-rating', () => {
  it('🔴별점을 호버한 뒤 클릭해 값이 바뀌는 경로가 경고를 내지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<u-rating id="r" max="5"></u-rating>';
    const el = document.getElementById('r') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
    await el.updateComplete;
    const star = el.shadowRoot!.querySelector<HTMLElement>('.symbol[data-score="3"]')!;
    const r = star.getBoundingClientRect();
    star.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerType: 'mouse' }));
    await el.updateComplete;
    star.click();
    await el.updateComplete;
    await wait(60);
    expect(el.value, '클릭으로 값이 바뀌었다').toBeGreaterThan(0);
    expect(litWarnings(warn)).toEqual([]);
  });
});
