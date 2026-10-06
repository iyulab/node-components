import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from './USpinner.styles.js';
import { HostAria } from '../../utilities/hostAria.js';
import { syncProgressbar } from '../../utilities/progressAria.js';
import { Locale } from '../../utilities/Locale.js';

/** 역할 축(`primary`…`danger`, 의미 · 리브랜딩을 따라옴)과 장식 축(`blue`…, 색 자체 · 면역)이 병존한다. */
export type SpinnerColor =
  | "neutral"
  | "primary" | "info" | "success" | "warning" | "danger"
  | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";

/**
 * 로딩 상태를 나타내는 회전 스피너 컴포넌트입니다.
 *
 * @slot - 스피너 아래에 표시할 텍스트
 *
 * @csspart svg - 스피너 SVG 요소
 * @csspart label - 라벨 영역
 *
 * @cssprop --spinner-track-width - 트랙 두께 (기본: 0.125em)
 * @cssprop --spinner-track-color - 트랙 배경색
 * @cssprop --spinner-indicator-color - 인디케이터 색상
 * @cssprop --spinner-indicator-speed - 회전 속도 (기본: 2s)
 */
@customElement('u-spinner')
export class USpinner extends UElement {
  static styles = [ super.styles, styles ];

  /** 인디케이터 색상 */
  @property({ type: String, reflect: true }) color?: SpinnerColor;

  @state() private hasLabel = false;

  /**
   * 보조기기에는 «양을 모르는 진행»(`progressbar`, 값 없음). 이름은 슬롯 글자, 없으면 로케일의 `loading` — 회전하는
   * 그림만으로는 무엇이 진행 중인지 들리지 않는다. 호스트의 `aria-label` 이 이긴다.
   */
  private readonly aria = new HostAria(this);

  connectedCallback(): void {
    super.connectedCallback();
    this.nameFrom('');
  }

  /** 이름으로 쓰는 보이는 글자(없으면 로케일의 «로딩 중»). */
  private slotText = '';

  private nameFrom(text: string): void {
    this.slotText = text;
    if (!this.isConnected) return;
    syncProgressbar(this.aria);
    this.aria.set('aria-label', text || Locale.getValue('loading'));
  }

  /** 글자가 없을 때의 기본 이름은 로케일 문장이다 — 새 로케일로 다시 적는다. */
  protected override localeChanged(): void {
    this.nameFrom(this.slotText);
    super.localeChanged();
  }

  render() {
    return html`
      <svg class="spinner" part="svg">
        <circle class="track"></circle>
        <circle class="indicator"></circle>
      </svg>

      <span class="label" part="label" ?hidden=${!this.hasLabel} aria-hidden="true">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
    `;
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this.hasLabel = nodes.some(node =>
      node.nodeType === Node.ELEMENT_NODE ||
      (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '')
    );
    // 보이는 글자가 이름이 된다 — 같은 글자를 두 번 읽지 않게 표시용 상자는 보조기기에서 숨긴다(위 aria-hidden).
    this.nameFrom(nodes.map(n => n.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim());
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-spinner': USpinner;
  }
}
