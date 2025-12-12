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

  firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
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
          <h2>Dialog</h2>
          <u-dialog heading="Dialog Preview" ?modal=${true} open>
            <p>이것은 다이얼로그 컴포넌트의 미리보기입니다.</p>
          </u-dialog>
        </section>
        <section>
          <u-split-panel orientation="horizontal">
            <h2>Button</h2>
            <u-tooltip on for="u-button:nth-of-type(2)" strategy="fixed">
              툴팁이 표시됩니다.
            </u-tooltip>
            <u-button>Primary Button</u-button>
            <u-button>Secondary Button</u-button>
            <u-button>Tertiary Button</u-button>
          </u-split-panel>
        </section>
        <section style="height: 1200vh;">
          <h2>Scroll Test Content</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
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
      margin: 0 0 30px 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--u-txt-color);
    }
  `;
}