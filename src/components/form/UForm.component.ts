import { html  } from 'lit';
import { property } from 'lit/decorators.js';

import { arrayAttrConverter } from '../../utilities/converters.js';
import { BaseElement } from '../BaseElement.js';
import { UInput } from '../input/UInput.component.js';
import { styles } from './UForm.styles.js';

/**
 * Form 컴포넌트는 여러 입력 요소를 그룹화하고 관리하는 폼 컨테이너입니다.
 * 폼 내의 입력 요소들의 값 변경을 감지하고, 포함 및 제외 규칙에 따라 폼 컨텍스트에 데이터를 자동으로 업데이트합니다.
 */
export class UForm extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 포함할 입력 요소의 name 속성 목록입니다. */
  @property({ type: Array, converter: arrayAttrConverter(v => v) }) includes: string[] = [];
  /** 제외할 입력 요소의 name 속성 목록입니다. */
  @property({ type: Array, converter: arrayAttrConverter(v => v) }) excludes: string[] = [];
  /** 폼의 컨텍스트 데이터를 설정합니다. */
  @property({ type: Object, attribute: false }) context?: any;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('change', this.handleInputChange);
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.handleInputChange);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot></slot>
    `;
  }

  /** 
   * 폼 내의 모든 입력 요소를 검증합니다. 
   */
  public validate() {
    const slot = this.shadowRoot?.querySelector('slot');
    const elements = slot?.assignedElements({ flatten: true })
      .filter(el => el instanceof UInput);
    if (!elements) return true;
    if (elements.length === 0) return true;

    const isValid = Array.from(elements).every(input => input.validate());
    return isValid;
  }

  /** 입력 요소의 변경 이벤트를 처리합니다. */
  private handleInputChange = (e: Event) => {
    const input = e.target as UInput;
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