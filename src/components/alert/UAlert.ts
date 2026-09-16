import { html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UElement } from '../UElement.js';
import { styles } from './UAlert.styles.js';
import { ShowEventDetail } from '../../events/ShowEvent.js';
import { HideEventDetail } from '../../events/HideEvent.js';
import { Locale } from '../../utilities/Locale.js';
import { devWarnOnce } from '../../utilities/devWarning.js';

/** 유효한 `u-alert` 상태 — 런타임 검증과 타입이 **같은 목록**을 보게 둔다. */
export const ALERT_STATUSES = ["error", "warning", "success", "info", "notice"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];
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
 * @csspart title - 타이틀 텍스트 (title 미지정 시 현재 로케일의 상태 이름)
 * @csspart close-btn - 닫기 버튼 (closable=true 일 때만 표시)
 * @csspart content - 스크롤 가능한 본문 영역
 * @csspart footer - 하단 슬롯 영역
 *
 * @cssprop --alert-background-color - 배경색 (status에 따라 자동 설정, variant="outlined"는 transparent)
 * @cssprop --alert-border-color - 테두리 색상 (status에 따라 자동 설정, variant="filled"는 transparent)
 * @cssprop --alert-icon-color - 아이콘 색상 (status에 따라 자동 설정)
 * @cssprop --alert-padding-block - 세로 여백
 * @cssprop --alert-padding-inline - 가로 여백
 * @cssprop --alert-border-width - 테두리 두께 (variant 이 정한다)
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

    // status가 이미 심각도를 표현하므로 role/aria-live는 소비자가 매 사용처마다 반복
    // 부착할 것이 아니라 컴포넌트가 스스로 안다 — WAI-ARIA Alert/Status 패턴.
    this.setAttribute('role', this.mapRole(this.status));
    this.setAttribute('aria-atomic', 'true');

    if (changedProperties.has('status')) this.warnUnknownStatus();
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
            ${this.title || this.defaultTitle()}
          </div>
          <u-button class="close-btn" part="close-btn"
            variant="ghost"
            ?hidden=${!this.closable}
            aria-label=${Locale.getValue('close')}
            @click=${this.hide}>
            <u-icon lib="internal" name="x"></u-icon>
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

    if(this.fire<ShowEventDetail>("show", { bubbles: false, composed: false })) {
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
    
    if(this.fire<HideEventDetail>("hide", { bubbles: false, composed: false })) {
      this.open = false;
      return true;
    }
    return false;
  }

  /**
   * `title` 을 주지 않았을 때 쓰는 제목 — **현재 로케일의 상태 이름**.
   *
   * 종전에는 `status` 를 대문자로 올려 썼다(`ERROR`·`WARNING` …). 그것은 **어느 로케일의
   * 낱말도 아니어서**, 한국어 화면에 영문 대문자가 그대로 찍혔다(소비자 실측 — 이미 고객에게
   * 전달된 매뉴얼 캡처 한 장에 그 상태로 실렸다). 같은 컴포넌트의 닫기 버튼은 처음부터
   * `Locale` 을 탔으므로, 빠져 있던 것은 인프라가 아니라 **이 한 자리**였다.
   *
   * ⚠알 수 없는 `status` 는 여기서 조용히 «메시지» 로 떨어진다 — 그 사실 자체는
   * `warnUnknownStatus` 가 개발 모드에서 알린다.
   */
  private defaultTitle(): string {
    switch (this.status) {
      case 'error': return Locale.getValue('alertError');
      case 'warning': return Locale.getValue('alertWarning');
      case 'success': return Locale.getValue('alertSuccess');
      case 'info': return Locale.getValue('alertInfo');
      case 'notice': return Locale.getValue('alertNotice');
      default: return Locale.getValue('alertMessage');
    }
  }

  /**
   * 유효하지 않은 `status` 를 개발 모드에서 한 번 알린다.
   *
   * ★왜 필요한가: 이 컴포넌트는 알 수 없는 값을 **에러 없이** 받아 중립 알림(종 아이콘 ·
   * `role="status"`)으로 그린다. 즉 `status="danger"` 는 *오류처럼 보이지 않는 오류 알림*이
   * 되고 아무 신호도 나지 않는다 — 소비자가 실제로 화면 셋을 그 상태로 내보냈다.
   * 타입은 이것을 막지 못한다(HTML 속성·서버가 만든 마크업에는 타입이 없다).
   */
  private warnUnknownStatus(): void {
    const status = this.status as string | undefined;
    if (!status || ALERT_STATUSES.includes(status as AlertStatus)) return;
    devWarnOnce(
      `u-alert:status:${status}`,
      `<u-alert status="${status}"> is not a known status, so it renders as a neutral notice. ` +
      `Use one of: ${ALERT_STATUSES.join(', ')}.`,
    );
  }

  /** Alert 상태에 따른 아이콘 이름을 반환합니다. */
  private mapIcon(status?: AlertStatus): string {
    switch (status) {
      case 'error': return 'alert-circle-fill';
      case 'warning': return 'alert-triangle-fill';
      case 'success': return 'circle-check-fill';
      case 'info': return 'info-circle-fill';
      case 'notice': return 'bell-fill';
      default: return 'bell-fill';
    }
  }

  /**
   * Alert 상태에 따른 ARIA role을 반환합니다 — `error`/`warning`은 시간에 민감한 방해로
   * `alert`(암묵적 `aria-live="assertive"`), 그 외(`success`/`info`/`notice`/상태 없음)는
   * `status`(암묵적 `aria-live="polite"`)로 안내됩니다.
   */
  private mapRole(status?: AlertStatus): 'alert' | 'status' {
    switch (status) {
      case 'error':
      case 'warning':
        return 'alert';
      default:
        return 'status';
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