import { describe, it, expect, afterEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/button/UButton.js';
import { userEvent } from 'vitest/browser';

/**
 * 버튼 상태의 지각 하한 — hover 가 쉼과 **보이게** 다르다(OKLab 명도 차 ≥ 0.03).
 *
 * 상태 색은 «검정 쪽 85%·70% 섞기» 로 고정돼, 이미 검정에 가까운 브랜드(잉크 primary #18191B)에서는 hover 대비가 ≈1.05:1 로
 * 사라졌다 — 그 지역에서 가장 자주 누르는 버튼의 상태가 없었다. 어두운 색(명도 < 0.4)은 흰색 쪽으로 섞고, 중간·밝은 색은
 * 종전 그대로 검정 쪽이다. 실제 포인터를 올려 계산된 배경을 잰다.
 */
afterEach(() => { document.body.replaceChildren(); document.body.style.cssText = ''; });

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
/** OKLab 명도(L) — 계산값 rgb()/color(srgb …) 를 읽는다. */
function lightness(css: string): number {
  const probe = document.createElement('i');
  probe.style.color = css;
  document.body.appendChild(probe);
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = getComputedStyle(probe).color;
  probe.remove();
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => toLinear(v / 255));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  return 0.2104542553 * Math.cbrt(l) + 0.793617785 * Math.cbrt(m) - 0.0040720468 * Math.cbrt(s);
}

async function states(primary: string, attrs = '') {
  document.body.style.setProperty('--u-primary-color', primary);
  document.body.insertAdjacentHTML('beforeend', `<button id="away">away</button><u-button ${attrs}>Sign in</u-button>`);
  const el = document.querySelector('u-button') as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  const bg = () => getComputedStyle(el).backgroundColor;
  const settle = () => new Promise((r) => setTimeout(r, 400)); // 전환(220ms) 이 끝난 뒤 — 첫 렌더도 투명에서 전환한다
  await settle();
  const rest = bg();
  expect(rest).not.toBe('rgba(0, 0, 0, 0)');
  await userEvent.hover(el);
  await settle();
  const hover = bg();
  await userEvent.hover(document.getElementById('away')!);
  return { rest, hover };
}

const FLOOR = 0.03;

describe('버튼 hover 의 지각 하한', () => {
  it('🔴잉크 primary(#18191B) — hover 가 밝아져 쉼과 구별된다', async () => {
    const { rest, hover } = await states('#18191B');
    expect(lightness(hover) - lightness(rest)).toBeGreaterThanOrEqual(FLOOR);
  });

  it('🔴어두운 남색(#0B1F3A)도 밝아진다', async () => {
    const { rest, hover } = await states('#0B1F3A');
    expect(lightness(hover) - lightness(rest)).toBeGreaterThanOrEqual(FLOOR);
  });

  it('⚪NEGATIVE — 중간 파랑(#1976D2)은 종전 그대로 검정 쪽 85% (외형 불변)', async () => {
    const { rest, hover } = await states('#1976D2');
    const probe = document.createElement('i');
    probe.style.backgroundColor = 'color-mix(in srgb, #1976D2 85%, black)';
    document.body.appendChild(probe);
    expect(hover).toBe(getComputedStyle(probe).backgroundColor);
    expect(lightness(rest) - lightness(hover)).toBeGreaterThanOrEqual(FLOOR);
  });

  it('⚪NEGATIVE — 밝은 노랑(warning)은 어두워진다', async () => {
    const { rest, hover } = await states('#1976D2', 'color="warning"');
    expect(lightness(rest) - lightness(hover)).toBeGreaterThanOrEqual(FLOOR);
  });
});
