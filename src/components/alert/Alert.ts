import { html, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { UElement } from '../../internals';
import { Icon } from '../icon/Icon.js';
import { styles } from './Alert.styles.js';

type AlertType = "warning" | "danger" | "info" | "success";
type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
interface ToastOptions {
  type: AlertType;
  label?: string;
  content?: string;
  duration?: number;
  position?: ToastPosition;
}

/**
 * 사용자에게 메시지를 표시하는 Alert 컴포넌트입니다.
 * 자동 닫힘 타이머, 접기/펼치기 기능 등을 제공합니다.
 */
export class Alert extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': Icon,
  };

  private static readonly container: Map<ToastPosition, HTMLDivElement> = new Map();
  private static readonly elements: Set<Alert> = new Set();
  private timeoutId?: number;

  @query('.content') contentEl!: HTMLElement;

  @state() overflow: boolean = false;
  @state() collapsed: boolean = true;

  /** Alert 표시 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** Alert 상태 (warning, danger, info, success) */
  @property({ type: String, reflect: true }) type: AlertType = 'info';
  /** 본문 최소 행 수 */
  @property({ type: Number }) minRows: number = 3;
  /** 본문 최대 행 수 */
  @property({ type: Number }) maxRows: number = 10;
  /** Alert 제목 */
  @property({ type: String }) label?: string;
  /** Alert 본문 내용 */
  @property({ type: String }) content?: string;
  /** Alert 숨김 타이머 (밀리초) */
  @property({ type: Number }) timeout: number = 0;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    if (changedProperties.has('minRows') && this.minRows < this.maxRows && this.minRows > 0) {
      this.style.setProperty('--min-rows', `${this.minRows}`);
    }
    if (changedProperties.has('maxRows') && this.maxRows > this.minRows && this.maxRows > 0) {
      this.style.setProperty('--max-rows', `${this.maxRows}`);
    }
    if (changedProperties.has('content') || changedProperties.has('minRows') || changedProperties.has('maxRows')) {
      this.resize();
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="header">
          <u-icon name=${this.type === 'warning' ? 'exclamation-triangle-fill' :
            this.type === 'danger' ? 'x-circle-fill' :
            this.type === 'info' ? 'info-circle-fill' :
            this.type === 'success' ? 'check-circle-fill' :
            'info-circle-fill'}
          ></u-icon>
          <div class="title">
            ${this.label || this.type.toUpperCase()}
          </div>
          <div class="flex"></div>
          <u-icon class="close-btn" 
            name="x-lg" 
            @click=${this.hide}
          ></u-icon>
        </div>
        <div class="content scrollable" ?collapsed=${this.collapsed}>
          ${this.content || html`<slot></slot>`}
        </div>
        <div class="footer">
          <div class="more-btn" 
            ?hidden=${!this.overflow}
            @click=${() => this.collapsed = !this.collapsed}>
            <u-icon 
              name=${this.collapsed ? "chevron-down" : "chevron-up"}
            ></u-icon>
          </div>
        </div>
      </div>
    `;
  }

  /** 토스트 알림을 생성합니다. */
  public static async toast(options: ToastOptions) {
    // 토스트 알림을 생성합니다.
    Alert.define("u-alert");
    const el = new Alert();
    el.type = options.type;
    el.label = options.label;
    el.content = options.content;
    this.elements.add(el);
    
    // 토스트 알림을 컨테이너에 추가합니다.
    const position = options.position || 'top-right';
    const container = this.container.get(position) || this.createContainer(position);
    container.appendChild(el);
    await el.updateComplete;
    el.show();

    // duration 시간이 지나면 알림을 닫습니다.
    const duration = (options.duration && options.duration > 0) ? options.duration : 3000;
    setTimeout(async () => {
      await el.hide();
      el.remove();
      this.elements.delete(el);

      // 엘리먼트가 없는 컨테이너는 제거합니다.
      if (!container.hasChildNodes()) {
        container.remove();
        this.container.delete(position);
      }
    }, duration);
  }

  /** Alert를 표시합니다. */
  public async show() {
    await this.updateComplete;
    this.open = true;
    this.dispatch("show");

    if (this.timeout && this.timeout > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.hide();
      }, this.timeout);
    }
  }

  /** Alert를 숨깁니다. */
  public async hide() {
    await this.updateComplete;
    this.open = false;
    clearTimeout(this.timeoutId);
    this.style.transition = '';
    this.style.transform = '';
    this.dispatch("hide");
  }

  /**
   * 본문 내용이 오버플로우되는지 확인하고,
   * 필요시 접기/펼치기 상태를 업데이트합니다.
   */
  private resize = async () => {
    if (!this.contentEl) return;
    await this.updateComplete;
    const scrollHeight = this.contentEl.scrollHeight;
    const clientHeight = this.contentEl.clientHeight;
    this.overflow = scrollHeight > clientHeight;
    this.collapsed = true;
  }

  /** 위치에 맞는 컨테이너 엘리먼트를 생성합니다. */
  private static createContainer(position: ToastPosition) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.gap = '10px';

    // 세로 정렬
    if (position.includes('top')) {
      container.style.top = '20px';
      container.style.flexDirection = 'column'; // 세로 정렬
    } else if (position.includes('bottom')) {
      container.style.bottom = '20px';
      container.style.flexDirection = 'column-reverse'; // 세로 reverse 정렬
    }
    
    // 가로 정렬
    if (position.includes('center')) {
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.alignItems = 'center'; // 가로 중앙 정렬을 위해 추가
    } else if (position.includes('left')) {
      container.style.left = '20px';
      container.style.alignItems = 'flex-start'; // 왼쪽 정렬
    } else if (position.includes('right')) {
      container.style.right = '20px';
      container.style.alignItems = 'flex-end'; // 오른쪽 정렬
    }

    document.body.appendChild(container);
    this.container.set(position, container);
    return container;
  }
}