import { LitElement, html  } from 'lit';
import { customElement, property, query, state } from "lit/decorators.js";
import { convertReact } from "../../utils";

import SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.component.js';
SlDrawer.define('sl-drawer');

import { UDrawerModel, type DrawerPosition } from "./UDrawer.model";
import { UModalContent } from "./UModalContent";
import type { UModalResult } from "./UModalContent.model";
import { styles } from './UDrawer.styles';

@customElement('u-drawer')
export class UDrawerElement extends LitElement implements UDrawerModel {
  private resolveHandler?: (value: UModalResult<any>) => void;

  @query("sl-drawer") drawer!: SlDrawer;

  @state() content?: UModalContent;

  @property({ type: Boolean }) open: boolean = false;
  @property({ type: Boolean }) noHeader: boolean = false;
  @property({ type: Boolean }) contained: boolean = false;
  @property({ type: String }) position: DrawerPosition = "end";
  @property({ type: String }) label?: string;

  render() {
    return html`
      <sl-drawer
        ?open=${this.open}
        ?noHeader=${this.noHeader}
        ?contained=${this.contained}
        label=${this.label || ''}
        .placement=${this.position}
      >
        <slot name="action" slot="header-actions"></slot>
        ${this.content ?? html`<slot></slot>`}
      </sl-drawer>
    `;
  }

  public async showAsync<T>(content?: UModalContent) {
    this.label = content?.label ?? undefined;
    this.content = content ?? this.content;
    await this.updateComplete;
    await this.drawer.show();

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
    await this.drawer.hide();
  }

  public handleConfirm = async (event?: any) => {
    const value = event?.detail;
    if (this.resolveHandler) {
      this.resolveHandler({ confirmed: true, value });
    }
    await this.drawer.hide();
    this.resolveHandler = undefined;
    this.content = undefined;
  }

  public handleCancel = async (event?: any) => {
    const value = event?.detail;
    if (this.resolveHandler) {
      this.resolveHandler({ confirmed: false, value });
    }
    await this.drawer.hide();
    this.resolveHandler = undefined;
    this.content = undefined;
  }

  static styles = [styles];

}

export const UDrawer = convertReact({
  elementClass: UDrawerElement,
  tagName: 'u-drawer',
})