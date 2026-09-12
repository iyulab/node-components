import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

/**
 * **WCAG 2.2 SC 2.5.8 Target Size (Minimum) — 24×24 CSS px** 게이트 (§C-A).
 *
 * ## 왜 브라우저에서 재는가
 *
 * 타깃 크기는 **렌더된 성질**이다 — 토큰·패딩·`font-size`·섀도 DOM 이 함께 정한다. 소스에서
 * `width`/`height` 리터럴을 세는 정적 검사로 흉내 내면 ***정당한 배치 전건에 발화하고 그
 * 순간 검사가 통째로 무시당한다***(이 리포가 반복 기록한 실패 모드). ⇒ 실제 크로미움에서
 * `getBoundingClientRect` 로 잰다.
 *
 * ## 🔴 간격 예외를 모델링하는 것이 이 게이트의 절반이다
 *
 * SC 2.5.8 은 «24px 미만»을 곧바로 위반으로 보지 않는다 — **간격 예외**가 있다:
 * *"타깃 중심에 놓인 지름 24px 원이 다른 타깃의 원과 겹치지 않으면 충족"*. 기하로 옮기면
 * ***두 중심 사이 거리가 24px 이상이면 통과***다(반지름 12 + 12). 이 예외를 빼고 켜면
 * 정당한 배치가 전건 위반이 된다.
 *
 * 그 밖의 예외(등가 컨트롤 · 인라인 · UA 컨트롤 · 본질적)는 **모델링하지 않는다** — 문서
 * 문맥이나 디자인 의도를 읽어야 하는 축이라 기계가 판정할 수 없다.
 *
 * ## 🔴 대상은 «도출»하고 규칙만 «손으로 쓴다» (cycle-486)
 *
 * 이 파일의 첫 판은 컴포넌트 일곱을 **임포트로 손수 열거**했다. 그런데 이 패키지는 46개를
 * 게시하므로, 그 상태로 «게이트가 초록이다»를 «전부 준수한다»로 읽으면 ***§C-A 가 A안을
 * 기각한 바로 그 형태의 거짓 선언***이 된다. 그리고 손으로 쓴 대상 목록은 이 리포가
 * **여섯 번** 데인 형태다(`tokens:sync` 의 `flex-table` · `gitignore-check` 의 `dist` ·
 * `draft-backlog` 의 `draftFolders`/`searchRoots` · `skill-doc-check` 의 스킬 경로 ·
 * `workspace-link-check` 의 `siblingDeps` · `build-gate-check` 의 `gateTargets`).
 *
 * ⇒ **배럴을 임포트하면서 `customElements.define` 을 가로채** 등록된 태그 전부를 얻는다.
 * 손으로 쓰는 것은 «무엇이 포인터 타깃인가»라는 **규칙**뿐이다 — 그것은 리포에서 읽어낼 수
 * 있는 사실이 아니라 우리 지식이다(cycle-181 의 경계 그대로).
 *
 * 🔴**그리고 그 규칙 표가 낡지 않도록 «전수 대응»을 단언한다**: 등록된 태그는 아래 세 집합
 * 중 정확히 하나에 있어야 하고, 세 집합에 등록되지 않은 이름이 있어도 실패한다. ⇒ ***새
 * 컴포넌트는 분류되기 전에는 이 게이트를 조용히 빠져나갈 수 없다.***
 *
 * ## ⚠ 「미판정」을 통과로 세지 않는다
 *
 * `NEEDS_FIXTURE` 는 «타깃이 있는데 아직 우리가 픽스처를 못 썼다»는 뜻이고 **이름을 그대로
 * 보고한다**. 침묵이 아니라 ***할 일이 있다***는 신호다 — cycle-485 가 `u-radio` 에서
 * 정확히 그것을 확인했다(«잴 수 없다»의 원인이 컴포넌트가 아니라 빈 픽스처였다).
 *
 * ✅**cycle-487 로 그 집합이 비었다**(24 판정 · 0 미판정 · 22 대상아님). 그 일곱을 열어 보니
 * 둘은 애초에 **타깃이 없었고**(`u-tag` 는 제거 버튼 자체가 없다 · `u-split-panel` 의
 * splitter 는 **소비자가 슬롯으로 넣는다**) 다섯은 픽스처만 있으면 재졌다.
 *
 * 🔴**(cycle-539 정정) `u-split-panel` 에 대한 위 판단은 틀렸다.** 컴포넌트가 분할 핸들
 * `div.splitter[part=splitter]` 를 **스스로 만들고** `pointerdown`·`dblclick` 을 건다 — `splitter`
 * 슬롯의 내용은 그 안에 복제되는 장식일 뿐이다. 그래서 «대상 아님» 에서 꺼내 재고, 기본 4px 라
 * `UNDERSIZED_PINS` 에 핀으로 둔다(사람 판단 대기).
 *
 * ⚠**커버리지 숫자는 단언으로 고정돼 있다** — 픽스처를 더하거나 분류를 바꾸면 그 줄을 함께
 * 고쳐야 하고, 그것이 이 표가 조용히 낡지 않게 하는 장치다.
 */

const MIN = 24;

interface Measured {
  w: number;
  h: number;
  cx: number;
  cy: number;
}

