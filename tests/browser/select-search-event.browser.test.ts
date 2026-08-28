import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import type { USelect } from '../../src/components/select/USelect.js';

async function settle(el: USelect) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function createSelect(values: string[], attrs: Record<string, string> = {}): USelect {
  const select = document.createElement('u-select') as USelect;
  for (const [k, v] of Object.entries(attrs)) select.setAttribute(k, v);
  for (const v of values) {
    const option = document.createElement('u-option');
    option.setAttribute('value', v);
    option.textContent = `Option ${v}`;
    select.appendChild(option);
  }
  return select;
}

function typeSearch(select: USelect, value: string) {
  const input = select.shadowRoot!.querySelector('.search-input input') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

describe('USelect search 이벤트 (docket #128 — 원격/서버 검색 지원)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('searchable일 때 입력마다 { detail: { query } }로 search 이벤트를 발행한다', async () => {
    const select = createSelect(['a', 'b'], { searchable: '' });
    document.body.appendChild(select);
    await settle(select);

    const seen: string[] = [];
    select.addEventListener('search', (e) => seen.push((e as CustomEvent<{ query: string }>).detail.query));

    typeSearch(select, 'Foo');
    await settle(select);

    expect(seen).toEqual(['foo']);
  });

  it('search 이벤트는 기존 로컬 필터링(hidden 토글)과 독립적으로 함께 발화한다', async () => {
    const select = createSelect(['apple', 'banana'], { searchable: '' });
    document.body.appendChild(select);
    await settle(select);

    let received: string | undefined;
    select.addEventListener('search', (e) => { received = (e as CustomEvent<{ query: string }>).detail.query; });

    typeSearch(select, 'app');
    await settle(select);

    expect(received).toBe('app');
    const appleOption = select.querySelector('u-option[value="apple"]') as HTMLElement;
    const bananaOption = select.querySelector('u-option[value="banana"]') as HTMLElement;
    expect(appleOption.hidden).toBe(false);
    expect(bananaOption.hidden).toBe(true);
  });

  it('검색어를 지우면 query가 빈 문자열인 search 이벤트가 발행된다', async () => {
    const select = createSelect(['a', 'b'], { searchable: '' });
    document.body.appendChild(select);
    await settle(select);

    typeSearch(select, 'a');
    await settle(select);

    const seen: string[] = [];
    select.addEventListener('search', (e) => seen.push((e as CustomEvent<{ query: string }>).detail.query));
    typeSearch(select, '');
    await settle(select);

    expect(seen).toEqual(['']);
  });

  it('searchable이 아니어도(기본값) 검색 입력이 렌더되지 않아 search를 발행할 경로가 없다', async () => {
    const select = createSelect(['a', 'b']);
    document.body.appendChild(select);
    await settle(select);

    const input = select.shadowRoot!.querySelector('.search-input') as HTMLElement;
    expect(input.hidden).toBe(true);
  });
});
