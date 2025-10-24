import { LitElement, html, nothing  } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { UInputLabelModel } from './UInputLabel.model';
import { styles } from './UInputLabel.styles';

@customElement('u-input-label')
export class UInputLabel extends LitElement implements UInputLabelModel {

  @property({ type: Boolean, reflect: true }) required?: boolean;
  @property({ type: String }) label?: string;
  @property({ type: String }) description?: string;

  render() {
    if(!this.label) return nothing;
    
    return html`
      <div class="container">
        <label>${this.label}</label>
        ${this.renderDescription()}
      </div>
    `;
  }

  private renderDescription() {
    if(!this.description) return nothing;
    
    return html`
      <div class="tooltip">
        <u-icon type="system" name="info-circle-fill"></u-icon>
        <pre>${this.description}</pre>
      </div>
    `;
  }

  static styles = [styles];
}