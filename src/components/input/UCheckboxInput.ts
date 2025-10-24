import { html  } from 'lit';
import { customElement, property, query } from "lit/decorators.js";
import { convertReact } from "../../utils";
import { t } from "../../localization/ULocalizer";

import { UCheckboxInputModel } from "./UCheckboxInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { styles } from './UCheckboxInput.styles';

@customElement('u-checkbox-input')
export class UCheckboxInputElement extends UBaseInput implements UCheckboxInputModel {
  
  @query('input') inputEl!: HTMLInputElement;

  @property({ type: Boolean, reflect: true }) clearable?: boolean;
  @property({ type: Boolean }) requiredCheck?: boolean;
  @property({ type: Boolean }) value?: boolean;

  render() {
    return html`
      <input 
        type="checkbox"
        ?checked=${this.value || false}
        ?required=${this.requiredCheck}
        @change=${this.onChage}
      />
      <u-input-label
        .label=${this.label}
        .required=${this.requiredCheck}
        .description=${this.description}
      ></u-input-label>
      <u-input-error
        .error=${this.error}
      ></u-input-error>
    `;
  }

  public async validate() {
    if(this.requiredCheck && !this.value) {
      return this.setInvalid(t("requiredCheckField", {
        ns: "component",
        defaultValue: "This field is required."
      }));
    } else {
      return this.setValid();
    }
  }

  private onChage = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.validate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  static styles = [styles];
}

export const UCheckboxInput = convertReact({
  elementClass: UCheckboxInputElement,
  tagName: 'u-checkbox-input',
  events: {
    onChange: 'change'
  }
});