import { LitElement, html  } from 'lit';
import { customElement, property } from "lit/decorators.js";
import { styles } from './UWizardContent.styles';

@customElement("u-wizard-content")
export class UWizardContent extends LitElement {

  @property({ type: String }) name?: string;

  render() {
    return html`
      <slot></slot>
    `;
  }

  static styles = [styles];

}