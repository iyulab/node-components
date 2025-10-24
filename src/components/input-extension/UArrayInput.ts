import { html  } from 'lit';
import { customElement, property, queryAll } from "lit/decorators.js";
import { repeat } from 'lit/directives/repeat.js';
import { convertReact } from "../../utils";

import type { UTextInputElement } from "../input/UTextInput";
import { UArrayInputModel } from "./UArrayInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { t } from "../../localization";
import { styles } from './UArrayInput.styles';

@customElement('u-array-input')
export class UArrayInputElement extends UBaseInput implements UArrayInputModel {

  @queryAll('u-text-input') inputs!: NodeListOf<UTextInputElement>;

  @property({ type: Array }) value?: string[];

  render() {
    return html`
      <u-input-container>
        <div class="container">
          ${this.value && this.value.length > 0 
            ? this.renderArray(this.value)
            : this.renderAddButton()
          }
        </div>
      </u-input-container>
    `;
  }

  private renderAddButton() {
    return html`
      <div class="create" @click=${() => this.addValue(0)}>
        <u-icon type="system" name="plus-square"></u-icon>
        <label>Add New</label>
      </div>
    `;
  }

  private renderArray(value: string[]) {
    return html`
      ${repeat(value,
        (value, index) => ({value, index}),
        (value, index) => html`
          <div class="value">
            <u-text-input required
              .value=${value}
              @change=${(e: any) => this.onChangeValue(e, index)}>
            </u-text-input>
            <u-icon type="system" name="plus-square" 
              @click=${() => this.addValue(index)}
            ></u-icon>
            <u-icon type="system" name="minus-square" 
              @click=${() => this.deleteValue(index)}
            ></u-icon>
          </div>
        `
      )}
    `;
  }

  public async validate() {
    if (this.required) {
      if (!this.value || this.value.length === 0) {
        return this.setInvalid(t("requiredField", {
          ns: "component",
          defaultValue: "This field is required."
        }));
      }
      if (this.value.some(v => !v)) {
        return this.setInvalid(t("missingField", {
          ns: "component",
          defaultValue: "Please fill in all fields"
        }));
      }
    }
    return this.setValid();
  }

  private addValue = (index: number) => {
    this.value ||= [];
    this.value.splice(index + 1, 0, '');
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private deleteValue = (index: number) => {
    this.value?.splice(index, 1);
    this.value = this.value?.length === 0 ? undefined : this.value;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private onChangeValue = (event: Event, index: number) => {
    event.stopPropagation();
    const target = event.target as any;
    target.validate();
    const value = target.value;
    this.value ||= [];
    this.value[index] = value;
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  static styles = [styles];
}

export const UArrayInput = convertReact({
  elementClass: UArrayInputElement,
  tagName: 'u-array-input',
  events: {
    onChange: 'change',
  }
});