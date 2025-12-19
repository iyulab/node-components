import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { theme } from '../src/utilities/theme';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("#theme-toggle") themeToggleBtn!: HTMLButtonElement;

  connectedCallback(): void {
    super.connectedCallback();
    theme.init({
      store: { type: 'localStorage', prefix: 'uui-' },
    });
  }

  render() {
    return html`
      <div class="header">
        <h1>Component Preview</h1>
        <div class="actions">
          <u-button id="theme-toggle"
            @click=${() => theme.set(theme.get() === 'dark' ? 'light' : 'dark')}>
            테마 변경
          </u-button>
        </div>
      </div>
      <div class="main" style="overflow: auto;">
        <section>
          <h2>Tree Component</h2>
          <p>A preview of the Tree component.</p>
          <u-tree>
            <u-tree-item>
              Item 1
              <u-tree-item slot="children">Item 1.1</u-tree-item>
              <u-tree-item slot="children">Item 1.2</u-tree-item>
            </u-tree-item>
            <u-tree-item>
              Item 2
              <u-tree-item slot="children">Item 2.1</u-tree-item>
              <u-tree-item slot="children">
                Item 2.2
                <u-tree-item slot="children">Item 2.2.1</u-tree-item>
                <u-tree-item slot="children">Item 2.2.2</u-tree-item>
              </u-tree-item>
            </u-tree-item>
            <u-tree-item>Item 3 (Leaf)</u-tree-item>
          </u-tree>
        </section>
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
    }

    section {
      margin-bottom: 60px;
    }
    section h2 {
      margin: 0 0 10px 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--u-txt-color);
    }
    section p {
      margin: 0 0 20px 0;
      color: var(--u-txt-color-secondary, #666);
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }
  `;
}