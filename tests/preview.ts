import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import '../src';
import { Theme } from '../src/utilities/Theme';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  connectedCallback(): void {
    super.connectedCallback();
    Theme.init({
      store: { type: 'localStorage', prefix: 'uui-' },
    });
  }

  render() {
    return html`
      <div class="header">
        <h1>Component Preview</h1>
        <div class="actions">
          <u-button
            @click=${() => Theme.set(Theme.get() === 'dark' ? 'light' : 'dark')}>
            테마 변경
          </u-button>
        </div>
      </div>
      <div class="main">

      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
      color: var(--u-txt-color);
      background-color: var(--u-bg-color);
    }

    .header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--u-border-color);
    }
    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }
    .header .actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }

    .main {
      display: block;
      overflow: auto;
    }

    section {
      margin-bottom: 40px;
    }
    section h3 {
      margin: 0 0 10px 0;
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--u-txt-color);
    }

    .row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .log {
      padding: 12px 16px;
      border-radius: 4px;
      background: var(--u-panel-bg-color);
      border: 1px solid var(--u-border-color);
      font-family: monospace;
      font-size: 0.9rem;
      color: var(--u-txt-color);
      min-height: 1.5em;
    }
  `;
}
