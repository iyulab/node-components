import { html  } from 'lit';
import { customElement, property } from "lit/decorators.js";
import { convertReact } from "../../utils";

import SlRange from "@shoelace-style/shoelace/dist/components/range/range.component.js";
SlRange.define('sl-range');

import { t } from "../../localization/ULocalizer";
import { URangeInputModel } from "./URangeInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { styles } from './URangeInput.styles';

@customElement('u-range-input')
export class URangeInputElement extends UBaseInput implements URangeInputModel {

  @property({ type: Number }) min: number = 0;
  @property({ type: Number }) max: number = 100;
  @property({ type: Number }) step: number = 1;
  @property({ type: String }) left?: string;
  @property({ type: String }) right?: string;
  @property({ type: Number }) value?: number;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;
  }

  render() {
    return html`
      <u-input-container>
        <sl-range type="range"
          .min=${this.min}
          .max=${this.max}
          .step=${this.step}
          .value=${this.value || this.min}
          @sl-input=${this.onInput}
          @sl-change=${this.onChange}
        ></sl-range>
        ${this.renderLeftAndRight()}
      </u-input-container>
    `;
  }

  public async validate() {
    if(this.required && (this.value === undefined || this.value === null)) {
      return this.setInvalid(t("requiredField", {
        ns: "component",
        defaultValue: "This field is required."
      }));
    } else {
      return this.setValid();
    }
  }

  private renderLeftAndRight() {
    return html`
      <div class="footer">
        ${this.left ? html`<div>${this.left}</div>` : ''}
        ${this.right ? html`<div>${this.right}</div>` : ''}
      </div>
    `;
  }

  private onInput = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.value = parseFloat(target.value);
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private onChange = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.value = parseFloat(target.value);
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  static styles = [styles];
}

export const URangeInput = convertReact({
  elementClass: URangeInputElement,
  tagName: 'u-range-input',
  events: {
    onChange: 'change'
  }
});