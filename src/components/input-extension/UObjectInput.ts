import { html  } from 'lit';
import { customElement, property, queryAll } from "lit/decorators.js";
import { repeat } from 'lit/directives/repeat.js';
import { convertReact } from "../../utils";

import type { UTextInputElement } from "../input/UTextInput";
import { UObjectInputModel } from "./UObjectInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { styles } from './UObjectInput.styles';

@customElement('u-object-input')
export class UObjectInputElement extends UBaseInput implements UObjectInputModel {

  @queryAll('u-text-input') inputs!: NodeListOf<UTextInputElement>;

  @property({ type: Object }) value?: object;

  render() {
    const entries = this.value ? Object.entries(this.value) : [];
    return html`
      <u-input-container>
        <div class="properties">
          ${repeat(entries, 
            ([key]) => key, 
            ([key, value]) => this.renderProperty(key, value))}
        </div>
        <div class="create" @click=${this.appendProperty}>
          <u-icon type="system" name="plus-square"></u-icon>
          <label>Add New</label>
        </div>
      </u-input-container>
    `;
  }

  private renderProperty(key: string, value: string) {
    return html`
      <div class="property">
        <u-text-input required placeholder="Enter key"
          .value=${key}
          @change=${(e: any) => this.onChangeKey(e, key)}>
          <u-icon slot="prefix" type="system" name="key"></u-icon>
        </u-text-input>
        <u-text-input required placeholder="Enter value"
          .value=${value}
          @change=${(e: any) => this.onChangeValue(e, key)}>
          <u-icon slot="prefix" type="system" name="box"></u-icon>
        </u-text-input>
        <u-icon class="delete" type="system" name="minus-square" 
          @click=${() => this.deleteProperty(key)}
        ></u-icon>
      </div>
    `;
  }

  public async validate() {
    const inputs = Array.from(this.inputs);
    const results = await Promise.all(inputs.map(input => input.validate()));
    return results.every(result => result);
  }

  private appendProperty = () => {
    this.value = { ...this.value, "": "" };
  }

  private deleteProperty = (key: string) => {
    //@ts-ignore
    delete this.value[key];
    this.value = { ...this.value };
  }

  private onChangeKey = (event: Event, prevKey: string) => {
    event.stopPropagation();
    const target = event.target as any;
    target.validate();
    const newKey = target.value;
    if (prevKey === newKey) return;
    //@ts-ignore
    const oldValue =  this.value?.[prevKey];
    //@ts-ignore
    delete this.value[prevKey];
    this.value = { ...this.value, [newKey]: oldValue };
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private onChangeValue = (event: Event, key: string) => {
    event.stopPropagation();
    const target = event.target as any;
    target.validate();
    const value = target.value;
    this.value = { ...this.value, [key]: value };
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  static styles = [styles];
}

export const UObjectInput = convertReact({
  elementClass: UObjectInputElement,
  tagName: 'u-object-input',
  events: {
    onChange: 'change',
  }
});