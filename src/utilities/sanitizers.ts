/**
 * HTML 출력 시 XSS 방지를 위한 escape 유틸
 *
 * 컨텍스트에 맞는 함수를 사용해야 합니다.
 *
 * - escapeHtmlText : HTML 텍스트 노드에 삽입할 때
 * - escapeHtmlAttr : HTML attribute 값에 삽입할 때
 * - escapeHtmlHref : href/src 같은 URL attribute에 삽입할 때
 */


/**
 * Zero Width Space / LTR / RTL mark / BOM 등
 * 화면에 표시되지 않는 유니코드 문자를 제거합니다.
 */
export function stripZeroWidth(value: string): string {
  const ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\u200E\u200F\uFEFF]/g;

  return ZERO_WIDTH_REGEX.test(value)
    ? value.replace(ZERO_WIDTH_REGEX, '')
    : value;
}


/** HTML text context escape 대상 문자 */
const HTML_TEXT_ESCAPE_REGEX = /[&<>"']/g;

/** HTML text context escape용 문자 매핑 */
const HTML_TEXT_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * HTML 텍스트 노드(context)에 삽입할 문자열을 escape합니다.
 *
 * 예:
 *   <script> → &lt;script&gt;
 */
export function escapeHtmlText(value: string): string {
  return HTML_TEXT_ESCAPE_REGEX.test(value)
    ? value.replace(HTML_TEXT_ESCAPE_REGEX, (ch) => HTML_TEXT_ESCAPE_MAP[ch])
    : value;
}


/** HTML attribute escape 대상 문자 */
const HTML_ATTR_ESCAPE_REGEX = /[&<>"]/g;

/** HTML attribute escape용 문자 매핑 */
const HTML_ATTR_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

/**
 * HTML attribute 값(context)에 삽입할 문자열을 escape합니다.
 * 
 * 예:
 *   <div title="{value}">
 */
export function escapeHtmlAttr(value: string): string {
  return HTML_ATTR_ESCAPE_REGEX.test(value)
    ? value.replace(HTML_ATTR_ESCAPE_REGEX, (ch) => HTML_ATTR_ESCAPE_MAP[ch])
    : value;
}


/** protocol 우회 공격 방지를 위한 공백/제어문자 제거 */
const HREF_STRIP_CHARS_REGEX = /[\u0000-\u001F\u007F\s]+/g;

/** href/src에서 차단해야 하는 위험 protocol */
const HREF_UNSAFE_PROTOCOL_REGEX = /^(?:javascript|data|vbscript):/i;

/**
 * href / src attribute용 문자열 처리
 *
 * 예:
 *  <a href="{value}">
 */
export function escapeHtmlHref(value: string): string {
  // 1) zero-width 제거 + trim
  let normalized = stripZeroWidth(value).trim();

  // 2) 공백/개행/제어문자 제거 (java\nscript: 같은 protocol 우회 방지)
  if (HREF_STRIP_CHARS_REGEX.test(normalized)) {
    normalized = normalized.replace(HREF_STRIP_CHARS_REGEX, '');
  }

  // 3) backslash URL 정규화 (http:\\evil.com → http://evil.com)
  normalized = normalized.replace(/\\/g, '/');

  // 4) protocol-relative URL 차단 (//evil.com)
  if (normalized.startsWith('//')) {
    return '#';
  }

  // 5) 위험 protocol 차단 (javascript:, data:, vbscript:)
  if (HREF_UNSAFE_PROTOCOL_REGEX.test(normalized)) {
    return '#';
  }

  // 6) attribute에 안전하게 넣을 수 있도록 escape
  return escapeHtmlAttr(normalized);
}