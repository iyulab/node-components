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
          <h2>Menu Component</h2>
          <p>우클릭하여 컨텍스트 메뉴를 확인하세요.</p>
          <div class="context-area">
            우클릭 영역
          </div>
          <u-menu for=".context-area" trigger="contextmenu" mode="multiple"
            @u-select=${this.handleSelect}>
            <u-menu-item value="cut">잘라내기</u-menu-item>
            <u-menu-item value="copy">복사</u-menu-item>
            <u-menu-item value="paste">붙여넣기</u-menu-item>
            <u-menu-item value="delete">삭제</u-menu-item>
            <u-menu-item value="select-all">모두 선택</u-menu-item>
            <u-menu-item>더보기
              <u-menu slot="submenu">
                <u-menu-item value="find">찾기</u-menu-item>
                <u-menu-item value="replace">바꾸기</u-menu-item>
              </u-menu>
            </u-menu-item>
          </u-menu>
        </section>
        <section>
          <h2>Dropdown Menu</h2>
          <p>아래 버튼을 클릭하여 드롭다운 메뉴를 확인하세요.</p>
          <u-button id="dropdown-btn">메뉴 열기</u-button>
          <u-menu for="#dropdown-btn" trigger="click" mode="single"
            @u-select=${this.handleSelect}>
            <u-menu-item value="new-file">새 파일</u-menu-item>
            <u-menu-item value="open-file">파일 열기</u-menu-item>
            <u-menu-item value="save-file">파일 저장</u-menu-item>
            <u-menu-item>내보내기
              <u-menu slot="submenu">
                <u-menu-item value="export-pdf">PDF로 내보내기</u-menu-item>
                <u-menu-item value="export-docx">DOCX로 내보내기</u-menu-item>
              </u-menu>
            </u-menu-item>
          </u-menu>
        </section>
      </div>
    `;
  }

  private handleSelect = (e: CustomEvent) => {
    console.log('u-select:', e.detail);
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

    .context-area {
      width: 300px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--u-border-color);
      border-radius: 8px;
      color: var(--u-txt-color-secondary, #666);
      user-select: none;
    }
  `;
}