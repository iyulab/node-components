import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { theme } from '../src/utilities/theme';
import { Dialog } from '../src/components/dialog/Dialog';
import { Drawer } from '../src/components/drawer/Drawer';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("#theme-toggle") themeToggleBtn!: HTMLButtonElement;
  @query("#dialog") dialog!: Dialog;
  @query("#drawer-start") drawerStart!: Drawer;
  @query("#drawer-end") drawerEnd!: Drawer;
  @query("#drawer-top") drawerTop!: Drawer;
  @query("#drawer-bottom") drawerBottom!: Drawer;

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
          <h2>Dialog</h2>
          <p>모달 대화상자 컴포넌트입니다.</p>
          <div class="button-group">
            <u-button @click=${() => this.dialog.show()}>Dialog 열기</u-button>
          </div>
          <u-dialog id="dialog" heading="Dialog 제목">
            <div style="padding: 20px;">
              <p>이것은 Dialog 컴포넌트의 내용입니다.</p>
              <p>모달 형태로 화면 중앙에 표시됩니다.</p>
            </div>
          </u-dialog>
        </section>

        <section>
          <h2>Drawer</h2>
          <p>화면 가장자리에서 슬라이드하여 나타나는 패널입니다.</p>
          <div class="button-group">
            <u-button @click=${() => this.drawerStart.show()}>Start (왼쪽)</u-button>
            <u-button @click=${() => this.drawerEnd.show()}>End (오른쪽)</u-button>
            <u-button @click=${() => this.drawerTop.show()}>Top (위)</u-button>
            <u-button @click=${() => this.drawerBottom.show()}>Bottom (아래)</u-button>
          </div>
          
          <u-drawer id="drawer-start" placement="start" heading="Start Drawer">
            <div style="padding: 20px;">
              <p>왼쪽에서 나타나는 Drawer입니다.</p>
              <p>네비게이션 메뉴 등에 사용됩니다.</p>
            </div>
          </u-drawer>
          
          <u-drawer id="drawer-end" placement="end" heading="End Drawer">
            <div style="padding: 20px;">
              <p>오른쪽에서 나타나는 Drawer입니다.</p>
              <p>상세 정보 패널 등에 사용됩니다.</p>
            </div>
          </u-drawer>
          
          <u-drawer id="drawer-top" placement="top" heading="Top Drawer">
            <div style="padding: 20px;">
              <p>위에서 나타나는 Drawer입니다.</p>
            </div>
          </u-drawer>
          
          <u-drawer id="drawer-bottom" placement="bottom" heading="Bottom Drawer">
            <div style="padding: 20px;">
              <p>아래에서 나타나는 Drawer입니다.</p>
            </div>
          </u-drawer>
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