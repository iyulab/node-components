import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { getTheme, localizer, setTheme, t } from "../src/utilities";
import { notifier } from "../src/utilities/notifier";
import { Button } from "../src";

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("u-button") button!: any;

  firstUpdated(changedProperties: any): void {
    super.firstUpdated(changedProperties);
    localizer.init();
  }

  render() {
    return html`
      <div class="canvas">

        <h2>Input 컴포넌트</h2>
        
        <div class="section">
          <h3>1. 기본 Input</h3>
          <div class="demo-grid">
            <u-input placeholder="Enter text..."></u-input>
            <u-input value="Default value"></u-input>
            <u-input placeholder="Disabled input" disabled></u-input>
            <u-input placeholder="Readonly input" readonly value="Read only"></u-input>
          </div>
        </div>

        <div class="section">
          <h3>2. Label과 Description이 있는 Input</h3>
          <div class="demo-grid">
            <u-input 
              label="Username" 
              placeholder="Enter username"
              description="Your unique username"
            ></u-input>
            <u-input 
              label="Email" 
              type="email"
              placeholder="user@example.com"
              description="We'll never share your email"
              required
            ></u-input>
            <u-input 
              label="Help Icon" 
              label-help="This is a helpful tooltip"
              placeholder="Hover over the info icon"
            ></u-input>
          </div>
        </div>

        <div class="section">
          <h3>3. 다양한 Input Type</h3>
          <div class="demo-grid">
            <u-input type="text" label="Text" placeholder="Text input"></u-input>
            <u-input type="email" label="Email" placeholder="email@example.com"></u-input>
            <u-input type="password" label="Password" placeholder="Enter password"></u-input>
            <u-input type="search" label="Search" placeholder="Search..."></u-input>
            <u-input type="tel" label="Phone" placeholder="123-456-7890"></u-input>
            <u-input type="url" label="URL" placeholder="https://example.com"></u-input>
            <u-input type="number" label="Number" placeholder="123"></u-input>
          </div>
        </div>

        <div class="section">
          <h3>4. Clearable Input</h3>
          <div class="demo-grid">
            <u-input 
              clearable 
              value="Clear me!" 
              label="Clearable"
              description="Click the X icon to clear"
            ></u-input>
            <u-input 
              type="password" 
              clearable
              value="password123"
              label="Password with clear"
            ></u-input>
          </div>
        </div>

        <div class="section">
          <h3>5. Validation</h3>
          <div class="demo-grid">
            <u-input 
              label="Required Field" 
              required
              placeholder="This field is required"
            ></u-input>
            <u-input 
              label="Min/Max Length" 
              minLength="3"
              maxLength="10"
              placeholder="3-10 characters"
              description="Enter 3 to 10 characters"
            ></u-input>
            <u-input 
              label="Pattern (Email)" 
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
              placeholder="email@example.com"
              validation-message="Please enter a valid email"
            ></u-input>
          </div>
        </div>

        <hr style="margin: 30px 0;">

        <h2>Menu 컴포넌트</h2>
        
        <div class="section">
          <h3>1. 기본 Menu</h3>
          <u-menu open style="max-width: 300px;">
            <u-menu-item value="new" label="New File"></u-menu-item>
            <u-menu-item value="open" label="Open File"></u-menu-item>
            <u-menu-item value="save" label="Save"></u-menu-item>
            <u-menu-item value="exit" label="Exit"></u-menu-item>
          </u-menu>
        </div>

        <div class="section">
          <h3>2. Disabled Menu Items</h3>
          <u-menu open style="max-width: 300px;">
            <u-menu-item value="cut" label="Cut"></u-menu-item>
            <u-menu-item value="copy" label="Copy"></u-menu-item>
            <u-menu-item value="paste" label="Paste" disabled></u-menu-item>
            <u-menu-item value="delete" label="Delete"></u-menu-item>
          </u-menu>
        </div>

        <div class="section">
          <h3>3. Checkable Menu Items</h3>
          <u-menu open style="max-width: 300px;">
            <u-menu-item checkable checked label="Word Wrap"></u-menu-item>
            <u-menu-item checkable label="Show Line Numbers"></u-menu-item>
            <u-menu-item checkable label="Show Minimap"></u-menu-item>
            <u-menu-item checkable checked label="Auto Save"></u-menu-item>
          </u-menu>
        </div>

        <div class="section">
          <h3>4. Selectable Menu (Radio Mode)</h3>
          <u-menu open selectable value="medium" style="max-width: 300px;">
            <u-menu-item value="small" label="Small"></u-menu-item>
            <u-menu-item value="medium" label="Medium"></u-menu-item>
            <u-menu-item value="large" label="Large"></u-menu-item>
            <u-menu-item value="xlarge" label="Extra Large"></u-menu-item>
          </u-menu>
        </div>

        <div class="section">
          <h3>5. Menu with Slot Content</h3>
          <u-menu open style="max-width: 300px;">
            <u-menu-item value="bold">
              <strong>Bold Text</strong>
            </u-menu-item>
            <u-menu-item value="italic">
              <em>Italic Text</em>
            </u-menu-item>
            <u-menu-item value="code">
              <code>Code Style</code>
            </u-menu-item>
          </u-menu>
        </div>

        <hr style="margin: 30px 0;">

        <h2>Context Menu 컴포넌트</h2>
        
        <div class="section">
          <h3>1. 기본 Context Menu</h3>
          <div 
            id="context-target-1"
            style="padding: 40px; background: #f0f0f0; border: 2px dashed #999; text-align: center; cursor: pointer;"
          >
            이 영역에서 마우스 오른쪽 클릭을 해보세요
            <u-context-menu>
              <u-menu-item value="copy" label="Copy"></u-menu-item>
              <u-menu-item value="paste" label="Paste"></u-menu-item>
              <u-menu-item value="cut" label="Cut"></u-menu-item>
              <u-menu-item value="delete" label="Delete"></u-menu-item>
            </u-context-menu>
          </div>
        </div>

        <div class="section">
          <h3>2. Context Menu with Disabled Items</h3>
          <div 
            id="context-target-2"
            style="padding: 40px; background: #e8f4f8; border: 2px dashed #0066cc; text-align: center; cursor: pointer;"
          >
            여기서 오른쪽 클릭 (일부 항목 비활성화됨)
            <u-context-menu>
              <u-menu-item value="undo" label="Undo" disabled></u-menu-item>
              <u-menu-item value="redo" label="Redo"></u-menu-item>
              <u-menu-item value="cut" label="Cut"></u-menu-item>
              <u-menu-item value="copy" label="Copy"></u-menu-item>
              <u-menu-item value="paste" label="Paste" disabled></u-menu-item>
            </u-context-menu>
          </div>
        </div>

        <div class="section">
          <h3>3. Context Menu with Checkable Items</h3>
          <div 
            id="context-target-3"
            style="padding: 40px; background: #f0e8ff; border: 2px dashed #8833cc; text-align: center; cursor: pointer;"
          >
            오른쪽 클릭으로 설정 메뉴 열기
            <u-context-menu>
              <u-menu-item checkable checked label="Bold"></u-menu-item>
              <u-menu-item checkable label="Italic"></u-menu-item>
              <u-menu-item checkable label="Underline"></u-menu-item>
              <u-menu-item checkable checked label="Spell Check"></u-menu-item>
            </u-context-menu>
          </div>
        </div>

        <div class="section">
          <h3>4. Multiple Context Menu Areas</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div 
              style="padding: 40px; background: #ffe8e8; border: 2px dashed #cc3333; text-align: center; cursor: pointer;"
            >
              Red Zone
              <u-context-menu>
                <u-menu-item value="red1" label="Red Action 1"></u-menu-item>
                <u-menu-item value="red2" label="Red Action 2"></u-menu-item>
              </u-context-menu>
            </div>
            <div 
              style="padding: 40px; background: #e8ffe8; border: 2px dashed #33cc33; text-align: center; cursor: pointer;"
            >
              Green Zone
              <u-context-menu>
                <u-menu-item value="green1" label="Green Action 1"></u-menu-item>
                <u-menu-item value="green2" label="Green Action 2"></u-menu-item>
              </u-context-menu>
            </div>
          </div>
        </div>

        <hr style="margin: 30px 0;">

        <h2>Split Panel 테스트 (Multi-Panel)</h2>
        
        <div class="section">
          <h3>1. 2개 패널 (기본 50:50)</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel>
              <div class="panel-content panel-1">
                <h4>패널 1</h4>
                <p>기본적인 2개 패널 분할입니다.</p>
                <p>중간의 디바이더를 드래그하여 크기를 조절할 수 있습니다.</p>
              </div>
              <div class="panel-content panel-2">
                <h4>패널 2</h4>
                <p>두 번째 패널입니다.</p>
                <p>자식 요소를 직접 패널로 사용합니다.</p>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>2. 3개 패널 (균등 분할)</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel>
              <div class="panel-content panel-1">
                <h4>패널 1</h4>
                <p>3개의 패널로 분할되었습니다.</p>
              </div>
              <div class="panel-content panel-2">
                <h4>패널 2</h4>
                <p>중간 패널입니다.</p>
              </div>
              <div class="panel-content panel-3">
                <h4>패널 3</h4>
                <p>마지막 패널입니다.</p>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>3. 4개 패널 (초기 크기: 20%, 30%, 30%, 20%)</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel initial-sizes="20,30,30,20">
              <div class="panel-content panel-1">
                <h4>패널 1 (20%)</h4>
              </div>
              <div class="panel-content panel-2">
                <h4>패널 2 (30%)</h4>
              </div>
              <div class="panel-content panel-3">
                <h4>패널 3 (30%)</h4>
              </div>
              <div class="panel-content panel-4">
                <h4>패널 4 (20%)</h4>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>4. 최소/최대 크기 제한</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel .minSizes=${[100, 150, 100]} .maxSizes=${[400, 600, 400]}>
              <div class="panel-content panel-1">
                <h4>패널 1</h4>
                <p>최소: 100px, 최대: 400px</p>
              </div>
              <div class="panel-content panel-2">
                <h4>패널 2</h4>
                <p>최소: 150px, 최대: 600px</p>
              </div>
              <div class="panel-content panel-3">
                <h4>패널 3</h4>
                <p>최소: 100px, 최대: 400px</p>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>5. 수직 분할 (상하)</h3>
          <div style="height: 500px; border: 1px solid var(--u-border-color);">
            <u-split-panel direction="vertical">
              <div class="panel-content panel-1">
                <h4>상단 패널</h4>
                <p>direction="vertical"로 설정하면 상하 분할됩니다.</p>
              </div>
              <div class="panel-content panel-2">
                <h4>중간 패널</h4>
              </div>
              <div class="panel-content panel-3">
                <h4>하단 패널</h4>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>6. Disabled (크기 조절 불가)</h3>
          <div style="height: 300px; border: 1px solid var(--u-border-color);">
            <u-split-panel disabled>
              <div class="panel-content panel-1">
                <h4>패널 1</h4>
                <p>disabled 속성이 설정되어 있어 크기를 조절할 수 없습니다.</p>
              </div>
              <div class="panel-content panel-2">
                <h4>패널 2</h4>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>7. 다양한 요소 타입</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel>
              <div class="panel-content panel-1">
                <h4>DIV 요소</h4>
              </div>
              <section class="panel-content panel-2">
                <h4>SECTION 요소</h4>
              </section>
              <article class="panel-content panel-3">
                <h4>ARTICLE 요소</h4>
              </article>
              <aside class="panel-content panel-4">
                <h4>ASIDE 요소</h4>
              </aside>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>8. 중첩된 Split Panel</h3>
          <div style="height: 500px; border: 1px solid var(--u-border-color);">
            <u-split-panel initial-sizes="25,75">
              <div class="panel-content panel-1">
                <h4>Left Sidebar</h4>
                <p>고정된 사이드바</p>
              </div>
              <u-split-panel direction="vertical" initial-sizes="70,30">
                <div class="panel-content panel-2">
                  <h4>Main Content Area</h4>
                  <p>중첩된 Split Panel을 사용하여</p>
                  <p>복잡한 레이아웃을 구성할 수 있습니다.</p>
                </div>
                <div class="panel-content panel-3">
                  <h4>Bottom Panel</h4>
                  <p>하단 패널 영역</p>
                </div>
              </u-split-panel>
            </u-split-panel>
          </div>
        </div>

        <hr style="margin: 30px 0;">

        <u-button @click=${this.toggleTheme} borderless>
          ${t('Toggle Theme')}
        </u-button>
        <u-button
          @click=${this.toggle}
          ?loading=${false}>
          ${t('Load Data')}
        </u-button>
      </div>
    `;
  }

  toggleTheme() {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
  }

  toggle(event: Event) {
    const target = event.target as Button;
    target.loading = !target.loading;
    notifier.toast({
      type: 'info',
      content: t('Button loading state is now {state}', { state: target.loading ? t('enabled') : t('disabled') }),
      duration: 2000
    });
    new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
      target.loading = false;
    });
  }

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }

    .canvas {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: var(--u-color-neutral-50, #f9fafb);
      border-radius: 8px;
    }

    .section {
      margin-bottom: 40px;
      padding: 20px;
      background-color: var(--u-color-neutral-0, white);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 30px;
      align-items: center;
      justify-items: center;
    }

    hr {
      border: none;
      border-top: 1px solid var(--u-color-neutral-200, #e5e7eb);
    }

    .panel-content {
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
    }

    .panel-1 { background: #e3f2fd; }
    .panel-2 { background: #f3e5f5; }
    .panel-3 { background: #e8f5e9; }
    .panel-4 { background: #fff3e0; }
  `;
}
