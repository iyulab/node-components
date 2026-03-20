import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import '../src';
import { Theme } from '../src/utilities/Theme';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @state() dropdownEvent = '';
  @state() contextEvent = '';
  @state() selectedTab = 'tab1';
  @state() chipSelected = false;

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
          <u-tooltip for=".actions u-button" offset="8" arrow>
            할로
          </u-tooltip>
        </div>
      </div>
      <div class="main">

        <!-- Tab Panel -->
        <h2 class="section-title">Tab Panel</h2>
        <section>
          <h3>Line Variant (default)</h3>
          <u-tab-panel value="tab1" variant="line"
            style="border: 1px solid var(--u-border-color); border-radius: 8px; height: 200px;">
            <div slot="toolbar">
              <u-button variant="ghost" style="font-size: 12px;">Actions</u-button>
            </div>
            <u-tab value="tab1">Home</u-tab>
            <u-tab value="tab2">Profile</u-tab>
            <u-tab value="tab3" disabled>Settings</u-tab>
            <u-panel value="tab1" style="padding: 1rem;">Home 콘텐츠입니다.</u-panel>
            <u-panel value="tab2" style="padding: 1rem;">Profile 콘텐츠입니다.</u-panel>
            <u-panel value="tab3" style="padding: 1rem;">Settings 콘텐츠입니다.</u-panel>
          </u-tab-panel>
        </section>

        <section>
          <h3>Card Variant</h3>
          <u-tab-panel value="file1" variant="card"
            style="height: 200px;">
            <u-tab value="file1" closable>index.ts</u-tab>
            <u-tab value="file2" closable>styles.css</u-tab>
            <u-tab value="file3" closable>README.md</u-tab>
            <u-panel value="file1" style="padding: 1rem; border: 1px solid var(--u-border-color); border-top: none;">
              index.ts 파일 내용
            </u-panel>
            <u-panel value="file2" style="padding: 1rem; border: 1px solid var(--u-border-color); border-top: none;">
              styles.css 파일 내용
            </u-panel>
            <u-panel value="file3" style="padding: 1rem; border: 1px solid var(--u-border-color); border-top: none;">
              README.md 파일 내용
            </u-panel>
          </u-tab-panel>
        </section>

        <section>
          <h3>Pill Variant</h3>
          <u-tab-panel value="a" variant="pill"
            style="height: 180px;">
            <u-tab value="a">Overview</u-tab>
            <u-tab value="b">Analytics</u-tab>
            <u-tab value="c">Reports</u-tab>
            <u-panel value="a" style="padding: 1rem;">Overview 콘텐츠</u-panel>
            <u-panel value="b" style="padding: 1rem;">Analytics 콘텐츠</u-panel>
            <u-panel value="c" style="padding: 1rem;">Reports 콘텐츠</u-panel>
          </u-tab-panel>
        </section>

        <section>
          <h3>Plain Variant</h3>
          <u-tab-panel value="p1" variant="plain">
            <u-tab value="p1">First</u-tab>
            <u-tab value="p2">Second</u-tab>
            <u-panel value="p1" style="padding: 1rem;">First 패널</u-panel>
            <u-panel value="p2" style="padding: 1rem;">Second 패널</u-panel>
          </u-tab-panel>
        </section>

        <section>
          <h3>Left Placement</h3>
          <u-tab-panel value="l1" variant="line" placement="left"
            style="height: 200px; border: 1px solid var(--u-border-color); border-radius: 8px;">
            <u-tab value="l1">General</u-tab>
            <u-tab value="l2">Security</u-tab>
            <u-tab value="l3">Notifications</u-tab>
            <u-panel value="l1" style="padding: 1rem;">General 설정</u-panel>
            <u-panel value="l2" style="padding: 1rem;">Security 설정</u-panel>
            <u-panel value="l3" style="padding: 1rem;">Notifications 설정</u-panel>
          </u-tab-panel>
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
      overflow: auto;
    }

    .section-title {
      margin: 40px 0 16px 0;
      padding-bottom: 8px;
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--u-txt-color);
      border-bottom: 2px solid var(--u-border-color);
    }
    .section-title:first-of-type {
      margin-top: 0;
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

    .context-area {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 400px;
      height: 150px;
      border: 2px dashed var(--u-border-color);
      border-radius: 8px;
      color: var(--u-txt-color-weak);
      font-size: 1rem;
      user-select: none;
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
