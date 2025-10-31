import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { getTheme, localizer, setTheme, t } from "../src/utilities";
import { notifier } from "../src/utilities/notifier";
import { Button } from "../src";

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
        <h2>Split Panel 테스트</h2>
        
        <div class="section">
          <h3>Horizontal Split Panel (좌우 분할)</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel direction="horizontal" position="40">
              <div slot="start" style="padding: 20px; background-color: var(--u-neutral-50);">
                <h4>Left Panel</h4>
                <p>이 영역은 좌측 패널입니다.</p>
                <p>중앙의 구분선을 드래그하여 크기를 조절할 수 있습니다.</p>
                <p>구분선에 호버하면 굵어집니다.</p>
                <p>더블클릭하면 50%로 리셋됩니다.</p>
              </div>
              <div slot="end" style="padding: 20px;">
                <h4>Right Panel</h4>
                <p>이 영역은 우측 패널입니다.</p>
                <ul>
                  <li>최소/최대 크기 제한 가능</li>
                  <li>드래그로 크기 조절</li>
                  <li>반응형 레이아웃</li>
                </ul>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>Vertical Split Panel (상하 분할)</h3>
          <div style="height: 400px; border: 1px solid var(--u-border-color);">
            <u-split-panel direction="vertical" position="60" min-size="80" end-min-size="80">
              <div slot="start" style="padding: 20px; background-color: var(--u-neutral-50);">
                <h4>Top Panel</h4>
                <p>이 영역은 상단 패널입니다.</p>
                <p>vertical 방향으로 설정되어 상하로 분할됩니다.</p>
              </div>
              <div slot="end" style="padding: 20px;">
                <h4>Bottom Panel</h4>
                <p>이 영역은 하단 패널입니다.</p>
                <p>최소 크기가 80px로 설정되어 있습니다.</p>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>Disabled Split Panel</h3>
          <div style="height: 300px; border: 1px solid var(--u-border-color);">
            <u-split-panel direction="horizontal" disabled>
              <div slot="start" style="padding: 20px; background-color: var(--u-neutral-50);">
                <h4>고정된 좌측 패널</h4>
                <p>disabled 속성으로 크기 조절이 불가능합니다.</p>
              </div>
              <div slot="end" style="padding: 20px;">
                <h4>고정된 우측 패널</h4>
                <p>구분선을 드래그할 수 없습니다.</p>
              </div>
            </u-split-panel>
          </div>
        </div>

        <div class="section">
          <h3>Nested Split Panel (중첩)</h3>
          <div style="height: 500px; border: 1px solid var(--u-border-color);">
            <u-split-panel direction="horizontal" position="30">
              <div slot="start" style="padding: 20px; background-color: var(--u-neutral-50);">
                <h4>Left Sidebar</h4>
                <p>고정된 사이드바</p>
              </div>
              <u-split-panel slot="end" direction="vertical" position="70">
                <div slot="start" style="padding: 20px;">
                  <h4>Main Content Area</h4>
                  <p>중첩된 Split Panel을 사용하여</p>
                  <p>복잡한 레이아웃을 구성할 수 있습니다.</p>
                </div>
                <div slot="end" style="padding: 20px; background-color: var(--u-neutral-50);">
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
  `;
}
