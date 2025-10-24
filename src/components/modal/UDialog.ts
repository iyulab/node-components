import { html, LitElement  } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js';
import { DirectiveResult } from 'lit/async-directive.js';
import { convertReact } from '../../utils';

import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.component.js';
SlDialog.define('sl-dialog');

import { UDialogModel } from './UDialog.model';
import { UModalContent } from './UModalContent';
import type { UModalResult } from './UModalContent.model';
import { styles } from './UDialog.styles';

@customElement('u-dialog')
export class UDialogElement extends LitElement implements UDialogModel {
  private resolveHandler?: (value: UModalResult<any>) => void;
  
  @query("sl-dialog") dialog!: SlDialog;

  @state() content?: UModalContent;

  @property({ type: Boolean }) open: boolean = false;
  @property({ type: Boolean }) noHeader: boolean = false;
  @property({ type: String }) label?: string | DirectiveResult;
    
  render() {
    return html`
      <sl-dialog 
        ?open=${this.open}
        ?noHeader=${this.noHeader}
        label=${ifDefined(this.label)}
      >
        <slot name="action" slot="header-actions"></slot>
        ${this.content ?? html`<slot></slot>`}
      </sl-dialog>
    `;
  }
  
  public async showAsync<T>(content?: UModalContent) {
    this.label = content?.label;
    this.content = content ?? this.content;
    await this.updateComplete;
    await this.dialog.show();

    return new Promise<UModalResult<T>>((resolve) => {
      if (this.content instanceof UModalContent) {
        this.resolveHandler = resolve;
        this.content.addEventListener('confirm', this.handleConfirm);
        this.content.addEventListener('cancel', this.handleCancel);
      } else {
        resolve({ confirmed: false });
      }
    });
  }

  public async hideAsync() {
    await this.dialog.hide();
  }

  public handleConfirm = async (event?: any) => {
    const value = event?.detail;
    if (this.resolveHandler) {
      this.resolveHandler({ confirmed: true, value });
    }
    await this.dialog.hide();
    this.resolveHandler = undefined;
    this.content = undefined;
  }

  public handleCancel = async (event?: any) => {
    const value = event?.detail;
    if (this.resolveHandler) {
      this.resolveHandler({ confirmed: false, value });
    }
    await this.dialog.hide();
    this.resolveHandler = undefined;
    this.content = undefined;
  }

  static styles = [styles];

}

export const UDialog = convertReact({
  elementClass: UDialogElement,
  tagName: 'u-dialog',
})