import { LitElement, html  } from 'lit';
import { customElement, property, query } from "lit/decorators.js";
import { convertReact } from "../../utils";
import { t } from "../../localization/ULocalizer";

import { UMessageDialogModel } from './UMessageDialog.model';
import "./UDialog";
import "../button/UButtonGroup";
import "../button/UButton";
import { styles } from './UMessageDialog.styles';

@customElement("u-message-dialog")
export class UMessageDialogElement extends LitElement implements UMessageDialogModel {
  private resolveHandler?: (value: boolean) => void;
  
  @query(".message") messageEl!: HTMLDivElement;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: String }) label?: string;
  @property({ type: String }) message?: string;
  @property({ type: String }) color?: string;
  @property({ type: String }) size?: string;
  @property({ type: String }) weight?: string;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;
    
    if (changedProperties.has("color") && this.color) {
      this.messageEl.style.color = this.color;
    }
    if (changedProperties.has("size") && this.size) {
      this.messageEl.style.fontSize = this.size;
    }
    if (changedProperties.has("weight") && this.weight) {
      this.messageEl.style.fontWeight = this.weight;
    }
  }

  render() {
    return html`
      <u-dialog
        ?open=${this.open}
        .label=${this.label || t("messageTitle", {
          ns: "component",
          defaultValue: "Message"
        })}
      >
        <p class="message">
          ${this.message}
        </p>
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
    return new Promise<boolean>((resolve) => {
      this.resolveHandler = resolve;
    });
  }

  public async hideAsync() {
    this.open = false;
    await this.updateComplete;
  }

  public handleConfirm = async () => {
    if (this.resolveHandler) {
      this.resolveHandler(true);
    }
    await this.hideAsync();
    this.resolveHandler = undefined;
  };

  public handleCancel = async () => {
    if (this.resolveHandler) {
      this.resolveHandler(false);
    }
    await this.hideAsync();
    this.resolveHandler = undefined;
  };

  static styles = [styles];
  
}

export const UMessageDialog = convertReact({
  elementClass: UMessageDialogElement,
  tagName: 'u-message-dialog',
});