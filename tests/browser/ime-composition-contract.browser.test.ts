/**
 * 조합 입력 계약 — 한국어 IME 로 «서울» 을 치는 동안 컴포넌트가 무엇을 보이고 무엇을 내는가. 실제 조합(`ime.ts`)으로 잰다.
 *
 * - `u-select searchable`: 조합 중인 음절은 «진행 중» 이다. 거르기는 확정된 부분으로만 해서(최종 글자가 맞출 옵션을 숨기지
 *   않는다) «일치 없음» 은 확정된 부분이 이미 아무것도 맞추지 않을 때만 알린다. `search` 는 조합 단계마다 나가되
 *   `detail.composing` 을 싣고, 조합이 끝나면 `composing: false` 로 한 번 더 나간다.
 * - `u-input`: 조합 중에도 `value` 가 상자 글자를 따르고, 조상은 `input`(`isComposing`)을 호스트에서 받는다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/input/UInput.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UInput } from '../../src/components/input/UInput.js';
import { compose, commit } from './ime.js';

type Lit = HTMLElement & { updateComplete: Promise<boolean> };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function settle(el: Lit) {
  await el.updateComplete;
  await sleep(0);
  await el.updateComplete;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

async function openSearchableSelect() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<u-select searchable label="City">
    <u-option value="seoul">서울</u-option>
    <u-option value="seongnam">성남</u-option>
    <u-option value="busan">부산</u-option>
  </u-select>`;
  document.body.appendChild(wrap);
  const select = wrap.querySelector('u-select') as USelect;
  await settle(select);
  await userEvent.click(select);
  await sleep(100);
  const search = select.shadowRoot!.querySelector('.search-input input') as HTMLInputElement;
  search.focus();
  const visible = () => [...select.querySelectorAll('u-option')].filter((o) => !o.hidden).map((o) => o.textContent);
  const status = () => select.shadowRoot!.querySelector('.no-matches')!.textContent!.trim();
  const searches: { query: string; composing: boolean }[] = [];
  wrap.addEventListener('search', (e) => searches.push({ ...(e as CustomEvent).detail }));
  return { select, visible, status, searches };
}

describe('u-select searchable — 조합 중 거르기와 search', () => {
  it('«서울» 을 치는 동안 서울을 숨기지 않고 «일치 없음» 을 알리지 않는다', async () => {
    const { select, visible, status } = await openSearchableSelect();
    const seen: { visible: (string | null)[]; status: string }[] = [];
    const step = async () => { await settle(select); seen.push({ visible: visible(), status: status() }); };

    for (const text of ['ㅅ', '서', '성']) { await compose([text]); await step(); }
    await commit('서'); await step();
    for (const text of ['우', '울']) { await compose([text]); await step(); }
    await commit('울'); await step();

    for (const s of seen) {
      expect(s.visible, JSON.stringify(seen)).toContain('서울');
      expect(s.status).toBe('');
    }
    expect(seen.at(-1)!.visible).toEqual(['서울']);
  });

  it('search 는 조합 단계마다 composing:true, 조합이 끝날 때 composing:false 로 나간다', async () => {
    const { select, searches } = await openSearchableSelect();
    await compose(['ㅅ', '서', '성']);
    await commit('서');
    await compose(['우', '울']);
    await commit('울');
    await settle(select);

    expect(searches.every((s) => typeof s.composing === 'boolean')).toBe(true);
    expect(searches.filter((s) => !s.composing).map((s) => s.query)).toEqual(['서', '서울']);
    expect(searches.at(-1)).toEqual({ query: '서울', composing: false });
  });

  it('NEGATIVE: 확정된 부분이 아무것도 맞추지 않으면 조합 중에도 «일치 없음» 이다', async () => {
    const { select, visible, status } = await openSearchableSelect();
    await compose(['ㄱ', '가']);
    await commit('가');
    await compose(['ㄴ']);
    await settle(select);
    expect(visible()).toEqual([]);
    expect(status()).not.toBe('');
  });

  it('글 가운데서 조합해도 확정된 부분은 조합 앞뒤의 글자다', async () => {
    const { select, visible } = await openSearchableSelect();
    const search = select.shadowRoot!.querySelector('.search-input input') as HTMLInputElement;
    await userEvent.keyboard('busan');
    search.setSelectionRange(0, 0);
    await compose(['ㅅ']);
    await settle(select);
    expect(search.value).toBe('ㅅbusan');
    expect(visible()).toEqual(['부산']);
  });

  it('조합 없는 타이핑은 search 를 composing:false 로 낸다', async () => {
    const { select, searches } = await openSearchableSelect();
    await userEvent.keyboard('bu');
    await settle(select);
    expect(searches).toEqual([{ query: 'b', composing: false }, { query: 'bu', composing: false }]);
  });
});

describe('u-input — 조합 중 value 와 input', () => {
  it('조합 중에도 value 가 상자 글자를 따르고, 조상은 호스트에서 input 을 받는다 · 조합은 깨지지 않는다', async () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<u-input name="city"></u-input>';
    document.body.appendChild(wrap);
    const host = wrap.querySelector('u-input') as UInput;
    await settle(host);
    const inner = host.shadowRoot!.querySelector('input') as HTMLInputElement;
    const heard: { value: unknown; composing: boolean }[] = [];
    wrap.addEventListener('input', (e) => {
      if (e.target === host) heard.push({ value: host.value, composing: (e as InputEvent).isComposing });
    });
    inner.focus();

    await compose(['ㅅ', '서', '성']);
    await settle(host);
    expect(host.value).toBe('성');
    await commit('서');
    await compose(['우', '울']);
    await commit('울');
    await settle(host);

    expect(inner.value).toBe('서울');
    expect(host.value).toBe('서울');
    expect(heard.length).toBeGreaterThan(0);
    for (const h of heard) expect(typeof h.value).toBe('string');
    expect(heard.at(-1)!.value).toBe('서울');
  });
});
