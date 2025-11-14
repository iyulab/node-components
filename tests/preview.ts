import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { theme } from '../src/utilities/theme';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("#progress1") progress1!: any;
  @query("u-button") button!: any;

  firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    theme.init();
  }

  private testProgress = async () => {
    this.progress1.progress(0);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.progress1.progress(30);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.progress1.progress(60);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.progress1.progress(100);
  }

  render() {
    return html`
      <div class="header">
        <h1>Component Preview</h1>
        <u-button @click=${() => theme.set(theme.get() === 'dark' ? 'light' : 'dark')}>테마 변경</u-button>
        <u-button @click=${this.testProgress}>ProgressBar 테스트</u-button>
      </div>

      <section class="section">
        <h2>Progress Components</h2>
        <u-progress-bar id="progress1" .value=${30}></u-progress-bar>
        <!-- <u-progress-bar id="progress2" indeterminate></u-progress-bar> -->
      </section>

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
        <h2>Tree Components</h2>
        
        <div class="demo-item">
          <h3>Basic Tree</h3>
          <u-tree>
            <u-tree-item value="1">
              <span slot="label">📁 Documents</span>
              <u-tree-item slot="children" value="1-1">
                <span slot="label">📄 Report.pdf</span>
              </u-tree-item>
              <u-tree-item slot="children" value="1-2">
                <span slot="label">📄 Presentation.pptx</span>
              </u-tree-item>
            </u-tree-item>
            <u-tree-item value="2">
              <span slot="label">📁 Images</span>
              <u-tree-item slot="children" value="2-1">
                <span slot="label">🖼️ Photo1.jpg</span>
              </u-tree-item>
              <u-tree-item slot="children" value="2-2">
                <span slot="label">🖼️ Photo2.png</span>
              </u-tree-item>
            </u-tree-item>
            <u-tree-item value="3" leaf>
              <span slot="label">📄 README.md</span>
            </u-tree-item>
          </u-tree>
        </div>

        <div class="demo-item">
          <h3>Tree with Icons</h3>
          <u-tree>
            <u-tree-item value="root" icon="📦">
              <span slot="label">Project Root</span>
              <u-tree-item slot="children" value="src" icon="📁">
                <span slot="label">src</span>
                <u-tree-item slot="children" value="components" icon="📁">
                  <span slot="label">components</span>
                  <u-tree-item slot="children" value="tree" icon="📁">
                    <span slot="label">tree</span>
                    <u-tree-item slot="children" value="tree-ts" icon="📝" leaf>
                      <span slot="label">Tree.ts</span>
                    </u-tree-item>
                    <u-tree-item slot="children" value="tree-styles" icon="🎨" leaf>
                      <span slot="label">Tree.styles.ts</span>
                    </u-tree-item>
                  </u-tree-item>
                </u-tree-item>
                <u-tree-item slot="children" value="index" icon="📝" leaf>
                  <span slot="label">index.ts</span>
                </u-tree-item>
              </u-tree-item>
              <u-tree-item slot="children" value="package" icon="📋" leaf>
                <span slot="label">package.json</span>
              </u-tree-item>
            </u-tree-item>
          </u-tree>
        </div>

        <div class="demo-item">
          <h3>Expanded Tree</h3>
          <u-tree>
            <u-tree-item value="folder1" expanded>
              <span slot="label">📁 Expanded Folder</span>
              <u-tree-item slot="children" value="file1" leaf>
                <span slot="label">📄 File 1.txt</span>
              </u-tree-item>
              <u-tree-item slot="children" value="file2" leaf>
                <span slot="label">📄 File 2.txt</span>
              </u-tree-item>
              <u-tree-item slot="children" value="subfolder" expanded>
                <span slot="label">📁 Subfolder</span>
                <u-tree-item slot="children" value="nested-file" leaf>
                  <span slot="label">📄 Nested File.txt</span>
                </u-tree-item>
              </u-tree-item>
            </u-tree-item>
          </u-tree>
        </div>

        <div class="demo-item">
          <h3>Tree with Selected Item</h3>
          <u-tree>
            <u-tree-item value="item1">
              <span slot="label">Item 1</span>
              <u-tree-item slot="children" value="item1-1" selected>
                <span slot="label">Item 1-1 (Selected)</span>
              </u-tree-item>
              <u-tree-item slot="children" value="item1-2">
                <span slot="label">Item 1-2</span>
              </u-tree-item>
            </u-tree-item>
            <u-tree-item value="item2">
              <span slot="label">Item 2</span>
            </u-tree-item>
          </u-tree>
        </div>

        <div class="demo-item">
          <h3>Tree with Disabled Items</h3>
          <u-tree>
            <u-tree-item value="enabled1">
              <span slot="label">Enabled Item</span>
              <u-tree-item slot="children" value="disabled1" disabled>
                <span slot="label">Disabled Item</span>
              </u-tree-item>
              <u-tree-item slot="children" value="enabled2">
                <span slot="label">Enabled Item</span>
              </u-tree-item>
            </u-tree-item>
          </u-tree>
        </div>

        <div class="demo-item">
          <h3>Multiple Selection Tree</h3>
          <u-tree multiple>
            <u-tree-item value="multi1">
              <span slot="label">Selectable 1</span>
            </u-tree-item>
            <u-tree-item value="multi2">
              <span slot="label">Selectable 2</span>
            </u-tree-item>
            <u-tree-item value="multi3">
              <span slot="label">Selectable 3</span>
              <u-tree-item slot="children" value="multi3-1">
                <span slot="label">Selectable 3-1</span>
              </u-tree-item>
            </u-tree-item>
          </u-tree>
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