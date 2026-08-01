import { describe, it, expect, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';

/**
 * 규약: **밝기 판단에 쓰는 값은 항상 `'light' | 'dark'` 여야 한다.**
 *
 * ★이 API 가 생긴 이유는 `get()` 이 **선호**를 돌려주기 때문이다. 선호에는 `'system'`
 * 이 있고 그것이 **기본값**이다. 소비자가 `get() === 'dark'` 로 분기하면 system + OS
 * 다크에서 밝은 화면을 그리게 되는데, 이 경로가 가장 흔하다.
 *
 * 실제로 이 리포의 소비자 **둘이 각각 다르게 틀렸다** — 한쪽은 `'system'` 을 CSS 선택자에
 * 그대로 써서 어떤 규칙도 매치되지 않았고, 다른 쪽은 `=== 'dark' ? … : 'light'` 로
 * 강제 변환해 다크에서 밝은 테마를 골랐다. 둘 다 소스만 보면 멀쩡하다.
 */
describe('Theme.resolved() — 선호가 아니라 실효 테마', () => {
  const html = document.documentElement;

  afterEach(() => {
    html.removeAttribute('data-theme');
    html.removeAttribute('theme');
  });

  it('명시 테마는 그대로 돌려준다', () => {
    Theme.set('dark');
    expect(Theme.resolved()).toBe('dark');
    Theme.set('light');
    expect(Theme.resolved()).toBe('light');
  });

  it("★'system' 선호에서도 실효값을 돌려준다 (get() 과 갈리는 지점)", () => {
    Theme.set('system');
    // 선호는 여전히 system 이다 — 그 사실 자체가 이 API 의 존재 이유다.
    expect(Theme.get()).toBe('system');
    // 실효값은 반드시 둘 중 하나다. `'system'` 이 새어 나오면 소비자의 분기가 조용히
    // 어긋난다(어느 CSS 규칙도 매치되지 않는 형태로).
    expect(['light', 'dark']).toContain(Theme.resolved());
  });

  it("실효값은 <html theme> 를 따른다 — 'system' 이 무엇으로 풀렸는지가 거기 적힌다", () => {
    html.setAttribute('data-theme', 'system');
    html.setAttribute('theme', 'dark');
    expect(Theme.get()).toBe('system');
    expect(Theme.resolved()).toBe('dark');
  });

  it('초기화 전에도 값을 돌려준다 (미설정 → 매체 질의)', () => {
    // Theme.init() 이 아직 돌지 않은 시점에 렌더되는 컴포넌트가 있다.
    // undefined 를 돌려주면 그 자리에서 또 각자 추측하게 된다.
    expect(['light', 'dark']).toContain(Theme.resolved());
  });
});
