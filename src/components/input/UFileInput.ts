import { html  } from 'lit';
import { customElement, property, query, state } from "lit/decorators.js";
import { convertReact } from "../../utils";

import { UBaseInput } from "../input-parts/UBaseInput";
import { UFileInputModel, type FileMetaValue } from "./UFileInput.model";
import { UFileItemElement, UploadResponse } from "../files";
import { SystemIcon } from "../icon/UIcon.resource";
import { styles } from './UFileInput.styles';

// TODO: UFileItem과 함께 구조정리 재설계 필요
@customElement('u-file-input')
export class UFileInputElement extends UBaseInput implements UFileInputModel {

  @query('input') inputEl!: HTMLInputElement;
  @query('.overlay') overlay!: HTMLElement;
  
  @state() files?: File[];

  @property({ type: Boolean, reflect: true }) uploading: boolean = false;
  @property({ type: Boolean, reflect: true }) dragover: boolean = false;
  @property({ type: Array }) accepts?: string[] = [];
  @property({ type: Array }) value?: FileMetaValue[];

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if(changedProperties.has('files')) {
      this.uploading = this.files && this.files.length > 0 ? true : false;
    }
  }

  render() {
    return html`
      <input type="file" multiple 
        accept=${this.accepts?.join(',') || '*'}
        @change=${this.onReceive}
      />
      <u-input-container>
        <u-input-border>
          <div class="dropbox"
            @dragover=${this.onDragOver}
            @dragenter=${this.onDragEnter}
          >
            ${this.renderPlaceholder()}
            ${this.renderFileUpload()}
            ${this.renderFiles()}
          </div>
          <div class="overlay"
            @dragover=${this.onDragOver}
            @dragleave=${this.onDragLeave}
            @drop=${this.onDrop}
          >
            <svg viewBox="0 0 16 16">
              <path d="${SystemIcon['upload']?.path}"></path>
            </svg>
            <div class="text">Drop your files here</div>
            <div class="text">Accept: ${this.accepts?.join(', ') || 'all'}</div>
          </div>
        </u-input-border>
      </u-input-container>
    `;
  }

  public async validate() {
    if(this.required && (!this.value || this.value.length === 0)) {
      return this.setInvalid('Please select a file.');
    }
    if(this.uploading) {
      return this.setInvalid('Please wait until the upload is complete.');
    }
    return this.setValid();
  }

  private renderFileUpload() {
    if(!this.files || this.files.length === 0) return;
    return this.files.map(file => html`
      <u-file-item class="upload"
        .file=${file}
        @upload=${this.onUpload}
      ></u-file-item>
    `);
  }

  private renderFiles() {
    if(!this.value || this.value.length === 0) return;
    return this.value.map(value => html`
      <u-file-item class="file"
        .value=${value}
        @remove=${this.onRemove}
      ></u-file-item>
    `);
  }

  private renderPlaceholder() {
    if(this.value && this.value.length > 0) return;
    if(this.files && this.files.length > 0) return;
    return html`
      <div class="placeholder">
        <u-icon type="system" name="upload"></u-icon>
        <div class="text">Drag your files here or</div>
        <div class="text button" @click=${() => this.inputEl.click()}>
          Click to browse your files
        </div>
      </div>
    `;
  }

  private onReceive = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if(!input.files) return;
    this.files = Array.from(input.files);
  }

  private onUpload = (event: CustomEvent) => {
    const target = event.target as UFileItemElement;
    const file = target.file;
    if(!file) return;
    const response = event.detail as UploadResponse;
    this.value ||= [];
    this.value = [...this.value, {
      type: file.type,
      name: file.name,
      size: file.size,
      path: response.data
    }];
    this.files = this.files?.filter(f => f !== file);
  }

  private onRemove = (event: CustomEvent) => {
    console.log('remove:', event.target);
    const target = event.target as UFileItemElement;
    const file = target.file;
    const value = target.value;
    if(file) {
      console.log('file:', file);
      this.files = this.files?.filter(f => f !== file);
    }
    if(value) {
      this.value = this.value?.filter(v => v !== value);
    }
  }

  private onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  private onDragEnter = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.dragover = true;
  }

  private onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.relatedTarget as HTMLElement;
    if(target instanceof Node && !this.overlay.contains(target)) {
      this.dragover = false;
    }
  }

  private onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if(this.uploading) return;
    const files = Array.from(event.dataTransfer?.files || []);
    this.files = files.filter(file => this.checkAccepts(file));
    this.dragover = false;
  }

  private checkAccepts(file: File) {
    if(!this.accepts) return true;
    if(this.accepts.length === 0) return true;
    return this.accepts.some((accept) => {
      if(accept === '*') {
        return true;
      } else if(accept.endsWith('/*')) {
        return file.type.startsWith(accept.replace('/*', ''));
      } else {
        return file.type === accept;
      }
    });
  }

  static styles = [styles];
}

export const UFileInput = convertReact({
  elementClass: UFileInputElement,
  tagName: 'u-file-input',
});