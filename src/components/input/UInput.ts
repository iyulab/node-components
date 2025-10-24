import { LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { unsafeStatic, html } from 'lit/static-html.js';
import { convertReact } from "../../utils";
import { styles } from './UInput.styles';

import "./index";
import { UInputModel } from './UInput.model';
import type { UBaseInput } from '../input-parts/UBaseInput';
import type { LabelPosition } from "../input-parts/UInputContainer.model";
import { 
  getPropertyMeta, 
  type PropertyMetaType, 
  type PropertyMetaData
} from "../../decorators";

@customElement('u-input')
export class UInputElement extends LitElement implements UInputModel {

  @query('.input') input!: UBaseInput;

  @state() tag?: string;

  @property({ type: String }) labelPosition?: LabelPosition;
  @property({ type: String }) size: string = "14px";

  @property({ type: Object }) meta?: PropertyMetaData;
  @property({ type: String }) type?: PropertyMetaType;
  @property({ type: Object }) context?: any;
  @property({ type: String }) name?: string;
  @property({ type: Object }) value?: any;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);

    if ((changedProperties.has('context') || changedProperties.has('name')) 
        && this.context && this.name) {
      this.meta = getPropertyMeta(this.context, this.name);
    }
    if (this.type == null && changedProperties.has('meta') && this.meta) {
      this.type = this.meta.type || 'text';
    }
    if (changedProperties.has('type') && this.type) {
      this.tag = `u-${this.type}-input`;
    }
  }

  render() {
    if (!this.tag) return nothing;
    
    return html`
      <${unsafeStatic(this.tag)} 
        class="input"
        .labelPosition=${this.labelPosition}
        .size=${this.size}
        .context=${this.context}
        .name=${this.name}
        .meta=${this.meta}
        .value=${this.value}
        @change=${this.onChange}
      ></${unsafeStatic(this.tag)}>
    `;
  }

  public async validate() {
    return await this.input.validate();
  }

  private onChange = (e: any) => {
    this.value = e.target?.value;
    this.dispatchEvent(new CustomEvent('change', { 
      detail: this.value 
    }));
  }

  static styles = [styles];
}

export const UInput = convertReact({
  elementClass: UInputElement,
  tagName: 'u-input',
  events: {
    onChange: 'change'
  }
});