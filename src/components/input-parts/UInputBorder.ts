import { LitElement, html  } from 'lit';
import { customElement, property } from "lit/decorators.js";

import { UInputBorderModel } from "./UInputBorder.model";
import { styles } from './UInputBorder.styles';

@customElement('u-input-border')
export class UInputBorder extends LitElement implements UInputBorderModel {

  @property({ type: Boolean, reflect: true }) invaild?: boolean;

  render() {
    return html`
      <slot></slot>
    `;
  }

  static styles = [styles];
}