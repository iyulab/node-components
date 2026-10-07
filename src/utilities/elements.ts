/**
 * 엘리먼트의 부모 엘리먼트를 반환합니다.
 * - Shadow DOM을 지원하는 경우, Shadow DOM의 호스트 엘리먼트를 반환합니다.
 * - 일반 DOM 엘리먼트인 경우, 해당 엘리먼트를 반환합니다.
 * - 찾을 수 없는 경우 undefined을 반환합니다.
 */
export function getParentElement(element: Element): HTMLElement | undefined {
  if (element.parentElement) {
    return element.parentElement as HTMLElement;  // 일반 DOM 엘리먼트
  } else {
    const root = element.getRootNode({ composed: false });
    return root instanceof Document 
      ? root.documentElement as HTMLElement // 문서 루트 엘리먼트
      : root instanceof ShadowRoot
      ? root.host as HTMLElement  // Shadow DOM 호스트 엘리먼트
      : root instanceof HTMLElement
      ? root  // 일반 DOM 엘리먼트
      : undefined;  // 찾을 수 없는 경우
  }
}

/**
 * element의 root를 기준으로 selector와 매치되는 첫번째 HTMLElement를 반환합니다.
 * - 탐색은 element가 존재하는 shadow DOM 또는 document 루트 범위에서 이루어집니다.
 */
export function querySelectorWithin(element: Element, selectors: string): HTMLElement | null {
  if (!selectors) return null;
  const rootNode = element.getRootNode({ composed: false });
  
  // rootNode는 shadow DOM까지 탐색합니다.
  if (rootNode instanceof ShadowRoot || rootNode instanceof Document) {
    return rootNode.querySelector(selectors) as HTMLElement | null;
  } else {
    return null;
  }
}

/**
 * element의 root를 기준으로 selector와 매치되는 모든 HTMLElement를 반환합니다.
 * - 탐색은 element가 존재하는 shadow DOM 또는 document 루트 범위에서 이루어집니다.
 */
export function querySelectorAllWithin(element: Element, selectors: string): HTMLElement[] {
  if (!selectors) return [];
  const rootNode = element.getRootNode({ composed: false });

  // rootNode는 shadow DOM까지 탐색합니다.
  if (rootNode instanceof ShadowRoot || rootNode instanceof Document) {
    const nodeList = rootNode.querySelectorAll(selectors);
    return Array.from(nodeList) as HTMLElement[];
  } else {
    return [];
  }
}

/**
 * 터치/펜처럼 지속되는 hover 상태가 없는 포인터인지 여부입니다.
 * - 이런 포인터는 탭 시 `pointerenter` 직후 `pointerleave`가 뒤따르므로, hover 트리거
 *   컴포넌트가 이를 구분하지 않으면 열리자마자 닫히는 결함으로 이어집니다(모바일 실측).
 */
export function isCoarsePointer(event: PointerEvent): boolean {
  return event.pointerType === 'touch' || event.pointerType === 'pen';
}

/**
 * 포커스를 «받을 수 있는» 요소인가 — 초기 포커스 후보를 고를 때 쓴다.
 * 네이티브 포커스 요소 · `focus()` 를 재정의한(안쪽으로 넘겨 주는) 컴포넌트 · `tabindex` 를 가진 요소이고,
 * 비활성·`inert`·안 보임이 아니어야 한다. 걸러진 호스트는 그 안쪽(섀도 루트)에서 계속 찾는다.
 * `u-select` 의 섀도에는 속성 `autofocus` 를 가진 닫힌 `u-popover` 가 늘 있다 — 이것을 집으면
 * 포커스가 아무 데도 가지 않는다.
 */
export function isFocusCandidate(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const native = el.matches('input:not([type="hidden"]), select, textarea, button, a[href], [contenteditable=""], [contenteditable="true"]');
  // `focus()` 를 재정의한 컴포넌트(`u-input`·`u-select` …)는 안쪽 컨트롤로 넘겨 준다 — 호스트 자체가 후보다.
  const forwards = el.focus !== HTMLElement.prototype.focus;
  if (!native && !forwards && !el.hasAttribute('tabindex')) return false;
  if (el.matches(':disabled') || el.hasAttribute('disabled') || el.closest('[inert]')) return false;
  return typeof el.checkVisibility === 'function' ? el.checkVisibility() : true;
}

/** 스스로 클릭을 처리하는 컨트롤 — 누르면 그 컨트롤의 동작이다. */
const OWN_CLICK_SELECTOR = [
  'a[href]', 'button', 'input', 'select', 'textarea', 'label', 'summary',
  '[contenteditable=""]', '[contenteditable="true"]',
  '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="switch"]', '[role="radio"]',
  '[role="menuitem"]', '[role="option"]', '[role="tab"]',
].join(', ');

/**
 * `event` 가 `boundary` 안쪽의 컨트롤(링크 · 버튼 · 입력 칸 · 그 역할을 가진 요소)에서 났는가.
 * 행·셀처럼 «눌렀다» 를 스스로 해석하는 상자가, 그 안에 그려진 컨트롤의 클릭을 제 것으로 읽지 않게 한다
 * — 셀 안 «삭제» 버튼을 누른 것이 «이 행을 연다» 가 되면 안 된다. 열린 섀도 안쪽까지 본다(`composedPath`).
 */
export function isFromControl(event: Event, boundary: EventTarget): boolean {
  for (const node of event.composedPath()) {
    if (node === boundary) return false;
    if (node instanceof Element && node.matches(OWN_CLICK_SELECTOR)) return true;
  }
  return false;
}

/**
 * `roots` 와 그 자손에서(열린 섀도 루트 안쪽까지) `selectors` 에 맞는 첫 요소를 문서 순서로 찾는다.
 * 섀도 루트 안은 호스트 자리에서 이어서 본다 — `querySelector` 는 섀도 경계에서 멈추므로,
 * 슬롯 자식이 컴포넌트면 그 템플릿 안의 요소를 못 찾는다. `accept` 가 거른 요소도 그 안쪽은 계속 본다.
 */
export function querySelectorDeep(
  roots: Iterable<Element>,
  selectors: string,
  accept: (el: Element) => boolean = () => true,
): HTMLElement | null {
  const visit = (start: Element): HTMLElement | null => {
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT);
    for (let el = walker.currentNode as Element | null; el; el = walker.nextNode() as Element | null) {
      if (el.matches(selectors) && accept(el)) return el as HTMLElement;
      if (el.shadowRoot) {
        for (const child of Array.from(el.shadowRoot.children)) {
          const found = visit(child);
          if (found) return found;
        }
      }
    }
    return null;
  };
  for (const root of roots) {
    const found = visit(root);
    if (found) return found;
  }
  return null;
}
