import { html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { UElement } from '../UElement.js';
import { UButton } from '../button/UButton.component.js';
import { UIcon } from '../icon/UIcon.component.js';
import { styles } from './UAlert.styles.js';

export type AlertStatus = "error" | "warning" | "success" | "info" | "notice";
export type AlertVariant = "solid" | "filled" | "outlined" | "glass";

/**
 * 사용자에게 메시지를 표시하는 Alert 컴포넌트입니다.
 * 자동 닫힘 타이머, 접기/펼치기 기능 등을 제공합니다.
 * 
 * @slot - Alert 본문 콘텐츠
 * @slot footer - Alert 하단 콘텐츠 (예: 버튼)
 */
export class UAlert extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-button': UButton,
    'u-icon': UIcon,
  };

  /** 표시 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 닫기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) closable: boolean = false;
  /** 형태 스타일 (solid, filled, outlined, glass) */
  @property({ type: String, reflect: true }) variant: AlertVariant = 'solid';
  /** 상태 (warning, error, info, success, notice) */
  @property({ type: String, reflect: true }) status?: AlertStatus;
  /** 타이틀 라벨 */
  @property({ type: String }) override title: string = '';
  /** 자동 닫힘 타이머 (밀리초 단위, 0이하면 비활성화) */
  @property({ type: Number }) duration: number = 0;

  /** 자동 닫힘 타이머 ID */
  private timeoutId?: number;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    if (changedProperties.has('open')) {
      this.setTimer(this.open);
    }
  }

  render() {
    return html`
      <div class="container" part="base">
        <div class="header" part="header">
          <u-icon class="icon" part="icon"
            ?hidden=${!this.status}
            lib="internal"
            name=${this.mapIcon(this.status)}
          ></u-icon>
          <div class="title" part="title">
            ${this.title || this.status?.toUpperCase() || 'MESSAGE'}
          </div>
          <u-button class="close-btn" part="close-btn"
            variant="ghost"
            ?hidden=${!this.closable}
            @click=${this.hide}>
            <u-icon lib="internal" name="x-lg"></u-icon>
          </u-button>
        </div>
        <div class="content" part="content" scrollable>
          <slot></slot>
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
  public show(): boolean {
    if (this.open) return true;

    if(this.emit("u-show")) {
      this.open = true;
      return true;
    }
    return false;
  }

  /** 
   * Alert를 숨깁니다. 
   */
  public hide(): boolean {
    if (!this.open) return true;
    
    if(this.emit("u-hide")) {
      this.open = false;
      return true;
    }
    return false;
  }

  /** Alert 상태에 따른 아이콘 이름을 반환합니다. */
  private mapIcon(status?: AlertStatus): string {
    switch (status) {
      case 'error': return 'exclamation-circle-fill';
      case 'warning': return 'exclamation-triangle-fill';
      case 'success': return 'check-circle-fill';
      case 'info': return 'info-circle-fill';
      case 'notice': return 'bell-fill';
      default: return 'bell-fill';
    }
  }

  /** 자동 닫힘 타이머를 설정하거나 해제합니다. */
  private setTimer(open: boolean) {
    if (open) {
      if (this.duration && this.duration > 0) {
        this.timeoutId = window.setTimeout(() => {
          this.hide();
        }, this.duration);
      }
    } else {
      clearTimeout(this.timeoutId);
    }
  }
}