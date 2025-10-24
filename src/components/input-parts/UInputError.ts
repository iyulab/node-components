import { LitElement, html, nothing  } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { UInputErrorModel } from './UInputError.model';
import { styles } from './UInputError.styles';

@customElement('u-input-error')
export class UInputError extends LitElement implements UInputErrorModel {

  @property({ type: String }) error?: string;

  render() {
    if(!this.error) return nothing;

    return html`<div class="error">${this.error}</div>`;
  }

  static styles = [styles];
}