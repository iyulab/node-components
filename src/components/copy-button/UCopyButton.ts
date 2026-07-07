import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Placement, OffsetOptions } from '@floating-ui/dom';

import '../icon-button/UIconButton.js';
import { UElement } from '../UElement.js';
import { type ButtonVariant } from '../button/UButton.js';
import { styles } from './UCopyButton.styles.js';

/**
 * 클릭 시 클립보드에 텍스트를 복사하는 버튼입니다. 복사 상태를 표시하기 위해 아이콘이 변경됩니다.
 *
 * @slot - 툴팁에 표시할 콘텐츠
 *
 * @event copy - 클립보드에 실제로 쓰기 전에 발생하는 네이티브 ClipboardEvent.
 * `preventDefault()`로 복사를 취소하거나, `clipboardData.setData('text/plain', ...)`로 복사될 값을 바꿀 수 있음
 *
 * @csspart button - 내부 버튼 요소
 * @csspart icon - 아이콘 요소
 * @csspart tooltip - 툴팁 요소
 */
@customElement('u-copy-button')
export class UCopyButton extends UElement {
  static styles = [ super.styles, styles ];

  /** 버튼 스타일 변형 */
  @property({ type: String, reflect: true }) variant: ButtonVariant = 'ghost';
  /** 원형 표시 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 클립보드 복사 상태를 나타냅니다. */
  @property({ type: Boolean, reflect: true }) copied: boolean = false;
  /** 툴팁 위치 */
  @property({ type: String, attribute: 'tooltip-placement' }) tooltipPlacement: Placement = "top";
  /** 툴팁 거리 */
  @property({ type: Number, attribute: 'tooltip-offset' }) tooltipOffset: OffsetOptions = 4;
  /** 클립보드 복사 후 재사용 대기 시간 (ms). 0 이하이면 복사 상태로 되돌아가지 않습니다. */
  @property({ type: Number }) delay: number = 1_000;
  /** 복사할 텍스트를 설정합니다. */
  @property({ type: String }) value?: string;

  render() {
    return html`
      <u-icon-button part="button"
        exportparts="icon,tooltip"
        ?disabled=${this.disabled}
        .variant=${this.variant}
        .rounded=${this.rounded}
        .tooltipPlacement=${this.tooltipPlacement}
        .tooltipOffset=${this.tooltipOffset}
        lib="internal"
        name=${this.copied ? 'check' : 'copy'}
        @click=${this.handleButtonClick}
      >
        <slot></slot>
      </u-icon-button>
    `;
  }

  /**
   * 클립보드에 텍스트를 복사하는 메서드입니다.
   * 실제 쓰기 전에 취소 가능한 네이티브 `copy` 이벤트를 발행하여, 리스너가 복사를 취소하거나
   * `clipboardData`를 통해 복사될 값을 바꿀 수 있게 합니다.
   * 복사 후 재사용 대기 시간이 설정되어 있으면, 일정 시간 후에 복사 가능 상태로 되돌립니다.
   */
  private handleButtonClick = async () => {
    if (!this.value) return;
    if (this.copied) return;

    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', this.value);

    const event = new ClipboardEvent('copy', {
      bubbles: false,
      composed: false,
      cancelable: true,
      clipboardData: clipboard,
    });

    const ok = this.dispatchEvent(event);
    if (!ok) return;

    try {
      const text = event.clipboardData?.getData('text/plain') || this.value;
      await window.navigator.clipboard.writeText(text);

      if (this.delay <= 0) return;

      this.copied = true;

      setTimeout(() => {
        this.copied = false;
      }, this.delay);
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error); // eslint-disable-line no-console
      this.copied = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "u-copy-button": UCopyButton;
  }
}
