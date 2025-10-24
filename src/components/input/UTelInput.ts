import { html, nothing  } from 'lit';
import { customElement, property, queryAll, state } from "lit/decorators.js";
import { convertReact } from "../../utils";

import { UTelInputModel } from "./UTelInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import { t } from "../../localization/ULocalizer";
import { styles } from './UTelInput.styles';

@customElement('u-tel-input')
export class UTelInputElement extends UBaseInput implements UTelInputModel {
  
  @queryAll('input') inputElList!: NodeListOf<HTMLInputElement>;

  @state() totalLength: number = 0;
  @state() values: string[] = [];

  @property({ type: Boolean, reflect: true }) clearable?: boolean;
  @property({ type: Array }) nationalCode?: number[];
  @property({ type: Array }) segments: number[] = [3, 4, 4];
  @property({ type: String }) value?: string;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if(changedProperties.has('segments') && this.segments) {
      this.totalLength = this.segments.reduce((acc, cur) => acc + cur, 0);
      const maxSegment = Math.max(...this.segments);
      this.style.setProperty('--input-width', `${maxSegment}em`);
    }
    if(changedProperties.has('value')) {
      this.values = this.values.length < 1 ? this.segments.map((length, index) => {
        const start = this.segments.slice(0, index).reduce((acc, cur) => acc + cur, 0);
        const end = start + length;
        return this.value?.slice(start, end) || "";
      }) : this.values;
      this.clearable = !!this.value;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('focusout', this.onFocusOut);
  }

  disconnectedCallback() {
    this.removeEventListener('focusout', this.onFocusOut);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <u-input-container>
        <u-input-border>
          <slot name="prefix"></slot>
          ${this.segments.map((length, index) => this.renderTelInput(index, length))}
          <div class="flex"></div>
          <u-icon class="clear" type="system" name="x-circle-fill"
            @click=${this.handleClear}
          ></u-icon>
          <slot name="suffix"></slot>
        </u-input-border>
      </u-input-container>
    `;
  }

  private renderTelInput(index: number, length: number) {
    return html`
      <input type="text"
        autocomplete="off"
        spellcheck="false"
        maxlength=${length}
        value=${this.values[index] || ""}
        @input=${(e: any) => this.onInput(e, index)}
      />
      ${index < this.segments.length - 1 
        ? html`<u-icon class="divider" type="system" name="minus"></u-icon>` 
        : nothing}
    `;
  }

  public async validate() {
    if(this.required && this.totalLength !== this.value?.length) {
      return this.setInvalid(t('requiredField', {
        ns: 'component',
        defaultValue: 'This field is required.'
      }));
    } else {
      return this.setValid();
    }
  }

  private onInput = (event: Event, index: number) => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (isNaN(Number(value)) || value.includes('.')) {
      target.value = this.values[index]; return;
    }
    this.values[index] = value;
    this.value = this.values.join('');
    if(value.length === this.segments[index]) {
      if(index < this.segments.length - 1) {
        this.inputElList[index + 1].focus();
      }
    }
    this.dispatchEvent(new CustomEvent('input', { detail: this.value }));
  }

  private onFocusOut = (event: Event) => {
    event.stopPropagation();
    this.validate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  private handleClear = () => {
    this.inputElList.forEach(el => el.value = "");
    this.value = "";
    this.inputElList[0].focus();
  }

  static styles = [styles];
}

export const UTelInput = convertReact({
  elementClass: UTelInputElement,
  tagName: 'u-tel-input',
  events: {
    onInput: 'input',
    onChange: 'change'
  }
});