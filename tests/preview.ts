import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import '../src';
import { Theme } from '../src/utilities/Theme';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @state() lastResult = '';
  @state() transitionValue = 30;
  @state() sliderValue = 40;
  @state() sliderRangeMin = 20;
  @state() sliderRangeMax = 80;

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
          <u-button id="theme-toggle"
            @click=${() => Theme.set(Theme.get() === 'dark' ? 'light' : 'dark')}>
            테마 변경
          </u-button>
        </div>
      </div>
      <div class="main" style="overflow: auto;">

        <!-- 컴포넌트 프리뷰 섹션 -->
        <section>
          <h2>컴포넌트 프리뷰</h2>

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
    section h3 {
      margin: 20px 0 10px 0;
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--u-txt-color);
    }
    section p {
      margin: 0 0 20px 0;
      color: var(--u-txt-color-weak);
    }

    .row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .col {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
  `;
}
