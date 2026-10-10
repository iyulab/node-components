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
   * 폼 안의 포함된 컨트롤을 **전부** 검증합니다 — 첫 오류에서 멈추지 않아 모든 무효 컨트롤이 오류를 보입니다.
   * 컨트롤은 위치와 무관하게 대상입니다(`u-field`·배치용 요소 안의 것 포함 — 네이티브 `form.elements` 와 같다).
   *
   * @param report `true`(기본값)면 각 컨트롤의 오류 표시를 갱신하고 첫 무효 컨트롤로 포커스를 옮긴다
   *   (네이티브 `reportValidity()`). `false`면 화면에 영향 없이 유효 여부만 확인한다(`checkValidity()`).
   * @returns 모든 컨트롤이 유효하면 true, 아니면 false
   */
  public validate(report: boolean = true): boolean {
    this.flushUpdate(); // 바로 앞의 `model` 이 컨트롤에 동기화된 뒤에 판정한다
    const controls = this.getControls();
    const results = controls.map(control => control.validate(report));
    const firstInvalid = controls[results.indexOf(false)];
    if (report && firstInvalid) firstInvalid.focus();
    return firstInvalid === undefined;
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

  /**
   * 포함된 컨트롤을 문서 순서로 모은다 — 슬롯에 배정된 요소 **와 그 자손**이 대상이다. 감싸개(`u-field` 등) 안의
   * 컨트롤도 이 폼의 것이다. 안쪽 `u-form` 의 컨트롤은 그 폼의 것이라 넘지 않는다.
   */
  private getControls(): UFormControlElement<unknown>[] {
    const slot = this.renderRoot.querySelector('slot');
    if (!slot) return [];
    return slot.assignedElements({ flatten: true })
      .flatMap(el => [el, ...el.querySelectorAll('*')])
      .filter((el): el is UFormControlElement<unknown> => el instanceof UFormControlElement)
      .filter(el => el.parentElement?.closest('u-form') === this)
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