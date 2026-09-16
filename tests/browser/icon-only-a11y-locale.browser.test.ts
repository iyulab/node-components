import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/chip/UChip.js';
import '../../src/components/tab/UTab.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * **아이콘만 있는 컨트롤의 접근성 이름이 로케일을 타는가.**
 *
 * 이 축은 `u-alert` 제목(docket `#316`)과 **같은 부류이고 더 조용하다** — 화면에 글자가 없어
 * 눈으로 하는 검수에서 절대 드러나지 않고, 한국어 앱에서 **스크린리더 사용자만 영어를 듣는다.**
 * 이 패키지는 로케일 테이블을 처음부터 갖고 있었고, 이 둘만 그것을 지나치지 않았다.
 *
 * ⚠**게이트는 「값이 무엇인가」가 아니라 「로케일을 타는가」를 잰다** — 특정 낱말을 고정하면
 * 번역을 다듬을 때마다 테스트가 깨지고, 그러면 테스트가 번역을 막는다.
 */
describe('아이콘 전용 컨트롤의 접근성 이름 — 로케일', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { Locale.set('en'); });

  async function label(tag: string, attrs: Record<string, string>, sel: string): Promise<string> {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el.shadowRoot!.querySelector(sel)!.getAttribute('aria-label')!;
  }

  const CASES: Array<[string, Record<string, string>, string]> = [
    ['u-chip', { removable: '' }, 'u-button[aria-label]'],
    ['u-tab', { removable: '' }, 'u-button[aria-label]'],
  ];

  for (const [tag, attrs, sel] of CASES) {
    it(`${tag} 의 제거 버튼 이름이 로케일마다 다르다`, async () => {
      Locale.set('en');
      const en = await label(tag, attrs, sel);
      Locale.set('ko');
      const ko = await label(tag, attrs, sel);

      expect(en.length).toBeGreaterThan(0);
      expect(ko.length).toBeGreaterThan(0);
      // 하드코딩이면 두 값이 같다 — 그것이 이 게이트가 잡는 전부다.
      expect(ko).not.toBe(en);
      // 키가 없어 `getValue` 가 키 자체를 돌려주는 상태도 걸러낸다.
      expect(ko).not.toMatch(/^[a-z][a-zA-Z]*$/);
    });
  }
});
