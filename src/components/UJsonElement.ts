import { html } from 'lit';

import { buildElementHTML } from '../utilities/elements.js';
import { UElement } from './UElement.js';
import { UIcon } from './icon/UIcon.component.js';
import { styles } from './UJsonElement.styles.js';

/**
 * `UJsonElement`는 light DOM 내 `<script type="application/json">` 태그에서
 * JSON 데이터를 읽어 컴포넌트 프로퍼티에 자동으로 매핑하는 기반 클래스입니다.
 *
 * 사용 예시:
 * ```html
 * <my-component>
 *   <script type="application/json">{ "items": [1, 2, 3] }</script>
 * </my-component>
 * ```
 *
 * JSON 최상위 키가 컴포넌트의 프로퍼티 이름과 일치하면 자동으로 할당됩니다.
 */
export class UJsonElement extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
  };

  connectedCallback() {
    super.connectedCallback();
    this.load();
  }

  /**
   * 지정한 태그와 데이터로 커스텀 엘리먼트 HTML 문자열을 생성합니다.
   * 데이터는 `<script type="application/json">` 태그로 주입됩니다.
   * 태그이름이 등록되지 않은 경우 빈 문자열을 반환합니다.
   *
   * @param tag   - 커스텀 엘리먼트 태그 이름 (예: `"u-table-block"`)
   * @param json  - JSON 데이터 객체 또는 문자열
   * @param attrs - 추가 속성 객체 (선택적, `buildElementHTML` 규칙 적용)
   * @returns 생성된 HTML 문자열
   */
  public static buildHTML(
    tag: string,
    json: any,
    attrs: Record<string, string | boolean | object | null | undefined> = {}
  ): string {
    if (!customElements.get(tag)) return '';

    const jsonStr = typeof json === 'string' ? json : JSON.stringify(json);
    // HTML 파서가 </script>를 만나 조기 종료하는 것을 방지하기 위해
    // <, >, &를 JSON unicode 이스케이프로 치환합니다.
    const safe = jsonStr
      .replace(/&/g, '\\u0026')       // & 먼저 (이후 치환 결과가 재처리되지 않도록)
      .replace(/</g, '\\u003c')       // HTML 파서의 태그 해석 방지
      .replace(/>/g, '\\u003e')       // </script> 조기 종료 방지
      .replace(/\u2028/g, '\\u2028')  // JSON 문자열 내 줄바꿈 문자 방지
      .replace(/\u2029/g, '\\u2029'); // JSON 문자열 내 줄바꿈 문자 방지

    const content = `<script type="application/json">${safe}</script>`;
    return buildElementHTML(tag, attrs, content);
  }

  /**
   * `data` 객체를 컴포넌트 프로퍼티에 할당합니다.
   * `data`가 제공되지 않은 경우 light DOM 내 `<script type="application/json">` 태그에서 JSON 데이터를 읽어 프로퍼티에 자동으로 할당합니다.
   * 오류가 발생할 경우 `error()`를 호출하여 에러 UI로 대체합니다.
   *
   * @param data - JSON 데이터 객체 (선택적)
   */
  protected async load(data?: object): Promise<void> {
    try {
      // data가 제공되지 않은 경우 light DOM에서 JSON 데이터를 읽어 파싱합니다.
      if (!data) {
        const script = this.querySelector('script[type="application/json"]');
        data = JSON.parse(script?.textContent || '{}');
      }

      // data가 객체가 아닌 경우 (예: 문자열, 배열 등) 에러 처리
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('Invalid JSON data: expected an object at the top level');
      }
      
      // JSON 객체의 키를 컴포넌트 프로퍼티에 할당합니다.
      Object.assign(this, data);
    } catch (error) {
      // Lit 렌더가 끝난 후 shadow DOM에 에러 UI로 대체합니다.
      await this.error(error);
    }
  }

  /**
   * 오류 발생 시 Lit이 주입한 스타일시트를 보존하고 나머지 렌더링 결과를 에러 UI로 교체합니다.
   * 일반적으로 JSON 파싱 오류의 경우 `data`가 객체가 아닌 문자열이거나 JSON 형식이 잘못된 경우입니다.
   * 이 함수는 Lit 렌더링이 완료된 후에 호출됩니다.
   * 
   * @param error - 발생한 오류 객체
   */
  protected async error(error: unknown): Promise<void> {
    await this.updateComplete;
    if (!this.shadowRoot) return;

    const tag     = this.tagName.toLowerCase();
    const type    = error instanceof Error ? error.constructor.name : 'UnknownError';
    const message = error instanceof Error ? error.message : String(error);

    this.replace(html`
      <div class="error-container">
        <div class="error-header">
          <u-icon class="error-icon" lib="internal" name="exclamation-triangle-fill"></u-icon>
          <span class="error-title">Render Error</span>
          <code class="error-tag">&lt;${tag}&gt;</code>
        </div>
        <div class="error-body">
          <div class="error-row">
            <span class="error-label">Type</span>
            <code class="error-type">${type}</code>
          </div>
          <div class="error-row">
            <span class="error-label">Message</span>
            <pre class="error-message">${message}</pre>
          </div>
        </div>
      </div>
    `);
  }
}
