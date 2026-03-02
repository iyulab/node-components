import { escapeHtmlAttr, escapeHtmlHref } from './sanitizers.js';

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
 * 지정한 태그, 속성, 내용으로 커스텀 엘리먼트 HTML 문자열을 생성합니다.
 *
 * 속성 값 처리 규칙:
 * - `null` / `undefined` → 해당 속성 생략
 * - `false` (boolean)   → 해당 속성 생략
 * - `true`  (boolean)   → 값 없이 키만 출력 (예: `disabled`)
 * - `object`            → `JSON.stringify` 후 `escapeHtmlAttr`
 * - `href` / `src` 키  → `escapeHtmlHref` 적용
 * - 그 외 string       → `escapeHtmlAttr` 적용
 *
 * `content`는 이미 안전한 HTML 문자열이라고 가정합니다 (내부 escape 없음).
 *
 * @param tag     - 커스텀 엘리먼트 태그 이름 (예: `"u-ref-tag"`)
 * @param attrs   - 속성 객체
 * @param content - 내부 HTML 문자열 (기본값: `""`)
 * @returns 생성된 HTML 문자열
 *
 * @example
 * buildElementHTML('u-ref-tag', { href: 'https://example.com', disabled: true }, 'Click');
 * // → '<u-ref-tag href="https://example.com" disabled>Click</u-ref-tag>'
 */
export function buildElementHTML(
  tag: string,
  attrs: Record<string, string | boolean | object | null | undefined> = {},
  content = ''
): string {
  const URL_ATTR = new Set(['href', 'src']);

  const attrStr = Object.entries(attrs)
    .flatMap(([k, v]) => {
      if (v === undefined || v == null || v === false) return [];
      if (v === true) return [k];
      const raw = typeof v === 'object' ? JSON.stringify(v) : String(v);
      const escaped = URL_ATTR.has(k) ? escapeHtmlHref(raw) : escapeHtmlAttr(raw);
      return [`${k}="${escaped}"`];
    })
    .join(' ');

  return attrStr
    ? `<${tag} ${attrStr}>${content}</${tag}>`
    : `<${tag}>${content}</${tag}>`;
}