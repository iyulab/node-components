import { LitElement, html  } from 'lit';
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { convertReact } from "../../utils";

import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
SlTooltip.define('sl-tooltip');

import type { UTooltipModel, UTooltipPosition } from "./UTooltip.model";
import { styles } from './UTooltip.styles';

@customElement('u-tooltip')
export class UTooltipElement extends LitElement implements UTooltipModel {

  @query("sl-tooltip") tooltip!: SlTooltip;

  @property({ type: String }) position: UTooltipPosition = 'top';
  @property({ type: Number }) distance?: number;
  @property({ type: Boolean }) hoist: boolean = false;
  @property({ type: Number }) maxWidth?: number;
  @property({ type: Boolean, reflect: true }) arrow: boolean = false;
  @property({ type: String }) content?: any;

  protected async update(changedProperties: any) {
    super.update(changedProperties);
    await this.updateComplete;

    if (changedProperties.has('maxWidth')) {
      this.tooltip.style.setProperty('--max-width', `${this.maxWidth}px`);
    }
  }

  render() {
    return html`
      <sl-tooltip 
        .position=${this.position}
        distance=${ifDefined(this.distance)}
        ?hoist=${this.hoist}
      >
        ${this.renderContent()}
        <slot></slot>
      </sl-tooltip>
    `;
  }

  private renderContent() {
    return this.content
      ? html`<span slot="content">${this.content}</span>`
      : html`<slot slot="content" name="content"></slot>`;
  }

  static styles = [styles];

}

export const UTooltip = convertReact({
  elementClass: UTooltipElement,
  tagName: 'u-tooltip',
})