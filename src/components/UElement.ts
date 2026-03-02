import { LitElement, CSSResultGroup, render, RenderOptions } from 'lit';
import { styles } from './UElement.styles.js';

/**
 * UElement는 LitElement를 확장한 기본 Web Component 클래스입니다.
 * 이 클래스는 자동으로 종속된 컴포넌트를 정의하며, 유용한 헬퍼 메서드들을 제공합니다.
 */
export class UElement extends LitElement {
  /**
   * 기본 스타일을 정의합니다.
   */
  static styles: CSSResultGroup = styles;

  /**
   * 현재 컴포넌트에 종속된 컴포넌트들을 정의하는 정적 속성입니다.
   * 이 속성은 컴포넌트가 정의될 때 자동으로 호출되어
   * 종속된 컴포넌트를 등록합니다.
   */
  static dependencies: Record<string, typeof UElement> = {};

  constructor() {
    super();
    Object.entries((this.constructor as typeof UElement).dependencies).forEach(([name, component]) => {
      component.define(name);
    });
  }

  /**
   * 커스텀 엘리먼트를 정의합니다.
   * 이미 정의된 엘리먼트는 다시 정의하지 않습니다.
   * @param name - 커스텀 엘리먼트의 이름
   * @param options - 엘리먼트 정의 옵션
   */
  static define(name: string, options: ElementDefinitionOptions = {}) {
    if (!customElements.get(name)) {
      try {
        customElements.define(name, this, options);
      } catch(error: any) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to register component "${name}":`, error);
      }
    }
  }

  /**
   * 커스텀 이벤트를 디스패치합니다.
   * @param name - 이벤트 이름
   * @param value - 이벤트의 detail에 포함될 데이터
   * @param options - 추가 이벤트 옵션 (예: bubbles, composed 등)
   * @returns 이벤트가 성공적으로 디스패치되었는지 여부
   */
  protected emit(name: string, value?: any, options?: CustomEventInit): boolean {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: value,
      ...options,
    });

    return this.dispatchEvent(event);
  }

  /**
   * 현재 shadow DOM의 렌더 결과를 지정한 템플릿으로 완전히 교체합니다.
   *
   * @param value - Lit 템플릿 결과 또는 기타 렌더링 가능한 값
   * @param options - Lit의 RenderOptions (예: renderBefore 등)
   * 
   * @remarks
   * Lit은 브라우저 환경에 따라 스타일을 두 가지 방식으로 주입합니다.
   *
   * - **모던 브라우저**: `shadowRoot.adoptedStyleSheets`에 `CSSStyleSheet` 객체로 주입.
   *   이 경우 `<style>` 태그 노드는 존재하지 않으므로 전체 `shadowRoot`를 교체해도 스타일이 유지됩니다.
   *
   * - **구형 브라우저 (폴리필 환경)**: `<style>` 태그를 shadow DOM 안에 직접 주입.
   *  이 경우 `<style>` 태그 노드를 제거하면 스타일이 사라지므로, 에러 UI로 교체할 때는 `<style>` 태그 노드를 보존해야 합니다.
   *
   * 따라서 `<style>` 태그 노드는 보존하고 나머지 노드를 제거한 뒤
   * 에러 div를 append하는 방식으로 양쪽 환경 모두에서 안전하게 동작합니다.
   *
   * @example
   * ```ts
   * this.replace(html`
   *   <span class="error">Something went wrong</span>
   * `);
   * ```
   */
  protected replace(value: unknown, options?: RenderOptions): void {
    if (!this.shadowRoot) return;

    // STYLE 노드만 보존하고 나머지 노드 제, Lit 스타일 유지 목적
    Array.from(this.shadowRoot.childNodes).forEach(node => {
      if (!(node instanceof HTMLStyleElement)) {
        node.parentNode?.removeChild(node);
      }
    });

    // Lit이 관리할 렌더 컨테이너 생성
    const container = document.createElement('div');
    container.style.display = 'contents';
    this.shadowRoot.appendChild(container);

    // Lit 템플릿 렌더
    render(value, container, options);
  }
}