import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { convertReact } from "../../utils";
import { styles as componentStyles } from './MonacoEditor.styles';

import SlCopyButton from "@shoelace-style/shoelace/dist/components/copy-button/copy-button.component.js";
SlCopyButton.define('sl-copy-button');

import "./MonacoEditor.worker";
import * as monaco from "monaco-editor";
// import styles from "monaco-editor/min/vs/editor/editor.main.css?inline";

import { MonacoEditorModel, type EditorTheme } from "./MonacoEditor.model";

@customElement("monaco-editor")
export class MonacoEditorElement extends LitElement implements MonacoEditorModel {
  static styles = [
    // unsafeCSS(styles),
    componentStyles
  ];

  private container: Ref<HTMLElement> = createRef();
  private editor!: monaco.editor.IStandaloneCodeEditor;
  private observer: MutationObserver = new MutationObserver(() => {
    const theme = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light";
    if (this.theme !== theme) this.theme = theme;
  });

  @property({ type: Boolean, reflect: true }) noHeader: boolean = false;
  @property({ type: String }) label: string = "Editor";
  @property({ type: String }) theme: EditorTheme = "light"; 
  @property({ type: Boolean }) readOnly: boolean = false;
  @property({ type: String }) language: string = "json";
  @property({ type: Number }) fontSize: number = 14;
  @property({ type: String }) value: string = "";
  
  connectedCallback() {
    super.connectedCallback();
    this.theme = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light";
    this.observer.observe(document.documentElement, { 
      attributes: true, attributeFilter: ["class"]
    });
  }

  disconnectedCallback() {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    await this.updateComplete;
      
    this.editor = monaco.editor.create(this.container.value!, {
      language: this.language,
      theme: this.theme === "light" ? "vs-light" : "vs-dark",
      fontSize: this.fontSize,
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 1,
      readOnly: this.readOnly,
      value: this.value,
      // Updated options for newer Monaco
      scrollBeyondLastLine: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false
      }
    });

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.dispatchEvent(new CustomEvent("change", { detail: value }));
    });
  }

  async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has("value")
      && this.value !== this.editor.getValue()
      && !this.editor.hasWidgetFocus()) {
      this.editor.setValue(this.value);
    }
    if (changedProperties.has("theme") && this.editor) {
      this.editor.updateOptions({
        theme: this.theme === "light" ? "vs-light" : "vs-dark",
      });
    }
    if (changedProperties.has("language") && this.editor) {
      monaco.editor.setModelLanguage(this.editor.getModel()!, this.language);
    }
  }
  
  render() {
    return html`
      ${this.renderHeader()}
      <div class="editor">
        <main ${ref(this.container)}></main>
      </div>
    `;
  }

  private renderHeader() {
    if (this.noHeader) return nothing;
    return html`
      <div class="header">
        <slot name="header-preffix"></slot>
        <div class="title">${this.label}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
        <sl-copy-button value=${this.value}></sl-copy-button>
      </div>
    `;
  }
}

export const MonacoEditor = convertReact({
  elementClass: MonacoEditorElement,
  tagName: "monaco-editor",
  events: {
    onChange: "change",
  }
});