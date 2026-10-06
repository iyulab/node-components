import { isFocusable } from "tabbable";

/**
 * 이벤트가 `owner` «안의» 다른 상호작용 요소(포커스를 받는 요소)에서 왔는가.
 *
 * 항목(탭 · 트리 항목 · 메뉴 항목)은 슬롯으로 버튼 같은 컨트롤을 받는다. 그 컨트롤의 키와 클릭은 컨트롤의 것이다 —
 * `<summary>`·`<label>` 안의 상호작용 콘텐츠가 조상을 활성화하지 않는 것과 같다. 항목의 키보드 모델과 클릭 활성화는
 * 이것이 거짓일 때만 해석한다.
 *
 * 내부 모듈이다 — 배럴에서 내보내지 않는다.
 */
export function isFromNestedControl(e: Event, owner: Element): boolean {
  for (const node of e.composedPath()) {
    if (node === owner) return false;
    if (node instanceof Element && isFocusable(node)) return true;
  }
  return false;
}
