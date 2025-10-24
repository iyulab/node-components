import { html  } from 'lit';
import { customElement, property } from "lit/decorators.js";
import { convertReact } from "../../utils";

import { t } from '../../localization/ULocalizer';
import { UEditorInputModel } from "./UEditorInput.model";
import { UBaseInput } from "../input-parts/UBaseInput";
import "../editor/MonacoEditor";
import { styles } from './UEditorInput.styles';

@customElement('u-editor-input')
export class UEditorInputElement extends UBaseInput implements UEditorInputModel {

  @property({ type: String }) language?: string;
  @property({ type: Number }) fontSize?: number;
  @property({ type: String }) value?: string;
  
  render() {
    return html`
      <u-input-container>
        <u-input-border>
          <monaco-editor 
            noHeader
            .language=${this.language || 'json'}
            .readOnly=${this.readonly || false}
            .value=${this.value || ''}
            .fontSize=${this.fontSize || 14}
            @change=${this.onChange}
          ></monaco-editor>
        </u-input-border>
      </u-input-container>
    `;
  }

  public async validate() {
    if (this.required && !this.value) {
      return this.setInvalid(t('requiredField', {
        ns: 'component',
        defaultValue: 'This field is required'
      }));
    } else {
      return this.setValid();
    }
  }

  private onChange = (event: CustomEvent) => {
    this.value = event.detail.trim();
    this.validate();
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }

  static styles = [styles];
}

export const UEditorInput = convertReact({
  elementClass: UEditorInputElement,
  tagName: 'u-editor-input',
  events: {
    onChange: 'change'
  }
})