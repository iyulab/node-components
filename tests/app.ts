import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import '../src';
import { propertyMeta, localizer, t } from "../src/utilities";

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("u-button") button!: any;

  connectedCallback() {
    super.connectedCallback();
    localizer.init();
  }

  render() {
    return html`
      <div class="canvas">
        <div class="inside">
          <u-button @click=${this.toggleTheme}>
            ${t('Toggle Theme')}
          </u-button>
        </div>
      </div>
    `;
  }

  toggleTheme() {
    document.documentElement.classList.toggle('sl-theme-dark');
  }

  static styles = css`
    :host {
      width: 100%;
      height: 100%;
    }

    .canvas {
      width: 100%;
      height: 200px;

      .inside {
        width: 50%;
        height: 100%;
        background-color: #f0f0f0;
      }
    }
  `;
}
