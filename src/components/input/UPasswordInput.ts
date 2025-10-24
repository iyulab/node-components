import { html  } from 'lit';
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { convertReact } from "../../utils";
import { t } from "../../localization/ULocalizer";

import { UPasswordInputModel } from "./UPasswordInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { styles } from './UPasswordInput.styles';

@customElement('u-password-input')
export class UPasswordInputElement extends UBaseInput implements UPasswordInputModel {
  
  @query('input') inputEl!: HTMLInputElement;

  @property({ type: Boolean, reflect: true }) clearable?: boolean;  
  @property({ type: Boolean }) visible?: boolean;  
  @property({ type: Number }) length?: number;
  @property({ type: String }) pattern?: string | RegExp;
  @property({ type: String }) invalidMessage?: string;
  @property({ type: String }) placeholder?: string;
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
          <input type=${this.visible ? 'text' : 'password'}
            autocomplete="off"
            spellcheck="false"
            ?required=${this.required}
            pattern=${ifDefined(this.pattern)}
            maxlength=${ifDefined(this.length)}
            placeholder=${ifDefined(this.placeholder)}
            value=${this.value || ''}
            @input=${this.onInput}
            @change=${this.onChage}
          />
          <u-icon class="visible" type="system" name=${this.visible ? 'visible' : 'invisible'}
            @click=${this.handleVisible}
          ></u-icon>
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
    } else if(this.inputEl.validity.patternMismatch) {
      return this.setInvalid(this.invalidMessage || t("invalidPattern",{
        ns: "component",
        defaultValue: "Please enter a valid pattern"
      }));
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

  private handleVisible = () => {
    this.visible = !this.visible;
  }

  private handleClear = () => {
    this.inputEl.value = "";
    this.value = "";
    this.inputEl.focus();
  }

  static styles = [styles];
}

export const UPasswordInput = convertReact({
  elementClass: UPasswordInputElement,
  tagName: 'u-password-input',
  events: {
    onInput: 'input',
    onChange: 'change'
  }
});