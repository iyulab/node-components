import { LitElement, html  } from 'lit';
import { customElement, property } from "lit/decorators.js";
import { convertReact } from "../../utils";
import { t } from "../../localization/ULocalizer";

import type { PropertyMetaData } from "../../decorators/PropertyMeta.model";
import type { UInputDialogModel, UInputDialogResult, UInputDialogConfig } from './UInputDialog.model';
import "./UDialog";
import "../input/UInput";
import "../button/UButtonGroup";
import "../button/UButton";
import { styles } from './UInputDialog.styles';

@customElement("u-input-dialog")
export class UInputDialogElement extends LitElement implements UInputDialogModel {
  private resolveHandler?: (value: UInputDialogResult) => void;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: String }) label?: string;
  @property({ attribute: false }) value?: any;
  @property({ type: Object }) meta?: PropertyMetaData;

  @property({ type: Object }) config?: UInputDialogConfig;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has("config") && this.config) {
      const { title, ...meta } = this.config;
      this.label = title;
      this.meta = meta;
    }
  }

  render() {
    return html`
      <u-dialog
        ?open=${this.open}
        .label=${this.label || t("inputTitle", {
          ns: "component",
          defaultValue: "Please enter a value"
        })}
      >
        <u-input
          .meta=${this.meta}
          @change=${this.handleChangeValue}
        ></u-input>
        <u-button-group gap="10px">
          <u-button
            theme="default"
            @click=${this.handleCancel}
          >${t("cancel", { ns: 'component', defaultValue: "Cancel" })}</u-button>
          <u-button
            theme="primary"
            @click=${this.handleConfirm}
          >${t("confirm", { ns: 'component', defaultValue: "Confirm" })}</u-button>
        </u-button-group>
      </u-dialog>
    `;
  }

  public async showAsync() {
    this.open = true;
    await this.updateComplete;
    return new Promise<UInputDialogResult>((resolve) => {
      this.resolveHandler = resolve;
    });
  }

  public async hideAsync() {
    this.open = false;
    await this.updateComplete;
  }

  public handleConfirm = async () => {
    if (this.resolveHandler) {
      this.resolveHandler({ confirmed: true, value: this.value });
    }
    await this.hideAsync();
    this.resolveHandler = undefined;
  };

  public handleCancel = async () => {
    if (this.resolveHandler) {
      this.resolveHandler({ confirmed: false, value: this.value });
    }
    await this.hideAsync();
    this.resolveHandler = undefined;
  };

  private handleChangeValue = (e: any) => {
    this.value = e.target?.value;
  }

  static styles = [styles];
  
}

export const UInputDialog = convertReact({
  elementClass: UInputDialogElement,
  tagName: 'u-input-dialog',
})