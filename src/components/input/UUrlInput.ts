import { html  } from 'lit';
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { convertReact } from "../../utils";

import { t } from "../../localization/ULocalizer";
import { UUrlInputModel } from "./UUrlInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import "./USelectInput";
import { styles } from './UUrlInput.styles';

@customElement('u-url-input')
export class UUrlInputElement extends UBaseInput implements UUrlInputModel {
  private static readonly pattern: RegExp = /^[a-zA-Z][a-zA-Z\d+\-.]*:(\/\/)?[\S]+$/;

  @query('input') inputEl!: HTMLInputElement;

  @state() scheme?: string;
  @state() path?: string;

  @property({ type: Boolean, reflect: true }) clearable?: boolean;  
  @property({ type: Array }) schemes?: string[] = ['Enter Manually', 
  'http://', 'https://', 'ftp://', 'file://', 'mailto:', 'tel:', 
  'sms:', 'geo:', 'urn:', 'data:', 'ws://', 'wss://'];
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
          <u-select-input
            required
            .options=${this.schemes}
            @change=${this.onSchemeChange}
          ></u-select-input>
          <input type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder=${ifDefined(this.placeholder)}
            value=${this.path || ''}
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
    if(this.required && !this.value) {
      return this.setInvalid(t('requiredField', {
        ns: 'component',
        defaultValue: 'This field is required'
      }));
    }
    if(this.value && !UUrlInputElement.pattern.test(this.value)) {
      return this.setInvalid(t('invalidUrl', {
        ns: 'component',
        defaultValue: 'Please enter a valid URL'
      }));
    }
      
    return this.setValid();
  }

  private onSchemeChange = (event: CustomEvent) => {
    this.scheme = event.detail === 'Enter Manually' ? '' : event.detail;
    this.value = `${this.scheme}${this.path}`;
  }

  private onInput = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.path = target.value;
    this.value = `${this.scheme}${this.path}`;
    this.dispatchEvent(new CustomEvent('input', { detail: this.value }));
  }

  private onChage = (event: Event) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.path = target.value;
    this.value = `${this.scheme}${this.path}`;
    this.validate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private handleClear = () => {
    this.inputEl.value = "";
    this.value = this.scheme || '';
    this.inputEl.focus();
  }

  static styles = [styles];
}

export const UUrlInput = convertReact({
  elementClass: UUrlInputElement,
  tagName: 'u-url-input',
  events: {
    onInput: 'input',
    onChange: 'change'
  }
});