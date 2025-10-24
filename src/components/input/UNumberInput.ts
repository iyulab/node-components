import { html  } from 'lit';
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { convertReact } from "../../utils";

import { UNumberInputModel, type NumberInputFormat } from "./UNumberInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { styles } from './UNumberInput.styles';

@customElement('u-number-input')
export class UNumberInputElement extends UBaseInput implements UNumberInputModel {
  
  @query('input') inputEl!: HTMLInputElement;

  @property({ type: Boolean, reflect: true }) clearable?: boolean;
  @property({ type: String }) format?: NumberInputFormat;
  @property({ type: Number }) min?: number;
  @property({ type: Number }) max?: number;
  @property({ type: String }) placeholder?: string;
  @property({ type: Number }) value?: number;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if(changedProperties.has('value')) {
      this.clearable = !!this.value;
    }
  }

  render() {
    return html`
      <u-input-container>
        <u-input-border>
          <slot name="prefix"></slot>
          <input type="number"
            autocomplete="off"
            spellcheck="false"
            ?required=${this.required}
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
            placeholder=${this.placeholder || ''}
            value=${this.value || ''}
            @input=${this.onInput}
            @change=${this.onChage}
          />
          <u-icon class="clear" type="system" name="x-circle-fill"
            @click=${this.handleClear}
          ></u-icon>
          <slot name="suffix"></slot>
        </u-input-border>
      </u-input-container>
    `;
  }

  public async validate() {
    if(this.inputEl.validity.valid) {
      return this.setValid();
    } else {
      return this.setInvalid(this.inputEl.validationMessage);
    }
  }

  private onInput = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if(this.min && Number(value) < this.min) {
      target.value = this.min.toString();
      this.value = this.min;
    } else if(this.max && Number(value) > this.max) {
      target.value = this.max.toString();
      this.value = this.max;
    } else if(this.format === 'integer' && value.includes('.')) {
      target.value = value.split('.')[0];
      this.value = Number(value.split('.')[0]);
    } else {
      this.value = Number(value);
    }
    this.dispatchEvent(new CustomEvent('input', { detail: this.value }));
  }

  private onChage = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.value = Number(target.value);
    this.validate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private handleClear = () => {
    this.inputEl.value = "";
    this.value = undefined;
    this.inputEl.focus();
  }

  static styles = [styles];
}

export const UNumberInput = convertReact({
  elementClass: UNumberInputElement,
  tagName: 'u-number-input',
  events: {
    onInput: 'input',
    onChange: 'change'
  }
});