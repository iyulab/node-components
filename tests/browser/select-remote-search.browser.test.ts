import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-select searchable` 의 원격 검색 — 옵션 집합의 주인이 소비자일 때 라이브러리가 다시 거르지 않는다(`filter="none"`).
 *
 * 종전에는 내장 로컬 필터를 끌 수 없었다. 서버가 낱말 AND · 다른 칸으로 찾아 돌려준 옵션을, 이전 검색어로 `hidden` 이 된
 * 채 재사용된 `u-option` 이 그대로 숨겨 «서버가 찾은 결과가 빈 목록» 으로 보였다.
 */
afterEach(() => {
  document.body.replaceChildren();
  Locale.set('en');
});

async function mount(attrs: string, options: Array<[string, string]>): Promise<USelect> {
  document.body.innerHTML = `<u-select searchable ${attrs}>${options.map(([v, t]) => `<u-option value="${v}">${t}</u-option>`).join('')}</u-select>`;
  const el = document.querySelector('u-select') as USelect;
  await el.updateComplete;
  return el;
}

async function type(el: USelect, text: string) {
  const input = el.shadowRoot!.querySelector('.search-input input') as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
  await el.updateComplete;
}

const hidden = (el: USelect) => [...el.querySelectorAll('u-option')].map((o) => (o as HTMLElement).hidden);
const status = (el: USelect) => el.shadowRoot!.querySelector('.no-matches')?.textContent?.trim() ?? '';

describe('u-select 원격 검색', () => {
  it('🔴filter="none" — 검색어가 옵션을 숨기지 않고, 서버 결과로 남은 재사용 옵션이 보인다', async () => {
    const el = await mount('filter="none"', [['x', 'AR1973 청주제조창 예비공장'], ['y', 'BR1971 남한강교']]);
    const queries: string[] = [];
    el.addEventListener('search', (e) => queries.push((e as CustomEvent<{ query: string }>).detail.query));
    await type(el, '청주 공장');
    expect(hidden(el)).toEqual([false, false]);
    el.querySelector('u-option[value="y"]')!.remove(); // 서버가 x 하나를 돌려줬다 — x 는 재사용
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(hidden(el)).toEqual([false]);
    expect(queries).toEqual(['청주 공장']);
  });

  it('🔴로컬 모드 — 옵션이 바뀌면 새 옵션에도 지금 검색어가 적용된다', async () => {
    const el = await mount('', [['a', 'Apple'], ['b', 'Banana']]);
    await type(el, 'ap');
    expect(hidden(el)).toEqual([false, true]);
    el.insertAdjacentHTML('beforeend', '<u-option value="c">Cherry</u-option><u-option value="g">Grape</u-option>');
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(hidden(el)).toEqual([false, true, true, false]);
  });

  it('🔴검색어에 맞는 옵션이 없으면 «일치하는 항목 없음» 을 알린다(상태 영역)', async () => {
    const el = await mount('', [['a', 'Apple']]);
    await type(el, 'zzz');
    expect(status(el)).toBe('No matches');
    expect(el.shadowRoot!.querySelector('.no-matches')!.getAttribute('role')).toBe('status');
    await type(el, '');
    expect(status(el)).toBe('');
  });

  it('원격 모드 — 불러오는 동안은 «0건» 을 말하지 않고, 결과가 비어 끝나면 말한다', async () => {
    const el = await mount('filter="none"', [['a', 'Apple']]);
    el.loading = true;
    await type(el, 'zzz');
    el.querySelector('u-option')!.remove();
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(status(el)).toBe('');
    el.loading = false;
    await el.updateComplete;
    expect(status(el)).toBe('No matches');
  });

  it('NEGATIVE 기본(로컬)은 종전처럼 연속 부분 문자열로 거른다', async () => {
    const el = await mount('', [['x', 'AR1973 청주제조창 예비공장'], ['y', 'BR1971 남한강교']]);
    await type(el, '청주');
    expect(hidden(el)).toEqual([false, true]);
    expect(status(el)).toBe('');
  });
});
