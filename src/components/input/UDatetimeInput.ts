import { html  } from 'lit';
import { customElement, property, query } from "lit/decorators.js";
import { convertReact } from "../../utils";

import { UDatetimeInputModel, type DatetimeInputFormat } from "./UDatetimeInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { styles } from './UDatetimeInput.styles';

@customElement('u-datetime-input')
export class UDatetimeInputElement extends UBaseInput implements UDatetimeInputModel {
  
  @query('input') inputEl!: HTMLInputElement;

  @property({ type: Boolean, reflect: true }) clearable?: boolean;  
  @property({ type: String }) format?: DatetimeInputFormat;
  @property({ type: String }) value?: string;

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
          <input type=${this.format || 'datetime-local'}
            autocomplete="off"
            spellcheck="false"
            ?required=${this.required}
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
    this.value = target.value;
    this.dispatchEvent(new CustomEvent('input', { detail: this.value }));
  }

  private onChage = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.validate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private handleClear = () => {
    this.inputEl.value = "";
    this.value = "";
    this.inputEl.focus();
  }

  static styles = [styles];
}

export const UDatetimeInput = convertReact({
  elementClass: UDatetimeInputElement,
  tagName: 'u-datetime-input',
  events: {
    onInput: 'input',
    onChange: 'change'
  }
});