import { LitElement, html, } from "lit";
import { customElement, property } from "lit/decorators.js";
import { convertReact } from "../../utils";
import { styles } from './UProgressRing.styles';

import SlProgressRing from '@shoelace-style/shoelace/dist/components/progress-ring/progress-ring.component.js';
SlProgressRing.define('sl-progress-ring');

import { UProgressRingModel } from './UProgressRing.model';

@customElement('u-progress-ring')
export class UProgressRingElement extends LitElement implements UProgressRingModel {

  @property({ type: Number }) value?: number;
  @property({ type: String }) size?: string;
  @property({ type: String }) thickness?: string;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;
    if(changedProperties.has('size') && this.size) {
      this.style.setProperty('--ring-size', this.size);
    }
    if(changedProperties.has('thickness') && this.thickness) {
      this.style.setProperty('--ring-thickness', this.thickness);
    }
  }

  render() {
    return html`
      <sl-progress-ring
        .value=${this.value || 0}>
        ${this.value} %
      </sl-progress-ring>
    `;
  }

  static styles = [styles];
}

export const UProgressRing = convertReact({
  elementClass: UProgressRingElement,
  tagName: 'u-progress-ring'
});