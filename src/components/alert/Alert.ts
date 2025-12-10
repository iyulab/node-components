import { html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { BaseElement } from '../BaseElement.js';
import { Icon } from '../icon/Icon.js';
import { styles } from './Alert.styles.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export type AlertType = "error" | "warning" | "info" | "success" | "notice";

/**
 * 사용자에게 메시지를 표시하는 Alert 컴포넌트입니다.
 * 자동 닫힘 타이머, 접기/펼치기 기능 등을 제공합니다.
 */
export class Alert extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon': Icon,
  };

  private timeoutId?: number;

  /** 표시 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 상태 (warning, error, info, success, notice) */
  @property({ type: String, reflect: true }) type: AlertType = 'info';
  /** 타이틀 라벨 */
  @property({ type: String }) heading?: string;
  /** 본문 내용 */
  @property({ type: String }) content?: string;
  /** 본문 최소 행 수 */
  @property({ type: Number }) minRows: number = 1;
  /** 본문 최대 행 수 */
  @property({ type: Number }) maxRows: number = 3;
  /** 자동 닫힘 타이머 (밀리초 단위, 0일 경우 자동 닫힘 없음) */
  @property({ type: Number }) duration: number = 0;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    if (changedProperties.has('minRows') && this.minRows < this.maxRows && this.minRows > 0) {
      this.style.setProperty('--min-content-rows', `${this.minRows}`);
    }
    if (changedProperties.has('maxRows') && this.maxRows > this.minRows && this.maxRows > 0) {
      this.style.setProperty('--max-content-rows', `${this.maxRows}`);
    }
    if (changedProperties.has('open')) {
      this.updateOpenState(this.open);
    }
  }

  render() {
    return html`
      <div class="container" part="base">
        <div class="header" part="header">
          <u-icon class="icon" part="icon"
            .library=${"internal"}
            .name=${this.getIconName(this.type)}
          ></u-icon>
          <div class="title" part="title">
            ${this.heading || this.type.toUpperCase()}
          </div>
          <u-icon class="close-btn" part="close-btn"
            .library=${"internal"}
            .name=${"x-lg"}
            @click=${this.hide}
          ></u-icon>
        </div>
        <div class="content scrollable" part="content">
          ${this.content
            ? unsafeHTML(this.content)
            : html`<slot></slot>`}
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  /**
   * Alert를 표시합니다. 
   */
  public async show() {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = true;
    });
  }

  /** 
   * Alert를 숨깁니다. 
   */
  public async hide() {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = false;
    });
  }

  /** Alert 타입에 따른 아이콘 이름을 반환합니다. */
  private getIconName(type: AlertType): string {
    switch (type) {
      case 'error': return 'exclamation-circle-fill';
      case 'warning': return 'exclamation-triangle-fill';
      case 'info': return 'info-circle-fill';
      case 'success': return 'check-circle-fill';
      case 'notice': return 'bell-fill';
      default: return 'bell-fill';
    }
  }

  /** open 속성 변경에 따른 상태 업데이트를 처리합니다. */
  private updateOpenState(open: boolean) {
    if (open) {
      if (this.duration && this.duration > 0) {
        this.timeoutId = window.setTimeout(() => {
          this.hide();
        }, this.duration);
      }
      this.emit("u-show");
    } else {
      clearTimeout(this.timeoutId);
      this.emit("u-hide");
    }
  }
}