import { html  } from 'lit';
import { property } from 'lit/decorators.js';

import { arrayAttributeConverter } from '../../internals/attribute-converters.js';
import { BaseElement } from '../BaseElement.js';
import { Input } from '../input/Input.js';
import { styles } from './Form.styles.js';

/**
 * Form 컴포넌트는 여러 입력 요소를 그룹화하고 관리하는 폼 컨테이너입니다.
 * 폼 내의 입력 요소들의 값 변경을 감지하고, 포함 및 제외 규칙에 따라 폼 컨텍스트에 데이터를 자동으로 업데이트합니다.
 */
export class Form extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 포함할 입력 요소의 name 속성 목록입니다. */
  @property({ type: Array, converter: arrayAttributeConverter(v => v) }) includes: string[] = [];
  /** 제외할 입력 요소의 name 속성 목록입니다. */
  @property({ type: Array, converter: arrayAttributeConverter(v => v) }) excludes: string[] = [];
  /** 폼의 컨텍스트 데이터를 설정합니다. */
  @property({ type: Object, attribute: false }) context?: any;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('change', this.handleChange);
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.handleChange);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot></slot>
    `;
  }

  /** 폼 내의 모든 입력 요소를 검증합니다. */
  public validate() {
    const slot = this.shadowRoot?.querySelector('slot');
    const inputEls = slot?.assignedElements({ flatten: true }).filter(el => el instanceof Input) || [];
    const isValid = Array.from(inputEls).every(input => input.validate());
    return isValid;
  }

  /** 입력 요소의 변경 이벤트를 처리합니다. */
  private handleChange = (e: Event) => {
    const input = e.target as Input;
    const name = input.name;
    const value = input.value;
    if (!name) return;
    if (!this.includes.includes(name)) return;
    if (this.excludes.includes(name)) return;
    
    if (this.context && typeof this.context === 'object') {
      this.context[name] = value;
    }
  }
}