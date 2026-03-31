import { html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { arrayAttrConverter } from '../../utilities/converters.js';
import { UElement } from '../UElement.js';
import { UFormControlElement } from '../UFormControlElement.js';
import { styles } from './UForm.styles.js';

/**
 * 여러 입력 요소를 그룹화하고 관리하는 폼 컨테이너 컴포넌트입니다.
 * 폼 내의 UFormControlElement 기반 입력 요소의 값 변경을 감지하고,
 * 포함/제외 규칙에 따라 모델 데이터를 자동으로 업데이트합니다.
 *
 * @event change - 폼 컨트롤 값 변경 시 발생
 */
@customElement('u-form')
export class UForm extends UElement {
  static styles = [super.styles, styles];

  /** 포함할 입력 요소의 name 속성 목록. 비어있으면 모두 포함됩니다. */
  @property({ type: Array, converter: arrayAttrConverter() }) includes: string[] = [];
  /** 제외할 입력 요소의 name 속성 목록. */
  @property({ type: Array, converter: arrayAttrConverter() }) excludes: string[] = [];
  /** 폼의 양방향 바인딩 데이터 모델. */
  @property({ type: Object, attribute: false }) model?: Record<string, unknown>;

  /** model의 초기값 스냅샷. reset 시 이 값으로 복원됩니다. */
  private snapshot: Record<string, unknown> = {};

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('change', this.handleChange);
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.handleChange);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('model')) {
      this.snapshot = { ...this.model };
      this.sync();
    }
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  /**
   * 폼 내의 모든 포함된 컨트롤을 검증합니다.
   * @returns 모든 컨트롤이 유효하면 true, 아니면 false
   */
  public validate(): boolean {
    const controls = this.getControls();
    return controls.every(control => control.validate());
  }

  /**
   * 폼 내의 모든 포함된 컨트롤을 스냅샷 값으로 리셋합니다.
   */
  public reset(): void {
    if (this.snapshot) {
      this.model = {};
      Object.keys(this.snapshot).forEach(key => {
        this.model![key] = this.snapshot[key];
      });
    }
    this.sync();
  }

  private sync(): void {
    if (!this.model) return;
    for (const control of this.getControls()) {
      if (control.name && control.name in this.model) {
        control.value = this.model[control.name];
      }
    }
  }

  private getControls(): UFormControlElement<unknown>[] {
    const slot = this.renderRoot.querySelector('slot');
    if (!slot) return [];
    return (slot.assignedElements({ flatten: true })
      .filter(el => el instanceof UFormControlElement) as UFormControlElement<unknown>[])
      .filter(el => this.isIncluded(el));
  }

  private isIncluded(el: UFormControlElement<unknown>): boolean {
    const name = el.name;
    if (!name) return false;
    if (this.excludes.includes(name)) return false;
    if (this.includes.length > 0 && !this.includes.includes(name)) return false;
    return true;
  }

  private handleSlotChange = (_: Event) => {
    this.sync();
  }

  private handleChange = (e: Event) => {
    const target = e.target;
    if (!(target instanceof UFormControlElement)) return;

    const name = target.name;
    const value = target.value;
    if (!name) return;
    if (!this.isIncluded(target)) return;

    if (this.model && typeof this.model === 'object') {
      this.model[name] = value;
    }

    e.stopPropagation();
    this.dispatchEvent(new Event('change', { 
      bubbles: true, 
      composed: true 
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-form': UForm;
  }
}