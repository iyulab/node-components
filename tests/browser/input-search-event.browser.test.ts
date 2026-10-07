import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

/**
 * **`u-input type="search"` 은 검색을 확정할 때 `search { query }` 를 낸다** — Enter · 지우기 버튼 · Escape(값이 있으면 비운다).
 *
 * ## 왜 이 파일이 생겼는가
 *
 * 목록의 «뷰 어휘» 는 검색을 `search { query }` 로 주고받는다(`bindSource` · `u-list-page` 가 듣는다). 그런데 그 모양을 내는
 * 요소는 `u-select searchable`(옵션 원격 검색)뿐이었고 **목록 검색 칸이 없었다** — 게시 문서가 «a search box» 를 묶을 수
 * 있다고 가르치는데 그런 요소가 없었다. 네이티브 `<input type=search>` 의 `search` 이벤트(Enter · 취소 버튼)는 Chromium·
 * Safari 에만 있고 섀도 안에 갇히므로, 그 시점을 우리가 직접 낸다.
 *
 * ## 왜 브라우저인가
 *
 * 키 입력은 포커스된 안쪽 입력에서 출발해야 «닿는가» 를 잰다(합성 keydown 을 호스트에 쏘면 원리적으로 못 잰다 — CLAUDE.md 함정 7).
 */

function mount(attrs: Record<string, string> = {}): Promise<UInput> {
  const input = document.createElement('u-input') as UInput;
  for (const [k, v] of Object.entries(attrs)) input.setAttribute(k, v);
  document.body.appendChild(input);
  return input.updateComplete.then(() => input);
}

function track(el: Element): string[] {
  const seen: string[] = [];
  el.addEventListener('search', (e) => seen.push((e as CustomEvent<{ query: string }>).detail.query));
  return seen;
}

const inner = (el: UInput) => el.shadowRoot!.querySelector('input') as HTMLInputElement;

describe('u-input type="search" — search { query }', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('Enter 가 앞뒤 공백을 걷은 값으로 낸다 — 섀도 밖 조상까지 닿는다', async () => {
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);
    const input = document.createElement('u-input') as UInput;
    input.setAttribute('type', 'search');
    wrap.appendChild(input);
    await input.updateComplete;
    const seen = track(wrap);
    await userEvent.click(inner(input));
    await userEvent.keyboard('  kim ');
    await userEvent.keyboard('{Enter}');
    expect(seen).toEqual(['kim']);
  });

  it('지우기 버튼이 빈 검색어로 낸다', async () => {
    const input = await mount({ type: 'search', clearable: '', value: 'kim' });
    const seen = track(input);
    const clear = input.shadowRoot!.querySelector('u-icon[name="x"]') as HTMLElement;
    clear.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await input.updateComplete;
    expect(input.value).toBe('');
    expect(seen).toEqual(['']);
  });

  it('Escape 가 값을 비우고 빈 검색어로 낸다 — 소비했음을 알린다', async () => {
    const input = await mount({ type: 'search', value: 'kim' });
    const seen = track(input);
    let prevented: boolean | undefined;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') prevented = e.defaultPrevented; }, { once: true });
    await userEvent.click(inner(input));
    await userEvent.keyboard('{Escape}');
    await input.updateComplete;
    expect(input.value).toBe('');
    expect(inner(input).value).toBe('');
    expect(seen).toEqual(['']);
    expect(prevented).toBe(true);
  });

  it('값이 없으면 Escape 를 소비하지 않는다 — 바깥(오버레이 닫기)이 받는다', async () => {
    const input = await mount({ type: 'search' });
    const seen = track(input);
    let prevented: boolean | undefined;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') prevented = e.defaultPrevented; }, { once: true });
    await userEvent.click(inner(input));
    await userEvent.keyboard('{Escape}');
    expect(seen).toEqual([]);
    expect(prevented).toBe(false);
  });

  it('검색 칸이 아니면 Enter 가 search 를 내지 않는다', async () => {
    const input = await mount({ type: 'text' });
    const seen = track(input);
    await userEvent.click(inner(input));
    await userEvent.keyboard('kim{Enter}');
    expect(seen).toEqual([]);
  });

  it('수정 키가 붙은 Enter 는 내지 않는다', async () => {
    const input = await mount({ type: 'search' });
    const seen = track(input);
    await userEvent.click(inner(input));
    await userEvent.keyboard('kim{Shift>}{Enter}{/Shift}');
    expect(seen).toEqual([]);
  });
});
