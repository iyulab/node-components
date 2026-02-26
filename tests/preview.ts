import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import '../src';
import { Theme } from '../src/utilities/Theme';

@customElement('preview-app')
export class PreviewApp extends LitElement {

  @query("#theme-toggle") themeToggleBtn!: HTMLButtonElement;

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
        <section>
          <h2>Menu Component</h2>
          <p>A preview of the Menu component.</p>
          <u-menu mode="single" style="width: 200px; border: 1px solid var(--u-border-color); border-radius: 8px;">
            <u-menu-item value="item1">Menu Item 1</u-menu-item>
            <u-menu-item value="item2" selected>Menu Item 2 (Selected)</u-menu-item>
            <u-menu-item value="item3" disabled>Menu Item 3 (Disabled)</u-menu-item>
            <u-menu-item value="item4">
              Menu Item 4
              <u-menu>
                <u-menu-item value="item4-1">Submenu Item 4-1</u-menu-item>
                <u-menu-item value="item4-2">Submenu Item 4-2</u-menu-item>
              </u-menu>
            </u-menu-item>
          </u-menu>
        </section>

        <section>
          <h2>Tree Component</h2>
          <p>A preview of the Tree component.</p>
          <u-tree>
            <u-tree-item>
              Item 1
              <u-tree-item>Item 1.1</u-tree-item>
              <u-tree-item>Item 1.2</u-tree-item>
            </u-tree-item>
            <u-tree-item>
              Item 2
              <u-tree-item>Item 2.1</u-tree-item>
              <u-tree-item>
                Item 2.2
                <u-tree-item>Item 2.2.1</u-tree-item>
                <u-tree-item>Item 2.2.2</u-tree-item>
              </u-tree-item>
            </u-tree-item>
            <u-tree-item>Item 3 (Leaf)</u-tree-item>
          </u-tree>
        </section>

        <section>
          <h2>Carousel Component</h2>
          <p>slides-per-view, slides-per-move, gap, draggable, loop, autoplay, navigation, pagination, ::part(slides)</p>

          <u-carousel class="carousel-demo"
            slides-per-view="3"
            slides-per-move="3"
            gap="16"
            draggable
            loop
            autoplay
            autoplay-interval="5000"
            navigation
            pagination
            style="padding: 0 60px;">
            <div class="slide" style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px;">Slide 1</div>
            <div class="slide" style="background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 8px;">Slide 2</div>
            <div class="slide" style="background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 8px;">Slide 3</div>
            <div class="slide" style="background: linear-gradient(135deg, #fa709a, #fee140); border-radius: 8px;">Slide 4</div>
            <div class="slide" style="background: linear-gradient(135deg, #30cfd0, #330867); border-radius: 8px;">Slide 5</div>
            <div class="slide" style="background: linear-gradient(135deg, #a8edea, #fed6e3); color: #333; border-radius: 8px;">Slide 6</div>
            <div class="slide" style="background: linear-gradient(135deg, #ff9a9e, #fecfef); color: #333; border-radius: 8px;">Slide 7</div>
            <div class="slide" style="background: linear-gradient(135deg, #ffecd2, #fcb69f); color: #333; border-radius: 8px;">Slide 8</div>
            <div class="slide" style="background: linear-gradient(135deg, #a1c4fd, #c2e9fb); color: #333; border-radius: 8px;">Slide 9</div>
          </u-carousel>
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
      color: var(--u-txt-color-secondary, #666);
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }

    .divider-demo {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 10px;
      border: 1px solid var(--u-border-color);
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .divider-demo.vertical {
      flex-direction: row;
      height: 100px;
    }
    .divider-box {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: var(--u-neutral-100, #f3f4f6);
      flex: 1;
    }

    .panel-content {
      padding: 16px;
      overflow: auto;
    }
    .panel-content h3 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .panel-content p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--u-txt-color-secondary, #666);
    }

    .tag-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .tooltip-demo {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      padding: 20px;
      border: 1px solid var(--u-border-color);
      border-radius: 8px;
    }

    .tooltip-demo-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 20px;
      padding: 60px 20px;
      border: 1px solid var(--u-border-color);
      border-radius: 8px;
    }
    .tooltip-demo-grid > div {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Carousel - 슬라이드 공통 스타일 */
    .slide {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    /* Carousel */
    .carousel-demo {
      height: 250px;
    }
  `;
}