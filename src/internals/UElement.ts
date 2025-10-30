import { CSSResultGroup, LitElement } from 'lit';
import { styles } from './UElement.styles';

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
  protected dispatch(name: string, value?: any, options?: any): boolean {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: value,
      ...options
    });

    return this.dispatchEvent(event);
  }
}