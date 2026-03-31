import { html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UElement } from '../UElement.js';
import { styles } from './UAlert.styles.js';
import { ShowEventDetail } from '../../events/ShowEvent.js';
import { HideEventDetail } from '../../events/HideEvent.js';

export type AlertStatus = "error" | "warning" | "success" | "info" | "notice";
export type AlertVariant = "solid" | "filled" | "outlined" | "glass";

/**
 * 사용자에게 메시지를 표시하는 Alert 컴포넌트입니다.
 * 자동 닫힘 타이머, 닫기 버튼, 다양한 상태(status) 및 형태(variant)를 지원합니다.
 * open 속성이 토글될 때 opacity/scale 트랜지션으로 표시·숨김 처리됩니다.
 *
 * @slot - Alert 본문 콘텐츠
 * @slot footer - Alert 하단 콘텐츠 (예: 액션 버튼)
 *
 * @csspart container - 전체 Alert 컨테이너 (flex column)
 * @csspart header - 아이콘·타이틀·닫기 버튼을 포함하는 상단 행
 * @csspart icon - 상태 아이콘 (status 없으면 hidden)
 * @csspart title - 타이틀 텍스트 (title 미지정 시 status 대문자 또는 'MESSAGE')
 * @csspart close-btn - 닫기 버튼 (closable=true 일 때만 표시)
 * @csspart content - 스크롤 가능한 본문 영역
 * @csspart footer - 하단 슬롯 영역
 *
 * @cssprop --alert-background-color - 배경색 (status에 따라 자동 설정, variant="outlined"는 transparent)
 * @cssprop --alert-border-color - 테두리 색상 (status에 따라 자동 설정, variant="filled"는 transparent)
 * @cssprop --alert-icon-color - 아이콘 색상 (status에 따라 자동 설정)
 *
 * @event show - Alert가 표시되기 직전 발생 (취소 가능)
 * @event hide - Alert가 닫히기 직전 발생 (취소 가능)
 */
@customElement('u-alert')
export class UAlert extends UElement {
  static styles = [ super.styles, styles ];

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
      <div class="container" part="container">
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

    if(this.fire<ShowEventDetail>("show")) {
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
    
    if(this.fire<HideEventDetail>("hide")) {
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

declare global {
  interface HTMLElementTagNameMap {
    'u-alert': UAlert;
  }
}