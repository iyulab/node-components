/**
 * 엘리먼트의 부모 엘리먼트를 반환합니다.
 * Shadow DOM을 지원하는 경우, Shadow DOM의 호스트 엘리먼트를 반환합니다.
 * 일반 DOM 엘리먼트인 경우, 해당 엘리먼트를 반환합니다.
 * 찾을 수 없는 경우 undefined을 반환합니다.
 */
export function getParentElement(element: Element): HTMLElement | undefined {
  if (element.parentElement) {
    return element.parentElement as HTMLElement;  // 일반 DOM 엘리먼트
  } else {
    const root = element.getRootNode({ composed: false });
    return root instanceof Document 
      ? root.documentElement as HTMLElement 
      : root instanceof ShadowRoot
      ? root.host as HTMLElement  // Shadow DOM 호스트 엘리먼트
      : root instanceof HTMLElement
      ? root  // 일반 DOM 엘리먼트
      : undefined;  // 찾을 수 없는 경우
  }
}

/**
 * element 기준으로 selector와 매치되는 모든 HTMLElement를 반환합니다.
 * - 탐색은 element가 존재하는 shadow DOM 또는 document 루트 안에서 이루어집니다.
 */
export function findElementsBy(element: Element, selectors: string): HTMLElement[] {
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