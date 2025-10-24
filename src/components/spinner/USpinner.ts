import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { convertReact } from "../../utils";
import { styles } from './USpinner.styles';

import SlSpinner from "@shoelace-style/shoelace/dist/components/spinner/spinner.component.js";
SlSpinner.define('sl-spinner');

import type { USpinnerModel } from "./USpinner.model";

@customElement('u-spinner')
export class USpinnerElement extends LitElement implements USpinnerModel {

  @query('sl-spinner') spinner!: SlSpinner;

  @property({ type: String }) size?: string;
  @property({ type: String }) width?: string;
  @property({ type: String }) indicatorColor?: string;
  @property({ type: String }) trackColor?: string;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has('size') && this.size) {
      this.spinner.style.fontSize = this.size;
    }
    if (changedProperties.has('width') && this.width) {
      this.spinner.style.setProperty('--track-width', this.width);
    }
    if (changedProperties.has('indicatorColor') && this.indicatorColor) {
      this.spinner.style.setProperty('--indicator-color', this.indicatorColor);
    }
    if (changedProperties.has('trackColor') && this.trackColor) {
      this.spinner.style.setProperty('--track-color', this.trackColor);
    }
  }

  render() {
    return html`
      <sl-spinner></sl-spinner>
    `;
  }

  static styles = [styles];

}

export const USpinner = convertReact({
  elementClass: USpinnerElement,
  tagName: 'u-spinner',
})