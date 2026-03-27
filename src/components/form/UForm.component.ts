import { html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { arrayAttrConverter } from '../../utilities/converters.js';
import { UElement } from '../UElement.js';
import { UFormControlElement } from '../UFormControlElement.js';
import { styles } from './UForm.styles.js';

/**
 * Form 컴포넌트는 여러 입력 요소를 그룹화하고 관리하는 폼 컨테이너입니다.
 * 폼 내의 UFormControlElement 기반 입력 요소들의 값 변경을 감지하고,
 * 포함 및 제외 규칙에 따라 모델 데이터를 자동으로 업데이트합니다.
 */
export class UForm extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};

  /** 포함할 입력 요소의 name 속성 목록입니다. 비어있으면 전부 포함합니다. */
  @property({ type: Array, converter: arrayAttrConverter() }) includes: string[] = [];
  /** 제외할 입력 요소의 name 속성 목록입니다. */
  @property({ type: Array, converter: arrayAttrConverter() }) excludes: string[] = [];
  /** 폼의 양방향 바인딩 데이터 모델입니다. */
  @property({ type: Object, attribute: false }) model?: Record<string, unknown>;

  /** model의 초기값 스냅샷. reset 시 이 값으로 복원합니다. */
  private snapshot: Record<string, unknown> = {};

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('u-change', this.handleChange);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-change', this.handleChange);
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
   * @returns 모든 컨트롤이 유효하면 `true`, 아니면 `false`
   */
  public validate(): boolean {
    const controls = this.getControls();
    return controls.every(control => control.validate());
  }

  /**
   * 폼의 모든 포함된 컨트롤을 스냅샷 값으로 리셋합니다.
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

  /** model의 값을 하위 컨트롤에 반영합니다. */
  private sync(): void {
    if (!this.model) return;
    for (const control of this.getControls()) {
      if (control.name && control.name in this.model) {
        control.value = this.model[control.name];
      }
    }
  }

  /**
   * 슬롯 내 폼 컨트롤 요소를 수집합니다.
   * includes가 비어있으면 전체 포함, excludes에 해당하면 제외합니다.
   */
  private getControls(): UFormControlElement<unknown>[] {
    const slot = this.renderRoot.querySelector('slot');
    if (!slot) return [];
    return (slot.assignedElements({ flatten: true })
      .filter(el => el instanceof UFormControlElement) as UFormControlElement<unknown>[])
      .filter(el => this.isIncluded(el));
  }

  /** includes/excludes 규칙에 따라 컨트롤 포함 여부를 판단합니다. */
  private isIncluded(el: UFormControlElement<unknown>): boolean {
    const name = el.name;
    if (!name) return false;
    if (this.excludes.includes(name)) return false;
    if (this.includes.length > 0 && !this.includes.includes(name)) return false;
    return true;
  }

  /** 슬롯 변경 시 model 값을 컨트롤에 반영합니다. */
  private handleSlotChange = (_: Event) => {
    this.sync();
  }

  /** 폼 컨트롤의 값 변경 이벤트를 처리합니다. */
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
    this.emit('u-change');
  }
}
