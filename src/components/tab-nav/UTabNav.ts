import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTab } from "../tab/UTab.js";
import { styles } from "./UTabNav.styles.js";

/**
 * 이동 링크의 탭 띠 — 저장된 보기(«열림 · 내 것 · 이번 주») 처럼 탭마다 URL 이 있는 자리.
 *
 * `u-tab-panel` 과 다른 일이다: 그것은 같은 쪽 안의 패널을 고르는 탭(`tablist`)이고, 이것은 다른 URL 로 가는
 * 링크의 `<nav>` 랜드마크다. 그래서 탭은 링크(`<u-tab href>`)로 그려지고, 현재 보기는 `aria-current="page"`
 * 로 알리며, 각 링크가 Tab 정지점이다(탭 목록의 화살표 이동은 링크 묶음에 쓰지 않는다 — WAI-ARIA APG).
 *
 * @slot - `u-tab href` 요소들(탭은 붙을 때 스스로 `slot="tab"` 을 단다 — 두 슬롯이 같은 자리에 그린다)
 *
 * @csspart base - `<nav>` 띠
 *
 * `appearance="tiles"` 면 탭이 같은 폭의 칸으로 늘어서고 현재 칸은 `--tab-nav-color` 면에 그 위 글자색이다 — 현장 단말의 공정 칸처럼
 * 칸 하나가 손가락 하나만 하고, 탭마다 쌓인 일의 수(`count-appearance="figure"`)가 고르는 이유인 자리.
 *
 * @cssprop --tab-nav-color - 현재 탭의 글자·밑줄 색, `tiles` 의 현재 칸 면 (기본: --u-primary-color)
 * @cssprop --tab-nav-contrast - `tiles` 의 현재 칸 글자색 (기본: --u-primary-txt-color)
 * @cssprop --tab-nav-tile-min - `tiles` 의 칸 최소 폭 (기본 7rem) — 이보다 좁아지면 다음 줄로 넘어간다
 */
/** 탭 띠의 외형 — `line`(기본 — 밑줄) · `tiles`(같은 폭의 칸 — 현재 칸은 채운 면). */
export type TabNavAppearance = 'line' | 'tiles';

@customElement('u-tab-nav')
export class UTabNav extends UElement {
  static styles = [super.styles, styles];

  /**
   * 현재 보기 — 같은 `value` 의 탭이 `active` 가 된다. 비워 두면 담긴 탭의 `active` 를 건드리지 않는다
   * (작성자가 현재 탭에 `active` 를 직접 둔다).
   */
  @property({ type: String, reflect: true }) value = '';
  /** 띠의 접근 가능한 이름 — 랜드마크가 여럿인 쪽에서 «무엇의 보기인가» 를 가른다(예: `Saved views`). */
  @property({ type: String }) label = '';
  /** 외형 — `line`(기본) · `tiles` */
  @property({ type: String, reflect: true }) appearance: TabNavAppearance = 'line';

  @state() private tabs: UTab[] = [];

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if ((changedProperties.has('value') || changedProperties.has('tabs')) && this.value) {
      for (const tab of this.tabs) tab.active = tab.value === this.value;
    }
  }

  render() {
    return html`
      <nav class="base" part="base" aria-label=${this.label || nothing}>
        <slot name="tab" @slotchange=${this.handleSlotChange}></slot>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </nav>
    `;
  }

  private handleSlotChange = () => {
    const slots = [...this.renderRoot.querySelectorAll('slot')];
    this.tabs = slots.flatMap(s => s.assignedElements({ flatten: true })).filter((el): el is UTab => el instanceof UTab);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tab-nav': UTabNav;
  }
}
