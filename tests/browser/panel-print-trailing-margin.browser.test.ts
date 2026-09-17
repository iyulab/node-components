/// <reference types="@vitest/browser-playwright" />
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import '../../src/components/panel/UPanel.js';

/**
 * **인쇄에서 `u-panel` 은 자손의 끝 여백을 가두지 않는다** (cycle-662).
 *
 * `overflow: auto` 는 독립 서식 문맥을 만든다 — 패널 안 마지막 블록의 아래 여백이 패널 «안» 에 갇혀
 * 패널이 그만큼 자라고, 내용 끝이 쪽 경계에서 그 여백 이내에 있으면 여백만 담긴 빈 꼬리 쪽이 찍힌다
 * (router 아웃렛 · modern-app master-detail 에서 실측된 기전). 패널은 패딩이 없는 콘텐츠 래퍼라
 * 이 차이가 곧 인쇄 결과다. 종이에는 스크롤이 없으므로 인쇄에서는 넘침을 흐름에 돌린다.
 */
const settle = async () => {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, 40));
};

const setMedia = async (media: 'print' | '') => {
  await cdp().send('Emulation.setEmulatedMedia', { media });
  await settle();
};

describe('u-panel — print: trailing margin', () => {
  let wrapper: HTMLDivElement;
  let panel: HTMLElement;

  const mount = async () => {
    wrapper = document.createElement('div');
    wrapper.style.width = '600px';
    panel = document.createElement('u-panel');
    panel.innerHTML = '<div style="height:100px;margin-bottom:24px">x</div>';
    wrapper.appendChild(panel);
    document.body.appendChild(wrapper);
    await settle();
  };

  afterEach(async () => {
    await setMedia('');
    document.body.replaceChildren();
  });

  const h = (el: Element) => Math.round(el.getBoundingClientRect().height);

  it('🔴print: the last block\'s bottom margin collapses out of the panel', async () => {
    await mount();
    await setMedia('print');
    expect({ panel: h(panel), wrapper: h(wrapper) }).toEqual({ panel: 100, wrapper: 100 });
  });

  it('screen is unchanged: the panel is still a scroll container', async () => {
    await mount();
    expect(getComputedStyle(panel).overflow).toBe('auto');
  });

  it('print: a consumer rule still wins', async () => {
    await mount();
    const style = document.createElement('style');
    style.textContent = '@media print { u-panel { overflow: hidden; } }';
    document.head.appendChild(style);
    try {
      await setMedia('print');
      expect(getComputedStyle(panel).overflow).toBe('hidden');
    } finally {
      style.remove();
    }
  });
});
