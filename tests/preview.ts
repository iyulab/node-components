import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { getTheme, importTheme, localizer, setTheme } from "../src/utilities";

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("u-button") button!: any;

  firstUpdated(changedProperties: any): void {
    super.firstUpdated(changedProperties);
    localizer.init();
    importTheme();
  }

  render() {
    return html`
      <div class="header">
        <h1>Component Preview</h1>
        <u-button @click=${this.toggleTheme}>테마 변경</u-button>
      </div>

      <section class="section">
        <h2>Input Components</h2>
        
        <div class="demo-item">
          <h3>Basic Input</h3>
          <u-input 
            label="이름" 
            placeholder="이름을 입력하세요"
            description="기본 텍스트 입력 필드입니다."
          ></u-input>
        </div>

        <div class="demo-item">
          <h3>Required Input with Validation</h3>
          <u-input 
            label="이메일" 
            type="email"
            placeholder="example@email.com"
            required
            validationMessage="올바른 이메일 주소를 입력해주세요."
            description="필수 입력 필드이며 이메일 형식을 검증합니다."
          ></u-input>
        </div>

        <div class="demo-item">
          <h3>Password Input</h3>
          <u-input 
            label="비밀번호" 
            type="password"
            placeholder="비밀번호 입력"
            required
            minlength="8"
            description="비밀번호는 최소 8자 이상이어야 합니다."
          ></u-input>
        </div>

        <div class="demo-item">
          <h3>Clearable Input</h3>
          <u-input 
            label="검색" 
            type="search"
            placeholder="검색어를 입력하세요"
            clearable
            description="X 버튼을 클릭하여 입력값을 지울 수 있습니다."
          ></u-input>
        </div>

        <div class="demo-item">
          <h3>Input with Label Help</h3>
          <u-input 
            label="사용자 ID" 
            labelhelp="사용자 ID는 영문자와 숫자만 사용 가능합니다."
            pattern="[a-zA-Z0-9]+"
            placeholder="user123"
            description="라벨 옆 도움말 아이콘에 마우스를 올려보세요."
          ></u-input>
        </div>

        <div class="demo-item">
          <h3>Disabled Input</h3>
          <u-input 
            label="비활성화됨" 
            value="수정 불가능"
            disabled
          ></u-input>
        </div>

        <div class="demo-item">
          <h3>Readonly Input</h3>
          <u-input 
            label="읽기 전용" 
            value="읽기만 가능"
            readonly
          ></u-input>
        </div>
      </section>

      <section class="section">
        <h2>Menu Components</h2>
        
        <div class="demo-item">
          <h3>Basic Menu</h3>
          <u-menu open>
            <u-menu-item value="1">메뉴 항목 1</u-menu-item>
            <u-menu-item value="2">메뉴 항목 2</u-menu-item>
            <u-menu-item value="3">메뉴 항목 3</u-menu-item>
          </u-menu>
        </div>

        <div class="demo-item">
          <h3>Selectable Menu</h3>
          <u-menu open selectable value="2">
            <u-menu-item value="1">옵션 1</u-menu-item>
            <u-menu-item value="2">옵션 2 (선택됨)</u-menu-item>
            <u-menu-item value="3">옵션 3</u-menu-item>
          </u-menu>
        </div>

        <div class="demo-item">
          <h3>Menu with Disabled Items</h3>
          <u-menu open>
            <u-menu-item value="1">활성화된 항목</u-menu-item>
            <u-menu-item value="2" disabled>비활성화된 항목</u-menu-item>
            <u-menu-item value="3">활성화된 항목</u-menu-item>
          </u-menu>
        </div>

        <div class="demo-item">
          <h3>Checkable Menu Items</h3>
          <u-menu open>
            <u-menu-item checkable checked>옵션 1</u-menu-item>
            <u-menu-item checkable>옵션 2</u-menu-item>
            <u-menu-item checkable checked>옵션 3</u-menu-item>
          </u-menu>
        </div>
      </section>

      <section class="section">
        <h2>Split Panel Components</h2>
        
        <div class="demo-item">
          <h3>Horizontal Split Panel</h3>
          <u-split-panel orientation="horizontal" style="height: 300px;">
            <u-panel>
              <div class="panel-content">왼쪽 패널</div>
            </u-panel>
            <u-panel>
              <div class="panel-content">오른쪽 패널</div>
            </u-panel>
          </u-split-panel>
        </div>

        <div class="demo-item">
          <h3>Vertical Split Panel</h3>
          <u-split-panel orientation="vertical" style="height: 400px;">
            <u-panel>
              <div class="panel-content">상단 패널</div>
            </u-panel>
            <u-panel>
              <div class="panel-content">하단 패널</div>
            </u-panel>
          </u-split-panel>
        </div>

        <div class="demo-item">
          <h3>Three-way Split Panel</h3>
          <u-split-panel orientation="horizontal" style="height: 300px;">
            <u-panel>
              <div class="panel-content">패널 1</div>
            </u-panel>
            <u-panel>
              <div class="panel-content">패널 2</div>
            </u-panel>
            <u-panel>
              <div class="panel-content">패널 3</div>
            </u-panel>
          </u-split-panel>
        </div>

        <div class="demo-item">
          <h3>Split Panel with Initial Sizes</h3>
          <u-split-panel orientation="horizontal" .ratio=${[1, 2]} style="height: 300px;">
            <u-panel>
              <div class="panel-content">작은 패널 (1/3)</div>
            </u-panel>
            <u-panel>
              <div class="panel-content">큰 패널 (2/3)</div>
            </u-panel>
          </u-split-panel>
        </div>

        <div class="demo-item">
          <h3>Disabled Split Panel</h3>
          <u-split-panel orientation="horizontal" disabled style="height: 300px;">
            <u-panel>
              <div class="panel-content">크기 조절 불가</div>
            </u-panel>
            <u-panel>
              <div class="panel-content">크기 조절 불가</div>
            </u-panel>
          </u-split-panel>
        </div>

        <div class="demo-item">
          <h3>Nested Split Panels</h3>
          <u-split-panel orientation="horizontal" style="height: 400px;">
            <u-panel>
              <div class="panel-content">좌측 패널</div>
            </u-panel>
            <u-panel>
              <u-split-panel orientation="vertical" style="height: 100%;">
                <u-panel>
                  <div class="panel-content">우측 상단 패널</div>
                </u-panel>
                <u-panel>
                  <div class="panel-content">우측 하단 패널</div>
                </u-panel>
              </u-split-panel>
            </u-panel>
          </u-split-panel>
        </div>
      </section>
    `;
  }

  toggleTheme() {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
  }

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
      background-color: var(--u-color-background);
      color: var(--u-color-text);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--u-color-border);
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .section {
      margin-bottom: 60px;
    }

    .section h2 {
      margin: 0 0 30px 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--u-color-primary);
    }

    .demo-item {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid var(--u-color-border);
      border-radius: 8px;
      background-color: var(--u-color-surface);
    }

    .demo-item h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--u-color-text-secondary);
    }

    .panel-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      font-size: 1rem;
      font-weight: 500;
      background-color: var(--u-color-surface);
      border: 1px solid var(--u-color-border);
      border-radius: 4px;
    }

    u-menu {
      max-width: 300px;
    }
  `;
}