import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/icon/UIcon.js';
import '../../src/components/split-panel/USplitPanel.js';
import { IconCache } from '../../src/utilities/icons.js';
import { resetDevWarnings } from '../../src/utilities/devWarning.js';

/**
 * HD-61 ⒝ — «조용히 틀리는» 두 자리에 개발 모드 1회성 경고.
 *
 * ⑴ `u-icon`: 이름이 해석되지 않으면 폴백(또는 아무것도)을 그리고 **신호가 없었다** — 소비앱의 메뉴
 *    30개가 같은 큐브로 그려졌다(docket #265 R3). 폴백은 의도된 것이라 유지하고 경고만 더한다.
 * ⑵ `u-split-panel`: 높이 제약이 없으면 18px 로 붕괴하고 `overflow: hidden` 이라 패널에 닿을 수 없다(cycle-565).
 *
 * 계약은 셋이다: 정확히 **한 번**(같은 키) · 정상이면 **0회** · 개발 모드에서만. 이 스위트는 vitest
 * 브라우저 모드라 `import.meta.env.DEV` 가 참이다.
 * ★NEGATIVE 가 절반 — 해석되는 이름 · 높이를 준 분할 패널은 침묵해야 한다. 여기 발화하면 경고는 무시당한다.
 */
describe('개발 모드 사용 안내 경고', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    IconCache.clear();
    resetDevWarnings();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    vi.unstubAllGlobals();
  });

  // slotchange → rAF 가 한 프레임 뒤라 넉넉히 기다린다.
  const settle = () => new Promise((r) => setTimeout(r, 100));
  // 토큰 시트 부재 경고(UElement)는 같은 네임스페이스의 «다른» 경고라 세지 않는다.
  const ours = () => (warn.mock.calls as unknown[][]).filter((c) => /^\[@iyulab\/components\] u-(icon|split-panel)/.test(String(c[0])));

  async function mountIcon(attrs: Record<string, string>) {
    const el = document.createElement('u-icon');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    await settle();
    return el;
  }

  describe('u-icon — 해석되지 않는 이름', () => {
    it('404 로 끝나면 이름당 한 번 경고하고 폴백은 그대로 그린다', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
      const fallback = '<svg xmlns="http://www.w3.org/2000/svg" data-fallback="1"><path d="M0 0"/></svg>';
      const a = await mountIcon({ name: 'no-such-icon', fallback });
      await mountIcon({ name: 'no-such-icon', fallback }); // 같은 이름 두 번째 — 경고는 늘지 않는다
      expect(ours()).toHaveLength(1);
      expect(String(ours()[0][0])).toContain('"no-such-icon"');
      expect(String(ours()[0][0])).toContain('fallback');
      expect(a.shadowRoot!.querySelector('svg'), '폴백은 여전히 그려진다').toBeTruthy();
    });

    it('등록되지 않은 lib 이면 그 사실을 함께 말한다', async () => {
      await mountIcon({ lib: 'no-such-lib', name: 'x' });
      expect(ours()).toHaveLength(1);
      expect(String(ours()[0][0])).toContain('not registered');
    });

    it('이름이 다르면 각각 한 번씩이다', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
      await mountIcon({ name: 'one' });
      await mountIcon({ name: 'two' });
      expect(ours()).toHaveLength(2);
    });

    it('NEGATIVE: 해석되는 이름은 침묵한다', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', { status: 200 })));
      await mountIcon({ name: 'ok' });
      expect(ours()).toHaveLength(0);
    });
  });

  describe('u-split-panel — 높이 없음', () => {
    async function mountSplit(style: string) {
      const el = document.createElement('u-split-panel');
      el.setAttribute('style', style);
      el.innerHTML = '<div style="height:900px">A</div><div style="height:900px">B</div>'; // cycle-565 의 픽스처 — 패널 높이는 지워진다
      document.body.appendChild(el);
      await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
      await settle();
      return el;
    }

    it('높이가 없어 붕괴하면 한 번 경고한다', async () => {
      const el = await mountSplit('width: 600px');
      expect(el.getBoundingClientRect().height, '이 사례는 붕괴해야 의미가 있다').toBeLessThan(40);
      expect(ours()).toHaveLength(1);
      expect(String(ours()[0][0])).toContain('has no height of its own');
    });

    it('NEGATIVE: 높이를 주면 침묵한다', async () => {
      await mountSplit('width: 600px; height: 300px');
      expect(ours()).toHaveLength(0);
    });
  });
});
