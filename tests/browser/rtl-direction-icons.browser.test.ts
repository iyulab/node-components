import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 「`dir="rtl"` 에서 **방향을 가진 아이콘**이 읽는 방향을 따르는가」 — 화살표·셰브론은 «앞/뒤» 를 뜻할 때 RTL 에서 뒤집힌다
 * (Material · APG 의 «auto-mirrored» 목록). 상자 배치의 거울(`rtl-mirror`)과는 다른 축이다: 상자는 맞게 놓여도 글리프가
 * 물리 방향을 가리키면 «이전» 단추가 «다음» 쪽을 가리킨다.
 *
 * 오라클은 픽셀이 아니라 **글리프가 가리키는 방향 벡터**다. 아이콘 이름이 SVG 안 도형의 방향을 정한다(`-right` = +x · `-left` = −x ·
 * `-down` = +y). 그 벡터에 글리프에서 문서 루트까지(섀도 경계를 건너) 누적한 변환 행렬을 곱한다 — 컴포넌트가 `scaleX(-1)` 로
 * 뒤집든 `rotate(90deg)` 로 눕히든 같은 방식으로 읽힌다. 회전과 거울이 합쳐지는 자리(열린 펼침 표시)는 행렬이 알아서 합성한다.
 *
 * 같은 마크업을 LTR · RTL 로 두 번 그려 **가로로 가리키는 글리프는 부호가 뒤집히고, 세로로 가리키는 글리프는 그대로**임을 잰다.
 * LTR 쪽이 먼저 서 있어야 «전환이 LTR 을 안 바꿨다» 가 증명된다. (계획: RTL 논리 속성 전환 — «화살표·셰브론 아이콘» 규칙)
 *
 * ⚠**대상 목록은 손으로 쓴다**(`rtl-mirror` 와 같다) — 어떤 컴포넌트가 방향 아이콘을 «앞/뒤» 의미로 쓰는지는 이 패키지의 지식이다.
 * 물리 방향이 **의미**인 아이콘(화면의 «오른쪽으로 스크롤») 이 생기면 이 목록이 아니라 그 컴포넌트가 `physical-ok` 로 적는다.
 */

interface Case { label: string; markup: string }

const CASES: Case[] = [
  { label: 'u-breadcrumb 구분자', markup: '<u-breadcrumb id="h"><u-breadcrumb-item href="#">A</u-breadcrumb-item><u-breadcrumb-item href="#">B</u-breadcrumb-item><u-breadcrumb-item href="#">C</u-breadcrumb-item></u-breadcrumb>' },
  { label: 'u-pagination 이전·다음', markup: '<u-pagination id="h" page="3" page-size="10" total-count="100"></u-pagination>' },
  { label: 'u-calendar 이전·다음 달', markup: '<u-calendar id="h"></u-calendar>' },
  { label: 'u-expander 닫힘', markup: '<u-expander id="h" label="x">본문</u-expander>' },
  { label: 'u-expander 열림', markup: '<u-expander id="h" label="x" open>본문</u-expander>' },
  { label: 'u-menu-item 하위 메뉴 표시', markup: '<u-menu id="h"><u-menu-item>Parent<u-menu-item slot="children">Child</u-menu-item></u-menu-item></u-menu>' },
  { label: 'u-tree-item 닫힘', markup: '<u-tree><u-tree-item id="h">Parent<u-tree-item slot="children">Child</u-tree-item></u-tree-item></u-tree>' },
  { label: 'u-tree-item 열림', markup: '<u-tree><u-tree-item id="h" expanded>Parent<u-tree-item slot="children">Child</u-tree-item></u-tree-item></u-tree>' },
  // 양성 대조 — 이미 `scaleX(-1)` 로 뒤집는 캐러셀. 오라클이 «뒤집힌 가로 글리프» 를 통과시키지 못하면 아래 초록은 아무것도 증명하지 못한다.
  { label: 'u-carousel 이전·다음 (양성 대조)', markup: '<u-carousel id="h" aria-label="x" navigation loop style="display:block;width:300px;height:120px"><div>A</div><div>B</div><div>C</div></u-carousel>' },
];

/**
 * 음성 케이스 — 소비자가 준 글리프는 의미를 소비자가 정한다. 컴포넌트가 스스로 넣는 기본 글리프만 뒤집고,
 * 슬롯으로 들어온 구분자 · 펼침 아이콘은 RTL 에서도 그대로여야 한다(«/» 가 «\» 로 뒤집히는 것과 같은 부류).
 */
const KEPT: Case[] = [
  { label: 'u-breadcrumb 소비자 구분자', markup: '<u-breadcrumb id="h"><u-icon slot="separator" lib="internal" name="chevron-right"></u-icon><u-breadcrumb-item href="#">A</u-breadcrumb-item><u-breadcrumb-item href="#">B</u-breadcrumb-item></u-breadcrumb>' },
  { label: 'u-tree 소비자 펼침 아이콘', markup: '<u-tree id="h"><u-icon slot="expand-icon" lib="internal" name="chevron-right"></u-icon><u-tree-item>Parent<u-tree-item slot="children">Child</u-tree-item></u-tree-item></u-tree>' },
];

async function settle(): Promise<void> {
  const walk = (root: ParentNode, out: Array<HTMLElement & { updateComplete?: Promise<unknown> }>) => {
    for (const el of Array.from(root.querySelectorAll('*')) as Array<HTMLElement & { updateComplete?: Promise<unknown> }>) {
      out.push(el);
      if (el.shadowRoot) walk(el.shadowRoot, out);
    }
  };
  for (let pass = 0; pass < 2; pass++) {
    const all: Array<HTMLElement & { updateComplete?: Promise<unknown> }> = [];
    walk(document.body, all);
    for (const el of all) if (el.updateComplete) await el.updateComplete;
    await new Promise((r) => setTimeout(r, 120));
  }
}

