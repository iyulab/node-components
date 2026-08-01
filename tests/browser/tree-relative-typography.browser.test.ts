import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tree/UTree.js';

/**
 * 규약: **컴포넌트 타이포는 상속된 `font-size` 에 비례한다.**
 *
 * `u-tree` 는 전 컴포넌트 중 유일하게 `rem` 을 쓰고 있었다. `rem` 은 **루트 기준**이라
 * 소비자가 컨테이너 타이포를 키워도 트리만 따라오지 않는다 — 그 컨테이너 안에서 트리만
 * 상대적으로 작아진다.
 *
 * ⚠**기본 상황에서는 두 단위가 같은 값이다**(루트 16px → `0.875rem` = `0.875em` = 14px).
 * 그래서 이 회귀는 **소비자가 타이포를 조정한 경우에만** 드러나고, 기본 스토리북/데모에서는
 * 영원히 보이지 않는다. 그 비대칭이 이 테스트가 존재하는 이유다.
 */
describe('u-tree 상대 타이포', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.fontSize = '';
  });

  async function mountIn(containerFontSize: string) {
    const box = document.createElement('div');
    box.style.fontSize = containerFontSize;
    document.body.appendChild(box);
    const tree = document.createElement('u-tree') as HTMLElement & { updateComplete: Promise<unknown> };
    box.appendChild(tree);
    await tree.updateComplete;
    return tree;
  }

  it('기본 컨텍스트에서 종전과 같은 크기다 (시각 변화 0)', async () => {
    const tree = await mountIn('16px');
    expect(getComputedStyle(tree).fontSize).toBe('14px'); // 0.875 × 16
  });

  it('컨테이너 타이포를 키우면 따라 커진다', async () => {
    const tree = await mountIn('24px');
    // `rem` 이었다면 루트(16px)를 보므로 14px 에 머문다 — 그것이 고치려는 동작이다.
    expect(getComputedStyle(tree).fontSize).toBe('21px'); // 0.875 × 24
  });

  it('루트 폰트 크기에 종속되지 않는다', async () => {
    document.documentElement.style.fontSize = '20px';
    const tree = await mountIn('16px');
    // `rem` 이었다면 17.5px 이 된다 — 컨테이너는 그대로인데 트리만 커지는 것도 결함이다.
    expect(getComputedStyle(tree).fontSize).toBe('14px');
    document.documentElement.style.fontSize = '';
  });
});
