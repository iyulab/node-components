import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/tooltip/UTooltip.js';
import type { UTooltip } from '../../src/components/tooltip/UTooltip.js';
import { axFirst } from './ax.js';

/**
 * 열린 툴팁의 글은 접근성 트리에서 대상과 이어져야 한다 — 호스트의 `role="tooltip"` 과 대상의 `aria-describedby`
 * (WAI-ARIA APG 툴팁 패턴). 이어지지 않으면 키보드 초점으로 열려도 화면 낭독기 사용자는 설명을 듣지 못한다.
 */

async function mount(html: string): Promise<{ tip: UTooltip; target: HTMLElement }> {
  document.body.innerHTML = html;
  const tip = document.querySelector('u-tooltip') as UTooltip;
  const target = document.querySelector('#target') as HTMLElement;
  await tip.updateComplete;
  return { tip, target };
}

describe('u-tooltip — 접근성 연결', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('🔴호스트는 role="tooltip" 이고 대상은 aria-describedby 로 툴팁을 가리킨다', async () => {
    const { tip, target } = await mount('<button id="target">Save</button><u-tooltip for="#target">Saves the form</u-tooltip>');
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(tip.id).not.toBe('');
    expect(target.getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('🔴접근성 트리에서 대상의 설명이 툴팁의 글이다', async () => {
    await mount('<button id="target">Save</button><u-tooltip for="#target">Saves the form</u-tooltip>');
    const node = await axFirst('button');
    expect(node?.description).toBe('Saves the form');
  });

  it('대상에 이미 있는 aria-describedby 는 보존하고 덧붙인다 · 걷을 때 우리 몫만 걷는다', async () => {
    const { tip, target } = await mount('<span id="hint">Required</span><button id="target" aria-describedby="hint">Save</button><u-tooltip for="#target">Saves</u-tooltip>');
    const id = tip.id;
    expect(target.getAttribute('aria-describedby')).toBe(`hint ${id}`);
    tip.remove();
    expect(target.getAttribute('aria-describedby')).toBe('hint');
  });

  it('작성자가 준 id 와 role 은 건드리지 않는다', async () => {
    const { tip, target } = await mount('<button id="target">Save</button><u-tooltip id="mine" role="note" for="#target">Saves</u-tooltip>');
    expect(tip.id).toBe('mine');
    expect(tip.getAttribute('role')).toBe('note');
    expect(target.getAttribute('aria-describedby')).toBe('mine');
    tip.remove();
    expect(target.getAttribute('aria-describedby')).toBeNull();
    expect(tip.id).toBe('mine');
  });

  it('interactive 툴팁(링크를 담는다)은 역할을 덧씌우지 않고 설명 연결만 둔다', async () => {
    const { tip, target } = await mount('<button id="target">Save</button><u-tooltip interactive for="#target">See <a href="#x">docs</a></u-tooltip>');
    expect(tip.hasAttribute('role')).toBe(false);
    expect(target.getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('for 가 바뀌면 옛 대상에서 걷고 새 대상에 건다', async () => {
    const { tip, target } = await mount('<button id="target">A</button><button id="other">B</button><u-tooltip for="#target">x</u-tooltip>');
    const other = document.querySelector('#other') as HTMLElement;
    const id = tip.id;
    tip.setAttribute('for', '#other');
    await tip.updateComplete;
    expect(target.getAttribute('aria-describedby')).toBeNull();
    expect(other.getAttribute('aria-describedby')).toBe(id);
  });
});