function measure(el: Element): Measured {
  const r = el.getBoundingClientRect();
  return { w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

/** SC 2.5.8 «간격 예외» — 중심 간 거리가 24px 이상이면 24px 원이 겹치지 않는다. */
function spacingSatisfied(target: Measured, others: Measured[]): boolean {
  return others.every((o) => Math.hypot(target.cx - o.cx, target.cy - o.cy) >= MIN);
}

type Verdict = 'meets-size' | 'exempt-by-spacing' | 'undersized';

function judge(target: Measured, others: Measured[]): Verdict {
  if (target.w >= MIN && target.h >= MIN) return 'meets-size';
  return spacingSatisfied(target, others) ? 'exempt-by-spacing' : 'undersized';
}

/** 섀도 DOM 안쪽의 `part` 를 타깃으로 고른다. */
function parts(host: Element, part: string): Element[] {
  const root = (host as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
  return root ? Array.from(root.querySelectorAll(`[part~="${part}"]`)) : [];
}

/**
 * 🔴**hit-test 축**(cycle-553 · 세 게이트 공통) — 타깃의 중심과 1px 안쪽 네 가장자리를 실제로 누르면 그 타깃이 받는가.
 *
 * `getBoundingClientRect` 는 조상의 `overflow` 가 자른 부분도, 닫혀서 보이지 않는 요소의 박스도 그대로 보고한다 — 크기만
 * 재면 ***보이지도 눌리지도 않는 타깃이 통과한다.*** 실제로 그랬다: components 게이트의 `u-input` 접미 아이콘(좁은 필드에서
 * 밖으로 밀려나 잘렸다)과, 닫힌 채 띄운 대화상자 픽스처(닫기 버튼 중심을 누르면 `body` 가 받았다).
 *
 * - **사용자가 스크롤로 닿을 수 있으면 닿는 것이다** — 점마다, 그 점이 보이도록 `overflow: auto|scroll` 조상과 창만 스크롤한
 *   뒤 잰다(cycle-554: 표·시트·블록이 러너의 좁은 뷰포트를 넘어 `elementFromPoint` 가 `null` 을 돌려줬고, 뷰포트보다 넓은
 *   타깃은 양 끝을 한 화면에 담을 수 없다). `overflow: hidden|clip` 조상은 사용자가 움직일 수 없으므로 **건드리지 않는다** —
 *   `scrollIntoView` 는 그것까지 스크롤해 잘린 타깃을 통과시킨다. 움직인 스크롤은 점마다 돌려놓는다.
 * - 판정은 타깃이 속한 트리(`getRootNode()`)에서 한다. 그 트리로 retarget 되어 **호스트**가 돌아오면, 그 점이 타깃 안
 *   `<slot>` 에 꽂힌 라이트 DOM 내용 위일 때 타깃이 받은 것으로 센다(링크 안에 꽂힌 글자 등).
 * - ⚠**이웃 타깃이 받은 것은 봐주지 않는다.** 붙어 있는 격자 셀의 경계선 때문에 가장자리를 이웃에 양보하는 면제를
 *   시험해 봤지만(cycle-554), 네거티브 컨트롤로 끄자 **어떤 픽스처도 빨개지지 않았다** — 셀 가장자리의 불일치는 경계선이
 *   아니라 뷰포트 밖이었다. 쓰이지 않는 면제는 조용한 미탐이라 걷어냈다. 필요해지면 그 픽스처가 빨강으로 알린다.
 *
 * ⚠이 헬퍼는 세 게이트(components · chat-components · data-components)에 **같은 코드로** 한 벌씩 있다 — 고치면 셋 다.
 */
type HitPoint = readonly [name: string, fx: number, fy: number, ox: number, oy: number];

const HIT_POINTS: HitPoint[] = [
  ['중심', 0.5, 0.5, 0, 0],
  ['왼', 0, 0.5, 1, 0],
  ['오른', 1, 0.5, -1, 0],
  ['위', 0.5, 0, 0, 1],
  ['아래', 0.5, 1, 0, -1],
];

function describeEl(el: Element | null): string {
  if (!el) return 'null';
  const cls = el.getAttribute('class');
  return `${el.localName}${cls ? `.${cls.split(' ')[0]}` : ''}`;
}

function unreachablePoints(el: Element): Array<{ point: string; hit: string }> {
  const root = el.getRootNode() as Document | ShadowRoot;
  const host = root instanceof ShadowRoot ? root.host : null;
  const at = (p: HitPoint): [number, number] => {
    const r = el.getBoundingClientRect();
    return [r.left + r.width * p[1] + p[3], r.top + r.height * p[2] + p[4]];
  };
  const misses: Array<{ point: string; hit: string }> = [];
  for (const p of HIT_POINTS) {
    const restore = revealPoint(el, () => at(p));
    try {
      const [x, y] = at(p);
      const hit = root.elementFromPoint(x, y);
      const ok = !!hit && (hit === el || el.contains(hit) || (hit === host && slottedContentAt(el, x, y)));
      if (!ok) misses.push({ point: p[0], hit: describeEl(hit) });
    } finally {
      restore();
    }
  }
  return misses;
}

/** 평탄 트리의 부모 — 슬롯에 꽂혔으면 그 슬롯, 섀도 루트면 그 호스트. */
function flatParent(node: Node): Element | null {
  const slot = (node as Element).assignedSlot;
  if (slot) return slot;
  const parent = node.parentNode;
  if (parent instanceof ShadowRoot) return parent.host;
  return parent instanceof Element ? parent : null;
}

/** 그 점이 보이도록 사용자가 스크롤할 수 있는 조상과 창을 움직인다. 돌려놓는 함수를 돌려준다. */
function revealPoint(el: Element, point: () => [number, number]): () => void {
  const moved: Array<[Element, number, number]> = [];
  for (let a = flatParent(el); a && a !== document.documentElement && a !== document.body; a = flatParent(a)) {
    const cs = getComputedStyle(a);
    const canX = /auto|scroll/.test(cs.overflowX) && a.scrollWidth > a.clientWidth;
    const canY = /auto|scroll/.test(cs.overflowY) && a.scrollHeight > a.clientHeight;
    if (!canX && !canY) continue;
    const [x, y] = point();
    const box = a.getBoundingClientRect();
    const left = box.left + a.clientLeft;
    const top = box.top + a.clientTop;
    const before: [Element, number, number] = [a, a.scrollLeft, a.scrollTop];
    if (canX && (x < left || x >= left + a.clientWidth)) a.scrollLeft += x - (left + a.clientWidth / 2);
    if (canY && (y < top || y >= top + a.clientHeight)) a.scrollTop += y - (top + a.clientHeight / 2);
    if (a.scrollLeft !== before[1] || a.scrollTop !== before[2]) moved.push(before);
  }
  const wx = window.scrollX;
  const wy = window.scrollY;
  const [x, y] = point();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const dx = x < 0 || x >= vw ? x - vw / 2 : 0;
  const dy = y < 0 || y >= vh ? y - vh / 2 : 0;
  if (dx || dy) window.scrollBy(dx, dy);
  return () => {
    window.scrollTo(wx, wy);
    for (const [a, l, t] of moved.reverse()) {
      a.scrollLeft = l;
      a.scrollTop = t;
    }
  };
}

/** 타깃 안 `<slot>` 에 꽂힌 라이트 DOM 내용 중 그 점을 덮는 것이 있는가. */
function slottedContentAt(el: Element, x: number, y: number): boolean {
  for (const slot of Array.from(el.querySelectorAll('slot'))) {
    for (const n of slot.assignedNodes({ flatten: true })) {
      let rects: DOMRect[];
      if (n instanceof Element) {
        rects = [n.getBoundingClientRect()];
      } else {
        const range = document.createRange();
        range.selectNodeContents(n);
        rects = Array.from(range.getClientRects());
      }
      if (rects.some((q) => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom)) return true;
    }
  }
  return false;
}

/** 폼 컨트롤의 «보이는» 접미 아이콘 버튼 — 조건부로 그려지는 것은 `hidden` 으로 DOM 에 남아 0x0 이 되므로 거른다. */
function suffixButtons(tag: string): Element[] {
  const root = document.querySelector(tag)!.shadowRoot!;
  return Array.from(root.querySelectorAll<HTMLElement>('.suffix-item[role="button"]')).filter((el) => !el.hidden);
}

// ---------------------------------------------------------------------------
// 규칙 — 손으로 쓴다 (도출할 수 없는 우리 지식)
// ---------------------------------------------------------------------------

/**
 * 포인터 타깃이 아닌 것 — 정적 표시·레이아웃 컨테이너·장식, 그리고 «트리거를 소비자가
 * 제공하는» 오버레이 컨테이너. SC 2.5.8 은 «사용자가 활성화하는 영역»에 적용되므로
 * 이것들에 자를 대면 정당한 컴포넌트 전건에 발화한다.
 */
const NOT_A_TARGET = new Set([
  'u-avatar', 'u-badge', 'u-breadcrumb', 'u-button-group', 'u-card', 'u-divider',
  'u-field', 'u-form', 'u-icon', 'u-menu', 'u-panel', 'u-popover', 'u-progress-bar',
  'u-progress-ring', 'u-skeleton', 'u-spinner', 'u-tab-panel', 'u-tag',
  'u-text', 'u-tooltip', 'u-tree',
]);

/**
 * 타깃을 «갖고 있지만» 아직 대표 픽스처를 쓰지 않은 것 — 대부분 열린 상태나 부수 컨트롤
 * (닫기 버튼·화살표·드래그 핸들·제거 버튼)이 타깃이라 상태를 만들어야 잰다.
 * ⚠**이 목록은 「통과」가 아니라 「미판정」이다.**
 */
const NEEDS_FIXTURE = new Set<string>([]);

/**
 * 🔴**측정 결과 미달인데 «치수를 올리는 것이 시각적 공개 계약 변경»이라 사람 판단이 필요한 것.**
 *
 * §C-A 가 채택한 순서(게이트 → 위반 확정 → 치수 조정 → 선언 상향)의 «위반 확정» 자리다.
 * 여기 있는 동안 이 파일은 그것을 **미달로 단언**하므로 스위트는 초록이고, 치수를 올리면
 * 빨개진다 — 그때 이 집합에서 빼는 것이 완료 신호다(cycle-479 가 쓴 것과 같은 장치).
 *
 * `u-slider`(thumb 18×18)가 첫 항목이었고 cycle-492 가 사람 결정(§C-A ⑷ ⑵안 — 히트 영역만
 * 넓힌다)에 따라 해소했다. 새로 핀을 넣을 때는 **왜 자율로 고칠 수 없는지**(선택지가 둘 이상인
 * 시각 계약 변경인지)를 여기 함께 적을 것.
 *
 * ✅**`u-split-panel`**(cycle-539 핀 → cycle-540 해소) — 분할 핸들이 4px 라 핀으로 뒀고, 사람
 * 결정(HD-55 ⑷)으로 **레이아웃 거터**가 됐다: 핸들 박스가 24px 공간을 차지하고 보이는 선은
 * 4px 그대로다. `u-slider` 식(포인터 영역만 겹쳐 넓힘)을 쓰지 않은 이유 — 핸들 양옆이 패널이고
 * 패널마다 `overflow: auto` 라 스크롤바가 핸들에 붙어 있다. 두 축은
 * `split-panel-handle.browser.test.ts` 가 잰다.
 */
/* ✅**`u-input` 접미 아이콘 넷의 핀은 `HD-57` ⒜ 채택으로 해소됐다**(2026-09-12) — 아이콘 사이 간격 0.25→0.5em ·
   스테퍼 글리프 0.85→1em · 좌우 여백 0 인 변형의 컨테이너에 오른쪽 0.25em. 이제 모든 접미 아이콘이 24×24 다. */
const UNDERSIZED_PINS = new Set<string>([]);

interface Fixture {
  html: string;
  /** 이 픽스처 안의 «타깃»들. 생략하면 태그 자신. */
  targets?: (tag: string) => Element[];
  /**
   * 🔴**이 컴포넌트가 «타깃들 사이의 간격»을 스스로 소유하는가.**
   *
   * 간격 예외는 *"주변에 다른 타깃이 24px 안에 없다"* 를 요구하는데, **그 사실을 정하는 것은
   * 대개 우리가 아니라 소비앱의 배치**다. 고립된 픽스처 하나만 띄워 놓고 «이웃이 없으니
   * 통과»라고 판정하면, 소비자가 그 컨트롤을 폼이나 툴바에 나란히 놓는 순간 판정이 뒤집힌다
   * ⇒ ***그것은 통과가 아니라 우리가 모르는 것이다.***
   *
   * ⇒ 기본값은 «간격 예외를 쓰지 않는다»(크기로만 판정). 별점의 심볼들이나 라디오 항목들처럼
   * **우리 컴포넌트가 그 배치를 직접 정하는** 경우에만 켠다.
   *
   * ★이 구분은 네거티브 컨트롤이 찾아냈다 — `u-button` 을 14×14 로 줄였는데도 게이트가
   * 초록이었다(이웃이 없어 간격 예외를 받았다). ***조용한 미탐이었고, 넓은 예외가 그 원인이다.***
   *
   * 🔴**그리고 「우리가 배치를 소유하는가」만으로는 부족하다 — 「그 예외가 실제로 일하는가」를
   * 함께 물어야 한다**(cycle-496 이 기준을 바꾸고 cycle-504 가 다섯을 전수 실측했다). 소유하되
   * 크기만으로도 이미 통과하고 이웃까지의 거리가 늘 24 를 넘으면, 그 예외가 하는 일은
   * ***미탐뿐***이다 — 나중에 치수가 줄어도 게이트가 초록으로 남는다. 실측(2026-09-09):
   *
   * ```
   * u-tab      49x34 48x34            크기만통과=true  최소거리=48.4  예외가일함=false
   * u-radio    103x32 ×3              크기만통과=true  최소거리=40    예외가일함=false
   * u-option   54x32 ×2               크기만통과=true  최소거리=40    예외가일함=false
   * u-rating   25x25 ×5               크기만통과=true  최소거리=28.5  예외가일함=false
   * u-carousel 78x68 78x68 24x10 10x10 크기만통과=false 최소거리=25    예외가일함=true
   * ```
   *
   * ⇒ 넷에서 걷어냈고 `u-carousel` 만 남겼다(페이지네이션 점이 실제로 미달이고 그 간격 25px 는
   * 우리가 정한다). `u-rating` 은 25×25 로 하한을 **1px** 넘고 있어, 예외가 있는 동안에는
   * cycle-484 가 어렵게 올린 그 치수를 지키는 장치가 없었다.
   */
  spacingIsOurs?: true;
  /**
   * 🔴**타깃이 «열린 상태»에서만 렌더되면 재기 전에 그 상태를 만든다**(`HD-46` — `chat-components`
   * 게이트가 먼저 들였다). 사용자와 같은 경로(클릭·키)로 연다 — 내부 상태를 직접 세우면 «그 경로로
   * 열리는가»가 빠진다. 열리지 않으면 «타깃 0개» 단언이 빨강을 낸다(조용히 통과하지 않는다).
   */
  prepare?: (host: Element) => Promise<void>;
  /**
   * 한 태그를 여러 상태로 잴 때 그 상태의 이름(테스트 이름에 붙는다).
   * 🔴**커버리지는 태그 수와 상태 수를 함께 센다** — 태그만 세면 닫힌 상태 하나만 재도 «판정» 이
   * 되어, 열린 상태의 타깃이 빠진 것을 아무것도 말하지 않는다.
   */
  state?: string;
}

/** 실제로 재는 것 — 대표 픽스처와 그 안의 타깃. 한 태그에 상태가 여럿이면 배열로 둔다. */
const FIXTURES: Record<string, Fixture | Fixture[]> = {
  'u-button': [
    { state: '기본', html: '<u-button>OK</u-button>' },
    // `sm` 은 크기 축(font-size 12px — 여백·최소 높이가 em 이라 비례한다)이다. 달력의 «Today» 가 정확히 이
    // 조합(`variant="ghost" size="sm"`)으로 그려진다 — 거기서 재지 않고 여기서 재는 이유는 `DL-536-1`.
    { state: 'sm', html: '<u-button variant="ghost" size="sm">Today</u-button>' },
    // 가장 좁은 `sm` — 아이콘만 든 버튼(글자 폭에 기대지 못한다).
    { state: 'sm 아이콘', html: '<u-button size="sm" aria-label="Close"><u-icon name="close"></u-icon></u-button>' },
  ],
  'u-icon-button': { html: '<u-icon-button name="close"></u-icon-button>' },
  'u-copy-button': { html: '<u-copy-button value="x"></u-copy-button>' },
  'u-checkbox': { html: '<u-checkbox></u-checkbox>' },
  'u-switch': { html: '<u-switch></u-switch>' },
  'u-input': [
    { state: '기본', html: '<u-input style="width:200px"></u-input>' },
    {
      state: '목록',
      // 기본 슬롯에 `u-option` 을 넣으면 콤보박스가 된다. 팝오버는 `trigger="focus"` 라 **포커스**가 연다(클릭이 아니다).
      // 항목은 라이트 DOM 자식이라 닫혀도 DOM 에 있다 — `u-select [목록]` 과 같은 규칙: 팝오버 `open` 을 기다리고 안 열리면 던진다.
      html: '<u-input style="width:200px"><u-option value="apple">Apple</u-option>' +
        '<u-option value="banana">Banana</u-option><u-option value="cherry">Cherry</u-option></u-input>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        (root.querySelector('input') as HTMLInputElement).focus();
        const popover = root.querySelector('u-popover')!;
        for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!popover.hasAttribute('open')) throw new Error('콤보박스 목록이 열리지 않았다 — 닫힌 항목을 재면 미탐이다');
      },
      targets: () => Array.from(document.querySelectorAll('u-input > u-option')),
    },
    // 접미 아이콘 버튼(`u-icon.suffix-item[role=button]`) — 지우기 · 비밀번호 토글 · 스테퍼. 전부 조건부로만 그려져
    // 기본 픽스처에서는 `hidden` 이다(재지 않고 있었다). 한 입력 안에서 **나란히** 놓일 수 있으므로 그 간격은
    // 우리가 정한다 ⇒ 쌍을 재는 상태는 `spacingIsOurs`.
    {
      state: '지우기',
      html: '<u-input clearable value="abc" style="width:200px"></u-input>',
      targets: () => suffixButtons('u-input'),
    },
    {
      state: '비밀번호',
      html: '<u-input type="password" value="abc" style="width:200px"></u-input>',
      targets: () => suffixButtons('u-input'),
    },
    {
      state: '비밀번호+지우기',
      html: '<u-input type="password" clearable value="abc" style="width:200px"></u-input>',
      targets: () => suffixButtons('u-input'),
      spacingIsOurs: true,
    },
    {
      state: '숫자',
      html: '<u-input type="number" value="1" style="width:200px"></u-input>',
      targets: () => suffixButtons('u-input'),
      spacingIsOurs: true,
    },
    // 좌우 여백이 0 인 변형 — 맨 뒤 아이콘이 오른쪽으로 넓힐 자리가 없다(컨테이너가 `overflow: hidden` 이라 넓혀도 잘린다).
    {
      state: '지우기 · 밑줄',
      html: '<u-input variant="underlined" clearable value="abc" style="width:200px"></u-input>',
      targets: () => suffixButtons('u-input'),
    },
    {
      state: '지우기 · 테두리 없음',
      html: '<u-input variant="borderless" clearable value="abc" style="width:200px"></u-input>',
      targets: () => suffixButtons('u-input'),
    },
  ],
  'u-textarea': { html: '<u-textarea style="width:200px"></u-textarea>' },
  'u-select': [
    { state: '닫힘', html: '<u-select style="width:200px"><u-option value="a">A</u-option></u-select>' },
    {
      state: '지우기',
      // 값이 있을 때만 그려지는 지우기 «x» — 트리거(`.container`) 안에 있지만 **다른 일**(값 지우기)을 하는
      // 별도 타깃이다(`stopPropagation` 으로 트리거 클릭을 막는다). 트리거가 크다고 이 타깃이 커지지 않는다.
      html: '<u-select clearable value="a" style="width:200px"><u-option value="a">A</u-option></u-select>',
      targets: () => suffixButtons('u-select'),
    },
    {
      state: '목록',
      // 목록 항목(`u-option`)은 라이트 DOM 자식이 팝오버 슬롯에 꽂힌 것이다.
      // 🔴**달력과 달리 항목은 닫힌 상태에서도 DOM 에 있다** — 팝오버는 `[open]` 전까지
      //   `visibility: hidden` 이고 그래도 레이아웃은 잡힌다. 그래서 «타깃이 나타날 때까지» 는
      //   열림의 신호가 되지 못한다: 열기에 실패해도 숨은 항목을 재고 초록이 된다. ⇒ 팝오버의
      //   `open` 을 기다리고, 끝내 열리지 않으면 **던진다**.
      html: '<u-select style="width:200px"><u-option value="a">A</u-option>' +
        '<u-option value="b">B</u-option><u-option value="c">C</u-option></u-select>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        (root.querySelector('.container') as HTMLElement).click();
        const popover = root.querySelector('u-popover')!;
        for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!popover.hasAttribute('open')) throw new Error('목록 팝오버가 열리지 않았다 — 닫힌 항목을 재면 미탐이다');
      },
      targets: () => Array.from(document.querySelectorAll('u-select > u-option')),
    },
    {
      state: '검색',
      // `searchable` 은 목록 팝오버 맨 위에 검색 입력을 그린다(섀도 안 `.search-input input`). 포인터를 받는 것은
      // 감싼 `div` 가 아니라 `<input>` 이다 — div 의 여백을 눌러도 입력에 포커스가 가지 않는다. 열림 신호는 목록과 같다.
      html: '<u-select searchable style="width:200px"><u-option value="a">A</u-option><u-option value="b">B</u-option></u-select>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        (root.querySelector('.container') as HTMLElement).click();
        const popover = root.querySelector('u-popover')!;
        for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!popover.hasAttribute('open')) throw new Error('목록 팝오버가 열리지 않았다 — 닫힌 입력을 재면 미탐이다');
      },
      targets: () => [document.querySelector('u-select')!.shadowRoot!.querySelector('.search-input input')!],
    },
  ],
  'u-file-input': { html: '<u-file-input></u-file-input>' },
  'u-date-picker': [
    { state: '닫힘', html: '<u-date-picker></u-date-picker>' },
    {
      state: '달력',
      // 달력(날짜 버튼 · 이전/다음 달)은 `.container` 를 눌러 팝오버가 `show` 를 낸 뒤에만 렌더된다.
      // 팝오버의 열림은 비동기일 수 있어(지연 타이머) 고정 대기가 아니라 «날짜 버튼이 나타날 때까지»
      // 짧게 기다린다 — 끝내 안 나타나면 «타깃 0개» 단언이 빨강을 낸다.
      // ⚠바닥의 «Today»(`u-button size="sm"`)는 재지 않는다 — 그 치수는 `u-button` 의 `sm` 계약이라
      //   그쪽 픽스처의 상태로 재야 한다. 여기서 재면 `u-button` 한 곳의 미달이 달력 전체를 핀에 묶는다.
      html: '<u-date-picker></u-date-picker>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        (root.querySelector('.container') as HTMLElement).click();
        for (let i = 0; i < 50 && !root.querySelector('button.day'); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
      },
      targets: () => Array.from(
        document.querySelector('u-date-picker')!.shadowRoot!
          .querySelectorAll('button.day, .calendar-header u-icon-button'),
      ),
    },
    {
      state: '시간',
      // `mode="datetime"` 이면 달력 아래에 시간 입력(`input.time-input[type=time]` · `calendar-time` 파트)이 붙는다.
      // 달력과 함께 열린 뒤에만 그려지므로 «시간 입력이 나타날 때까지» 가 곧 열림 신호다 — 안 나타나면 던진다.
      html: '<u-date-picker mode="datetime"></u-date-picker>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        (root.querySelector('.container') as HTMLElement).click();
        for (let i = 0; i < 50 && !root.querySelector('.time-input'); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!root.querySelector('.time-input')) throw new Error('datetime 달력의 시간 입력이 나타나지 않았다');
      },
      targets: () => [document.querySelector('u-date-picker')!.shadowRoot!.querySelector('.time-input')!],
    },
  ],
  // ⚠제목 속성은 `label` 이다 — `header` 는 슬롯 이름이라, 종전 `header="More"` 는 **빈 제목**을 재고 있었다.
  'u-expander': { html: '<u-expander label="More">body</u-expander>' },
  'u-tab': { html: '<u-tab-panel><u-tab>One</u-tab><u-tab>Two</u-tab></u-tab-panel>' },
  'u-menu-item': [
    { state: '닫힘', html: '<u-menu><u-menu-item>Item</u-menu-item></u-menu>' },
    {
      state: '서브메뉴',
      // 기본(`inline` 아님) 메뉴에서 하위 항목은 부모의 `u-popover`(`trigger="hover"` · `open` ⇐ `expanded`)에 꽂힌다.
      // 헤더 클릭도 `expanded` 를 토글한다 — 호버 대신 클릭으로 연다(포인터 위치에 기대지 않는다).
      // 하위 항목은 라이트 DOM 자식이라 닫혀도 DOM 에 있다 ⇒ 팝오버 `open` 을 기다리고 안 열리면 던진다.
      html: '<u-menu><u-menu-item>Parent<u-menu-item>Child A</u-menu-item><u-menu-item>Child B</u-menu-item></u-menu-item></u-menu>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        for (let i = 0; i < 50 && !root.querySelector('u-popover'); i++) await new Promise((r) => setTimeout(r, 20));
        (root.querySelector('.header') as HTMLElement).click();
        const popover = root.querySelector('u-popover')!;
        for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!popover.hasAttribute('open')) throw new Error('서브메뉴 팝오버가 열리지 않았다 — 닫힌 항목을 재면 미탐이다');
      },
      targets: () => Array.from(document.querySelectorAll('u-menu-item u-menu-item')),
    },
    {
      state: '인라인 하위',
      // `u-menu inline` 은 하위 항목을 팝오버가 아니라 제자리(`.submenu[open]`)에 펼친다 — 들여쓰기가 폭을 줄인다.
      html: '<u-menu inline><u-menu-item>Parent<u-menu-item>Child A</u-menu-item><u-menu-item>Child B</u-menu-item></u-menu-item></u-menu>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        (root.querySelector('.header') as HTMLElement).click();
        const sub = () => root.querySelector('.submenu') as HTMLElement | null;
        for (let i = 0; i < 50 && !sub()?.hasAttribute('open'); i++) await new Promise((r) => setTimeout(r, 20));
        if (!sub()?.hasAttribute('open')) throw new Error('인라인 하위 메뉴가 펼쳐지지 않았다');
      },
      targets: () => Array.from(document.querySelectorAll('u-menu-item u-menu-item')),
    },
  ],
  'u-tree-item': [
    { state: '닫힘', html: '<u-tree><u-tree-item>Node</u-tree-item></u-tree>' },
    {
      state: '펼침 토글',
      // 자식이 있는 항목만 토글(`.prefix-toggler` — 자체 `@click`)을 그린다. 자식 슬롯의 `slotchange` 뒤에
      // `leaf` 가 풀리므로 «토글이 보일 때까지» 기다린다 — 끝내 안 보이면 0×0 을 재지 않도록 던진다.
      // 🔴`trigger="icon"` 에서는 토글이 **펼치는 유일한 포인터 경로**다(행 클릭은 선택만) — 행이라는 더 큰
      // 동등 타깃이 없으므로 SC 2.5.8 의 «동등 컨트롤» 예외가 서지 않는다. 기본(`item`)이어도 선택 가능한
      // 트리에서는 «선택하지 않고 펼치기» 가 토글만의 일이라 같은 사정이다.
      html: '<u-tree trigger="icon"><u-tree-item>Parent<u-tree-item>Child</u-tree-item></u-tree-item></u-tree>',
      prepare: async (host) => {
        const toggler = () => host.shadowRoot!.querySelector('.prefix-toggler') as HTMLElement | null;
        for (let i = 0; i < 50 && (!toggler() || toggler()!.hidden); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!toggler() || toggler()!.hidden) throw new Error('자식이 있는 항목의 토글이 나타나지 않았다');
      },
      targets: () => [document.querySelector('u-tree-item')!.shadowRoot!.querySelector('.prefix-toggler')!],
    },
    {
      state: '체크',
      // `checkable` 트리의 체크박스(`.prefix-checkbox` — 자체 `@click` 으로 `check` 를 낸다. 헤더 클릭은 체크하지
      // 않으므로 동등 타깃이 없다). 토글과 **나란히** 있는 행을 재서, 두 우리 타깃이 서로의 영역을 먹지 않는지까지
      // 본다 — 타깃 둘을 함께 넘기고 크기로만 판정한다.
      html: '<u-tree checkable><u-tree-item>Parent<u-tree-item>Child</u-tree-item></u-tree-item></u-tree>',
      prepare: async (host) => {
        const root = host.shadowRoot!;
        const visible = (sel: string) => {
          const el = root.querySelector(sel) as HTMLElement | null;
          return !!el && !el.hidden;
        };
        for (let i = 0; i < 50 && !(visible('.prefix-toggler') && visible('.prefix-checkbox')); i++) {
          await new Promise((r) => setTimeout(r, 20));
        }
        if (!(visible('.prefix-toggler') && visible('.prefix-checkbox'))) {
          throw new Error('토글과 체크박스가 함께 나타나지 않았다');
        }
      },
      targets: () => {
        const root = document.querySelector('u-tree-item')!.shadowRoot!;
        return [root.querySelector('.prefix-toggler')!, root.querySelector('.prefix-checkbox')!];
      },
    },
  ],
  // 항목은 `href` 가 있을 때만 링크(`a[part=link]`)를 그리는 타깃이고, **마지막 항목은 현재 페이지**라 브레드크럼이
  // `pointer-events: none` 을 준다. 종전 픽스처(항목 하나 · `href` 없음)는 두 겹으로 타깃이 아닌 것을 재고 통과했다
  // (cycle-553 hit-test 축 — 다섯 점 모두 부모가 받았다). ⇒ 링크 항목 + 현재 항목, 앞의 것만 잰다.
  'u-breadcrumb-item': {
    html: '<u-breadcrumb><u-breadcrumb-item href="#home">Home</u-breadcrumb-item><u-breadcrumb-item>Page</u-breadcrumb-item></u-breadcrumb>',
    targets: () => [document.querySelector('u-breadcrumb-item')!],
  },

  // 타깃이 호스트가 아닌 것들 — cycle-485 가 확인한 함정이다(빈 컨테이너를 재면 0x0).
  'u-radio': {
    html: '<u-radio name="s" value="md"><u-option value="sm">Small</u-option>' +
      '<u-option value="md">Medium</u-option><u-option value="lg">Large</u-option></u-radio>',
    targets: () => Array.from(document.querySelectorAll('u-option')),
  },
  'u-option': {
    html: '<u-radio name="s"><u-option value="a">A</u-option><u-option value="b">B</u-option></u-radio>',
    targets: () => Array.from(document.querySelectorAll('u-option')),
  },
  'u-rating': {
    html: '<u-rating value="3"></u-rating>',
    targets: () => parts(document.querySelector('u-rating')!, 'symbol'),
  },
  'u-slider': {
    html: '<u-slider style="width:200px" value="50"></u-slider>',
    targets: () => parts(document.querySelector('u-slider')!, 'thumb'),
  },

  // 부수 컨트롤(닫기·제거·이동)이 타깃인 것들 — cycle-487.
  'u-alert': {
    html: '<u-alert open closable>Message</u-alert>',
    targets: () => parts(document.querySelector('u-alert')!, 'close-btn'),
  },
  'u-chip': {
    html: '<u-chip removable>tag</u-chip>',
    targets: () => parts(document.querySelector('u-chip')!, 'remove'),
  },
  // ⚠`open` 이어야 닫기 버튼이 화면에 있다 — 종전 픽스처는 닫힌 대화상자를 띄워 **보이지 않는 버튼의 박스**를 재고 통과했다
  //   (cycle-553 hit-test 축이 찾았다: 중심을 누르면 `body` 가 받았다).
  'u-dialog': {
    html: '<u-dialog closable open>body</u-dialog>',
    targets: () => parts(document.querySelector('u-dialog')!, 'close-btn'),
  },
  'u-drawer': {
    html: '<u-drawer closable open>body</u-drawer>',
    targets: () => parts(document.querySelector('u-drawer')!, 'close-btn'),
  },
  'u-carousel': {
    // ⚠`navigation`·`pagination` 을 켜야 화살표·인디케이터가 렌더된다 — 끄면 `hidden` 이라
    //   **0x0 이 나오고 그것을 «통과»로 읽으면 미탐이다**(cycle-485·486 이 세 번 밟은 함정).
    html: '<u-carousel navigation pagination loop style="width:300px;height:150px">' +
      '<div>1</div><div>2</div></u-carousel>',
    targets: () => {
      const c = document.querySelector('u-carousel')!;
      return [...parts(c, 'prev-button'), ...parts(c, 'next-button'), ...parts(c, 'dot')];
    },
    spacingIsOurs: true,
  },
  'u-split-panel': {
    // 🔴**분할 핸들은 컴포넌트가 스스로 만든다**(`createSplitter` — `pointerdown`·`dblclick` 을 건다).
    //   `splitter` 슬롯의 내용은 그 안에 복제되는 장식일 뿐이다. 패널 둘이면 핸들 하나이고, 가로
    //   방향(기본)이라 폭이 `max(--splitter-size, --splitter-hit-size)`(24px)다. 간격 예외를 켜지
    //   않는다 — 이웃이 없어 켜면 «혼자라서 통과» 가 된다(위 `spacingIsOurs` 주석).
    html: '<u-split-panel style="width:300px;height:120px"><div>A</div><div>B</div></u-split-panel>',
    targets: () => parts(document.querySelector('u-split-panel')!, 'splitter'),
  },
};

