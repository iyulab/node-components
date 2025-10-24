import { LitElement, html  } from 'lit';
import { customElement, property } from "lit/decorators.js";

import { styles } from './UWizardStep.styles';

@customElement("u-wizard-step")
export class UWizardStep extends LitElement {
  static styles = [styles];
  
  @property({ type: Boolean }) active?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) content?: string;

  render() {
    return html`      
      <slot name="icon"></slot>
      <slot></slot>
    `;
  }

}