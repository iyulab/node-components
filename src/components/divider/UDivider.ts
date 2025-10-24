import { LitElement,  } from 'lit';
import { customElement, property } from "lit/decorators.js";
import { convertReact } from "../../utils";

import type { UDividerModel } from "./UDivider.model";
import { styles } from './UDivider.styles';

@customElement('u-divider')
export class UDividerElement extends LitElement implements UDividerModel {

  @property({ type: Boolean }) vertical: boolean = false;
  @property({ type: String }) color?: string;
  @property({ type: String }) width?: string;
  @property({ type: String }) spacing?: string;
  
  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has('color') && this.color) {
      this.style.setProperty('--color', this.color);
    }
    if (changedProperties.has('width') && this.width) {
      this.style.setProperty('--width', this.width);
    }
    if (changedProperties.has('spacing') && this.spacing) {
      this.style.setProperty('--spacing', this.spacing);
    }
  }

  static styles = [styles];
}

export const UDivider = convertReact({
  elementClass: UDividerElement,
  tagName: 'u-divider',
});