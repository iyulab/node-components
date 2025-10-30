import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { getTheme, localizer, setTheme, t } from "../src/utilities";
import { Alert } from "../src/components/alert/Alert.js";

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
          <u-button @click=${this.alert}>
            ${t('Show Alert')}
          </u-button>
        </div>
      </div>
    `;
  }

  toggleTheme() {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
  }

  alert() {
    Alert.toast({
      type: 'success',
      content: t('This is a toast alert!'),
      duration: 3000,
    });
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
