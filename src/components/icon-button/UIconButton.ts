import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import type { Placement, OffsetOptions } from "@floating-ui/dom";
import '../button/UButton.js';
import '../icon/UIcon.js';
import '../tooltip/UTooltip.js';

import { UElement } from "../UElement.js";
import { type ButtonAppearance } from "../button/UButton.js";
import { FORWARDED_ARIA } from "../button/forwarded-aria.js";
import { type IconLibrary } from "../icon/UIcon.js";
import { styles } from "./UIconButton.styles.js";

/**
 * 아이콘만 표시하는 정사각형 버튼 컴포넌트입니다.
 * 내장 툴팁을 지원하여 접근성을 향상시킵니다.
 *
 * @slot - 툴팁에 표시할 콘텐츠
 *
 * @csspart button - 내부 버튼 요소
 * @csspart icon - 아이콘 요소
 * @csspart tooltip - 툴팁 요소
 */
@customElement('u-icon-button')
export class UIconButton extends UElement {
  static styles = [ super.styles, styles ];
  /** 호스트의 `.focus()` 를 안쪽 컨트롤로 위임한다 — `UButton` 과 같은 계약(호스트는 포커스 가능하지 않다). */
  static shadowRootOptions: ShadowRootInit = { ...UElement.shadowRootOptions, delegatesFocus: true };

  /** 버튼 스타일 변형 */
  @property({ type: String, reflect: true }) appearance: ButtonAppearance = "plain";
  /** 원형 표시 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 로딩 상태 여부 */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 링크 URL (설정 시 앵커 태그로 렌더링) */
  @property({ type: String }) href?: string;
  /** 링크 타겟 */
  @property({ type: String }) target?: string;
  /** rel 속성 */
  @property({ type: String }) rel?: string;
  /** 아이콘 SVG 소스를 직접 지정 */
  @property({ type: String }) src?: string;
  /** 아이콘 라이브러리 */
  @property({ type: String }) lib?: IconLibrary;
  /** 아이콘 이름 */
  @property({ type: String }) name?: string;
  /** 툴팁 위치 */
  @property({ type: String, attribute: 'tooltip-placement' }) tooltipPlacement: Placement = "top";
  /** 툴팁 거리 */
  @property({ type: Number, attribute: 'tooltip-offset' }) tooltipOffset: OffsetOptions = 4;

  /**
   * 호스트에 세팅된 `aria-label`과 버튼 상태 ARIA(`FORWARDED_ARIA`)를 내부 `<u-button>`으로 옮긴다 —
   * `UButton`과 같은 이유
   * (섀도우 경계 안쪽 엘리먼트가 실제 접근 가능한 이름 대상). 아이콘 전용
   * 버튼이라 텍스트 콘텐츠로 이름이 생기지 않으므로 이 전달이 없으면 접근 가능한 이름이
   * 아예 비게 된다 — 내장 툴팁(`<u-tooltip>`)은 ARIA를 배선하지 않아 대체 경로가 안 된다.
   */
  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, ...FORWARDED_ARIA];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if ((FORWARDED_ARIA as readonly string[]).includes(name)) this.requestUpdate();
  }

  /** 기본 슬롯(툴팁)의 글자 — `aria-label` 이 없을 때 버튼의 이름. */
  @state() private slotText = '';

  private handleSlotChange = (e: Event) => {
    const nodes = (e.target as HTMLSlotElement).assignedNodes({ flatten: true });
    this.slotText = nodes.map(n => n.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
  };

  render() {
    // 이름: 호스트 `aria-label`, 없으면 툴팁 글자(기본 슬롯) — 아이콘만 그리는 버튼이라 둘 다 없으면 보조기기에 이름이 없다.
    const ariaLabel = this.getAttribute('aria-label') ?? (this.slotText || undefined);
    const pressed = this.getAttribute('aria-pressed') ?? undefined;
    const expanded = this.getAttribute('aria-expanded') ?? undefined;
    const haspopup = this.getAttribute('aria-haspopup') ?? undefined;
    const controls = this.getAttribute('aria-controls') ?? undefined;
    return html`
      <u-button part="button"
        aria-label=${ifDefined(ariaLabel)}
        aria-pressed=${ifDefined(pressed)}
        aria-expanded=${ifDefined(expanded)}
        aria-haspopup=${ifDefined(haspopup)}
        aria-controls=${ifDefined(controls)}
        .disabled=${this.disabled}
        .loading=${this.loading}
        .appearance=${this.appearance}
        .rounded=${this.rounded}
        .href=${this.href}
        .target=${this.target}
        .rel=${this.rel}
      >
        <u-icon part="icon"
          .lib=${this.lib}
          .name=${this.name}
          .src=${this.src}
        ></u-icon>
      </u-button>

      <u-tooltip part="tooltip"
        .placement=${this.tooltipPlacement}
        .offset=${this.tooltipOffset}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </u-tooltip>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-icon-button': UIconButton;
  }
}