/** 요소의 «부모» — 섀도 루트의 부모는 호스트다. */
const parentOf = (n: Element): Element | null => n.parentElement ?? ((n.getRootNode() as ShadowRoot).host ?? null);

/** 글리프(svg)에서 문서 루트까지 누적한 선형 변환. 인라인(비치환) 요소의 변환은 적용되지 않으므로 건너뛴다. */
function accumulated(svg: Element): DOMMatrix {
  let m = new DOMMatrix();
  for (let n: Element | null = svg; n; n = parentOf(n)) {
    const cs = getComputedStyle(n);
    if (cs.display === 'inline' && n.tagName.toLowerCase() !== 'svg') continue;
    if (!cs.transform || cs.transform === 'none') continue;
    m = new DOMMatrix(cs.transform).multiply(m); // 부모 × 자식 — 자식 좌표가 먼저 변환된다
  }
  return m;
}

interface Glyph { name: string; x: number; y: number }

/** 호스트 안(섀도 포함) 모든 `u-icon` 의 SVG 가 화면에서 가리키는 방향. 이름이 방향을 담지 않는 아이콘은 건너뛴다. */
function glyphs(host: Element): Glyph[] {
  const out: Glyph[] = [];
  const visit = (root: ParentNode) => {
    for (const el of Array.from(root.querySelectorAll('*'))) {
      if (el.tagName.toLowerCase() === 'u-icon' && el.shadowRoot) {
        // `u-icon-button` 은 이름을 속성이 아니라 프로퍼티로 넘긴다 — 둘 다 읽는다.
        const name = el.getAttribute('name') ?? (el as HTMLElement & { name?: string }).name ?? '';
        const svg = el.shadowRoot.querySelector('svg');
        const base = /-right$/.test(name) ? [1, 0] : /-left$/.test(name) ? [-1, 0] : /-down$/.test(name) ? [0, 1] : null;
        // 렌더 상자가 없는 글리프(`hidden` 리프 항목의 접미 · 숨은 단추)는 사용자가 볼 수 없다 — 방향을 잴 대상이 아니다.
        if (svg && base && svg.getClientRects().length > 0) {
          const m = accumulated(svg);
          out.push({ name, x: m.a * base[0] + m.c * base[1], y: m.b * base[0] + m.d * base[1] });
        }
      }
      if (el.shadowRoot) visit(el.shadowRoot);
    }
  };
  visit(host.parentElement ?? document.body);
  return out;
}

async function render(dir: 'ltr' | 'rtl', markup: string): Promise<Glyph[]> {
  document.documentElement.dir = dir;
  document.body.innerHTML = markup;
  await settle();
  return glyphs(document.getElementById('h')!);
}

afterEach(() => { document.documentElement.dir = 'ltr'; document.body.innerHTML = ''; });

describe('RTL — 방향 아이콘이 읽는 방향을 따른다', () => {
  for (const c of CASES) {
    it(c.label, async () => {
      const ltr = await render('ltr', c.markup);
      const rtl = await render('rtl', c.markup);
      expect(ltr.length, `${c.label}: 방향 아이콘을 하나 이상 찾는다(대상 없음은 통과가 아니다)`).toBeGreaterThan(0);
      expect(rtl.length, `${c.label}: RTL 에서도 같은 아이콘이 그려진다`).toBe(ltr.length);
      ltr.forEach((g, i) => {
        const r = rtl[i];
        const horizontal = Math.abs(g.x) > 0.5;
        if (horizontal) {
          expect(Math.sign(r.x), `${c.label} #${i} ${g.name}: LTR (${g.x.toFixed(2)}, ${g.y.toFixed(2)}) → RTL (${r.x.toFixed(2)}, ${r.y.toFixed(2)}) — 가로로 가리키는 글리프는 RTL 에서 부호가 뒤집힌다`).toBe(-Math.sign(g.x));
        } else {
          expect(Math.abs(r.x), `${c.label} #${i} ${g.name}: 세로 글리프는 RTL 에서도 세로다 (${r.x.toFixed(2)}, ${r.y.toFixed(2)})`).toBeLessThan(0.1);
          expect(Math.sign(r.y), `${c.label} #${i} ${g.name}: 세로 방향은 그대로`).toBe(Math.sign(g.y));
        }
      });
    });
  }

  for (const c of KEPT) {
    it(`${c.label} — 뒤집지 않는다`, async () => {
      const ltr = await render('ltr', c.markup);
      const rtl = await render('rtl', c.markup);
      // 소비자가 준 글리프만 본다 — 슬롯에 놓인 `u-icon` 은 호스트의 라이트 DOM 자식이다.
      const own = (g: Glyph[]) => g.filter((x) => x.name === 'chevron-right');
      expect(own(ltr).length, `${c.label}: 소비자 글리프가 그려진다(대상 없음은 통과가 아니다)`).toBeGreaterThan(0);
      own(ltr).forEach((g, i) => {
        const r = own(rtl)[i];
        expect(Math.sign(r.x), `${c.label} #${i}: LTR (${g.x.toFixed(2)}) → RTL (${r.x.toFixed(2)}) — 소비자 글리프는 RTL 에서도 그대로`).toBe(Math.sign(g.x));
      });
    });
  }
});
