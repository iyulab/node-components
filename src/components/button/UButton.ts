import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js';
import { convertReact } from '../../utils';
import { styles } from './UButton.styles';

import '@shoelace-style/shoelace/dist/components/button/button.js';

import type { UTooltipPosition } from '../tooltip/UTooltip.model';
import type { CommandModel } from '../../patterns/CommandPattern';
import type { UButtonModel, UButtonTheme, UButtonSize, UButtonTarget } from './UButton.model';

import '../tooltip/UTooltip';

@customElement('u-button')
export class UButtonElement extends LitElement implements UButtonModel {

  @property({ type: String }) theme: UButtonTheme = 'default';
  @property({ type: Boolean }) outline: boolean = false;
  @property({ type: String }) size: UButtonSize = 'small';
  @property({ type: String }) href?: string;
  @property({ type: String }) target: UButtonTarget = '_self';
  @property({ type: String }) download?: string;
  @property({ type: Boolean }) round: boolean = false;
  @property({ type: Boolean }) disabled: boolean = false;
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  @property({ type: Boolean }) caret?: boolean = false;
  @property({ type: String }) tooltip?: string;
  @property({ type: String }) tooltipPosition: UTooltipPosition = 'top';
  @property({ type: Object }) command?: CommandModel;
  @property() commandParam?: any;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has('command') && this.command) {
      this.disabled = !this.command.canExecute(this.commandParam);
    }
  }

  render() {
    if (this.tooltip) {
      return this.renderButtonWithTooltip();
    } else {
      return this.renderButton();
    }
  }

  private renderButtonWithTooltip() {
    return html`
      <u-tooltip
        .content=${this.tooltip}
        .position=${this.tooltipPosition}>
        ${this.renderButton()}
      </u-tooltip>
    `;
  }

  private renderButton() {
    return html`
      <sl-button
        type="button"
        .variant=${this.theme}
        .size=${this.size}
        ?pill=${this.round}
        ?caret=${this.caret}
        ?disabled=${this.disabled}
        ?loading=${this.loading}
        ?outline=${this.outline}
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        @click=${this.handleClick}
      >
        <slot slot="prefix" name="prefix"></slot>
        <slot></slot>
        <slot slot="suffix" name="suffix"></slot>
      </sl-button>
    `;
  }

  private async handleClick(event: Event) {
    if (this.href || this.download) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.command && this.command.canExecute(this.commandParam)) {
      try {
        this.loading = true;
        this.command.execute(this.commandParam);
      } catch (error) {
        /* istanbul ignore next */
      } finally {
        this.loading = false;
      }
    }

    this.dispatchEvent(new CustomEvent('click', { 
      bubbles: true, composed: true
    }));
  }

  static styles = [styles];
}

export const UButton = convertReact({
  elementClass: UButtonElement,
  tagName: 'u-button',
  events: {
    onClick: 'click'
  }
});