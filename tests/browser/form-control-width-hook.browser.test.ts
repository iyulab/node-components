import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/input/UInput.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/select/USelect.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/file-input/UFileInput.js';

/**
 * 폼 컨트롤 호스트의 폭 훅은 **네 컨트롤이 같은 방식으로** 열려 있어야 한다.
 *
 * 폼 레이아웃은 컨트롤 종류로 갈리지 않는다 — 같은 행 안에서 어떤 칸은 컨테이너 폭을
 * 따르고 어떤 칸은 넘쳐 그려지면, 소비자는 **넘치는 쪽에만 우회를 만들게 된다**
 * (`::part` 강제 덮어쓰기 · 래퍼 폭을 콘텐츠 하한까지 넓히기 — 둘 다 다음 판에서
 * 조용히 깨진다).
 *
 * 실측 계기: `USelect`·`UTextarea` 만 `display: inline-block` 하드코딩이라 좁은 칸을
 * 넘쳐 그려졌다. `UInput`·`UDatePicker`·`UFileInput` 셋은 이미 훅을 갖고 있었으므로
 * **비대칭은 다섯 중 둘**이었다.
 *
 * ⚠이 검사가 jsdom 이 아니라 브라우저에 있는 이유: 재는 것이 **레이아웃 결과**다.
 */
const CONTROLS = [
  { tag: 'u-input', prefix: '--u-input' },
  { tag: 'u-textarea', prefix: '--u-textarea' },
  { tag: 'u-select', prefix: '--u-select' },
  { tag: 'u-date-picker', prefix: '--u-date-picker' },
  { tag: 'u-file-input', prefix: '--u-file-input' },
] as const;

const NARROW = 120;

async function mount(tag: string, hostStyle = '') {
  const box = document.createElement('div');
  box.style.width = `${NARROW}px`;
  const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
  if (hostStyle) el.setAttribute('style', hostStyle);
  box.appendChild(el);
  document.body.appendChild(box);
  await el.updateComplete;
  return el;
}

describe('폼 컨트롤 호스트의 폭 훅', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  for (const { tag, prefix } of CONTROLS) {
    it(`${tag} 은 ${prefix}-display: block 으로 좁은 칸을 채운다`, async () => {
      const el = await mount(tag, `${prefix}-display: block`);
      expect(Math.round(el.getBoundingClientRect().width)).toBe(NARROW);
    });

    // 네거티브 컨트롤 — 훅을 주지 않으면 종전 동작 그대로다(하위호환 순가산).
    it(`${tag} 의 기본 display 는 inline-block 이다`, async () => {
      const el = await mount(tag);
      expect(getComputedStyle(el).display).toBe('inline-block');
    });

    it(`${tag} 은 ${prefix}-width 로도 폭을 받는다`, async () => {
      const el = await mount(tag, `${prefix}-width: 100%`);
      expect(Math.round(el.getBoundingClientRect().width)).toBe(NARROW);
    });
  }
});
