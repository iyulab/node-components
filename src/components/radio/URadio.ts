import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { convertReact } from "../../utils";
import { styles } from './URadio.styles';

import SlRadio from "@shoelace-style/shoelace/dist/components/radio/radio.component.js";
import SlRadioButton from "@shoelace-style/shoelace/dist/components/radio-button/radio-button.component.js";
import SlRadioGroup from "@shoelace-style/shoelace/dist/components/radio-group/radio-group.component.js";
SlRadio.define('sl-radio');
SlRadioButton.define('sl-radio-button');
SlRadioGroup.define('sl-radio-group');

import type { 
  URadioItem, 
  URadioSize, 
  URadioType,
  URadioModel
} from "./URadio.model";

@customElement('u-radio')
export class URadioElement extends LitElement implements URadioModel {
  
  @query('sl-radio-group') radio!: SlRadioGroup;

  @property({ type: String }) type: URadioType = 'radio';
  @property({ type: String }) label: string = 'Radio group';
  @property({ type: String }) help?: string;
  @property({ type: String }) value?: string;
  @property({ type: String }) size: URadioSize = 'medium';
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: Array }) list: URadioItem[] = [];

  render() {
    return html`
      <sl-radio-group
        label=${this.label}
        help-text=${ifDefined(this.help)}
        value=${ifDefined(this.value)}
        size=${this.size}
        ?required=${this.required}
        @sl-change=${this.handleChanged}
      >
        ${this.renderRadio()}
      </sl-radio-group>
    `;
  }

  private renderRadio() {
    if(this.type === 'button') {
      return this.list.map((radio: URadioItem) => {
        return html`
          <sl-radio-button
            value=${radio.value}
            ?disabled=${radio.disabled || false}
          >${radio.display}</sl-radio-button>
        `;
      });
    } else {
      return this.list.map((radio: URadioItem) => {
        return html`
          <sl-radio
            value=${radio.value}
            ?disabled=${radio.disabled || false}
          >${radio.display}</sl-radio>
        `;
      });
    }
  }

  private async handleChanged(event: any) {
    const value = event.target.value;
    this.dispatchEvent(new CustomEvent('change', { 
      detail: value
    }));
  }

  static styles = [styles];
}

export const URadio = convertReact({
  elementClass: URadioElement,
  tagName: 'u-radio',
  events: {
    onChange: 'change'
  }
});