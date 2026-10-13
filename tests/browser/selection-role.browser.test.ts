import { describe, it, expect, afterEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';

/**
 * «선택 표시» 역할(`--u-selection-color` / `--u-selection-txt-color`) — 고른 것의 표시(체크된 상자 · 켠 스위치).
 *
 * 기본값은 primary 짝이라 테마가 가르지 않으면 종전과 같다. 잉크 primary 테마(하우스)는 선택을 상호작용 색으로 돌리는데,
 * 역할이 없던 동안 체크 표시가 primary(잉크)를 읽어 «행동» 처럼 그려졌고 같은 화면의 네이티브 체크박스(파랑)와 갈렸다.
 */
afterEach(() => { document.body.replaceChildren(); document.documentElement.style.cssText = ''; });

const rgb = (css: string) => {
  const probe = document.createElement('i');
  probe.style.color = css;
  document.body.appendChild(probe);
  const v = getComputedStyle(probe).color;
  probe.remove();
  return v;
};

async function mount(html: string) {
  document.body.insertAdjacentHTML('beforeend', html);
  const el = document.body.lastElementChild as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 300)); // 전환이 끝난 뒤
  return el;
}

const checkboxFill = (el: HTMLElement) => getComputedStyle(el.shadowRoot!.querySelector('.checkbox')!).backgroundColor;
const switchTrack = (el: HTMLElement) => getComputedStyle(el.shadowRoot!.querySelector('.track')!).backgroundColor;

describe('선택 표시 역할', () => {
  it('🔴테마가 선택 색을 가르면 체크된 u-checkbox(기본 color) 의 채움과 켠 u-switch 의 트랙이 그 색이다', async () => {
    document.documentElement.style.cssText = '--u-primary-color: #18191B; --u-selection-color: #2F6FEB; --u-selection-txt-color: #FFFFFF';
    const box = await mount('<u-checkbox checked>Agree</u-checkbox>');
    expect(checkboxFill(box)).toBe(rgb('#2F6FEB'));
    const sw = await mount('<u-switch checked>On</u-switch>');
    expect(switchTrack(sw)).toBe(rgb('#2F6FEB'));
  });

  it('⚪NEGATIVE — 테마가 가르지 않으면 primary 그대로(기본 외형 불변)', async () => {
    document.documentElement.style.cssText = '--u-primary-color: #1976D2';
    const box = await mount('<u-checkbox checked>Agree</u-checkbox>');
    expect(checkboxFill(box)).toBe(rgb('#1976D2'));
    const sw = await mount('<u-switch checked>On</u-switch>');
    expect(switchTrack(sw)).toBe(rgb('#1976D2'));
  });

  it('⚪NEGATIVE — 역할 축의 다른 색(danger)은 선택 색을 따르지 않는다', async () => {
    document.documentElement.style.cssText = '--u-selection-color: #2F6FEB';
    const box = await mount('<u-checkbox checked color="danger">Delete</u-checkbox>');
    expect(checkboxFill(box)).not.toBe(rgb('#2F6FEB'));
  });
});