async function mount(html: string): Promise<void> {
  document.body.innerHTML = `<div style="padding:40px">${html}</div>`;
  await new Promise((r) => setTimeout(r, 80));
}

/** 배럴이 등록한 태그 전부 — 손으로 열거하지 않는다. */
const registered: string[] = [];

beforeAll(async () => {
  const original = customElements.define.bind(customElements);
  customElements.define = ((name: string, ctor: CustomElementConstructor, opts?: ElementDefinitionOptions) => {
    registered.push(name);
    return original(name, ctor, opts);
  }) as typeof customElements.define;
  await import('../../src/index.js');
  customElements.define = original;
});

describe('WCAG 2.2 SC 2.5.8 — 타깃 크기(최소) 게이트', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('규칙 자체 — 간격 예외 모델링', () => {
    it('24×24 이상이면 간격과 무관하게 통과한다', () => {
      const t = { w: 24, h: 24, cx: 0, cy: 0 };
      expect(judge(t, [{ w: 24, h: 24, cx: 1, cy: 0 }])).toBe('meets-size');
    });

    it('🔴미달이어도 중심 간 24px 이상이면 «간격 예외»로 통과한다', () => {
      const t = { w: 16, h: 16, cx: 0, cy: 0 };
      expect(judge(t, [{ w: 16, h: 16, cx: 24, cy: 0 }])).toBe('exempt-by-spacing');
    });

    it('🔴미달이고 중심 간 24px 미만이면 위반이다', () => {
      const t = { w: 16, h: 16, cx: 0, cy: 0 };
      expect(judge(t, [{ w: 16, h: 16, cx: 23.9, cy: 0 }])).toBe('undersized');
    });

    it('⚪NEGATIVE — 이웃이 없으면 미달이어도 «간격 예외»다 (혼자 있는 타깃)', () => {
      expect(judge({ w: 10, h: 10, cx: 0, cy: 0 }, [])).toBe('exempt-by-spacing');
    });

    it('⚪NEGATIVE — 대각선 거리도 유클리드로 잰다 (축별로 재면 틀린다)', () => {
      // (17,17) 은 축별로는 둘 다 24 미만이지만 유클리드 거리는 24.04 다.
      expect(judge({ w: 16, h: 16, cx: 0, cy: 0 }, [{ w: 16, h: 16, cx: 17, cy: 17 }]))
        .toBe('exempt-by-spacing');
    });

    it('⚪NEGATIVE — 빈 컨테이너(0x0)는 위반이 아니다', () => {
      // cycle-485: `<u-radio></u-radio>` 가 0x0 인 것은 컨테이너라서지 결함이 아니다.
      expect(judge({ w: 0, h: 0, cx: 0, cy: 0 }, [])).toBe('exempt-by-spacing');
    });
  });

  describe('규칙 자체 — hit-test 축', () => {
    const pointsOf = (el: Element) => unreachablePoints(el).map((m) => m.point);
    const ALL = ['중심', '왼', '오른', '위', '아래'];

    it('보이는 버튼은 다섯 점 모두 닿는다 — 자손(글자·아이콘)이 받아도 그 버튼이 받은 것이다', async () => {
      await mount('<button style="width:60px;height:30px"><span style="display:block">OK</span></button>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
    });

    it('🔴조상 overflow 에 통째로 잘린 버튼은 다섯 점 모두 닿지 않는다 — 박스는 그대로 보고되는데도', async () => {
      await mount('<div style="width:40px;height:30px;overflow:hidden;position:relative">' +
        '<button style="position:absolute;left:50px;width:30px;height:30px">x</button></div>');
      const button = document.querySelector('button')!;
      expect(Math.round(button.getBoundingClientRect().width), '크기만 보면 통과처럼 보인다').toBe(30);
      expect(pointsOf(button)).toEqual(ALL);
    });

    it('🔴반쯤 잘린 버튼은 잘린 쪽 가장자리만 닿지 않는다 (중심만 재면 놓친다)', async () => {
      await mount('<div style="width:40px;height:30px;overflow:hidden;position:relative">' +
        '<button style="position:absolute;left:20px;width:30px;height:30px">x</button></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual(['오른']);
    });

    it('🔴다른 요소에 덮인 버튼은 닿지 않는다', async () => {
      await mount('<div style="position:relative"><button style="width:30px;height:30px">x</button>' +
        '<div style="position:absolute;inset:0;width:30px;height:30px"></div></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual(ALL);
    });

    it('뷰포트 밖이어도 창을 스크롤해 닿으면 닿는다 — 그리고 스크롤은 돌려놓는다', async () => {
      await mount('<div style="width:3000px"><button style="margin-left:2600px;width:30px;height:30px">x</button></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
      expect(window.scrollX).toBe(0);
    });

    it('🔴뷰포트보다 넓은 타깃도 양 끝이 닿는다 — 점마다 드러낸다', async () => {
      await mount('<button style="width:2500px;height:30px">wide</button>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
    });

    it('사용자 스크롤 컨테이너(overflow:auto) 밖에 있는 타깃은 그 컨테이너를 스크롤해 닿는다', async () => {
      // ⚠높이는 가로 스크롤바가 생겨도 버튼(30)이 들어갈 만큼 — 40 이면 스크롤바가 위아래 끝을 가려 픽스처가 틀린다.
      await mount('<div id="sc" style="width:100px;height:60px;overflow:auto"><div style="width:600px">' +
        '<button style="margin-left:500px;width:30px;height:30px">x</button></div></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
      expect(document.getElementById('sc')!.scrollLeft).toBe(0);
    });

    it('🔴overflow:hidden 컨테이너는 스크롤하지 않는다 — 잘린 타깃은 잘린 채로 남는다(scrollIntoView 는 이것을 드러낸다)', async () => {
      await mount('<div style="width:100px;height:40px;overflow:hidden"><div style="width:600px">' +
        '<button style="margin-left:500px;width:30px;height:30px">x</button></div></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual(ALL);
    });

    it('섀도 안 링크에 슬롯으로 꽂힌 글자 위의 점도 그 링크가 받은 것으로 센다(retarget 보정)', async () => {
      const name = 'zz-hit-slot-link';
      if (!customElements.get(name)) {
        customElements.define(name, class extends HTMLElement {
          constructor() {
            super();
            this.attachShadow({ mode: 'open' }).innerHTML =
              '<a href="#x" style="display:inline-block;padding:4px"><slot></slot></a>';
          }
        });
      }
      await mount(`<${name}>Linked text</${name}>`);
      expect(pointsOf(document.querySelector(name)!.shadowRoot!.querySelector('a')!)).toEqual([]);
    });

    it('⚪NEGATIVE — 이웃 타깃이 가장자리를 덮어도 봐주지 않는다 (이웃에 양보하는 면제는 없다)', async () => {
      await mount('<div style="display:flex"><button id="a" style="width:40px;height:30px;margin-right:-3px">a</button>' +
        '<button id="b" style="width:40px;height:30px;position:relative">b</button></div>');
      expect(pointsOf(document.getElementById('a')!)).toEqual(['오른']);
    });
  });

  describe('🔴 대상 도출 — 등록된 태그가 규칙 표를 벗어나지 않는다', () => {
    it('배럴이 태그를 실제로 등록한다 (도출이 0건이면 아래 단언이 전부 공허해진다)', () => {
      expect(registered.length).toBeGreaterThan(30);
    });

    it('등록된 모든 태그가 세 집합 중 정확히 하나에 분류돼 있다', () => {
      const unclassified = registered.filter(
        (t) => !NOT_A_TARGET.has(t) && !NEEDS_FIXTURE.has(t) && !(t in FIXTURES),
      );
      expect(unclassified,
        `분류되지 않은 태그가 있다 — 새 컴포넌트라면 규칙 표에 넣을 것: ${unclassified.join(' ')}`,
      ).toEqual([]);
    });

    it('규칙 표에 «등록되지 않은» 이름이 남아 있지 않다 (표가 낡지 않게)', () => {
      const known = new Set(registered);
      const stale = [...NOT_A_TARGET, ...NEEDS_FIXTURE, ...Object.keys(FIXTURES)]
        .filter((t) => !known.has(t));
      expect(stale, `등록되지 않은 이름: ${stale.join(' ')}`).toEqual([]);
    });

    it('📌커버리지를 보고한다 — 「미판정」은 통과가 아니다', () => {
      const judged = Object.keys(FIXTURES).length;
      // 🔴상태 수를 함께 센다 — 태그만 세면 한 태그의 열린 상태를 빠뜨려도 이 줄이 변하지 않는다.
      const states = Object.values(FIXTURES).flat().length;
      const unjudged = [...NEEDS_FIXTURE].sort();
      // ⚠이 단언은 «미판정이 늘지 않았는가»를 지킨다. 픽스처를 쓰면 이 수가 줄고
      //   그때 이 줄을 함께 고치는 것이 그 작업의 완료 신호다.
      expect(
        `판정 ${judged}(${states}상태) · 미판정 ${unjudged.length}(${unjudged.join(' ')}) · 대상아님 ${NOT_A_TARGET.size}`,
      ).toBe('판정 25(43상태) · 미판정 0() · 대상아님 21');
    });
  });

  describe('실측 — 픽스처를 가진 모든 타깃', () => {
    const CASES = Object.entries(FIXTURES).flatMap(([tag, entry]) =>
      (Array.isArray(entry) ? entry : [entry]).map((fixture) => ({ tag, fixture })));
    for (const { tag, fixture } of CASES) {
      const name = `${tag}${fixture.state ? ` [${fixture.state}]` : ''}`;
      // 핀은 태그 전체(`u-slider`) 또는 한 상태(`u-input [숫자]`)에 건다 — 태그로만 걸면 이미 통과하는 다른 상태가
      // «미달이어야 한다» 단언에 걸린다.
      const pinned = UNDERSIZED_PINS.has(tag) || UNDERSIZED_PINS.has(name);
      it(`${name}: ${pinned ? '📌미달로 «핀»돼 있다 (사람 판단 대기)' : 'SC 2.5.8 을 만족한다'}`, async () => {
        await mount(fixture.html);
        if (fixture.prepare) await fixture.prepare(document.querySelector(tag)!);
        const els = fixture.targets ? fixture.targets(tag) : [document.querySelector(tag)!];
        const targets = els.map(measure);
        expect(targets.length, '타깃을 하나도 못 찾으면 이 판정은 무의미하다').toBeGreaterThan(0);

        // 🔴크기보다 먼저 — 그 타깃이 실제로 눌리는가. 잘렸거나 가려졌거나 닫혀 있으면 크기 판정은 의미가 없다.
        //   (세 게이트 공통 · 인라인 예외도 «눌린다» 는 전제는 면제하지 않는다.)
        const unreachable = els
          .map((el) => ({ el, misses: unreachablePoints(el) }))
          .filter(({ misses }) => misses.length > 0)
          .map(({ el, misses }) => `${describeEl(el)} — ${misses.map((m) => `${m.point}→${m.hit}`).join(' · ')}`);
        expect(unreachable, '누르면 다른 요소가 받는 타깃 — 잘렸거나 가려졌거나 닫혀 있다').toEqual([]);

        // 🔴간격 예외는 «우리가 배치를 소유할 때»만 쓴다 — `spacingIsOurs` 주석 참조.
        const verdicts = targets.map((t, i) =>
          fixture.spacingIsOurs ? judge(t, targets.filter((_, j) => j !== i)) : judge(t, [t]),
        );
        const detail = `실측 ${targets.map((t) => `${Math.round(t.w)}x${Math.round(t.h)}`).join(' ')} · 판정 ${verdicts.join(' ')}`;

        if (pinned) {
          // ⚠**핀이다** — cycle-479 가 §C-A ⑵에서 쓴 것과 같은 장치다. 치수를 올리면 이
          //   단언이 빨개지고, 그때 `UNDERSIZED_PINS` 에서 빼는 것이 그 작업의 완료 신호다.
          expect(verdicts.some((v) => v === 'undersized'), detail).toBe(true);
        } else {
          expect(verdicts.every((v) => v !== 'undersized'), detail).toBe(true);
        }
      });
    }
  });

  describe('📌미달 재고 — 사람 판단 대기 (§C-A 의 「위반 확정」 자리)', () => {
    it('핀 목록이 실제 미달과 일치한다 — 낡으면 위 per-tag 단언이 먼저 빨개진다', () => {
      expect([...UNDERSIZED_PINS].sort()).toEqual([]);
    });
  });

  describe('u-slider — 「히트 영역만 넓힌다」가 실제로 그렇게 됐는가 (§C-A ⑷, cycle-492)', () => {
    /* ⚠**두 축을 함께 재지 않으면 이 결정을 검증할 수 없다.** 타깃만 재면 「보이는 원까지
       커졌다」를 통과시키고, 보이는 원만 재면 「타깃이 안 커졌다」를 통과시킨다. */
    it('타깃은 24×24 이고, 보이는 원은 그대로 18×18 이다', async () => {
      await mount('<u-slider style="width:200px" value="50"></u-slider>');
      const host = document.querySelector('u-slider')!;
      const thumbs = parts(host, 'thumb').map(measure);
      expect(thumbs).toHaveLength(1);
      expect(`${Math.round(thumbs[0].w)}x${Math.round(thumbs[0].h)}`).toBe('24x24');

      const visible = host.shadowRoot!.querySelector('.thumb-content')!;
      const v = measure(visible);
      expect(`${Math.round(v.w)}x${Math.round(v.h)}`, '보이는 원이 커졌다면 시각 계약이 바뀐 것이다').toBe('18x18');
    });

    it('보이는 원의 중심이 값 위치에 그대로 있다 — 여백이 대칭이라 어긋나지 않는다', async () => {
      await mount('<u-slider style="width:200px" value="50"></u-slider>');
      const host = document.querySelector('u-slider')!;
      const target = measure(parts(host, 'thumb')[0]);
      const visible = measure(host.shadowRoot!.querySelector('.thumb-content')!);
      expect(Math.abs(target.cx - visible.cx)).toBeLessThan(0.5);
      expect(Math.abs(target.cy - visible.cy)).toBeLessThan(0.5);
    });

    /* 🔴**range 모드의 「겹치면 어느 thumb 을 잡는가」는 히트 영역과 무관하다** — `pointerdown`
       은 thumb 이 아니라 `.container` 에 걸려 있고 «값이 가까운 쪽»을 고른다(`USlider.ts`
       `handleContainerPointerDown`). 히트 영역을 넓혀도 그 선택은 바뀌지 않는다는 것을
       고정한다 — 이 사실을 모르면 「겹침 해소 규칙을 새로 만들어야 한다」로 잘못 읽는다. */
    it('range 모드에서 두 thumb 이 겹쳐도 값이 가까운 쪽이 잡힌다', async () => {
      await mount('<u-slider range style="width:200px" value="[50,52]"></u-slider>');
      const host = document.querySelector('u-slider') as HTMLElement & { value: unknown };
      const thumbs = parts(host, 'thumb').concat(parts(host, 'thumb-end')).map(measure);
      expect(thumbs).toHaveLength(2);
      // 두 히트 영역이 실제로 겹치는 상황인지부터 확인한다 — 안 겹치면 이 단언은 공허하다.
      expect(Math.abs(thumbs[0].cx - thumbs[1].cx)).toBeLessThan(24);

      const track = host.shadowRoot!.querySelector('[part~="track"]')!.getBoundingClientRect();
      const at = (pct: number) => track.left + (track.width * pct) / 100;
      host.shadowRoot!.querySelector('[part~="container"]')!
        .dispatchEvent(new PointerEvent('pointerdown', { clientX: at(51.9), bubbles: true }));
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      expect((host.value as number[])[1], '52 에 가까운 지점을 눌렀으니 max 가 움직여야 한다')
        .toBeGreaterThan(51);
    });
  });
});
